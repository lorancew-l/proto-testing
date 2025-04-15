import { z } from 'zod';

export const researchEventSchema = z.object({
  researchId: z.string(),
  sessionId: z.string(),
  type: z.enum(['research-load', 'research-start', 'research-answer', 'research-finish']),
  questionId: z.string().nullable(),
  questionType: z.enum(['single', 'multiple', 'rating', 'prototype']).nullable(),
  answers: z.string().nullable(),
  appName: z.string(),
});

export type ResearchEvent = z.infer<typeof researchEventSchema>;
