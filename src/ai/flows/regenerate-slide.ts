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
import {z} from 'genkit';

const RegenerateSlideInputSchema = z.object({
  slideContent: z
    .string()
    .describe('The content of the slide to be regenerated.'),
  templateDetails: z
    .string()
    .describe('Details of the template being used for the presentation.'),
  smartArtDensity: z
    .enum(['low', 'medium', 'high'])
    .describe('The desired density of smart art on the slide.'),
  dataVisualizationPreference: z
    .string()
    .describe('The preferred type of data visualization (charts, graphs, infographics).'),
  contentToVisualRatio: z
    .string()
    .describe('The desired ratio of content to visual elements on the slide.'),
  toneAndStyle: z
    .string()
    .describe('The desired tone and style of the slide (professional, casual, bold, etc.).'),
});
export type RegenerateSlideInput = z.infer<typeof RegenerateSlideInputSchema>;

const RegenerateSlideOutputSchema = z.object({
  regeneratedSlide: z
    .string()
    .describe('The regenerated slide content with the new parameters.'),
});
export type RegenerateSlideOutput = z.infer<typeof RegenerateSlideOutputSchema>;

export async function regenerateSlide(input: RegenerateSlideInput): Promise<RegenerateSlideOutput> {
  return regenerateSlideFlow(input);
}

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
