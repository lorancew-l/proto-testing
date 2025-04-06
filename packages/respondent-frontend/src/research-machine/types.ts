import type { PrototypeArea, PrototypeQuestion, Research, SingleQuestion } from 'shared';

export type ResearchMachineEvents =
  | {
      type: 'selectAnswer';
      answer:
        | { type: SingleQuestion['type']; answerId: string }
        | { type: PrototypeQuestion['type']; click: { x: number; y: number; area: PrototypeArea | null } };
    }
  | { type: 'answer' }
  | { type: 'retryEventSending' };

export type ResearchEvent =
  | {
      type: 'research-load';
      payload: {
        ts: number;
      };
    }
  | {
      type: 'research-start';
      payload: {
        ts: number;
      };
    }
  | {
      type: 'research-answer';
      payload: {
        ts: number;
      };
    }
  | {
      type: 'research-finish';
      payload: {
        ts: number;
      };
    };

export type AnswerStackRecord = {
  questionId: string;
  screenId?: string;
} & (
  | { type: SingleQuestion['type']; answers: string[] }
  | { type: PrototypeQuestion['type']; answers: { x: number; y: number; areaId: string | null }[] }
);

export type ResearchState = {
  questionId?: string;
  screenId?: string;
  startedAt?: number;
  finishedAt?: number;
  answerStack: AnswerStackRecord[];
  pendingEvents: ResearchEvent[];
};

export type ResearchMachineContext = {
  research: Research & { id: string };
  state: ResearchState;
};
