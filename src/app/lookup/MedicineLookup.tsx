
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Camera, Loader2, Pill, Clock, Info, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { analyzeMedicineImage } from '@/app/add-medicine/actions';
import type { ExtractMedicineDetailsOutput } from '@/ai/flows/extract-medicine-details';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function MedicineLookup() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ExtractMedicineDetailsOutput | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAnalysisResult(null); // Reset previous results
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const formData = new FormData();
      formData.append('photoDataUri', imagePreview);

      const result = await analyzeMedicineImage(formData);
      
      if(result.success && result.data) {
        setAnalysisResult(result.data);
        toast({
          title: "Analysis Complete",
          description: "Here are the details we found.",
        });
      } else {
        throw new Error(result.error || "Unknown error from analysis");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Could not analyze the image.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 flex flex-col items-center justify-center">
          {imagePreview ? (
            <Image src={imagePreview} alt="Medicine preview" width={250} height={250} className="rounded-lg object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground p-8 border-2 border-dashed rounded-lg w-full">
              <Camera className="h-10 w-10" />
              <span>Upload a photo of your medicine</span>
            </div>
          )}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm">
            <Button type="button" variant="outline" asChild>
                <label htmlFor="photo-upload" className="cursor-pointer">Upload Photo</label>
            </Button>
            <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <Button type="button" onClick={handleAnalyze} disabled={!imagePreview || isAnalyzing}>
              {isAnalyzing ? <Loader2 className="animate-spin" /> : 'Analyze with AI'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isAnalyzing && (
        <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Analyzing image...</p>
        </div>
      )}

      {analysisResult && (
        <Card>
            <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold font-headline text-center mb-4">{analysisResult.description.split(' ')[0] || "Medicine Details"}</h2>
                <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertTitle>Description</AlertTitle>
                    <AlertDescription>
                        {analysisResult.description}
                    </AlertDescription>
                </Alert>
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Use / Purpose</AlertTitle>
                    <AlertDescription>
                        {analysisResult.use}
                    </AlertDescription>
                </Alert>
                 <Alert>
                    <Pill className="h-4 w-4" />
                    <AlertTitle>Dosage</AlertTitle>
                    <AlertDescription>
                        {analysisResult.dosage}
                    </AlertDescription>
                </Alert>
                 <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertTitle>Timing</AlertTitle>
                    <AlertDescription>
                        Take {analysisResult.timing}.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
