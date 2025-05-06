"use client";

import React, { useState } from 'react';
import { Header } from '@/components/header';
import { FileUpload } from '@/components/file-upload';
import { AnalysisResults } from '@/components/analysis-results';
import { PresentationParameters } from '@/components/presentation-parameters';
import { PresentationPreview } from '@/components/presentation-preview';
import { Separator } from '@/components/ui/separator';
// Import types directly from flow files
import type { AnalyzeDocumentContentOutput } from '@/ai/flows/document-analyzer';
import type { GeneratePresentationOutput } from '@/ai/flows/presentation-generator';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeDocumentContentOutput | null>(null);
  const [presentationData, setPresentationData] = useState<GeneratePresentationOutput | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [isGeneratingPresentation, setIsGeneratingPresentation] = useState<boolean>(false);

  const handleAnalysisComplete = (analysis: AnalyzeDocumentContentOutput) => {
    setAnalysisResult(analysis);
    setPresentationData(null); // Clear previous presentation
  };

  const handleGenerationStart = () => {
    setIsGeneratingPresentation(true);
    setPresentationData(null); // Clear previous presentation
  };

  const handleGenerationComplete = (data: GeneratePresentationOutput | null) => {
    setPresentationData(data);
    setIsGeneratingPresentation(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Column 1: Upload & Analysis */}
          <div className="md:col-span-1 space-y-6">
            <FileUpload
              onAnalysisComplete={handleAnalysisComplete}
              setIsLoadingAnalysis={setIsLoadingAnalysis}
            />
            {isLoadingAnalysis && (
              <Card>
                <CardContent className="p-6 flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin text-accent" />
                  <span className="text-muted-foreground">Analyzing document...</span>
                </CardContent>
              </Card>
            )}
            {!isLoadingAnalysis && analysisResult && (
              <AnalysisResults analysis={analysisResult} />
            )}
          </div>

          {/* Column 2: Parameters & Preview */}
          <div className="md:col-span-2 space-y-6">
             {analysisResult && !isLoadingAnalysis && (
                <PresentationParameters
                analysisData={analysisResult}
                onGenerationStart={handleGenerationStart}
                onGenerationComplete={handleGenerationComplete}
                isGenerating={isGeneratingPresentation}
                />
             )}

            {isGeneratingPresentation && (
               <Card>
                 <CardContent className="p-6 flex items-center justify-center">
                   <Loader2 className="mr-2 h-5 w-5 animate-spin text-accent" />
                   <span className="text-muted-foreground">Generating presentation... (This may take a minute)</span>
                 </CardContent>
               </Card>
            )}
            {!isGeneratingPresentation && presentationData && (
              <PresentationPreview presentationData={presentationData} />
            )}
          </div>
        </div>
      </main>
      <footer className="text-center py-4 text-sm text-muted-foreground border-t">
        AI PPT Maker - Transforming Documents into Presentations
      </footer>
    </div>
  );
}
