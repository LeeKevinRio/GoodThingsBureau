import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
// Note: process.env.API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getProductRecommendations = async (query: string): Promise<string[]> => {
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