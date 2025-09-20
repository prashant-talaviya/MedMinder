'use server';

/**
 * @fileOverview This file defines a Genkit flow for extracting medicine details from an image.
 *
 * The flow takes an image of a medicine as input and uses the Gemini API to extract information
 * such as dosage, timing, usage, and description.
 *
 * @exports extractMedicineDetails - An async function that takes an image data URI and returns
 * an object containing the extracted medicine details.
 * @exports ExtractMedicineDetailsInput - The input type for the extractMedicineDetails function.
 * @exports ExtractMedicineDetailsOutput - The output type for the extractMedicineDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractMedicineDetailsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of the medicine, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});

export type ExtractMedicineDetailsInput = z.infer<
  typeof ExtractMedicineDetailsInputSchema
>;

const ExtractMedicineDetailsOutputSchema = z.object({
  dosage: z.string().describe('The dosage of the medicine (e.g., \'1-0-1\').'),
  timing: z
    .string()
    .describe('When to take the medicine (e.g., before/after food).'),
  use: z.string().describe('The purpose/use of the medicine.'),
  description: z.string().describe('A description of the medicine.'),
});

export type ExtractMedicineDetailsOutput = z.infer<
  typeof ExtractMedicineDetailsOutputSchema
>;

export async function extractMedicineDetails(
  input: ExtractMedicineDetailsInput
): Promise<ExtractMedicineDetailsOutput> {
  return extractMedicineDetailsFlow(input);
}

const extractMedicineDetailsPrompt = ai.definePrompt({
  name: 'extractMedicineDetailsPrompt',
  input: {schema: ExtractMedicineDetailsInputSchema},
  output: {schema: ExtractMedicineDetailsOutputSchema},
  prompt: `You are an AI assistant specialized in extracting medicine details from images.
  Given a photo of a medicine, extract the following information:
  - Dosage
  - Timing (before/after food)
  - Use/purpose of medicine
  - Description of medicine

  Here is the photo of the medicine:
  {{media url=photoDataUri}}

  Please provide the extracted information in the following format:
  {
    "dosage": "<dosage>",
    "timing": "<timing>",
    "use": "<use>",
    "description": "<description>"
  }`,
});

const extractMedicineDetailsFlow = ai.defineFlow(
  {
    name: 'extractMedicineDetailsFlow',
    inputSchema: ExtractMedicineDetailsInputSchema,
    outputSchema: ExtractMedicineDetailsOutputSchema,
  },
  async input => {
    const {output} = await extractMedicineDetailsPrompt(input);
    return output!;
  }
);
