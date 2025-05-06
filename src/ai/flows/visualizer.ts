// src/ai/flows/visualizer.ts
'use server';

/**
 * @fileOverview AI flow to transform provided text/data into a specific visual element like a chart, graph, or diagram for a presentation slide. DOES NOT generate general images.
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
    const generationPrompt = `Generate a SINGLE specific visual element LIKE A CHART, GRAPH, DIAGRAM, or INFOGRAPHIC suitable for a presentation slide based ONLY on the following description. DO NOT generate a general photographic image.

Data/Description: ${input.promptText}

${input.templateDetails ? `Consider these template details for styling: ${input.templateDetails}` : ''}

Create a clean, professional-looking visual representation (e.g., bar chart, flow diagram). Ensure data accuracy if numerical data is provided. Focus on clarity and readability for a presentation context. Output ONLY the image data URI.`;

    console.log(`Visualizer: Generating specific visual (chart/graph/etc.) for prompt: "${input.promptText}"`)

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

    if (!media || !media.url || !media.url.startsWith('data:image')) {
        console.error(`Visualizer: Image generation failed or returned invalid media URL for prompt: "${input.promptText}". Received:`, media);
        throw new Error("AI visual generation failed or returned an invalid data URI.");
    }

    // Assuming the first media part is the image we want
    return { visualDataUri: media.url };
  }
);

// Exported wrapper function to call the flow
export async function generateVisuals(input: GenerateVisualsInput): Promise<GenerateVisualsOutput> {
    console.log("Visualizer Flow: Starting generation for:", input.promptText);
    try {
        const result = await generateVisualsFlow(input);
        console.log("Visualizer Flow: Generation successful.");
        return result;
    } catch (error) {
        console.error("Error in generateVisuals flow:", error);
        // Rethrow or return a specific error structure
        throw new Error(`Failed to generate AI visual: ${error instanceof Error ? error.message : String(error)}`);
    }
}
