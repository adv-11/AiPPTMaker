// src/ai/flows/visualizer.ts
'use server';

/**
 * @fileOverview AI flow to transform provided text/data into a visually appealing image (chart, graph, diagram, infographic) suitable for a presentation slide.
 *
 * - generateVisuals - A function that handles the generation of a single visual from data.
 * - GenerateVisualsInput - The input type for the generateVisuals function.
 * - GenerateVisualsOutput - The return type for the generateVisuals function.
 */

import {ai} from '@/ai/genkit';
import { z } from 'genkit';
import {
    GenerateVisualsInputSchema,
    GenerateVisualsOutputSchema
} from '@/ai/schemas/visualizer-schemas'; // Import schemas

// Define TypeScript types based on the imported Zod schemas
export type GenerateVisualsInput = z.infer<typeof GenerateVisualsInputSchema>;
export type GenerateVisualsOutput = z.infer<typeof GenerateVisualsOutputSchema>;

// Define the generateVisuals flow using the imported schemas
const generateVisualsFlow = ai.defineFlow(
  {
    name: 'generateVisualsFlow',
    inputSchema: GenerateVisualsInputSchema,
    outputSchema: GenerateVisualsOutputSchema,
  },
  async (input) => {
    const generationPrompt = `Generate a single visual element (like a chart, graph, diagram, or infographic) suitable for a presentation slide based on the following:

Data/Description: ${input.promptText}

${input.templateDetails ? `Consider these template details for styling: ${input.templateDetails}` : ''}

Create a clean, professional-looking visual representation. Ensure data accuracy if numerical data is provided in the description. Focus on clarity and readability for a presentation context. Output ONLY the image.`;

    const {media} = await ai.generate({
      // IMPORTANT: ONLY the googleai/gemini-2.0-flash-exp model is able to generate images.
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: generationPrompt,
      config: {
        // MUST provide both TEXT and IMAGE, IMAGE only won't work
        responseModalities: ['TEXT', 'IMAGE'],
        // Optional: Add parameters like aspect ratio if needed
        // generationConfig: {
        //   imageConfig: { aspectRatio: '16:9' } // Example
        // }
      },
    });

    if (!media || !media.url) {
        throw new Error("Image generation failed or returned no media URL.");
    }

    // Assuming the first media part is the image we want
    return { visualDataUri: media.url };
  }
);

// Exported wrapper function to call the flow
export async function generateVisuals(input: GenerateVisualsInput): Promise<GenerateVisualsOutput> {
    console.log("Generating visual for:", input.promptText);
    try {
        const result = await generateVisualsFlow(input);
        console.log("Visual generation successful.");
        return result;
    } catch (error) {
        console.error("Error in generateVisuals flow:", error);
        // Rethrow or return a specific error structure
        throw new Error(`Failed to generate visual: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// DO NOT export schemas or other non-async function values from this 'use server' file.
// Only export the main async function and potentially TypeScript types.
