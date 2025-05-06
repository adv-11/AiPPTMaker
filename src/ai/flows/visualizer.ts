'use server';

/**
 * @fileOverview AI flow to transform extracted data and information into visually appealing smart art, charts, and infographics.
 *
 * - generateVisuals - A function that handles the generation of visuals from data.
 * - GenerateVisualsInput - The input type for the generateVisuals function.
 * - GenerateVisualsOutput - The return type for the generateVisuals function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVisualsInputSchema = z.object({
  data: z.string().describe('The data to visualize.'),
  templateDetails: z.string().describe('Details of the selected template, including color scheme, font styles, and layout patterns.'),
});
export type GenerateVisualsInput = z.infer<typeof GenerateVisualsInputSchema>;

const GenerateVisualsOutputSchema = z.object({
  visualElements: z.array(z.string()).describe('Array of generated visual elements (smart art, charts, infographics) as data URIs.'),
});
export type GenerateVisualsOutput = z.infer<typeof GenerateVisualsOutputSchema>;

export async function generateVisuals(input: GenerateVisualsInput): Promise<GenerateVisualsOutput> {
  return generateVisualsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVisualsPrompt',
  input: {schema: GenerateVisualsInputSchema},
  output: {schema: GenerateVisualsOutputSchema},
  prompt: `You are an AI presentation design assistant. Your task is to transform the given data into visually appealing elements (smart art, charts, and infographics) suitable for a presentation slide, following the guidelines of the selected template.

Data to visualize: {{{data}}}

Template details: {{{templateDetails}}}

Output an array of data URIs for each visual element generated.

Example output: ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...", "data:image/svg+xml,...", ...]
`,
});

const generateVisualsFlow = ai.defineFlow(
  {
    name: 'generateVisualsFlow',
    inputSchema: GenerateVisualsInputSchema,
    outputSchema: GenerateVisualsOutputSchema,
  },
  async input => {
    //TODO: Call to a service that generates data visualizations.
    const {output} = await prompt(input);
    return output!;
  }
);
