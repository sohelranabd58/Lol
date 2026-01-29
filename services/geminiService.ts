
import { GoogleGenAI } from "@google/genai";
import { PhotoAttire, ImageSize, AspectRatio } from "../types.ts";

const DEFAULT_MODEL = 'gemini-2.5-flash-image';

class RateLimiter {
  private requests: Record<string, number[]> = {};

  checkLimit(modelId: string, rpm: number): { allowed: boolean; waitSeconds: number } {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    if (!this.requests[modelId]) {
      this.requests[modelId] = [];
    }

    this.requests[modelId] = this.requests[modelId].filter(ts => ts > oneMinuteAgo);

    if (this.requests[modelId].length >= rpm) {
      const oldest = this.requests[modelId][0];
      const waitSeconds = Math.ceil((60000 - (now - oldest)) / 1000);
      return { allowed: false, waitSeconds };
    }

    return { allowed: true, waitSeconds: 0 };
  }

  recordRequest(modelId: string) {
    if (!this.requests[modelId]) this.requests[modelId] = [];
    this.requests[modelId].push(Date.now());
  }
}

export const rateLimiter = new RateLimiter();

export const getSelectedModel = () => {
  return localStorage.getItem('AMR_STUDIO_SELECTED_MODEL') || DEFAULT_MODEL;
};

export const getApiKeyFragment = () => {
  const manualKey = localStorage.getItem('AMR_STUDIO_CUSTOM_API_KEY');
  const key = manualKey || process.env.API_KEY || '';
  if (key.length < 6) return '******';
  return `***${key.slice(-6)}`;
};

const MODEL_METADATA_SOURCE: Record<string, any> = {
  'gemini-2.5-flash-image': { 
    rpm: 15, 
    rpd: 1500, 
    recommended: true, 
    note: 'Primary Studio Engine',
    useCase: 'Best for 2x2 Passport & Face Identity Preservation',
    isImageModel: true,
    supportsImageSize: false,
    tier: 'Free'
  },
  'gemini-3-pro-image-preview': { 
    rpm: 2, 
    rpd: 50, 
    recommended: false, 
    note: 'Premium Studio Engine',
    useCase: 'Ultra High Detail (1080p+) - Requires Paid API Key',
    isImageModel: true,
    supportsImageSize: true,
    tier: 'Paid'
  },
  'gemini-3-flash-preview': { 
    rpm: 15, 
    rpd: 1500, 
    recommended: false, 
    note: 'General Assistant',
    useCase: 'Fast Multimodal Tasks (Not for high-quality generation)',
    isImageModel: false,
    supportsImageSize: false,
    tier: 'Free'
  },
  'gemini-flash-lite-latest': { 
    rpm: 15, 
    rpd: 1500, 
    recommended: false, 
    note: 'Lighweight Engine',
    useCase: 'Minimal Latency / Simple Text Tasks',
    isImageModel: false,
    supportsImageSize: false,
    tier: 'Free'
  },
};

const handleApiError = (error: any) => {
  console.error("Gemini API Error Detail:", error);
  const msg = error.message?.toLowerCase() || '';
  
  if (msg.includes('403') || msg.includes('permission')) {
    throw new Error('403 Error: আপনার API Key-টির এই মডেল ব্যবহার করার অনুমতি নেই। অনুগ্রহ করে সেটিংস থেকে একটি Paid API Key সিলেক্ট করুন।');
  }

  if (msg.includes('400') || msg.includes('invalid_argument')) {
    throw new Error('400 Error: ইনভ্যালিড রিকোয়েস্ট। সম্ভবত সিলেক্টেড মডেলটি ইমেজ তৈরির জন্য উপযুক্ত নয়।');
  }

  if (msg.includes('requested entity was not found')) {
    throw new Error('API Key পাওয়া যায়নি। সেটিংস থেকে "Select Official API Key" ক্লিক করে আবার কী সিলেক্ট করুন।');
  }
  
  if (msg.includes('rate limit') || msg.includes('429')) {
    throw new Error('মডেলের লিমিট শেষ। কিছুক্ষণ অপেক্ষা করুন।');
  }

  throw new Error(error.message || 'সার্ভার কানেকশন এরর। আবার চেষ্টা করুন।');
};

