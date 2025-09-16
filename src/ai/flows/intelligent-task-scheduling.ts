'use server';

/**
 * @fileOverview A Genkit flow for intelligent task scheduling, suggesting optimal task timings based on task durations
 * and historical scheduling patterns.
 *
 * - intelligentTaskScheduling - A function that suggests optimal task timings.
 * - IntelligentTaskSchedulingInput - The input type for the intelligentTaskScheduling function.
 * - IntelligentTaskSchedulingOutput - The return type for the intelligentTaskScheduling function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentTaskSchedulingInputSchema = z.object({
  taskDescription: z.string().describe('Description of the task to be scheduled.'),
  taskDurationMinutes: z.number().describe('Estimated duration of the task in minutes.'),
  historicalScheduleData: z.string().describe('User historical scheduling patterns in JSON format.'),
});

export type IntelligentTaskSchedulingInput = z.infer<typeof IntelligentTaskSchedulingInputSchema>;

const IntelligentTaskSchedulingOutputSchema = z.object({
  suggestedTiming: z.string().describe('Suggested start time for the task in ISO format.'),
  reasoning: z.string().describe('Explanation of why the suggested timing is optimal.'),
});

export type IntelligentTaskSchedulingOutput = z.infer<typeof IntelligentTaskSchedulingOutputSchema>;

export async function intelligentTaskScheduling(
  input: IntelligentTaskSchedulingInput
): Promise<IntelligentTaskSchedulingOutput> {
  return intelligentTaskSchedulingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentTaskSchedulingPrompt',
  input: {schema: IntelligentTaskSchedulingInputSchema},
  output: {schema: IntelligentTaskSchedulingOutputSchema},
  prompt: `You are an AI assistant that suggests the optimal time to schedule a task for a user.

  Consider the task description, task duration, and the user's historical scheduling patterns to suggest the best start time for the task.
  Provide the suggested start time in ISO format and explain your reasoning.

  Task Description: {{{taskDescription}}}
  Task Duration (minutes): {{{taskDurationMinutes}}}
  Historical Schedule Data: {{{historicalScheduleData}}}
  `,
});

const intelligentTaskSchedulingFlow = ai.defineFlow(
  {
    name: 'intelligentTaskSchedulingFlow',
    inputSchema: IntelligentTaskSchedulingInputSchema,
    outputSchema: IntelligentTaskSchedulingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
