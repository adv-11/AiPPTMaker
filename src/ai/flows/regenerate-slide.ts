// src/ai/flows/regenerate-slide.ts
'use server';
/**
 * @fileOverview Flow to regenerate a specific slide with different AI parameters.
 *
 * - regenerateSlide - A function that handles the slide regeneration process.
 * - RegenerateSlideInput - The input type for the regenerateSlide function.
 * - RegenerateSlideOutput - The return type for the regenerateSlide function.
 */

import {ai} from '@/ai/genkit';
import { z } from 'genkit';
import {
    RegenerateSlideInputSchema,
    RegenerateSlideOutputSchema
} from '@/ai/schemas/regenerate-slide-schemas'; // Import schemas

// Define TypeScript types based on the imported Zod schemas
export type RegenerateSlideInput = z.infer<typeof RegenerateSlideInputSchema>;
export type RegenerateSlideOutput = z.infer<typeof RegenerateSlideOutputSchema>;

// Export the main async function
export async function regenerateSlide(input: RegenerateSlideInput): Promise<RegenerateSlideOutput> {
  return regenerateSlideFlow(input);
}

// Define the prompt using the imported schemas
const prompt = ai.definePrompt({
  name: 'regenerateSlidePrompt',
  input: {schema: RegenerateSlideInputSchema},
  output: {schema: RegenerateSlideOutputSchema},
  prompt: `You are an AI presentation designer. You will regenerate a specific slide based on the user's input parameters to fine-tune the presentation to their needs.

  The slide content is: {{{slideContent}}}
  The template details are: {{{templateDetails}}}

  Consider the following parameters when regenerating the slide:
  - Smart Art Density: {{{smartArtDensity}}}
  - Data Visualization Preference: {{{dataVisualizationPreference}}}
  - Content to Visual Ratio: {{{contentToVisualRatio}}}
  - Tone and Style: {{{toneAndStyle}}}

  Regenerate the slide with the given parameters and return the updated slide content.
  The design should follow the selected template: {{{templateDetails}}}`,
});

// Define the flow using the imported schemas
const regenerateSlideFlow = ai.defineFlow(
  {
    name: 'regenerateSlideFlow',
    inputSchema: RegenerateSlideInputSchema,
    outputSchema: RegenerateSlideOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

// DO NOT export schemas or other non-async function values from this 'use server' file.
// Only export the main async function and potentially TypeScript types.
