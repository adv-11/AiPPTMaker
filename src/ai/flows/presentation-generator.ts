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
        description: 'Performs a web search for information or images based on a query. Use this ONLY for finding existing images on the web, NOT for generating new ones.',
        inputSchema: z.object({ query: z.string().describe("The search query for a suitable image.") }),
        outputSchema: z.object({ results: z.array(z.object({ title: z.string(), link: z.string().describe("URL link to the search result. Prioritize direct image URLs (e.g., ending in .jpg, .png, .gif or from known image sites like picsum.photos)."), snippet: z.string().optional() })).describe("Search results. Aim for results with image URLs.") }),
    },
    async ({ query }) => {
        // Placeholder: In a real implementation, this would call a search API (Google Search, Bing, etc.)
        console.log(`Performing web search for image: ${query}`);
        // Simulate finding some relevant results
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        // Use picsum for placeholder images identifiable by URL structure
        const imageSeed = encodeURIComponent(query.replace(/\s+/g, '-').toLowerCase()); // Create a seed from the query
         // Prioritize picsum link if possible, otherwise fallback
         const picsumUrl = `https://picsum.photos/seed/${imageSeed}/400/300`;
         let imageResult = { title: `Image Result for ${query}`, link: picsumUrl, snippet: `An image related to ${query}.` };

        // Simulate sometimes finding non-image links too
        const webPageResult = { title: `Web page about ${query}`, link: `https://example.com/info/${imageSeed}`, snippet: `Information about ${query}.` };
        const otherImageResult = { title: `Another Image Result for ${query}`, link: `https://picsum.photos/seed/${imageSeed}-alt/400/300`, snippet: `Alternative image for ${query}.` };

        return {
            // Mix results, ensuring the primary picsum URL is usually first
            results: [
                imageResult,
                webPageResult,
                otherImageResult,
            ].sort(() => Math.random() - 0.5) // Randomize slightly
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
    tools: [webSearchTool], // Make web search available
    system: "You are an AI Presentation Assistant. Your primary goal is to structure a presentation and identify relevant VISUALS FROM THE WEB using the webSearch tool. Only suggest AI generation for charts, graphs, or diagrams if explicitly appropriate based on content and preferences; otherwise, search the web for existing images. Strictly adhere to the output JSON schema.",
    prompt: `You are an AI Presentation Assistant. Create a presentation structure based on the document analysis and user preferences. Focus on finding relevant IMAGES FROM THE WEB using the webSearch tool.

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
    Data Visualization Preference: {{{dataVizPreference}}} (Use 'web-images' to prioritize web search)
    Content/Visual Ratio: {{{contentVisualRatio}}}
    Tone & Style: {{{toneStyle}}}

    **Instructions:**

    1.  **Determine Slide Structure:** Decide on slide titles and key text content. Start with a title slide, end with a conclusion. Distribute information logically.
    2.  **Generate Content:** Write concise text for each slide using the requested {{{toneStyle}}}.
    3.  **Identify Visual Needs:** Based on slide content and user preferences ({{{smartArtDensity}}}, {{{contentVisualRatio}}}, {{{dataVizPreference}}}), decide if a visual is needed.
    4.  **Find or Describe Visuals (Prioritize Web Search):**
        *   **If an IMAGE is suitable:**
            *   Formulate a concise SEARCH QUERY for the \`webSearch\` tool as the \`visualPrompt\` (e.g., "modern office building", "team collaboration").
            *   **USE THE \`webSearch\` TOOL** to find an image URL.
            *   If the tool returns a result with a clear IMAGE URL (e.g., from picsum.photos, or ending in .jpg, .png), set the \`visualDataUri\` field to that URL. Pick the most relevant image URL if multiple are returned.
            *   If the tool does NOT return a suitable image URL, leave \`visualDataUri\` as null (or omit it). DO NOT attempt to generate the image yourself in this step.
        *   **If a CHART, GRAPH, DIAGRAM, or INFOGRAPHIC is more appropriate (and NOT a general image):**
            *   Formulate a clear, descriptive prompt for AI generation as the \`visualPrompt\` (e.g., "Bar chart showing sales data: Q1 $50k, Q2 $75k", "Diagram illustrating the 3-step process").
            *   Leave \`visualDataUri\` as null (or omit it). The visual will be generated later.
        *   **If no visual is needed:** Leave both \`visualPrompt\` and \`visualDataUri\` as null or omit them.
    5.  **Output Format:** Return the complete presentation structure as a JSON object strictly matching the output schema. Ensure \`visualDataUri\` contains a WEB URL if found by the tool, otherwise it should be null/omitted for later generation or if no visual is needed.

    **Example Slide (Web Image Found):**
    { "id": 1, "title": "Future Workspace", "content": "Collaboration is key.", "visualPrompt": "modern collaborative office space", "visualDataUri": "https://picsum.photos/seed/modern-collaborative-office-space/400/300" }

    **Example Slide (Chart - Needs Generation Later):**
    { "id": 2, "title": "Sales Performance Q1", "content": "Sales increased by 15% in Q1.", "visualPrompt": "Bar chart showing Q1 sales growth of 15%", "visualDataUri": null }

    **Example Slide (No Visual):**
    { "id": 3, "title": "Key Takeaways", "content": "Focus on customer retention.", "visualPrompt": null, "visualDataUri": null }

    Generate the presentation structure now, prioritizing web search for images.
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
        console.log("Generating presentation structure and finding web images...");
        // 1. Get the slide structure, potential web image URLs, and AI visual prompts
        const structureResponse = await presentationStructurePrompt(input);
        let slides = structureResponse.output?.slides;
        const metadata = {
            template: input.template,
            toneStyle: input.toneStyle,
        };

        if (!slides) {
            throw new Error("Failed to generate presentation structure. LLM response was empty or invalid.");
        }
         // Ensure slides conform to schema initially, especially optional fields
         slides = slides.map(slide => ({
             ...slide,
             // Ensure visualDataUri is treated as optional from the start
             visualDataUri: slide.visualDataUri && slide.visualDataUri.trim() !== '' ? slide.visualDataUri.trim() : undefined,
             visualPrompt: slide.visualPrompt && slide.visualPrompt.trim() !== '' ? slide.visualPrompt.trim() : undefined,
         }));

        console.log(`Generated ${slides.length} slides structure. ${slides.filter(s => s.visualDataUri).length} slides have web images found.`);

        // 2. Generate AI visuals (Charts, Diagrams etc.) ONLY for slides that:
        //    a) Have a visualPrompt.
        //    b) DO NOT already have a visualDataUri (meaning web search didn't find/provide one).
        //    c) The visualPrompt does NOT look like a web search query (heuristic: doesn't scream "image of X"). This is tricky, rely on the prompt guidance mostly.
        const visualGenerationPromises = slides.map(async (slide, index) => {
            // Check conditions for AI generation
            const needsAiGeneration = slide.visualPrompt &&
                                      !slide.visualDataUri &&
                                      // Heuristic: If preference is *not* explicitly web-images, OR if prompt asks for specific chart/diagram types, generate.
                                      (input.dataVizPreference !== 'web-images' || /chart|graph|diagram|infographic/i.test(slide.visualPrompt));

            if (needsAiGeneration && typeof slide.visualPrompt === 'string') {
                 console.log(`Slide ${index + 1} (${slide.title}): Generating AI visual (Chart/Diagram/etc.) from prompt: "${slide.visualPrompt}"`);
                 try {
                     const visualInput: GenerateVisualsInput = {
                         promptText: slide.visualPrompt, // Prompt should describe the chart/diagram
                         templateDetails: `Template: ${input.template}, Style: ${input.toneStyle}`
                     };
                     const visualResult = await generateVisuals(visualInput);
                     console.log(`Slide ${index + 1}: AI Visual generated successfully.`);
                     return { ...slide, visualDataUri: visualResult.visualDataUri }; // Store the generated data URI
                 } catch (error) {
                     console.error(`Failed to generate AI visual for slide ${index + 1} ("${slide.title}") from prompt "${slide.visualPrompt}":`, error);
                     // Keep slide, mark failure
                     return { ...slide, visualDataUri: undefined, visualPrompt: `Error generating AI visual from prompt "${slide.visualPrompt}": ${error instanceof Error ? error.message : 'Visual generation failed'}` };
                 }
            } else if (slide.visualPrompt && !slide.visualDataUri) {
                console.log(`Slide ${index + 1} (${slide.title}): Web search requested ("${slide.visualPrompt}"), but no image URL found/provided by the tool. Skipping AI generation.`);
            }
            // If visualDataUri already exists (from web search) or no visual needed, or AI generation skipped, return slide as is
            return slide;
        });

        // 3. Wait for all potential AI visual generations to complete
        const slidesWithVisuals = await Promise.all(visualGenerationPromises);
        console.log("AI visual processing (if any) for slides completed.");

        // 4. Final cleanup: ensure visualDataUri is undefined if null/empty/invalid
        const cleanedSlides = slidesWithVisuals.map(slide => ({
             ...slide,
             visualDataUri: slide.visualDataUri && typeof slide.visualDataUri === 'string' && slide.visualDataUri.trim() !== '' ? slide.visualDataUri.trim() : undefined,
             visualPrompt: slide.visualPrompt && typeof slide.visualPrompt === 'string' && slide.visualPrompt.trim() !== '' ? slide.visualPrompt.trim() : undefined,
        }));

         console.log(`Final slide count: ${cleanedSlides.length}. Slides with any visual URI: ${cleanedSlides.filter(s => s.visualDataUri).length}`);


        return { slides: cleanedSlides, metadata };
    }
);

// Exported wrapper function
export async function generatePresentation(input: GeneratePresentationInput): Promise<GeneratePresentationOutput> {
    try {
        const result = await generatePresentationFlow(input);
        console.log("Presentation generation successful.");

        // Log details about final visuals
        result.slides.forEach((slide, index) => {
            if (slide.visualDataUri) {
                const type = slide.visualDataUri.startsWith('data:image') ? 'Generated AI Visual' : 'Web Image URL';
                console.log(`Slide ${index + 1} (${slide.title}): Has visual (${type}). Prompt was: "${slide.visualPrompt || 'N/A'}"`);
                 // Validate URL format more strictly if it's not a data URI
                 if (!slide.visualDataUri.startsWith('data:image') && !/^(https?:\/\/)/.test(slide.visualDataUri)) {
                     console.warn(`Slide ${index + 1} (${slide.title}) has potentially invalid visualDataUri (neither data URI nor http(s)): ${slide.visualDataUri}`);
                     // Optionally clear invalid URI
                     // result.slides[index].visualDataUri = undefined;
                 }
            } else if (slide.visualPrompt?.startsWith('Error generating')) {
                 console.warn(`Slide ${index + 1} (${slide.title}): Visual generation failed. Prompt: ${slide.visualPrompt}`);
            } else if (slide.visualPrompt) {
                console.log(`Slide ${index + 1} (${slide.title}): Had visual prompt "${slide.visualPrompt}", but no visual URI ended up in the final output.`);
            } else {
                 console.log(`Slide ${index + 1} (${slide.title}): No visual needed or generated.`);
            }
        });

        return result;
    } catch (error) {
        console.error("Error in generatePresentation flow:", error);
         // Provide a more informative error message back to the UI
         let errorMessage = `Failed to generate presentation: ${error instanceof Error ? error.message : String(error)}`;
         if (error instanceof Error && error.message.includes('Schema validation failed')) {
            errorMessage = `Failed to generate presentation: The AI model did not return data in the expected format. Check server logs for details. Details: ${error.message}`;
         } else if (error instanceof Error && error.message.includes('deadline')) {
             errorMessage = `Failed to generate presentation: The request timed out. This might be due to a complex request or network issues. Please try again.`;
         }

         const errorOutput: GeneratePresentationOutput = {
            slides: [{
                id: 0, // Special ID to indicate error
                title: "Error Generating Presentation",
                content: errorMessage,
                visualDataUri: undefined,
                visualPrompt: undefined,
            }],
            metadata: { template: input.template, toneStyle: input.toneStyle }
         }
         return errorOutput;
    }
}
