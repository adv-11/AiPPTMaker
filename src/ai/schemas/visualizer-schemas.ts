import { z } from 'genkit';

export const GenerateVisualsInputSchema = z.object({
  promptText: z.string().describe('Text description or data points to visualize. Be specific about the desired visual type (e.g., "bar chart showing sales data", "diagram explaining the process", "infographic about key statistics").'),
  templateDetails: z.string().optional().describe('Optional details about the presentation template (color scheme, style) to influence the visual style.'),
});

export const GenerateVisualsOutputSchema = z.object({
  visualDataUri: z.string().describe('A data URI of the generated visual element (e.g., chart, graph, diagram, infographic). Format: "data:image/png;base64,..."'),
});
