import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client safely
// Note: process.env.API_KEY is injected by the environment via Vite config.
// 初始化 Google Gemini AI 客戶端
const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * 取得 AI 推薦商品
 * Uses Gemini to suggest trending products based on a user query.
 * @param query 使用者輸入的搜尋關鍵字
 * @returns 推薦的商品名稱陣列
 */
export const getProductRecommendations = async (query: string): Promise<string[]> => {
  if (!ai) {
    console.warn("Gemini API Key is missing. AI features will be disabled.");
    return [];
  }

  try {
    const model = 'gemini-2.5-flash';
    
    // 設定 Prompt，要求回傳繁體中文的 JSON Array
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

/**
 * 分析商品趨勢 (趣味小知識)
 * Generates a short fun fact or buying tip for a specific product.
 */
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

/**
 * 生成商品文案 (用於後台編輯器)
 * Generates a persuasive product description for the admin editor.
 * @param productName 商品名稱
 * @param price 商品價格
 */
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