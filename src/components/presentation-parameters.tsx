"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
// Assuming a flow exists to generate the presentation based on analysis and parameters
// import { generatePresentation } from '@/ai/flows/presentation-generator'; // Placeholder
import type { AnalyzeDocumentContentOutput } from '@/ai/flows/document-analyzer'; // Import if needed for more specific typing

// Simulate visual elements with placeholder images
const placeholderVisuals = [
  "https://picsum.photos/seed/graph/600/400",
  "https://picsum.photos/seed/chart/600/400",
  "https://picsum.photos/seed/diagram/600/400",
  "https://picsum.photos/seed/infographic/600/400",
];

interface PresentationParametersProps {
  analysisData: AnalyzeDocumentContentOutput | null; // Use specific type
  onGenerationStart: () => void;
  onGenerationComplete: (presentationData: any) => void; // Type this based on expected presentation output
  isGenerating: boolean;
}

export function PresentationParameters({
  analysisData,
  onGenerationStart,
  onGenerationComplete,
  isGenerating,
}: PresentationParametersProps) {
  const [numSlides, setNumSlides] = useState<number | string>(''); // AI suggestion can be complex, start empty
  const [template, setTemplate] = useState<string>('Modern');
  const [smartArtDensity, setSmartArtDensity] = useState<string>('medium');
  const [dataVizPreference, setDataVizPreference] = useState<string>('charts');
  const [contentVisualRatio, setContentVisualRatio] = useState<string>('balanced');
  const [toneStyle, setToneStyle] = useState<string>('professional');
  const { toast } = useToast();

  // Placeholder for AI suggestion logic
  React.useEffect(() => {
    if (analysisData) {
      // Basic suggestion based on topic count or content length
      const suggestedSlides = Math.max(5, Math.min(20, (analysisData.topics?.length || 0) + (analysisData.subtopics?.length || 0) / 2));
      // Consider setting a default or placeholder if needed, e.g.,
      // if (numSlides === '') setNumSlides(Math.round(suggestedSlides));
    }
  }, [analysisData]);

  const handleGenerate = async () => {
    if (!analysisData) {
      toast({
        variant: "destructive",
        title: "Missing Analysis",
        description: "Please analyze a document first.",
      });
      return;
    }

    onGenerationStart();
    try {
       // --- Placeholder for AI Presentation Generation ---
      console.log("Starting presentation generation with parameters:", {
        analysisData, // Pass the actual analysis results
        numSlides: typeof numSlides === 'number' ? numSlides : undefined, // Handle AI suggestion string?
        template,
        smartArtDensity,
        dataVizPreference,
        contentVisualRatio,
        toneStyle,
      });

      // Simulate generation delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Replace with actual call to AI flow like generatePresentation(...)
      // Use valid placeholder URLs
      const generatedPresentation = {
        slides: [
          { id: 1, title: "Slide 1 Title", content: "Generated content for the first slide covering key topic A.", visuals: [placeholderVisuals[0]] },
          { id: 2, title: "Slide 2 Title", content: "More generated content exploring subtopic B-1.", visuals: [placeholderVisuals[1]] },
          { id: 3, title: "Data Insights", content: "Presenting important data points found in the document.", visuals: [placeholderVisuals[2]] },
          { id: 4, title: "Key Quote", content: "Highlighting a significant quote: '...'", visuals: [placeholderVisuals[3]] },
          { id: 5, title: "Conclusion Slide", content: "Summarizing the main points and concluding the presentation.", visuals: [] }, // Slide with no visual
        ],
        metadata: { template, toneStyle }
      };
      // --- End Placeholder ---

      onGenerationComplete(generatedPresentation);
      toast({
        title: "Presentation Generated",
        description: "Your presentation draft is ready for preview.",
      });
    } catch (error) {
      console.error("Presentation generation failed:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate the presentation. Please try again.",
      });
      onGenerationComplete(null); // Indicate failure
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Set Presentation Parameters</CardTitle>
        <CardDescription>Configure how the AI should generate your presentation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger id="template">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Modern">Modern</SelectItem>
                <SelectItem value="Corporate">Corporate</SelectItem>
                <SelectItem value="Creative">Creative</SelectItem>
                <SelectItem value="Minimal">Minimal</SelectItem>
                {/* Option to upload custom template later */}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
             <Label htmlFor="num-slides">Number of Slides (Optional)</Label>
            <Input
              id="num-slides"
              type="number"
              placeholder="Leave blank for AI suggestion"
              value={typeof numSlides === 'number' ? numSlides : ''}
              onChange={(e) => setNumSlides(e.target.value ? parseInt(e.target.value, 10) : '')}
              min="1"
            />
          </div>


          <div className="space-y-2">
            <Label htmlFor="smart-art-density">Smart Art Density</Label>
            <Select value={smartArtDensity} onValueChange={setSmartArtDensity}>
              <SelectTrigger id="smart-art-density">
                <SelectValue placeholder="Select density" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data-viz">Data Visualization</Label>
            <Select value={dataVizPreference} onValueChange={setDataVizPreference}>
              <SelectTrigger id="data-viz">
                <SelectValue placeholder="Select preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="charts">Charts</SelectItem>
                <SelectItem value="graphs">Graphs</SelectItem>
                <SelectItem value="infographics">Infographics</SelectItem>
              </SelectContent>
            </Select>
          </div>

           <div className="space-y-2">
            <Label htmlFor="content-ratio">Content/Visual Ratio</Label>
            <Select value={contentVisualRatio} onValueChange={setContentVisualRatio}>
              <SelectTrigger id="content-ratio">
                <SelectValue placeholder="Select ratio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text-heavy">Text Heavy</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="visual-heavy">Visual Heavy</SelectItem>
              </SelectContent>
            </Select>
          </div>

           <div className="space-y-2">
            <Label htmlFor="tone-style">Tone & Style</Label>
            <Select value={toneStyle} onValueChange={setToneStyle}>
              <SelectTrigger id="tone-style">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
                <SelectItem value="informative">Informative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!analysisData || isGenerating}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Presentation...
            </>
          ) : (
            'Generate Presentation'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
