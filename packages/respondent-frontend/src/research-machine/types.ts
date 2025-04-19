import type { MultipleQuestion, PrototypeArea, PrototypeQuestion, RatingQuestion, Research, SingleQuestion } from 'shared';

export type PendingEventStatusUpdate = { type: 'pendingEventStatusUpdate'; event: PendingEvent };

export type ResearchMachineEvents =
  | {
      type: 'selectAnswer';
      answer:
        | { type: SingleQuestion['type']; answerId: string }
        | {
            type: PrototypeQuestion['type'];
            screenId: string;
            ssid: string;
            screenTime: number;
            click: { x: number; y: number; area: PrototypeArea | null };
          };
    }
  | { type: 'answer' }
  | { type: 'retryEventSending' }
  | PendingEventStatusUpdate;

export type ResearchEvent =
  | {
      type: 'research-load';
    }
  | {
      type: 'research-start';
    }
  | {
      type: 'research-answer';
      questionId: string;
      answer: QuestionAnswerState;
    }
  | {
      type: 'research-finish';
    };

export type SingleQuestionAnswerState = { type: SingleQuestion['type']; answers: string[] };
export type MultipleQuestionAnswerState = { type: MultipleQuestion['type']; answers: string[] };
export type RatingQuestionAnswerState = { type: RatingQuestion['type']; answers: string[] };
export type PrototypeQuestionAnswerState = {
  type: PrototypeQuestion['type'];
  startTs: number;
  endTs: number | null;
  completed: boolean;
  givenUp: boolean;
  screenTime: Record<string, number>;
  answers: { x: number; y: number; screenId: string; ssid: string; ts: number; areaId: string | null }[];
};

type QuestionAnswerState =
  | SingleQuestionAnswerState
  | MultipleQuestionAnswerState
  | RatingQuestionAnswerState
  | PrototypeQuestionAnswerState;

export type AnswerStackRecord = {
  questionId: string;
  screenId?: string;
  submitted: boolean;
} & QuestionAnswerState;

export type PendingEvent = {
  id: string;
  event: ResearchEvent;
  status: 'scheduled' | 'pending' | 'fulfilled' | 'rejected';
};

export type ResearchState = {
  sessionId: string;
  questionId?: string;
  screenId?: string;
  finished: boolean;
  started: boolean;
  answerStack: AnswerStackRecord[];
  pendingEvents: PendingEvent[];
};

export type ResearchMachineContext = {
  research: Research & { id: string };
  state: ResearchState;
  eventSenderError: boolean;
};
