import { z } from 'genkit';
// Note: Import schemas from other files if needed, e.g.:
// import { AnalyzeDocumentContentOutputSchema } from './document-analyzer-schemas';

// Define the structure for a single slide
export const GeneratedSlideSchema = z.object({
    id: z.number().describe('Unique identifier for the slide.'),
    title: z.string().describe('The title of the slide.'),
    content: z.string().describe('The main text content of the slide.'),
    visualDataUri: z.string().nullable().optional().describe('Optional URL or data URI for a visual element. Can be an HTTPS URL found via web search OR a base64 data URI (e.g., "data:image/png;base64,...") for AI-generated charts/diagrams. Null or omitted if no visual is used.'),
    visualPrompt: z.string().nullable().optional().describe('The prompt used to generate the visual OR the query used for web search. Null or omitted if no visual is used.')
});

// Define the input schema, combining analysis and parameters
export const GeneratePresentationInputSchema = z.object({
  // Instead of directly embedding, use the imported schema or redefine if simpler
  analysisData: z.object({
    topics: z.array(z.string()),
    subtopics: z.array(z.string()),
    dataPoints: z.array(z.string()),
    quotes: z.array(z.string()),
    summary: z.string(),
  }).describe('The analyzed content from the document.'),
  numSlides: z.number().optional().describe('Target number of slides. AI will decide if not provided.'),
  template: z.string().describe('Selected presentation template name (e.g., Modern, Corporate).'),
  smartArtDensity: z.enum(['low', 'medium', 'high']).describe('Desired density of smart art/visuals.'),
  dataVizPreference: z.string().describe('Preferred type of data visualization (e.g., "charts", "graphs", "infographics", "web-images"). Use "web-images" to prioritize searching for existing images online.'),
  contentVisualRatio: z.string().describe('Desired ratio of content to visuals (text-heavy, balanced, visual-heavy).'),
  toneStyle: z.string().describe('Desired tone and style (professional, casual, bold, informative).'),
});

// Define the output schema
export const GeneratePresentationOutputSchema = z.object({
  slides: z.array(GeneratedSlideSchema).describe('An array of generated presentation slides.'),
  metadata: z.object({
        template: z.string(),
        toneStyle: z.string(),
        // Add other relevant params if needed downstream
    }).describe('Metadata about the generated presentation.'),
});

