const { GoogleGenerativeAI } = require("@google/generative-ai");

// In a real app, this would be in .env
const API_KEY = "YOUR_GEMINI_API_KEY"; 
const genAI = new GoogleGenerativeAI(API_KEY);

exports.processUrduText = async (req, res) => {
  try {
    const { prompt, context } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const fullPrompt = `You are a professional Urdu document assistant. Process the following request and return ONLY the Urdu text: ${prompt}. Context: ${context || ''}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({ text });
  } catch (err) {
    console.error('Gemini Error:', err);
    // Return a fallback if API fails
    res.json({ text: "معذرت، ابھی اردو پروسیسنگ دستیاب نہیں ہے۔" });
  }
};
