const express = require('express');
const { GoogleGenerativeAI } = require('@google/genai');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(cors());

const rateLimit = new Map();

app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10;

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, []);
  }

  const timestamps = rateLimit.get(ip);
  const windowStart = now - windowMs;

  const requestsInWindow = timestamps.filter(ts => ts > windowStart);

  if (requestsInWindow.length >= maxRequests) {
    return res.status(429).send('Too many requests, please try again later.');
  }

  timestamps.push(now);
  rateLimit.set(ip, timestamps);

  next();
});

app.post('/api/generate', async (req, res) => {
  try {
    const { image, prompt, mode, apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).send('API key is required.');
    }

    // API key is passed dynamically from the client-side
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    let result;

    const imagePart = {
        inlineData: {
            data: image,
            mimeType: 'image/jpeg'
        }
    };

    switch (mode) {
        case 'passport':
            result = await model.generateContent([prompt, imagePart]);
            break;
        case 'prompt2image':
            const imageModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
            result = await imageModel.generateContent(prompt);
            break;
        case 'image2image':
            result = await model.generateContent([prompt, imagePart]);
            break;
        case 'faceswap':
            result = await model.generateContent([prompt, imagePart]);
            break;
        default:
            return res.status(400).send('Invalid mode.');
    }

    const response = await result.response;
    const text = response.text();

    res.json({ image: text });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred.');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
