// Adapt instructions based on user skill level and available tools.
'use server';
/**
 * @fileOverview Adapts recipe instructions to the user's skill level and available tools.
 *
 * - adaptInstructions - A function that adapts recipe instructions.
 * - AdaptInstructionsInput - The input type for the adaptInstructions function.
 * - AdaptInstructionsOutput - The return type for the adaptInstructions function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AdaptInstructionsInputSchema = z.object({
  recipe: z.string().describe('The full recipe instructions.'),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).describe('The user skill level in cooking.'),
  availableTools: z.array(z.string()).describe('The list of tools available to the user.'),
});
export type AdaptInstructionsInput = z.infer<typeof AdaptInstructionsInputSchema>;

const AdaptInstructionsOutputSchema = z.object({
  adaptedInstructions: z.string().describe('The adapted recipe instructions based on skill level and available tools.'),
});
export type AdaptInstructionsOutput = z.infer<typeof AdaptInstructionsOutputSchema>;

export async function adaptInstructions(input: AdaptInstructionsInput): Promise<AdaptInstructionsOutput> {
  return adaptInstructionsFlow(input);
}

const adaptInstructionsPrompt = ai.definePrompt({
  name: 'adaptInstructionsPrompt',
  input: {
    schema: z.object({
      recipe: z.string().describe('The full recipe instructions.'),
      skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).describe('The user skill level in cooking.'),
      availableTools: z.array(z.string()).describe('The list of tools available to the user.'),
    }),
  },
  output: {
    schema: z.object({
      adaptedInstructions: z.string().describe('The adapted recipe instructions based on skill level and available tools.'),
    }),
  },
  prompt: `You are a cooking assistant that adapts recipes to the user's skill level and available tools.

  Recipe: {{{recipe}}}
  Skill Level: {{{skillLevel}}}
  Available Tools: {{#each availableTools}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Adapt the recipe to the user's skill level and available tools. Provide detailed instructions for beginners, simplify instructions for intermediate users, and offer advanced techniques for advanced users. If a tool is unavailable, suggest alternatives.
  \n  Adapted Instructions:`,
});

const adaptInstructionsFlow = ai.defineFlow<
  typeof AdaptInstructionsInputSchema,
  typeof AdaptInstructionsOutputSchema
>(
  {
    name: 'adaptInstructionsFlow',
    inputSchema: AdaptInstructionsInputSchema,
    outputSchema: AdaptInstructionsOutputSchema,
  },
  async input => {
    const {output} = await adaptInstructionsPrompt(input);
    return output!;
  }
);
