"use client";

import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
// Import the type and function directly from the flow file
import type { AnalyzeDocumentContentOutput } from '@/ai/flows/document-analyzer';
import { analyzeDocumentContent } from '@/ai/flows/document-analyzer';

interface FileUploadProps {
  onAnalysisComplete: (analysis: AnalyzeDocumentContentOutput) => void;
  setIsLoadingAnalysis: (loading: boolean) => void;
}

const ACCEPTED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'text/plain' // .txt
];
const ACCEPTED_EXTENSIONS = '.pdf,.docx,.txt';

export function FileUpload({ onAnalysisComplete, setIsLoadingAnalysis }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (ACCEPTED_MIME_TYPES.includes(file.type)) {
        setSelectedFile(file);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: `Please upload a ${ACCEPTED_EXTENSIONS.replaceAll(',', ', ')} file.`,
        });
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset input
        }
      }
    }
  };

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
       if (ACCEPTED_MIME_TYPES.includes(file.type)) {
        setSelectedFile(file);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
           description: `Please upload a ${ACCEPTED_EXTENSIONS.replaceAll(',', ', ')} file.`,
        });
        setSelectedFile(null);
      }
    }
  }, [toast]);

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "No File Selected",
        description: "Please select a file to analyze.",
      });
      return;
    }

    setIsLoadingAnalysis(true);
    try {
      const documentDataUri = await readFileAsDataURL(selectedFile);

      // Current approach: Send data URI directly to the AI flow
      const analysisResult = await analyzeDocumentContent({ documentDataUri });

      onAnalysisComplete(analysisResult);
      toast({
        title: "Analysis Complete",
        description: "Document analysis finished successfully.",
      });
    } catch (error: any) {
      console.error("Analysis failed:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error?.message || "Could not analyze the document. Please try again.",
      });
       // Clear potentially bad results
       // Return an empty analysis result structure on error
       onAnalysisComplete({ topics: [], subtopics: [], dataPoints: [], quotes: [], summary: "Error during analysis." });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>1. Upload Document</CardTitle>
        <CardDescription>Upload a PDF, DOCX, or TXT file to analyze its content.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`flex justify-center items-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer ${
            isDragging ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/80'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <div className="text-center">
            <UploadCloud className={`mx-auto h-12 w-12 ${isDragging ? 'text-accent' : 'text-muted-foreground'}`} />
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-semibold text-accent">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">{ACCEPTED_EXTENSIONS.replaceAll(',', ', ').toUpperCase()}</p>
            <Input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept={ACCEPTED_EXTENSIONS}
              ref={fileInputRef}
            />
          </div>
        </div>

        {selectedFile && (
          <div className="flex items-center justify-between p-3 border rounded-md bg-secondary/50">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{selectedFile.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => {
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}>
              Remove
            </Button>
          </div>
        )}

        <Button
          onClick={handleAnalyze}
          disabled={!selectedFile}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          Analyze Document
        </Button>
      </CardContent>
    </Card>
  );
}
