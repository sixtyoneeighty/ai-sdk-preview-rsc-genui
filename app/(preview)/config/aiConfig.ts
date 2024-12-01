import { google } from "@ai-sdk/google";

export const geminiModel = google("gemini-1.5-pro", {
  safetySettings: [
    { category: "HATE", threshold: "BLOCK_NONE" },
    { category: "VIOLENCE", threshold: "BLOCK_NONE" },
    { category: "SELF_HARM", threshold: "BLOCK_NONE" },
    { category: "SEXUAL", threshold: "BLOCK_NONE" },
    { category: "HARASSMENT", threshold: "BLOCK_NONE" },
  ],
});
