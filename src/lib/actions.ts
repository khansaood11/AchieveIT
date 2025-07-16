'use server';

import { suggestGoal, type SuggestGoalInput } from '@/ai/flows/ai-goal-suggestion';

export async function getAiSuggestions(input: SuggestGoalInput) {
  try {
    const result = await suggestGoal(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('AI Suggestion Error:', error);
    return { success: false, error: 'Failed to get AI suggestions. Please try again.' };
  }
}
