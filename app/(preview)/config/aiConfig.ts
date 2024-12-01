import { google } from "@ai-sdk/google";

export type HarmCategory = 
  | "HARM_CATEGORY_HATE_SPEECH"
  | "HARM_CATEGORY_DANGEROUS_CONTENT"
  | "HARM_CATEGORY_HARASSMENT"
  | "HARM_CATEGORY_SEXUALLY_EXPLICIT";

export type HarmThreshold = 
  | "BLOCK_NONE"
  | "HARM_BLOCK_THRESHOLD_UNSPECIFIED"
  | "BLOCK_LOW_AND_ABOVE"
  | "BLOCK_MEDIUM_AND_ABOVE"
  | "BLOCK_ONLY_HIGH";

export interface SafetySetting {
  category: HarmCategory;
  threshold: HarmThreshold;
}

// For our punk rock AI, we're setting all thresholds to BLOCK_NONE
// because punk rock doesn't believe in censorship! 🤘
export const geminiModel = google("gemini-1.5-pro", {
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
});