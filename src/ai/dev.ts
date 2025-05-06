import { config } from 'dotenv';
config();

// Import the flow functions directly
import '@/ai/flows/regenerate-slide';
import '@/ai/flows/document-analyzer';
import '@/ai/flows/visualizer';
import '@/ai/flows/presentation-generator'; // Keep this import

// Schemas are now in separate files and don't need explicit registration for dev mode.
// Genkit picks up flows defined with ai.defineFlow automatically.
