// src/lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// تذكر: مفتاح الـ API يجب أن يكون في ملف .env تحت اسم VITE_GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function processWithGemini(prompt: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}