import { google } from "@ai-sdk/google";

export type HarmCategory = 
  | "HARM_CATEGORY_HATE_SPEECH"
  | "HARM_CATEGORY_DANGEROUS_CONTENT"
  | "HARM_CATEGORY_HARASSMENT"
  | "HARM_CATEGORY_SEXUALLY_EXPLICIT";

export type HarmThreshold = "BLOCK_NONE" | "BLOCK_SOME" | "BLOCK_ALL";

export interface SafetySetting {
  category: HarmCategory;
  threshold: HarmThreshold;
}

export const geminiModel = google("gemini-1.5-pro", {
  safetySettings: [
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
  ] as SafetySetting[]
});