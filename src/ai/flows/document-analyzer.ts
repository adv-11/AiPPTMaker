// src/ai/flows/document-analyzer.ts
'use server';

/**
 * @fileOverview Analyzes document content to extract key topics, subtopics, data points, and quotes.
 *
 * - analyzeDocumentContent - A function that handles the document analysis process.
 * - AnalyzeDocumentContentInput - The input type for the analyzeDocumentContent function.
 * - AnalyzeDocumentContentOutput - The return type for the analyzeDocumentContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeDocumentContentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The document to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. Supported types include PDF, DOCX, TXT."
    ),
});
export type AnalyzeDocumentContentInput = z.infer<typeof AnalyzeDocumentContentInputSchema>;

const AnalyzeDocumentContentOutputSchema = z.object({
  topics: z.array(z.string()).describe('Key topics identified in the document.'),
  subtopics: z.array(z.string()).describe('Subtopics for each key topic.'),
  dataPoints: z.array(z.string()).describe('Important data points extracted from the document.'),
  quotes: z.array(z.string()).describe('Key quotes extracted from the document.'),
  summary: z.string().describe('A concise summary of the document content.'),
});
export type AnalyzeDocumentContentOutput = z.infer<typeof AnalyzeDocumentContentOutputSchema>;

export async function analyzeDocumentContent(
  input: AnalyzeDocumentContentInput
): Promise<AnalyzeDocumentContentOutput> {
  // Consider adding server-side text extraction here for robustness
  // if client-side extraction or direct model handling proves unreliable.
  return analyzeDocumentContentFlow(input);
}

const analyzeDocumentContentPrompt = ai.definePrompt({
  name: 'analyzeDocumentContentPrompt',
  input: {schema: AnalyzeDocumentContentInputSchema},
  output: {schema: AnalyzeDocumentContentOutputSchema},
  prompt: `You are an expert AI document analyzer. Your task is to meticulously read the provided document, understand its content, and extract key information.

  Document Provided:
  {{media url=documentDataUri}}

  Instructions:
  1.  **Analyze Content:** Carefully analyze the content of the document provided via the data URI. Extract the text content accurately.
  2.  **Identify Key Topics:** Determine the main subjects or themes discussed in the document.
  3.  **Extract Subtopics:** For each key topic, identify related sub-points or secondary themes.
  4.  **Find Data Points:** Extract significant numerical data, statistics, or factual points presented.
  5.  **Extract Key Quotes:** Identify impactful or representative sentences or phrases from the document.
  6.  **Summarize:** Provide a concise summary of the document's overall message and purpose.

  Output Format:
  Return the extracted information strictly in the specified JSON format. Ensure all fields (topics, subtopics, dataPoints, quotes, summary) are populated based on your analysis. If no relevant information is found for a field, return an empty array [] for arrays or an empty string "" for the summary.
  `,
});


const analyzeDocumentContentFlow = ai.defineFlow(
  {
    name: 'analyzeDocumentContentFlow',
    inputSchema: AnalyzeDocumentContentInputSchema,
    outputSchema: AnalyzeDocumentContentOutputSchema,
  },
  async input => {
     // If the model consistently fails with certain document types (like DOCX via data URI),
     // a server-side pre-processing step (e.g., using mammoth.js for DOCX)
     // to extract text before calling the LLM would be necessary here.
    const {output} = await analyzeDocumentContentPrompt(input);
    return output!;
  }
);
