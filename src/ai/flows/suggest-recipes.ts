// Required directives.
'use server';

/**
 * @fileOverview Recipe suggestion flow.
 *
 * - suggestRecipes - A function that suggests recipes based on ingredients.
 * - SuggestRecipesInput - The input type for the suggestRecipes function.
 * - SuggestRecipesOutput - The return type for the suggestRecipes function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestRecipesInputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('A list of ingredients identified by the user.'),
  dietaryRestrictions: z
    .string()
    .optional()
    .describe('Any dietary restrictions the user may have, such as vegetarian, vegan, gluten-free, etc.'),
  cuisinePreferences: z
    .string()
    .optional()
    .describe('Cuisine preferences of the user, such as Italian, Mexican, etc.'),
});
export type SuggestRecipesInput = z.infer<typeof SuggestRecipesInputSchema>;

const SuggestRecipesOutputSchema = z.object({
  recipes: z.array(
    z.object({
      name: z.string().describe('The name of the recipe.'),
      ingredients: z
        .array(z.string())
        .describe('A list of ingredients required for the recipe.'),
      instructions: z.string().describe('Step-by-step instructions for the recipe.'),
    })
  ).describe('A list of suggested recipes based on the provided ingredients.')
});
export type SuggestRecipesOutput = z.infer<typeof SuggestRecipesOutputSchema>;

export async function suggestRecipes(input: SuggestRecipesInput): Promise<SuggestRecipesOutput> {
  return suggestRecipesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecipesPrompt',
  input: {
    schema: z.object({
      ingredients: z
        .array(z.string())
        .describe('A list of ingredients identified by the user.'),
      dietaryRestrictions: z
        .string()
        .optional()
        .describe('Any dietary restrictions the user may have, such as vegetarian, vegan, gluten-free, etc.'),
      cuisinePreferences: z
        .string()
        .optional()
        .describe('Cuisine preferences of the user, such as Italian, Mexican, etc.'),
    }),
  },
  output: {
    schema: z.object({
      recipes: z.array(
        z.object({
          name: z.string().describe('The name of the recipe.'),
          ingredients: z
            .array(z.string())
            .describe('A list of ingredients required for the recipe.'),
          instructions: z.string().describe('Step-by-step instructions for the recipe.'),
        })
      ).describe('A list of suggested recipes based on the provided ingredients.'),
    }),
  },
  prompt: `You are a helpful cooking assistant that suggests recipes based on available ingredients.

  Given the following ingredients:
  {{#each ingredients}}
  - {{{this}}}
  {{/each}}

  Suggest recipes that can be made using these ingredients.
  Consider the following dietary restrictions: {{{dietaryRestrictions}}}
  Consider the following cuisine preferences: {{{cuisinePreferences}}}

  Return the recipes in JSON format.
  `,
});

const suggestRecipesFlow = ai.defineFlow<
  typeof SuggestRecipesInputSchema,
  typeof SuggestRecipesOutputSchema
>(
  {
    name: 'suggestRecipesFlow',
    inputSchema: SuggestRecipesInputSchema,
    outputSchema: SuggestRecipesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
