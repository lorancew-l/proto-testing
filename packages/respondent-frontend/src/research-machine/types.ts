import type {
  FreeTextQuestion,
  MultipleQuestion,
  PrototypeArea,
  PrototypeQuestion,
  RatingQuestion,
  Research,
  SingleQuestion,
} from 'shared';

export type PendingEventStatusUpdate = { type: 'pendingEventStatusUpdate'; event: PendingEvent };

export type ResearchMachineEvents =
  | {
      type: 'selectAnswer';
      answer:
        | { type: SingleQuestion['type']; answerId: string }
        | { type: MultipleQuestion['type']; answerId: string }
        | { type: RatingQuestion['type']; answerId: string }
        | { type: FreeTextQuestion['type']; text: string }
        | {
            type: PrototypeQuestion['type'];
            click: { x: number; y: number; area: PrototypeArea | null };
          };
    }
  | { type: 'answer' }
  | { type: 'skip' }
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
export type FreeTextQuestionAnswerState = { type: FreeTextQuestion['type']; text: string };
export type PrototypeQuestionAnswerState = {
  type: PrototypeQuestion['type'];
  startTs: number;
  endTs: number | null;
  completed: boolean;
  givenUp: boolean;
  answers: PrototypeScreenState[];
};

export type PrototypeScreenState = {
  screenId: string;
  startTs: number;
  endTs: number;
  ssid: string;
  clicks: { x: number; y: number; areaId: string | null; ts: number }[];
};
type QuestionAnswerState =
  | SingleQuestionAnswerState
  | MultipleQuestionAnswerState
  | RatingQuestionAnswerState
  | FreeTextQuestionAnswerState
  | PrototypeQuestionAnswerState;

export type AnswerStackRecord = {
  questionId: string;
} & QuestionAnswerState;

export type PendingEvent = {
  id: string;
  payload: ResearchEvent;
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
  validationError?: string;
};
