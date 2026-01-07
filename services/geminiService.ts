

import { GoogleGenAI, Type } from "@google/genai";
import { RequestCategory, UrgencyLevel } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

interface AnalysisResult {
  category: RequestCategory;
  urgency: UrgencyLevel;
  summary: string;
}

export const analyzeRequestWithGemini = async (
  description: string, 
  location: string
): Promise<AnalysisResult | null> => {
  if (!apiKey) {
    console.warn("No API Key provided for Gemini");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following facility maintenance or service request. 
      Description: "${description}"
      Location: "${location}"
      
      Determine the most appropriate Category from the list below and Urgency Level (Low, Medium, High).
      
      Categories:
      - Electric
      - Machinery (AC) (for HVAC, facility systems)
      - Repair/Maintenance (for architecture, building repairs)
      - Security (Gate) (for access control, communication, gates)
      - Easy Stuff Moving (for event support, furniture moving)
      - Cleaning
      - Fire System
      - Other
      
      The location will be one of: H-3 Outdoor, H-4 Outdoor, PAC, School Center, STMEV, MS Pod, SS Pod, UJS, Wellness Center, Shin Saimdang, Sherborn, Seondeok, Other.
      
      Also provide a very brief 5-word summary title.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              enum: [
                "Electric",
                "Machinery (AC)",
                "Repair/Maintenance",
                "Security (Gate)",
                "Easy Stuff Moving",
                "Cleaning",
                "Fire System",
                "Other"
              ]
            },
            urgency: {
              type: Type.STRING,
              enum: ["Low", "Medium", "High"]
            },
            summary: {
              type: Type.STRING
            }
          },
          required: ["category", "urgency", "summary"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return null;
  }
};