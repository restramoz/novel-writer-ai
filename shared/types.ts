/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// Story Arc type
export interface StoryArc {
  name: string;
  description: string;
  startChapter: number;
  endChapter: number;
}

// Character Traits type
export interface CharacterTraits {
  personality?: string;
  quirks?: string;
  motivation?: string;
  fears?: string;
  background?: string;
}

// AI Generation types
export interface GenerationRequest {
  prompt: string;
  context?: string;
  model?: string;
  temperature?: number;
}

export interface StreamingResponse {
  content: string;
  isDone: boolean;
}

// Settings types
export interface AppSettings {
  theme: "light" | "dark";
  modelName: string;
  modelUrl: string;
  temperature: number;
  maxTokens: number;
}

// Music types
export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
  mood: "peaceful" | "mysterious" | "epic" | "melancholic" | "uplifting";
}
