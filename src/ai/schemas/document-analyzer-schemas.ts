import { z } from 'genkit';

export const AnalyzeDocumentContentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The document to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. Supported types include PDF, DOCX, TXT."
    ),
});

export const AnalyzeDocumentContentOutputSchema = z.object({
  topics: z.array(z.string()).describe('Key topics identified in the document.'),
  subtopics: z.array(z.string()).describe('Subtopics for each key topic.'),
  dataPoints: z.array(z.string()).describe('Important data points extracted from the document.'),
  quotes: z.array(z.string()).describe('Key quotes extracted from the document.'),
  summary: z.string().describe('A concise summary of the document content.'),
});
