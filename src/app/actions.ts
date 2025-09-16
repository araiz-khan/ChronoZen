'use server';

import { intelligentTaskScheduling, type IntelligentTaskSchedulingInput } from '@/ai/flows/intelligent-task-scheduling';

export async function getTaskSuggestion(input: IntelligentTaskSchedulingInput) {
  try {
    const result = await intelligentTaskScheduling(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('AI suggestion failed:', error);
    return { success: false, error: 'Failed to get suggestion from AI.' };
  }
}
