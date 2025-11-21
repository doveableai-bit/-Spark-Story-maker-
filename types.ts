export enum AspectRatio {
  Square = "1:1",
  Landscape = "16:9",
  Portrait = "9:16",
  Standard = "4:3",
  Wide = "21:9"
}

export enum ImageResolution {
  OneK = "1K",
  TwoK = "2K",
  FourK = "4K"
}

export enum ArtStyle {
  Cinematic = "Cinematic",
  Anime = "Anime",
  Pixar = "3D Animation",
  Watercolor = "Watercolor",
  Photorealistic = "Photorealistic",
  Cyberpunk = "Cyberpunk"
}

export interface Scene {
  id: number;
  prompt: string;
  script: {
    character: string;
    text: string;
  }[];
  imageState: 'empty' | 'generating' | 'complete' | 'error';
  imageUrl?: string;
  videoState: 'empty' | 'generating' | 'complete' | 'error';
  videoUrl?: string;
}

export interface StoryConfig {
  prompt: string;
  language: string;
  country: string;
  aspectRatio: AspectRatio;
  resolution: ImageResolution;
  artStyle: ArtStyle;
  sceneCount: number;
  influencerDescription?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
