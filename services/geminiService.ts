const API_URL = 'http://localhost:3000/api/generate';

// Function to get the API key from localStorage
const getApiKey = () => {
  const apiKey = localStorage.getItem('gemini_api_key');
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please add it in the settings.');
  }
  return apiKey;
};

const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'An error occurred.');
  }
  const data = await response.json();
  return data.image;
};

export const generatePassportPhoto = async (
  base64Image: string, 
  attire: string, 
  background: { name: string, hex: string }
): Promise<string> => {
  const apiKey = getApiKey();
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: base64Image.split(',')[1],
      prompt: `Generate a professional 2x2 passport-style photo. Attire: ${attire}. Background: ${background.name} (${background.hex}). Centered pose.`,
      mode: 'passport',
      apiKey
    })
  });
  return handleApiResponse(response);
};

export const generatePromptToImage = async (prompt: string): Promise<string> => {
  const apiKey = getApiKey();
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      mode: 'prompt2image',
      apiKey
    })
  });
  return handleApiResponse(response);
};

export const generateImageToImage = async (faceB64: string, styleB64: string): Promise<string> => {
    const apiKey = getApiKey();
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            image: faceB64.split(',')[1],
            prompt: styleB64.split(',')[1], // Sending the style image as a prompt
            mode: 'image2image',
            apiKey
        })
    });
    return handleApiResponse(response);
};

export const generateFaceSwap = async (sourceFaceB64: string, targetImageB64: string): Promise<string> => {
    const apiKey = getApiKey();
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            image: sourceFaceB64.split(',')[1],
            prompt: targetImageB64.split(',')[1], // Sending the target image as a prompt
            mode: 'faceswap',
            apiKey
        })
    });
    return handleApiResponse(response);
};