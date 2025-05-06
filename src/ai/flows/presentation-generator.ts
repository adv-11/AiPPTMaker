// src/ai/flows/presentation-generator.ts
'use server';

/**
 * @fileOverview Generates presentation slides based on analyzed document content and user parameters.
 *
 * - generatePresentation - A function that handles the presentation generation process.
 * - GeneratePresentationInput - The input type for the generatePresentation function.
 * - GeneratedSlide - The structure for a single generated slide.
 * - GeneratePresentationOutput - The return type for the generatePresentation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { AnalyzeDocumentContentOutput } from './document-analyzer'; // Keep type import
// Import necessary types and the main function from visualizer
import type { GenerateVisualsInput, GenerateVisualsOutput } from './visualizer';
import { generateVisuals } from './visualizer';
// Import schemas from the dedicated file
import {
    GeneratedSlideSchema,
    GeneratePresentationInputSchema,
    GeneratePresentationOutputSchema
} from '@/ai/schemas/presentation-generator-schemas';

// --- Define Tools ---

const webSearchTool = ai.defineTool(
    {
        name: 'webSearch',
        description: 'Performs a web search for information or images based on a query.',
        inputSchema: z.object({ query: z.string().describe("The search query.") }),
        outputSchema: z.object({ results: z.array(z.object({ title: z.string(), link: z.string(), snippet: z.string().optional() })).describe("Search results.") }),
    },
    async ({ query }) => {
        // Placeholder: In a real implementation, this would call a search API (Google Search, Bing, etc.)
        console.log(`Performing web search for: ${query}`);
        // Simulate finding some relevant results
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        // Use picsum for placeholder images identifiable by URL structure
        const imageSeed = encodeURIComponent(query.replace(/\s+/g, '-').toLowerCase()); // Create a seed from the query
        return {
            results: [
                { title: `Result 1 for ${query}`, link: `https://example.com/search?q=${encodeURIComponent(query)}&n=1`, snippet: `This is a snippet for the first result related to ${query}.` },
                 { title: `Image Result for ${query}`, link: `https://picsum.photos/seed/${imageSeed}/400/300`, snippet: `An image related to ${query}.` },
                { title: `Result 3 for ${query}`, link: `https://example.com/search?q=${encodeURIComponent(query)}&n=3`, snippet: `Another relevant snippet for ${query}.` },
            ]
        };
    }
);

// --- Data Structures ---

// Define TypeScript types based on the imported Zod schemas
export type GeneratedSlide = z.infer<typeof GeneratedSlideSchema>;
export type GeneratePresentationInput = z.infer<typeof GeneratePresentationInputSchema>;
export type GeneratePresentationOutput = z.infer<typeof GeneratePresentationOutputSchema>;


// --- Main Presentation Generation Flow ---

// Define the main prompt using imported schemas
const presentationStructurePrompt = ai.definePrompt({
    name: 'presentationStructurePrompt',
    input: { schema: GeneratePresentationInputSchema },
    output: { schema: GeneratePresentationOutputSchema },
    tools: [webSearchTool],
    system: "You are an AI Presentation Assistant. Use the available tools, like web search, when necessary to find relevant information or images for the slides, especially if the user prefers 'web-images' for visuals.",
    prompt: `You are an AI Presentation Assistant. Your task is to create a compelling presentation structure based on the provided document analysis and user preferences.

    **Document Analysis:**
    Summary: {{{analysisData.summary}}}
    Topics: {{#each analysisData.topics}}- {{{this}}}{{/each}}
    Subtopics: {{#each analysisData.subtopics}}- {{{this}}}{{/each}}
    Data Points: {{#each analysisData.dataPoints}}- {{{this}}}{{/each}}
    Quotes: {{#each analysisData.quotes}}- "{{{this}}}"{{/each}}

    **User Preferences:**
    {{#if numSlides}}Target Number of Slides: {{{numSlides}}}{{else}}Number of Slides: Determine automatically based on content (aim for conciseness).{{/if}}
    Template: {{{template}}}
    Smart Art/Visual Density: {{{smartArtDensity}}}
    Data Visualization Preference: {{{dataVizPreference}}} (Use web search if 'web-images' is preferred and appropriate)
    Content/Visual Ratio: {{{contentVisualRatio}}}
    Tone & Style: {{{toneStyle}}}

    **Instructions:**

    1.  **Determine Slide Structure:** Decide on the number of slides (if not specified), slide titles, and the key information (text content) for each slide. Start with a title slide and end with a conclusion/summary slide. Distribute topics, subtopics, data points, and quotes logically across the slides.
    2.  **Generate Content:** Write concise and engaging text content for each slide, adhering to the requested {{{toneStyle}}}. Summarize information appropriately.
    3.  **Identify Visual Opportunities:** Based on the content of each slide and the user's preferences ({{{smartArtDensity}}}, {{{dataVizPreference}}}, {{{contentVisualRatio}}}), decide if a visual element (chart, graph, diagram, relevant image, infographic) would enhance the slide.
    4.  **Create Visual Prompts:** If a visual is needed:
        *   For charts, graphs, diagrams, infographics: Formulate a clear and specific prompt (\`visualPrompt\`) describing the visual to be generated based on slide content (e.g., "Bar chart showing sales data: Q1 $50k, Q2 $75k", "Diagram illustrating the 3-step process").
        *   If the user prefers 'web-images' or if a relevant real-world image is suitable: Formulate a concise search query for the webSearch tool as the \`visualPrompt\` (e.g., "modern office building", "team collaboration"). Use the tool to find an image URL. Set the visualDataUri field directly to the found image URL if the search tool provides one.
        *   If no visual is needed, leave \`visualPrompt\` empty or null.
    5.  **Output Format:** Return the complete presentation structure as a JSON object matching the output schema. Ensure each slide has an ID, title, and content. Include the \`visualPrompt\` if a visual is intended. Include the \`visualDataUri\` ONLY if a web search successfully found an image URL. DO NOT generate actual visual data URIs (except for web search results) in THIS step; only generate prompts for other visuals.

    **Example Slide Object (Chart - Needs Generation Later):**
    { "id": 1, "title": "Sales Performance Q1", "content": "Sales increased by 15% in Q1.", "visualPrompt": "Bar chart showing Q1 sales growth of 15%" }

    **Example Slide Object (Web Image - Found by Tool):**
    { "id": 2, "title": "Future Workspace", "content": "Collaboration is key.", "visualPrompt": "modern collaborative office space", "visualDataUri": "https://picsum.photos/seed/modern-collaborative-office-space/400/300" }

    **Example Slide Object (No Visual):**
    { "id": 3, "title": "Key Takeaways", "content": "Focus on customer retention." }

    Generate the presentation structure now.
    `,
});

// Define the main flow using imported schemas
const generatePresentationFlow = ai.defineFlow(
    {
        name: 'generatePresentationFlow',
        inputSchema: GeneratePresentationInputSchema,
        outputSchema: GeneratePresentationOutputSchema,
    },
    async (input) => {
        console.log("Generating presentation structure and identifying visuals...");
        // 1. Get the slide structure and visual prompts/search queries from the LLM
        const structureResponse = await presentationStructurePrompt(input);
        let slides = structureResponse.output?.slides;
        const metadata = {
            template: input.template,
            toneStyle: input.toneStyle,
        };

        if (!slides) {
            throw new Error("Failed to generate presentation structure.");
        }
        console.log(`Generated ${slides.length} slides structure.`);

        // 2. Generate visuals for slides that have prompts BUT NO visualDataUri yet
        const visualGenerationPromises = slides.map(async (slide, index) => {
            if (slide.visualPrompt && !slide.visualDataUri && typeof slide.visualPrompt === 'string' && slide.visualPrompt.trim() !== '') {
                 console.log(`Slide ${index + 1}: Generating visual from prompt: "${slide.visualPrompt}"`);
                 try {
                     // Prepare input for the visualizer flow using the correct type
                     const visualInput: GenerateVisualsInput = {
                         promptText: slide.visualPrompt,
                         templateDetails: `Template: ${input.template}, Style: ${input.toneStyle}`
                     };
                     const visualResult = await generateVisuals(visualInput); // Call the imported generateVisuals function
                     return { ...slide, visualDataUri: visualResult.visualDataUri };
                 } catch (error) {
                     console.error(`Failed to generate visual for slide ${index + 1} from prompt "${slide.visualPrompt}":`, error);
                     return { ...slide, visualDataUri: undefined, visualPrompt: `Error generating visual: ${error instanceof Error ? error.message : 'Visual generation failed'}` };
                 }
            }
            return slide;
        });

        // 3. Wait for all visual generations to complete
        const slidesWithVisuals = await Promise.all(visualGenerationPromises);
        console.log("Visual processing for slides completed.");

        const cleanedSlides = slidesWithVisuals.map(slide => ({
             ...slide,
             visualDataUri: slide.visualDataUri && slide.visualDataUri.trim() !== '' ? slide.visualDataUri : undefined,
        }));

        return { slides: cleanedSlides, metadata };
    }
);

// Exported wrapper function
export async function generatePresentation(input: GeneratePresentationInput): Promise<GeneratePresentationOutput> {
    try {
        const result = await generatePresentationFlow(input);
        console.log("Presentation generation successful.");
        result.slides.forEach(slide => {
            if (slide.visualDataUri && !slide.visualDataUri.startsWith('data:image') && !slide.visualDataUri.startsWith('https://')) {
                console.warn(`Slide ${slide.id} has potentially invalid visualDataUri: ${slide.visualDataUri}`);
            }
        });
        return result;
    } catch (error) {
        console.error("Error in generatePresentation flow:", error);
         const emptyOutput: GeneratePresentationOutput = {
            slides: [{
                id: 0,
                title: "Error Generating Presentation",
                content: `Failed to generate presentation: ${error instanceof Error ? error.message : String(error)}`,
                visualDataUri: undefined,
                visualPrompt: undefined,
            }],
            metadata: { template: input.template, toneStyle: input.toneStyle }
         }
         return emptyOutput;
    }
}

// DO NOT export schemas or other non-async function values from this 'use server' file.
// Only export the main async function and potentially TypeScript types.
