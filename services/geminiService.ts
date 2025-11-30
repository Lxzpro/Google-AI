import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize only if key is present to avoid errors on load
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzePageContent = async (imageData: string): Promise<string> => {
  if (!ai) {
    return "API Key not configured. Please set process.env.API_KEY.";
  }

  try {
    const base64Data = imageData.split(',')[1]; // Remove data:image/png;base64, prefix

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/png'
            }
          },
          {
            text: "Analyze the visual content of this book page. Summarize the text and describe any diagrams or images present. Keep it concise, futuristic, and insightful."
          }
        ]
      }
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Failed to analyze page. Please try again.";
  }
};
