'use server';

/**
 * @fileOverview An AI-powered goal suggestion flow.
 * 
 * - suggestGoal - A function that provides goal suggestions based on user's current progress and past performance.
 * - SuggestGoalInput - The input type for the suggestGoal function.
 * - SuggestGoalOutput - The return type for the suggestGoal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestGoalInputSchema = z.object({
  currentGoals: z.string().describe('The user\'s current goals.'),
  pastPerformance: z.string().describe('The user\'s past performance data.'),
});
export type SuggestGoalInput = z.infer<typeof SuggestGoalInputSchema>;

const SuggestGoalOutputSchema = z.object({
  suggestedGoals: z.string().describe('AI-powered suggestions for realistic and achievable goals.'),
  reasoning: z.string().describe('The AI\'s reasoning behind the suggested goals.'),
});
export type SuggestGoalOutput = z.infer<typeof SuggestGoalOutputSchema>;

export async function suggestGoal(input: SuggestGoalInput): Promise<SuggestGoalOutput> {
  return suggestGoalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestGoalPrompt',
  input: {schema: SuggestGoalInputSchema},
  output: {schema: SuggestGoalOutputSchema},
  prompt: `You are an AI assistant that provides suggestions for realistic and achievable goals based on the user\'s current goals and past performance.

Current Goals: {{{currentGoals}}}
Past Performance: {{{pastPerformance}}}

Based on this information, provide suggestions for new goals, and explain your reasoning for each suggestion.
Make sure each suggestion is realistic and achievable for the user.
Output must be in JSON format.
`,
});

const suggestGoalFlow = ai.defineFlow(
  {
    name: 'suggestGoalFlow',
    inputSchema: SuggestGoalInputSchema,
    outputSchema: SuggestGoalOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
