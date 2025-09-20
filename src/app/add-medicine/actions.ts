'use server';

import { extractMedicineDetails } from "@/ai/flows/extract-medicine-details";
import { z } from "zod";
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '@/lib/firebase';
import { revalidatePath } from "next/cache";

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

const addMedicineSchema = z.object({
  name: z.string().min(2, 'Medicine name is required.'),
  dosage: z.string().min(1, 'Dosage is required (e.g., 1-0-1).'),
  timing: z.enum(['before-food', 'after-food', 'any']),
  use: z.string().min(3, 'Use/Purpose is required.'),
  description: z.string(),
  schedule: z.array(z.string()).min(1, 'At least one schedule time must be selected.'),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 day.'),
  quantity: z.coerce.number().min(1, 'Quantity is required.'),
  photoUrl: z.string().url('A photo URL is required.'),
  userId: z.string(),
});

export async function addMedicine(data: unknown) {
    try {
        const parsedData = addMedicineSchema.parse(data);

        await addDoc(collection(db, 'medicines'), {
            ...parsedData,
            createdAt: serverTimestamp(),
        });

        revalidatePath('/dashboard');
        
        return { success: true };

    } catch(error) {
        console.error("Error adding medicine:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return {
          success: false,
          error: `Failed to add medicine. ${errorMessage}`
        };
    }
}
