
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateDraft(topic: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a professional blog post intro for the topic: "${topic}". Keep it engaging and informative.`,
      config: {
        temperature: 0.7,
      }
    });
    return response.text || "Failed to generate content.";
  }

  async suggestSEO(content: string): Promise<string[]> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest 5 SEO keywords for the following content: "${content.substring(0, 1000)}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    try {
      return JSON.parse(response.text || "[]");
    } catch (e) {
      return ["Error parsing keywords"];
    }
  }

  async generateMetaDescription(title: string, content: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a compelling SEO meta description (max 155 chars) for a blog post titled "${title}" based on this content: "${content.substring(0, 500)}"`,
      config: {
        temperature: 0.6,
      }
    });
    return response.text?.trim() || "";
  }

  async generateAltText(imageTitle: string, caption: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a concise, SEO-optimized accessibility alt text for an image titled "${imageTitle}" with context: "${caption}". Max 125 characters.`,
      config: {
        temperature: 0.5,
      }
    });
    return response.text?.trim() || "No description available.";
  }

  async expandIdea(outline: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Expand this blog outline into a detailed section: "${outline}"`,
      config: {
        thinkingConfig: { thinkingBudget: 1000 }
      }
    });
    return response.text || "Failed to expand content.";
  }
}

export const geminiService = new GeminiService();
