import { z } from 'genkit';

export const RegenerateSlideInputSchema = z.object({
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

export const RegenerateSlideOutputSchema = z.object({
  regeneratedSlide: z
    .string()
    .describe('The regenerated slide content with the new parameters.'),
});
