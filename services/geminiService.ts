import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeTrackingData = async (inputData: string): Promise<AnalysisResult | null> => {
  if (!process.env.API_KEY) {
    console.error("API Key missing");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Analyze the following system data or query within the context of a high-tech "WebTracking AI" system. 
        Evaluate it based on abstract cybernetic concepts:
        1. Define vs Recognize (Cognitive Axis)
        2. Sort vs Order (Structural Axis)
        3. Quality vs Quantity (Metric Axis)
        
        Input: "${inputData}"
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            define: { type: Type.NUMBER, description: "Score 0-100 for definition clarity" },
            recognize: { type: Type.NUMBER, description: "Score 0-100 for pattern recognition" },
            sort: { type: Type.NUMBER, description: "Score 0-100 for categorization capability" },
            order: { type: Type.NUMBER, description: "Score 0-100 for sequential logic" },
            focus: { type: Type.STRING, description: "Primary focus area (e.g., QUEST, LEARN, FOCUS)" },
            spectrum: { type: Type.STRING, description: "Analysis spectrum type" },
            quality: { type: Type.NUMBER, description: "Quality metric 0-100" },
            quantity: { type: Type.NUMBER, description: "Quantity/Load metric 0-100" },
            analysis: { type: Type.STRING, description: "Brief technical summary of the analysis" }
          },
          required: ["define", "recognize", "sort", "order", "focus", "spectrum", "quality", "quantity", "analysis"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    return null;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};