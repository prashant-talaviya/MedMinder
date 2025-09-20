'use server';

import { extractMedicineDetails } from "@/ai/flows/extract-medicine-details";
import { z } from "zod";

const actionSchema = z.object({
  photoDataUri: z.string(),
});

export async function analyzeMedicineImage(formData: FormData) {
  try {
    const input = actionSchema.parse({
      photoDataUri: formData.get('photoDataUri'),
    });
    
    const result = await extractMedicineDetails({ photoDataUri: input.photoDataUri });

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error("Error analyzing medicine image:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return {
      success: false,
      error: `Failed to analyze image. ${errorMessage}`
    };
  }
}
