import { google } from "@ai-sdk/google";

export type HarmCategory = 
  | "HARM_CATEGORY_HATE_SPEECH"
  | "HARM_CATEGORY_DANGEROUS_CONTENT"
  | "HARM_CATEGORY_HARASSMENT"
  | "HARM_CATEGORY_SEXUALLY_EXPLICIT";

export type HarmThreshold = 
  | "HARM_BLOCK_THRESHOLD_UNSPECIFIED"
  | "BLOCK_LOW_AND_ABOVE"
  | "BLOCK_MEDIUM_AND_ABOVE"
  | "BLOCK_ONLY_HIGH"
  | "BLOCK_NONE";

export interface SafetySetting {
  category: HarmCategory;
  threshold: HarmThreshold;
}

// Create model configuration wrapper
export const MODEL_NAME = "gemini-1.5-pro-latest";

export const modelConfig = {
  model: google(MODEL_NAME),
  safetySettings: [
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_NONE"
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_NONE"
    },
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_NONE"
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_NONE"
    }
  ] as SafetySetting[]
};