// src/commands.ts
import { processWithGemini } from "./lib/gemini";

export const commandCenter = {
  version: "1.1.0",
  async executeCommand(userPrompt: string) {
    console.log("Executing:", userPrompt);
    const response = await processWithGemini(userPrompt);
    return response;
  }
};