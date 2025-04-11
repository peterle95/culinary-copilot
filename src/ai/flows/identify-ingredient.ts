'use server';
/**
 * @fileOverview An ingredient identification AI agent.
 *
 * - identifyIngredient - A function that handles the ingredient identification process.
 * - IdentifyIngredientInput - The input type for the identifyIngredient function.
 * - IdentifyIngredientOutput - The return type for the identifyIngredient function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const IdentifyIngredientInputSchema = z.object({
  photoUrl: z.string().describe('The URL of the ingredient photo.'),
});
export type IdentifyIngredientInput = z.infer<typeof IdentifyIngredientInputSchema>;

const IdentifyIngredientOutputSchema = z.object({
  ingredientName: z.string().describe('The identified name of the ingredient.'),
  confidence: z.number().describe('The confidence level of the identification (0-1).'),
});
export type IdentifyIngredientOutput = z.infer<typeof IdentifyIngredientOutputSchema>;

export async function identifyIngredient(input: IdentifyIngredientInput): Promise<IdentifyIngredientOutput> {
  return identifyIngredientFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyIngredientPrompt',
  input: {
    schema: z.object({
      photoUrl: z.string().describe('The URL of the ingredient photo.'),
    }),
  },
  output: {
    schema: z.object({
      ingredientName: z.string().describe('The identified name of the ingredient.'),
      confidence: z.number().describe('The confidence level of the identification (0-1).'),
    }),
  },
  prompt: `You are an expert culinary assistant. Your primary task is to identify ingredients from images.

Analyze the image at the provided URL and accurately determine the ingredient. Provide the ingredient name and a confidence level (0-1) for your identification.

Image URL: {{media url=photoUrl}}`,
});

const identifyIngredientFlow = ai.defineFlow<
  typeof IdentifyIngredientInputSchema,
  typeof IdentifyIngredientOutputSchema
>({
  name: 'identifyIngredientFlow',
  inputSchema: IdentifyIngredientInputSchema,
  outputSchema: IdentifyIngredientOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
