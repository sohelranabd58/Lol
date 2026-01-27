
import { GoogleGenAI } from "@google/genai";
import { PhotoAttire } from "../types";

const MODEL_NAME = 'gemini-2.5-flash-image';

/**
 * Generates a passport photo using the Gemini API.
 */
export const generatePassportPhoto = async (
  base64Image: string,
  attire: PhotoAttire,
  bgColor: { name: string, hex: string }
): Promise<string> => {
  // Always create a new instance to get the latest key from process.env.API_KEY
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined") {
    throw new Error('API_KEY_MISSING');
  }

  const ai = new GoogleGenAI({ apiKey });
  
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
    
    if (msg.includes('429') || msg.includes('quota')) {
      throw new Error('QUOTA_EXCEEDED');
    }
    if (msg.includes('Requested entity was not found')) {
      throw new Error('INVALID_KEY');
    }
    throw new Error(msg || 'Connection error with AI Studio.');
  }
};
