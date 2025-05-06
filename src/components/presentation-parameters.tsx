"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
// Import types and function directly from the presentation generator flow file
import { generatePresentation, GeneratePresentationInput, GeneratePresentationOutput } from '@/ai/flows/presentation-generator';
// Import type directly from the document analyzer flow file
import type { AnalyzeDocumentContentOutput } from '@/ai/flows/document-analyzer';

interface PresentationParametersProps {
  analysisData: AnalyzeDocumentContentOutput | null;
  onGenerationStart: () => void;
  onGenerationComplete: (presentationData: GeneratePresentationOutput | null) => void;
  isGenerating: boolean;
}

export function PresentationParameters({
  analysisData,
  onGenerationStart,
  onGenerationComplete,
  isGenerating,
}: PresentationParametersProps) {
  const [numSlides, setNumSlides] = useState<number | string>('');
  const [template, setTemplate] = useState<string>('Modern');
  const [smartArtDensity, setSmartArtDensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [dataVizPreference, setDataVizPreference] = useState<string>('charts');
  const [contentVisualRatio, setContentVisualRatio] = useState<string>('balanced');
  const [toneStyle, setToneStyle] = useState<string>('professional');
  const { toast } = useToast();

  React.useEffect(() => {
    if (analysisData) {
       // No AI suggestion logic implemented yet
    }
  }, [analysisData, numSlides]);

  const handleGenerate = async () => {
    if (!analysisData) {
      toast({
        variant: "destructive",
        title: "Missing Analysis",
        description: "Please analyze a document first.",
      });
      return;
    }
     if (typeof numSlides === 'string' && numSlides !== '' && parseInt(numSlides, 10) <= 0) {
       toast({
         variant: "destructive",
         title: "Invalid Slide Number",
         description: "Number of slides must be positive.",
       });
       return;
     }

    onGenerationStart();
    try {
      // Prepare input for the AI flow
      const presentationInput: GeneratePresentationInput = {
        analysisData: { // Ensure structure matches AnalyzeDocumentContentOutput
            topics: analysisData.topics || [],
            subtopics: analysisData.subtopics || [],
            dataPoints: analysisData.dataPoints || [],
            quotes: analysisData.quotes || [],
            summary: analysisData.summary || '',
        },
        numSlides: typeof numSlides === 'number' ? numSlides : typeof numSlides === 'string' && numSlides !== '' ? parseInt(numSlides, 10) : undefined, // Handle empty string case
        template,
        smartArtDensity,
        dataVizPreference,
        contentVisualRatio,
        toneStyle,
      };

      console.log("Calling generatePresentation with input:", presentationInput);

      // Call the actual AI flow
      const generatedPresentation = await generatePresentation(presentationInput);

      console.log("Received presentation data:", generatedPresentation);

      // Basic check if the generation resulted in an error slide structure
      if (generatedPresentation.slides.length === 1 && generatedPresentation.slides[0].id === 0 && generatedPresentation.slides[0].title.startsWith("Error")) {
          throw new Error(generatedPresentation.slides[0].content);
      }

      onGenerationComplete(generatedPresentation);
      toast({
        title: "Presentation Generated",
        description: "Your presentation draft is ready for preview.",
      });
    } catch (error: any) {
      console.error("Presentation generation failed:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error?.message || "Could not generate the presentation. Please try again.",
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
               value={numSlides}
               onChange={(e) => {
                  const val = e.target.value;
                  setNumSlides(val === '' ? '' : parseInt(val, 10));
               }}
              min="1"
            />
          </div>


          <div className="space-y-2">
            <Label htmlFor="smart-art-density">Smart Art/Visual Density</Label>
             <Select value={smartArtDensity} onValueChange={(value) => setSmartArtDensity(value as 'low' | 'medium' | 'high')}>
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
                <SelectItem value="charts">Charts (Bar, Pie, Line)</SelectItem>
                <SelectItem value="graphs">Graphs (Network, Flow)</SelectItem>
                <SelectItem value="infographics">Infographics</SelectItem>
                 <SelectItem value="diagrams">Diagrams</SelectItem>
                 <SelectItem value="web-images">Relevant Images (Web Search)</SelectItem> {/* Updated label */}
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
                <SelectItem value="engaging">Engaging</SelectItem>
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
