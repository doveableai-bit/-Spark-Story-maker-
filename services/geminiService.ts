import { GoogleGenAI, Type, Content, Part } from "@google/genai";
import { Scene, StoryConfig, ImageResolution } from "../types";

// Helper to ensure valid API Key selection for premium models
const ensureApiKeySelected = async () => {
  const win = window as any;
  // If running in AI Studio environment, check for key selection
  if (win.aistudio) {
    const hasKey = await win.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await win.aistudio.openSelectKey();
    }
  }
  // If running locally/Vercel, process.env.API_KEY is expected to be populated
};

export const generateStoryScenes = async (config: StoryConfig): Promise<Scene[]> => {
  await ensureApiKeySelected();
  // Always create a new instance to grab the latest key from process.env
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `You are an expert screenplay writer and visual director. 
  Create a ${config.sceneCount}-scene story based on the user's prompt.
  The story takes place in ${config.country} and is written in ${config.language}.
  The visual style is ${config.artStyle}.
  
  CRITICAL: You must maintain character consistency. If the user provided an influencer description, ensure the main character description matches it exactly in every scene prompt.
  
  Return the response in JSON format containing an array of scenes.`;

  const prompt = `Story Idea: ${config.prompt}. 
  ${config.influencerDescription ? `Main Character Description: ${config.influencerDescription}` : ''}
  
  Generate ${config.sceneCount} scenes. For each scene, provide:
  1. A detailed visual prompt for an AI image generator (describing lighting, camera angle, character appearance, background).
  2. A short script/dialogue snippet.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Using the high-intelligence model for story logic
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              visual_prompt: { type: Type.STRING, description: "The prompt for the image generator" },
              script_lines: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    character: { type: Type.STRING },
                    text: { type: Type.STRING }
                  }
                }
              }
            }
          }
        },
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text generated");

    const rawData = JSON.parse(text);
    
    return rawData.map((item: any, index: number) => ({
      id: index + 1,
      prompt: item.visual_prompt,
      script: item.script_lines,
      imageState: 'empty',
      videoState: 'empty'
    }));

  } catch (error) {
    console.error("Error generating story:", error);
    throw error;
  }
};

export const generateSceneImage = async (prompt: string, config: StoryConfig): Promise<string> => {
  await ensureApiKeySelected();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Enhance prompt with style
  const fullPrompt = `${config.artStyle} style. ${prompt}. High quality, detailed, 8k.`;

  try {
    // Using gemini-3-pro-image-preview for high quality
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: fullPrompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: config.aspectRatio,
          imageSize: config.resolution // 1K, 2K, or 4K
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

export const generateVeoVideo = async (imageBase64: string, prompt: string, aspectRatio: string): Promise<string> => {
  // VEO REQUIREMENT: Check/Prompt for API Key selection
  await ensureApiKeySelected();

  // Create a NEW instance to ensure we pick up the selected key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare image part - strip prefix if present
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  // Map aspect ratio to Veo supported (landscape/portrait)
  // Veo fast supports 16:9 or 9:16. If user chose 1:1 or 4:3, default to 16:9
  const veoRatio = (aspectRatio === "9:16") ? "9:16" : "16:9";

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `Cinematic movement. ${prompt}`,
      image: {
        imageBytes: base64Data,
        mimeType: 'image/png'
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p', // Veo fast defaults
        aspectRatio: veoRatio
      }
    });

    // Polling loop
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("No video URI returned");

    // Fetch the actual video blob
    // Must append API Key for download
    const fetchUrl = `${videoUri}&key=${process.env.API_KEY}`;
    const videoRes = await fetch(fetchUrl);
    const videoBlob = await videoRes.blob();
    
    return URL.createObjectURL(videoBlob);

  } catch (error) {
    console.error("Error generating video:", error);
    throw error;
  }
};

export const chatWithGemini = async (history: Content[], message: string) => {
  await ensureApiKeySelected();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    history: history,
    config: {
      thinkingConfig: { thinkingBudget: 2048 } // Enable thinking for better assistance
    }
  });

  const result = await chat.sendMessageStream({ message });
  return result;
};