
import { GoogleGenAI } from "@google/genai";
import { PhotoAttire } from "../types";

const MODEL_NAME = 'gemini-2.5-flash-image';

export const generatePassportPhoto = async (
  base64Image: string,
  attire: PhotoAttire,
  bgColor: { name: string, hex: string },
  sharpness: number = 85,
  manualKey?: string
): Promise<string> => {
  const apiKey = manualKey || process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey as string });
  
  const isKeepingOriginal = attire === PhotoAttire.ORIGINAL_ATTIRE;

  const systemInstruction = `You are a professional biometric passport photographer. 
  Your task is to generate an OFFICIAL 2x2 inch passport photo.
  STRICT RULES:
  1. BACKGROUND: MUST be a solid, flat ${bgColor.name} color (${bgColor.hex}). Absolutely no gradients, shadows, or textures.
  2. COMPOSITION: Head must be perfectly centered. Face should occupy 55-70% of the image height.
  3. LIGHTING: Professional even studio lighting. High clarity, no harsh shadows on face or neck.
  4. QUALITY: Photorealistic, high-resolution 300DPI texture. Sharp focus on eyes.
  5. ATTIRE: Render the subject in ${attire}. If keeping original, clean the clothes to look ironed and neat.
  6. EXPRESSION: Front-facing, neutral expression, mouth closed, eyes open looking at camera.`;

  const finalPrompt = `Transform this person into a professional 2x2 passport photo. 
  Background Color: ${bgColor.name} (${bgColor.hex}). 
  Attire: ${attire}. 
  Ensure the facial features remain exactly identical to the original image.`;

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
      throw new Error('Studio Engine failed to render. Try a clearer portrait.');
    }

    return `data:image/png;base64,${imagePart.inlineData.data}`;
  } catch (error: any) {
    if (error.message?.includes('429')) {
      throw new Error('API Quota Full. Please wait a moment or use an Admin key.');
    }
    throw new Error(error.message || 'Studio server communication error.');
  }
};
