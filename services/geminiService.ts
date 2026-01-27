
import { GoogleGenAI } from "@google/genai";
import { PhotoAttire } from "../types";

const MODEL_NAME = 'gemini-2.5-flash-image';

/**
 * Validates the API key. 
 * Results are cached in the UI layer (App.tsx) to prevent redundant hits.
 */
export const validateApiKey = async (key: string): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    // Use the lightest possible model for validation to save quota
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: 'ping',
    });
    return !!response.text;
  } catch (error: any) {
    console.error("API Key Validation Failed:", error);
    return false;
  }
};

export const generatePassportPhoto = async (
  base64Image: string,
  attire: PhotoAttire,
  bgColor: { name: string, hex: string },
  sharpness: number = 85,
  manualKey?: string
): Promise<string> => {
  const apiKey = manualKey || localStorage.getItem('STUDIO_API_KEY');
  
  if (!apiKey) {
    throw new Error('API Key Missing. Please set your key in Studio Controls.');
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  const systemInstruction = `You are a professional biometric passport photographer. 
  Your task is to generate an OFFICIAL 2x2 inch passport photo.
  STRICT RULES:
  1. BACKGROUND: MUST be a solid, flat ${bgColor.name} color (${bgColor.hex}). No gradients or shadows.
  2. COMPOSITION: Head centered. Face 55-70% of height.
  3. LIGHTING: Professional studio lighting. High clarity.
  4. QUALITY: Photorealistic, 300DPI.
  5. ATTIRE: Render in ${attire}.
  6. EXPRESSION: Front-facing, neutral expression.`;

  const finalPrompt = `Transform subject to professional 2x2 passport photo. BG: ${bgColor.name}. Attire: ${attire}. Maintain identical facial features.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1],
              mimeType: 'image/jpeg',
            },
          },
          {
            text: finalPrompt,
          },
        ],
      },
      config: {
        systemInstruction,
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!imagePart || !imagePart.inlineData) {
      throw new Error('Studio Engine failed to render. The AI might be busy.');
    }

    return `data:image/png;base64,${imagePart.inlineData.data}`;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const msg = error.message || '';
    
    // Explicit 429 handling with instructions
    if (msg.includes('429')) {
      throw new Error('QUOTA_EXCEEDED: You have hit the per-minute limit for the Free Tier. Please wait 60 seconds before trying again.');
    }
    if (msg.includes('401') || msg.includes('403')) {
      throw new Error('INVALID_KEY: Your API key is incorrect or has been disabled. Please check AI Studio.');
    }
    throw new Error(msg || 'Engine communication error.');
  }
};
