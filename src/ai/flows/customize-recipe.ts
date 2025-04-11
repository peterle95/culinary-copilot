// The AI flow to customize a recipe based on dietary restrictions or preferences.
// - customizeRecipe - A function that handles the recipe customization process.
// - CustomizeRecipeInput - The input type for the customizeRecipe function.
// - CustomizeRecipeOutput - The return type for the customizeRecipe function.

'use server';
import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const CustomizeRecipeInputSchema = z.object({  
  recipe: z.string().describe('The original recipe to customize.'),
  dietaryRestrictions: z.string().describe('Dietary restrictions or preferences, e.g., vegetarian, gluten-free, low-carb.'),
  skillLevel: z.string().describe('The skill level of the user.').optional(),
  availableTools: z.string().describe('The available tools for the user.').optional()
});

export type CustomizeRecipeInput = z.infer<typeof CustomizeRecipeInputSchema>;

const CustomizeRecipeOutputSchema = z.object({
  customizedRecipe: z.string().describe('The customized recipe based on the dietary restrictions and preferences.')
});

export type CustomizeRecipeOutput = z.infer<typeof CustomizeRecipeOutputSchema>;

export async function customizeRecipe(input: CustomizeRecipeInput): Promise<CustomizeRecipeOutput> {
  return customizeRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customizeRecipePrompt',
  input: {
    schema: z.object({
      recipe: z.string().describe('The original recipe to customize.'),
      dietaryRestrictions: z.string().describe('Dietary restrictions or preferences, e.g., vegetarian, gluten-free, low-carb.'),
      skillLevel: z.string().describe('The skill level of the user.').optional(),
      availableTools: z.string().describe('The available tools for the user.').optional()
    })
  },
  output: {
    schema: z.object({
      customizedRecipe: z.string().describe('The customized recipe based on the dietary restrictions and preferences.')
    })
  },
  prompt: `You are a culinary expert, adept at modifying recipes to suit various dietary needs and preferences.

  Please take the original recipe provided and adjust it according to the specified dietary restrictions and skill level.
  Consider the available tools when modifying the recipe.

  Original Recipe: {{{recipe}}}
  Dietary Restrictions/Preferences: {{{dietaryRestrictions}}}
  User Skill Level: {{{skillLevel}}}
  Available Tools: {{{availableTools}}}

  Customized Recipe:`
});

const customizeRecipeFlow = ai.defineFlow<
  typeof CustomizeRecipeInputSchema,
  typeof CustomizeRecipeOutputSchema
>({
  name: 'customizeRecipeFlow',
  inputSchema: CustomizeRecipeInputSchema,
  outputSchema: CustomizeRecipeOutputSchema
}, async input => {
  const {output} = await prompt(input);
  return output!;
});