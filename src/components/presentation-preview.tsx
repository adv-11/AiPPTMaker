"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Edit, Save, RefreshCw, Download, Share2, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { RegenerateSlideInput, RegenerateSlideOutput } from '@/ai/flows/regenerate-slide'; // Import types
import { regenerateSlide } from '@/ai/flows/regenerate-slide'; // Import function

interface Slide {
  id: number;
  title: string;
  content: string;
  visuals?: string[]; // Array of image URLs or data URIs
}

interface PresentationPreviewProps {
  presentationData: {
    slides: Slide[];
    metadata: any; // Add template, tone etc. if needed for regeneration
  } | null;
}

// Simulate visual elements with placeholder images - Moved to PresentationParameters
// const placeholderVisuals = [
//   "https://picsum.photos/seed/graph/600/400",
//   "https://picsum.photos/seed/chart/600/400",
//   "https://picsum.photos/seed/diagram/600/400",
//   "https://picsum.photos/seed/infographic/600/400",
// ];


export function PresentationPreview({ presentationData }: PresentationPreviewProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [editingSlideId, setEditingSlideId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const { toast } = useToast();


  useEffect(() => {
     if (presentationData?.slides) {
       // Slides received should already have valid visual URLs or be empty arrays
      setSlides(presentationData.slides);
      setCurrentSlideIndex(0); // Reset to first slide when new data arrives
      setEditingSlideId(null); // Reset editing state
    } else {
      setSlides([]); // Clear slides if no data
    }
  }, [presentationData]);


  if (!presentationData || slides.length === 0) {
    return null; // Don't render if no presentation data
  }

  const currentSlide = slides[currentSlideIndex];
  if (!currentSlide) { // Add a check for currentSlide to prevent errors if slides array is manipulated unexpectedly
    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Error</CardTitle>
                <CardDescription>Could not load current slide.</CardDescription>
            </CardHeader>
        </Card>
    );
  }


  const goToNextSlide = () => {
    setCurrentSlideIndex((prevIndex) => Math.min(prevIndex + 1, slides.length - 1));
    setEditingSlideId(null); // Exit edit mode when changing slides
  };

  const goToPrevSlide = () => {
    setCurrentSlideIndex((prevIndex) => Math.max(prevIndex - 1, 0));
     setEditingSlideId(null); // Exit edit mode
  };

  const startEditing = () => {
    setEditingSlideId(currentSlide.id);
    setEditedContent(currentSlide.content);
  };

  const saveEdit = () => {
    setSlides((prevSlides) =>
      prevSlides.map((slide) =>
        slide.id === editingSlideId ? { ...slide, content: editedContent } : slide
      )
    );
    setEditingSlideId(null);
    toast({ title: "Changes Saved", description: `Slide ${currentSlideIndex + 1} updated.` });
  };

  const cancelEdit = () => {
    setEditingSlideId(null);
  };

  const handleRegenerate = async () => {
     if (!currentSlide || !presentationData.metadata) return;
     setIsRegenerating(true);

     // Prepare input for the regenerateSlide flow
     const input: RegenerateSlideInput = {
        slideContent: currentSlide.content, // Use current or original content? Decide based on desired UX
        templateDetails: presentationData.metadata.template || 'Modern', // Get from metadata
        // These should ideally come from the UI if you add controls for regeneration parameters
        smartArtDensity: 'medium',
        dataVisualizationPreference: 'charts',
        contentToVisualRatio: 'balanced',
        toneAndStyle: presentationData.metadata.toneStyle || 'professional', // Get from metadata
      };

      try {
        const result: RegenerateSlideOutput = await regenerateSlide(input);
        // Update the specific slide with regenerated content
        setSlides((prevSlides) =>
          prevSlides.map((slide) =>
            slide.id === currentSlide.id
              ? {
                  ...slide,
                  content: result.regeneratedSlide,
                  // Potentially regenerate visuals too if the flow supports it
                  // For now, assume visual regeneration might provide a new URL or keep existing one.
                  // If visuals are regenerated, they should come from 'result'.
                  // For placeholder:
                  visuals: slide.visuals && slide.visuals.length > 0 ? [slide.visuals[0]] : ["https://picsum.photos/seed/newvisual/600/400"], // Simulate new visual if needed
                 }
              : slide
          )
        );
        toast({ title: "Slide Regenerated", description: `Slide ${currentSlideIndex + 1} updated.` });
      } catch (error) {
          console.error("Regeneration failed:", error);
          toast({
            variant: "destructive",
            title: "Regeneration Failed",
            description: "Could not regenerate the slide. Please try again.",
          });
      } finally {
          setIsRegenerating(false);
      }
  };

   // Placeholder actions
  const handleExportPPTX = () => toast({ title: "Export PPTX", description: "Feature coming soon!" });
  const handleExportPDF = () => toast({ title: "Export PDF", description: "Feature coming soon!" });
  const handleShare = () => toast({ title: "Share Presentation", description: "Feature coming soon!" });


  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>3. Preview & Refine Presentation</CardTitle>
        <CardDescription>Review the generated slides and make adjustments.</CardDescription>
      </CardHeader>
      <CardContent>
         <div className="flex justify-between items-center mb-4">
           <span className="text-sm font-medium text-muted-foreground">
             Slide {currentSlideIndex + 1} of {slides.length}
           </span>
           <div className="flex gap-2">
             <Button variant="outline" size="icon" onClick={goToPrevSlide} disabled={currentSlideIndex === 0}>
               <ChevronLeft className="h-4 w-4" />
             </Button>
             <Button variant="outline" size="icon" onClick={goToNextSlide} disabled={currentSlideIndex === slides.length - 1}>
               <ChevronRight className="h-4 w-4" />
             </Button>
           </div>
         </div>

         <Card className="overflow-hidden mb-4 shadow-md">
             <CardContent className="p-0 aspect-[16/9] flex flex-col md:flex-row">
                 {/* Slide Content Area */}
                <div className="w-full md:w-1/2 p-6 bg-background flex flex-col">
                    <h3 className="text-xl font-semibold mb-4">{currentSlide.title}</h3>
                    {editingSlideId === currentSlide.id ? (
                        <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="flex-grow resize-none text-sm"
                        />
                    ) : (
                        <ScrollArea className="flex-grow">
                         <p className="text-sm whitespace-pre-wrap">{currentSlide.content}</p>
                        </ScrollArea>
                    )}
                    <div className="mt-4 flex gap-2">
                        {editingSlideId === currentSlide.id ? (
                         <>
                            <Button size="sm" onClick={saveEdit}><Save className="mr-1 h-4 w-4"/>Save</Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                         </>
                        ) : (
                         <Button size="sm" variant="outline" onClick={startEditing}><Edit className="mr-1 h-4 w-4"/>Edit Text</Button>
                        )}
                         <Button
                           size="sm"
                           variant="outline"
                           onClick={handleRegenerate}
                           disabled={isRegenerating || editingSlideId !== null}
                           className="ml-auto"
                         >
                           {isRegenerating ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-1 h-4 w-4" />}
                           Regenerate
                         </Button>
                    </div>
                </div>
                 {/* Visual Area */}
                <div className="w-full md:w-1/2 bg-secondary flex items-center justify-center p-4">
                  {currentSlide.visuals && currentSlide.visuals.length > 0 && currentSlide.visuals[0] ? (
                     <div className="relative w-full h-full">
                      <Image
                        src={currentSlide.visuals[0]} // Display first visual
                        alt={`Visual for ${currentSlide.title}`}
                        layout="fill"
                        objectFit="contain"
                        data-ai-hint="chart graph" 
                      />
                     </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                        <p>No visual element</p>
                     </div>
                   )}
                </div>
             </CardContent>
         </Card>


      </CardContent>
       <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleExportPPTX}><Download className="mr-2 h-4 w-4" /> Export PPTX</Button>
          <Button variant="outline" onClick={handleExportPDF}><Download className="mr-2 h-4 w-4" /> Export PDF</Button>
          <Button onClick={handleShare}><Share2 className="mr-2 h-4 w-4" /> Share</Button>
       </CardFooter>
    </Card>
  );
}
