
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private static async getAI() {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private static async handleApiError(error: any) {
    console.error("Gemini API Error Context:", error);
    const msg = error?.message || String(error);
    const is404 = msg.includes("Requested entity was not found") || msg.includes("404");
    const isKeyInvalid = msg.includes("API_KEY_INVALID") || msg.includes("invalid api key");
    
    if (is404 || isKeyInvalid) {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
      }
      throw new Error(
        "AI Engine Access Denied (404/NOT_FOUND). Ensure you have selected a key from a PAID Google Cloud Project with billing enabled."
      );
    }
    throw error;
  }

  static async polishPrompt(roughPrompt: string): Promise<string> {
    const ai = await this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Expand this rough creative idea into a detailed, professional cinematic prompt for an image generator. Focus on lighting, camera angle, and mood. Ideas: "${roughPrompt}". Return ONLY the polished prompt text.`,
      });
      return response.text || roughPrompt;
    } catch (e) {
      return roughPrompt;
    }
  }

  static async generateRandomPrompt(): Promise<string> {
    const ai = await this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Generate one highly creative, cinematic, and visually stunning text-to-video prompt. It should be one sentence, descriptive, and focus on unique lighting or movement. Return ONLY the prompt text.",
      });
      return response.text || "A cinematic journey through a neon-lit futuristic rainforest.";
    } catch (e) {
      return "A cinematic shot of a golden eagle soaring over misty mountain peaks at sunset.";
    }
  }

  static async generateVideo(prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') {
    const ai = await this.getAI();
    try {
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("Video generation failed: No URI returned.");

      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      if (!response.ok) throw new Error("Failed to download generated video.");
      
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  static async generateThumbnail(videoUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = videoUrl;
      video.muted = true;
      video.crossOrigin = 'anonymous';

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(video.duration / 2, 0.5);
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          reject('Failed to create canvas context');
        }
      };

      video.onerror = (e) => reject('Thumbnail generation failed: ' + e);
    });
  }

  static async generateImage(prompt: string) {
    const ai = await this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });

      const parts = response.candidates?.[0]?.content?.parts;
      if (!parts) return null;
      
      for (const part of parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  static async suggestClipEdits(clip: any) {
    const ai = await this.getAI();
    try {
      const context = clip.prompt || clip.title;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this video clip context: "${context}". Provide a professional mood analysis and 3 specific cinematic editing suggestions.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mood: { type: Type.STRING },
              suggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    category: { type: Type.STRING }
                  },
                  required: ["title", "description", "category"]
                }
              }
            },
            required: ["mood", "suggestions"]
          }
        }
      });
      return JSON.parse(response.text);
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  static async generateAIThumbnail(clip: any, style: string = 'Cinematic', refinePrompt?: string) {
    const ai = await this.getAI();
    try {
      const context = clip.prompt || clip.title || "Cinematic scene";
      const stylePrompt = style === 'Cinematic' 
        ? "hyper-realistic movie poster, 8k resolution, volumetric lighting, epic composition" 
        : style === 'Anime' 
          ? "makoto shinkai style anime illustration, vibrant colors, aesthetic lighting"
          : style === 'Noir'
            ? "gritty black and white noir photography, high contrast shadows, moody atmosphere"
            : "minimalist artistic graphic design, clean lines, professional branding";

      const prompt = `A professional ${stylePrompt} thumbnail representing: "${context}". ${refinePrompt ? `Additional focus: ${refinePrompt}.` : ''} No text, no watermarks.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });

      const parts = response.candidates?.[0]?.content?.parts;
      if (!parts) return null;

      for (const part of parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  static async assistantChat(userMessage: string, projectState: any) {
    const ai = await this.getAI();
    const systemInstruction = `
      You are the "Iris AI Co-Pilot", a world-class cinematic video editor and creative director built into the Lumina Edit Studio. 
      Your goal is to help users edit, fix technical issues (bugs), and enhance their storytelling.
      
      Current Project State Summary:
      - Clips count: ${projectState.clips.length}
      - Audio tracks: ${projectState.audioTracks.length}
      - Text overlays: ${projectState.textOverlays.length}
      - Current playhead position: ${projectState.currentTime.toFixed(2)}s
      
      Instructions:
      1. Be concise, professional, and creative. Use cinematic terminology (e.g., "color grading", "parallax", "volumetric lighting").
      2. If a user asks to "fix a bug", offer troubleshooting advice or creative workarounds.
      3. Provide actionable suggestions (e.g., "Add a noir filter to clip 2 to emphasize the shadows").
      4. Always stay in character as a high-end AI assistant.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });
      return response.text;
    } catch (error) {
      return this.handleApiError(error);
    }
  }
}
