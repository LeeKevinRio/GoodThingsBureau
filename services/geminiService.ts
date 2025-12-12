import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client safely
// Note: process.env.API_KEY is injected by the environment via Vite config.
const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getProductRecommendations = async (query: string): Promise<string[]> => {
  if (!ai) {
    console.warn("Gemini API Key is missing. AI features will be disabled.");
    return [];
  }

  try {
    const model = 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
      model: model,
      contents: `Suggest 5 specific, trending product names for a purchasing agent request based on this user query: "${query}". 
      The user is looking to buy something from abroad. Return the product names in Traditional Chinese (Taiwan usage).
      Return only the product names as a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as string[];
  } catch (error) {
    console.error("Gemini recommendation error:", error);
    return [];
  }
};

export const analyzeOrderTrend = async (productName: string): Promise<string> => {
  if (!ai) return "不錯的選擇！";

  try {
    const model = 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model: model,
      contents: `Give a very short, 1-sentence fun fact or buying tip for "${productName}". 
      Write it in Traditional Chinese (Taiwan usage). Keep it professional yet engaging.`,
    });
    return response.text || "不錯的選擇！";
  } catch (error) {
    return "非常棒的商品選擇。";
  }
};

export const generateProductDescription = async (productName: string, price: string): Promise<string> => {
  if (!ai) return "這是一個非常棒的商品，推薦給大家！";

  try {
    const model = 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model: model,
      contents: `You are a professional group buying agent (團購主). Write a short, catchy, and persuasive product description (about 30-50 words) for "${productName}" priced at "${price}".
      Use Traditional Chinese (Taiwan style). Include emojis. Highlight why it's a good deal.`,
    });
    return response.text || "";
  } catch (error) {
    console.error(error);
    return "無法產生文案，請檢查網路連線。";
  }
};
