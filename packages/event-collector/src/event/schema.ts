import { z } from 'zod';

export const researchEventSchema = z.object({
  referer: z.string(),
  researchId: z.string(),
  sessionId: z.string(),
  type: z.enum(['research-load', 'research-start', 'research-answer', 'research-finish']),
  questionId: z.string().nullable(),
  questionType: z.enum(['single', 'multiple', 'rating', 'free-text', 'prototype']).nullable(),
  answers: z.string().nullable(),
  appName: z.string(),
  revision: z.number(),
});

export type ResearchEvent = z.infer<typeof researchEventSchema>;
