import { invokeLLM } from "./_core/llm";

export interface StreamingOptions {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  onChunk?: (chunk: string) => void;
}

/**
 * Stream text generation from LLM
 * Returns the full response and calls onChunk for each token
 */
export async function streamLLMResponse(options: StreamingOptions): Promise<string> {
  const {
    prompt,
    systemPrompt = "You are a creative writing assistant.",
    temperature = 0.7,
    maxTokens = 2000,
    onChunk,
  } = options;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    const messageContent = response.choices?.[0]?.message?.content;
    const content = typeof messageContent === "string" ? messageContent : "";

    if (onChunk) {
      onChunk(content);
    }

    return content;
  } catch (error) {
    console.error("[LLM] Streaming error:", error);
    throw error;
  }
}

/**
 * Generate master concept from basic idea
 */
export async function generateMasterConcept(
  synopsis: string,
  genre: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const systemPrompt = `You are a professional story architect. Your task is to develop a comprehensive Master Concept for a novel.

Genre: ${genre}

Respond with a structured JSON object containing:
{
  "expandedSynopsis": "1-2 paragraphs of expanded synopsis (150-200 words)",
  "plotOutline": "Beginning, Middle, Climax, Resolution - each 2-3 sentences",
  "themes": "2-3 main themes separated by commas",
  "tone": "Description of the tone and atmosphere",
  "worldbuildingNotes": "Key world-building elements and rules"
}`;

  const prompt = `Create a Master Concept for this novel synopsis:\n\n${synopsis}`;

  return streamLLMResponse({
    prompt,
    systemPrompt,
    temperature: 0.8,
    maxTokens: 2000,
    onChunk,
  });
}

/**
 * Generate character details
 */
export async function generateCharacter(
  novelContext: string,
  genre: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const systemPrompt = `You are an expert character designer for novels. Create a detailed, compelling character.

Genre: ${genre}

Respond with a structured JSON object containing:
{
  "name": "Character name",
  "role": "Protagonist/Antagonist/Mentor/Supporting",
  "description": "Physical description and personality",
  "characteristics": {
    "personality": "Key personality traits",
    "motivation": "What drives this character",
    "fears": "What the character fears",
    "background": "Brief backstory"
  },
  "skills": ["skill1", "skill2", "skill3"],
  "appearance": "Detailed physical appearance"
}`;

  const prompt = `Create a character for this novel:\n\n${novelContext}`;

  return streamLLMResponse({
    prompt,
    systemPrompt,
    temperature: 0.8,
    maxTokens: 1500,
    onChunk,
  });
}

/**
 * Generate chapter content
 */
export async function generateChapter(
  novelContext: string,
  previousChapters: string,
  characters: string,
  chapterPrompt: string,
  genre: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const systemPrompt = `You are a professional novelist specializing in ${genre} fiction. Write engaging, immersive chapter content.

Guidelines:
- Use vivid, descriptive language
- Show character emotions and development
- Maintain consistent pacing and tone
- Use dialogue naturally
- Output in Markdown format with proper formatting

Context:
${novelContext}

Previous chapters summary:
${previousChapters}

Key characters:
${characters}`;

  const prompt = `Write the next chapter based on this prompt:\n\n${chapterPrompt}`;

  return streamLLMResponse({
    prompt,
    systemPrompt,
    temperature: 0.7,
    maxTokens: 3000,
    onChunk,
  });
}

/**
 * Generate dialogue suggestions
 */
export async function generateDialogue(
  context: string,
  characters: string,
  situation: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const systemPrompt = `You are an expert dialogue writer. Create natural, engaging dialogue for the given situation.

${characters}

Respond with dialogue in this format:
**Character Name**: "Dialogue here"

Make the dialogue feel natural and advance the plot.`;

  const prompt = `Write dialogue for this situation:\n\n${situation}\n\nContext:\n${context}`;

  return streamLLMResponse({
    prompt,
    systemPrompt,
    temperature: 0.75,
    maxTokens: 1000,
    onChunk,
  });
}

/**
 * Generate plot twist suggestions
 */
export async function generatePlotTwist(
  novelContext: string,
  currentPlot: string,
  genre: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const systemPrompt = `You are a master storyteller specializing in ${genre}. Suggest compelling plot twists.

Respond with 3 plot twist ideas in JSON format:
{
  "twists": [
    {
      "title": "Twist title",
      "description": "How the twist unfolds",
      "impact": "How it affects the story"
    }
  ]
}`;

  const prompt = `Suggest plot twists for this novel:\n\nContext: ${novelContext}\n\nCurrent plot: ${currentPlot}`;

  return streamLLMResponse({
    prompt,
    systemPrompt,
    temperature: 0.85,
    maxTokens: 1500,
    onChunk,
  });
}

/**
 * Generate style recommendations based on genre
 */
export async function generateStyleRecommendations(
  genre: string,
  excerpt: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const systemPrompt = `You are a writing coach specializing in ${genre} fiction. Analyze the writing style and provide recommendations.

Respond with JSON:
{
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "genreSpecificTips": ["tip1", "tip2"],
  "styleRecommendations": "Overall style guidance"
}`;

  const prompt = `Analyze this ${genre} excerpt and provide style recommendations:\n\n${excerpt}`;

  return streamLLMResponse({
    prompt,
    systemPrompt,
    temperature: 0.6,
    maxTokens: 1000,
    onChunk,
  });
}
