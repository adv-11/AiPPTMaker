# AI Presentation Generator

## Overview

This project is an AI-powered presentation generator application built with Next.js, TypeScript, and Tailwind CSS. It leverages Google's Generative AI (via Genkit) to analyze uploaded documents (PDF, DOCX, TXT) and automatically create presentation slides based on the content.

## Features

-   **Document Upload & Analysis:** Upload PDF, DOCX, or TXT files. The AI analyzes the content to extract key topics, subtopics, data points, quotes, and a summary.
-   **AI Presentation Generation:** Automatically generates presentation slides based on the document analysis and user-defined parameters (template style, number of slides, visual preferences, tone).
-   **Dynamic Visuals:**
    -   Uses web search (via a Genkit tool) to find relevant images for slides based on content.
    -   Generates charts, graphs, and diagrams using AI based on slide content and user preferences (if web images aren't preferred or suitable).
-   **Customization Parameters:** Configure the presentation generation with options for:
    -   Template (Modern, Corporate, Creative, Minimal)
    -   Number of Slides (Optional, AI suggests if blank)
    -   Visual Density (Low, Medium, High)
    -   Data Visualization Preference (Charts, Graphs, Infographics, Diagrams, Web Images)
    -   Content/Visual Ratio (Text Heavy, Balanced, Visual Heavy)
    -   Tone & Style (Professional, Casual, Bold, Informative, Engaging)
-   **Interactive Preview:** Preview the generated slides in a carousel.
-   **Slide Editing:** Edit the text content of generated slides directly in the preview.
-   **Slide Regeneration:** Regenerate the text content of a specific slide using AI (visual regeneration not yet implemented).
-   **UI Components:** Uses `shadcn/ui` for a modern and consistent user interface.
-   **AI Flows:** Implements AI logic with `genkit` for document analysis, presentation structuring, and visual generation.

## Placeholder / Future Features

-   **Export Functionality:** Exporting to PPTX and PDF formats is not yet implemented. Buttons exist but show a "coming soon" message.
-   **Sharing:** Presentation sharing functionality is not yet implemented. The button exists but shows a "coming soon" message.
-   **Visual Regeneration:** Regenerating the *visual* element of a slide is not yet implemented (only content regeneration works).
-   **Advanced Customization:** More granular control over slide layouts, fonts, and color schemes.
-   **Custom Templates:** Ability to upload or define custom presentation templates.

## Project Structure

-   `src/app/`: Next.js App Router pages and layout.
    -   `page.tsx`: The main application page.
    -   `layout.tsx`: The root layout.
    -   `globals.css`: Global styles and Tailwind/ShadCN theme variables.
-   `src/components/`: Reusable React components.
    -   `ui/`: Shadcn UI components.
    -   `header.tsx`, `file-upload.tsx`, `analysis-results.tsx`, `presentation-parameters.tsx`, `presentation-preview.tsx`: Core application components.
-   `src/ai/`: Genkit AI flows, schemas, and configuration.
    -   `flows/`: Contains the AI logic for `document-analyzer`, `presentation-generator`, `visualizer`, `regenerate-slide`.
    -   `schemas/`: Zod schemas defining the input and output structures for the AI flows.
    -   `genkit.ts`: Genkit initialization and configuration (connects to Google AI).
    -   `dev.ts`: Entry point for the Genkit development server.
-   `src/hooks/`: Custom React hooks (e.g., `use-toast`, `use-mobile`).
-   `src/lib/`: Utility functions (e.g., `utils.ts` for `cn`).
-   `public/`: Static assets.
-   `next.config.ts`: Next.js configuration (includes image hostname allowlist).
-   `tailwind.config.ts`: Tailwind CSS configuration.
-   `components.json`: Shadcn UI configuration.
-   `tsconfig.json`: TypeScript configuration.
-   `package.json`: Project dependencies and scripts.
-   `.env`: Environment variables (requires `GOOGLE_API_KEY`).

## Getting Started

Follow these steps to get the project up and running locally:

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up Environment Variables:**
    *   Create a `.env` file in the root of the project.
    *   Add your Google AI API key to the `.env` file. You can obtain one from [Google AI Studio](https://aistudio.google.com/app/apikey).
        ```env
        GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
        ```
    *   **Important:** Ensure this key has access to the "Gemini 2.0 Flash Experimental" model (`gemini-2.0-flash-exp`) if you want AI visual generation (charts, diagrams) to work correctly, as this model is used by the `visualizer` flow. The base text generation uses `gemini-pro`.

4.  **Run the Genkit Development Server:**
    *   Genkit flows need to be running for the AI features to work. Open a **separate terminal** and run:
        ```bash
        npm run genkit:dev
        ```
    *   This command starts the Genkit development UI (usually accessible at `http://localhost:4000`) and makes the defined flows available for the Next.js app to call. Keep this terminal running.

5.  **Run the Next.js Development Server:**
    *   In your **main terminal**, run:
        ```bash
        npm run dev
        ```
    *   This will start the Next.js application (usually accessible at `http://localhost:9002`).

6.  **Open the Application:**
    *   Open your browser and navigate to `http://localhost:9002`.

Now you should be able to upload documents, configure parameters, and generate presentations! Remember that export and share features are currently placeholders.
```