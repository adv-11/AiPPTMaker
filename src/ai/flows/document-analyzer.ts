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
      "The document to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeDocumentContentInput = z.infer<typeof AnalyzeDocumentContentInputSchema>;

const AnalyzeDocumentContentOutputSchema = z.object({
  topics: z.array(z.string()).describe('Key topics identified in the document.'),
  subtopics: z.array(z.string()).describe('Subtopics for each key topic.'),
  dataPoints: z.array(z.string()).describe('Important data points extracted from the document.'),
  quotes: z.array(z.string()).describe('Key quotes extracted from the document.'),
  summary: z.string().describe('A summary of the document content.'),
});
export type AnalyzeDocumentContentOutput = z.infer<typeof AnalyzeDocumentContentOutputSchema>;

export async function analyzeDocumentContent(
  input: AnalyzeDocumentContentInput
): Promise<AnalyzeDocumentContentOutput> {
  return analyzeDocumentContentFlow(input);
}

const analyzeDocumentContentPrompt = ai.definePrompt({
  name: 'analyzeDocumentContentPrompt',
  input: {schema: AnalyzeDocumentContentInputSchema},
  output: {schema: AnalyzeDocumentContentOutputSchema},
  prompt: `You are an AI document analyzer. Your task is to extract key topics, subtopics, important data points, and quotes from the given document.

  Analyze the following document:
  {{documentDataUri}}

  Output the key topics, subtopics, data points, and quotes in a JSON format.
  Also provide a summary of the document content.
  `,
});

const analyzeDocumentContentFlow = ai.defineFlow(
  {
    name: 'analyzeDocumentContentFlow',
    inputSchema: AnalyzeDocumentContentInputSchema,
    outputSchema: AnalyzeDocumentContentOutputSchema,
  },
  async input => {
    const {output} = await analyzeDocumentContentPrompt(input);
    return output!;
  }
);