export const fetchAvailableModels = async (onlyFree: boolean = true) => {
  const staticModels = Object.keys(MODEL_METADATA_SOURCE);
  return staticModels
    .filter(id => !onlyFree || MODEL_METADATA_SOURCE[id].tier === 'Free')
    .map(id => {
      const meta = MODEL_METADATA_SOURCE[id];
      return {
        name: id,
        displayName: id.split('-').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
        rpm: meta.rpm,
        rpd: meta.rpd,
        isRecommended: meta.recommended,
        note: meta.note,
        useCase: meta.useCase,
        isImageModel: meta.isImageModel,
        tier: meta.tier
      };
    })
    .sort((a, b) => (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0));
};

const validateRateLimit = (modelId: string) => {
  const meta = MODEL_METADATA_SOURCE[modelId] || { rpm: 2 };
  const status = rateLimiter.checkLimit(modelId, meta.rpm);
  if (!status.allowed) {
    throw new Error(`Rate Limit Exceeded! Please wait ${status.waitSeconds} seconds for this model.`);
  }
};

export const generatePassportPhoto = async (
  base64Image: string, 
  attire: string, 
  background: { name: string, hex: string }
): Promise<string> => {
  const modelId = getSelectedModel();
  validateRateLimit(modelId);
  const ai = new GoogleGenAI({ apiKey: localStorage.getItem('AMR_STUDIO_CUSTOM_API_KEY') || process.env.API_KEY });
  const data = base64Image.split(',')[1] || base64Image;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { data: data, mimeType: 'image/png' } },
          { text: `Generate a professional 2x2 passport-style photo. Attire: ${attire}. Background: ${background.name} (${background.hex}). Centered pose.` }
        ]
      },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    rateLimiter.recordRequest(modelId);
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No image generated.");
  } catch (error) { throw handleApiError(error); }
};

export const generatePromptToImage = async (base64Image: string, prompt: string): Promise<string> => {
  const modelId = getSelectedModel();
  validateRateLimit(modelId);
  const ai = new GoogleGenAI({ apiKey: localStorage.getItem('AMR_STUDIO_CUSTOM_API_KEY') || process.env.API_KEY });
  const data = base64Image.split(',')[1] || base64Image;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { data: data, mimeType: 'image/png' } },
          { text: `Generate high-quality portrait consistent with face identity: ${prompt}` }
        ]
      },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    rateLimiter.recordRequest(modelId);
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No image generated.");
  } catch (error) { throw handleApiError(error); }
};

export const generateImageToImage = async (faceB64: string, styleB64: string): Promise<string> => {
  const modelId = getSelectedModel();
  validateRateLimit(modelId);
  const ai = new GoogleGenAI({ apiKey: localStorage.getItem('AMR_STUDIO_CUSTOM_API_KEY') || process.env.API_KEY });
  const faceData = faceB64.split(',')[1] || faceB64;
  const styleData = styleB64.split(',')[1] || styleB64;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { data: faceData, mimeType: 'image/png' } },
          { inlineData: { data: styleData, mimeType: 'image/png' } },
          { text: `Merge face from image 1 onto style of image 2.` }
        ]
      },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    rateLimiter.recordRequest(modelId);
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No image generated.");
  } catch (error) { throw handleApiError(error); }
};

export const generateFaceSwap = async (sourceFaceB64: string, targetImageB64: string): Promise<string> => {
  const modelId = getSelectedModel();
  validateRateLimit(modelId);
  const ai = new GoogleGenAI({ apiKey: localStorage.getItem('AMR_STUDIO_CUSTOM_API_KEY') || process.env.API_KEY });
  const sourceData = sourceFaceB64.split(',')[1] || sourceFaceB64;
  const targetData = targetImageB64.split(',')[1] || targetImageB64;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { data: sourceData, mimeType: 'image/png' } },
          { inlineData: { data: targetData, mimeType: 'image/png' } },
          { text: `Extract the face identity from the first image and perfectly swap it onto the person in the second image. Ensure the lighting, skin tone, and expression blend naturally with the second image's environment.` }
        ]
      },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    rateLimiter.recordRequest(modelId);
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("Face swap failed.");
  } catch (error) { throw handleApiError(error); }
};
