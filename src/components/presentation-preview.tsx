"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Edit, Save, RefreshCw, Download, Share2, Loader2, ImageOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
// Import types and function directly from the regenerate slide flow file
import type { RegenerateSlideInput, RegenerateSlideOutput } from '@/ai/flows/regenerate-slide';
import { regenerateSlide } from '@/ai/flows/regenerate-slide';
// Import types directly from the presentation generator flow file
import type { GeneratePresentationOutput, GeneratedSlide } from '@/ai/flows/presentation-generator';


interface PresentationPreviewProps {
  presentationData: GeneratePresentationOutput | null;
}

export function PresentationPreview({ presentationData }: PresentationPreviewProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slides, setSlides] = useState<GeneratedSlide[]>([]);
  const [editingSlideId, setEditingSlideId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const { toast } = useToast();


  useEffect(() => {
     if (presentationData?.slides) {
       // Filter out potential error slides if needed
       const validSlides = presentationData.slides.filter(slide => slide.id !== 0 || !slide.title.startsWith("Error"));
       setSlides(validSlides);
       setCurrentSlideIndex(0);
       setEditingSlideId(null);
    } else {
      setSlides([]);
    }
  }, [presentationData]);


  if (!presentationData || slides.length === 0) {
    // Handle specific error slide case from generation
    if (presentationData && presentationData.slides.length === 1 && presentationData.slides[0].id === 0 && presentationData.slides[0].title.startsWith("Error")) {
        return (
             <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="text-destructive">{presentationData.slides[0].title}</CardTitle>
                    <CardDescription>There was an issue generating the presentation.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground break-words">{presentationData.slides[0].content}</p>
                 </CardContent>
            </Card>
        )
    }
    // Handle general case where no valid slides were generated
    if (presentationData && slides.length === 0) {
        return (
             <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Presentation Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No valid slides were generated for this presentation.</p>
                 </CardContent>
            </Card>
        )
    }
    return null; // No presentation data at all
  }

  const currentSlide = slides[currentSlideIndex];

  if (!currentSlide) {
    console.error("Error: currentSlide is undefined at index", currentSlideIndex);
    if (currentSlideIndex !== 0 && slides.length > 0) {
        setCurrentSlideIndex(0);
        return <Loader2 className="animate-spin mx-auto mt-10" />
    }
    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Error</CardTitle>
                <CardDescription>Could not load current slide data.</CardDescription>
            </CardHeader>
        </Card>
    );
  }


  const goToNextSlide = () => {
    setCurrentSlideIndex((prevIndex) => Math.min(prevIndex + 1, slides.length - 1));
    setEditingSlideId(null);
  };

  const goToPrevSlide = () => {
    setCurrentSlideIndex((prevIndex) => Math.max(prevIndex - 1, 0));
     setEditingSlideId(null);
  };

  const startEditing = () => {
    setEditingSlideId(currentSlide.id);
    setEditedContent(currentSlide.content);
  };

  const saveEdit = () => {
     if (editingSlideId === null) return;
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
     if (!currentSlide || !presentationData?.metadata) return;
     setIsRegenerating(true);

     const input: RegenerateSlideInput = {
        slideContent: currentSlide.content,
        templateDetails: presentationData.metadata.template || 'Modern',
        // These should ideally come from UI controls for regeneration parameters
        smartArtDensity: 'medium', // Placeholder
        dataVisualizationPreference: 'charts', // Placeholder
        contentToVisualRatio: 'balanced', // Placeholder
        toneAndStyle: presentationData.metadata.toneStyle || 'professional',
      };

      try {
        const result: RegenerateSlideOutput = await regenerateSlide(input);

        setSlides((prevSlides) =>
          prevSlides.map((slide) =>
            slide.id === currentSlide.id
              ? { ...slide, content: result.regeneratedSlide }
              : slide
          )
        );
        toast({ title: "Slide Content Regenerated", description: `Slide ${currentSlideIndex + 1} text updated.` });
      } catch (error) {
          console.error("Regeneration failed:", error);
          toast({
            variant: "destructive",
            title: "Regeneration Failed",
            description: "Could not regenerate the slide content. Please try again.",
          });
      } finally {
          setIsRegenerating(false);
      }
  };

  const handleExportPPTX = () => toast({ title: "Export PPTX", description: "Feature coming soon!" });
  const handleExportPDF = () => toast({ title: "Export PDF", description: "Feature coming soon!" });
  const handleShare = () => toast({ title: "Share Presentation", description: "Feature coming soon!" });

  const getAiHint = (prompt?: string | null): string => {
    if (!prompt) return 'visual element';
    return prompt.split(' ').slice(0, 2).join(' ').toLowerCase() || 'visual element';
  };


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
                    <CardTitle className="text-xl font-semibold mb-4">{currentSlide.title}</CardTitle>
                    {editingSlideId === currentSlide.id ? (
                        <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="flex-grow resize-none text-sm"
                        aria-label="Edit slide content"
                        />
                    ) : (
                        <ScrollArea className="flex-grow">
                         <div className="text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
                            {currentSlide.content}
                         </div>
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
                           title="Regenerate slide content using AI"
                         >
                           {isRegenerating ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-1 h-4 w-4" />}
                           Regenerate Content
                         </Button>
                    </div>
                </div>
                 {/* Visual Area */}
                <div className="w-full md:w-1/2 bg-secondary flex items-center justify-center p-4 border-l relative">
                  {currentSlide.visualDataUri && typeof currentSlide.visualDataUri === 'string' && (currentSlide.visualDataUri.startsWith('data:image') || /^(https?:\/\/)/.test(currentSlide.visualDataUri)) ? (
                     <Image
                        src={currentSlide.visualDataUri}
                        alt={`Visual for ${currentSlide.title}`}
                        layout="fill" // Use fill for responsive sizing within the container
                        objectFit="contain" // Ensure the whole image is visible
                        data-ai-hint={getAiHint(currentSlide.visualPrompt)}
                        onError={(e) => {
                            console.error("Image load error:", e, "Src:", currentSlide.visualDataUri);
                            toast({ variant: "destructive", title:"Image Error", description: "Could not load visual for this slide."})
                            // Replace the image with an error message directly in the DOM
                             const parent = e.currentTarget.parentNode;
                             if (parent) {
                                 parent.innerHTML = `
                                     <div class="text-center text-destructive-foreground p-4 bg-destructive rounded flex flex-col items-center justify-center h-full w-full absolute top-0 left-0">
                                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-off h-8 w-8 mb-2"><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"/><line x1="2" x2="22" y1="2" y2="22"/><path d="M11.73 21.73a9.36 9.36 0 0 0 10.07-10.1"/><path d="M12.27 2.27a9.357 9.357 0 0 0-10 10.07"/><path d="M14 14l-1.5 2-1-1L9 18"/><path d="M19 12v3a2 2 0 0 1-2 2H9"/><path d="M6.5 8.5c1.69 0 3.14.83 4 2.09"/><path d="M5 12V9a2 2 0 0 1 2-2h3"/></svg>
                                         <p>Error loading image</p>
                                     </div>`;
                             }
                        }}
                        unoptimized={currentSlide.visualDataUri.startsWith('data:image')} // Keep unoptimized for base64
                    />
                  ) : (
                    <div className="text-center text-muted-foreground p-4 flex flex-col items-center justify-center h-full">
                        <ImageOff className="h-8 w-8 mb-2" />
                        {currentSlide.visualDataUri && typeof currentSlide.visualDataUri === 'string' ? (
                            <p>Invalid visual data format</p>
                         ) : (
                             <p>No visual element for this slide</p>
                         )}
                         {currentSlide.visualPrompt && currentSlide.visualPrompt.startsWith('Error generating visual') && (
                             <p className="text-xs mt-1 text-destructive">{currentSlide.visualPrompt}</p>
                         )}
                          {currentSlide.visualPrompt && !currentSlide.visualPrompt.startsWith('Error generating visual') && !currentSlide.visualDataUri && (
                              <p className="text-xs mt-1">(Visual prompt: {currentSlide.visualPrompt})</p>
                          )}
                     </div>
                   )}
                </div>
             </CardContent>
         </Card>


      </CardContent>
       <CardFooter className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={handleExportPPTX}><Download className="mr-2 h-4 w-4" /> Export PPTX</Button>
          <Button variant="outline" onClick={handleExportPDF}><Download className="mr-2 h-4 w-4" /> Export PDF</Button>
          <Button onClick={handleShare}><Share2 className="mr-2 h-4 w-4" /> Share</Button>
       </CardFooter>
    </Card>
  );
}
