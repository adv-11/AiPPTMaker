import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import type { AnalyzeDocumentContentOutput } from '@/ai/flows/document-analyzer';
import { ScrollArea } from "@/components/ui/scroll-area";

interface AnalysisResultsProps {
  analysis: AnalyzeDocumentContentOutput | null;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  if (!analysis) {
    return null; // Don't render anything if there's no analysis data
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Results</CardTitle>
        <CardDescription>Summary and extracted information from your document.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="summary">
          <AccordionItem value="summary">
            <AccordionTrigger>Summary</AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-32">
                <p className="text-sm">{analysis.summary || "No summary available."}</p>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="topics">
            <AccordionTrigger>Key Topics</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2">
                {analysis.topics.length > 0 ? analysis.topics.map((topic, index) => (
                  <Badge key={index} variant="secondary">{topic}</Badge>
                )) : <p className="text-sm text-muted-foreground">No topics found.</p>}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="subtopics">
            <AccordionTrigger>Subtopics</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2">
                {analysis.subtopics.length > 0 ? analysis.subtopics.map((subtopic, index) => (
                  <Badge key={index} variant="outline">{subtopic}</Badge>
                )) : <p className="text-sm text-muted-foreground">No subtopics found.</p>}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="data-points">
            <AccordionTrigger>Data Points</AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-32">
                {analysis.dataPoints.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {analysis.dataPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                 ) : <p className="text-sm text-muted-foreground">No data points found.</p>}
               </ScrollArea>
            </AccordionContent>
          </AccordionItem>

           <AccordionItem value="quotes">
            <AccordionTrigger>Key Quotes</AccordionTrigger>
            <AccordionContent>
               <ScrollArea className="h-32">
                {analysis.quotes.length > 0 ? (
                  <ul className="space-y-2">
                    {analysis.quotes.map((quote, index) => (
                      <li key={index} className="border-l-4 border-accent pl-4 italic text-sm text-muted-foreground">
                        "{quote}"
                      </li>
                    ))}
                  </ul>
                 ) : <p className="text-sm text-muted-foreground">No quotes found.</p>}
               </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
