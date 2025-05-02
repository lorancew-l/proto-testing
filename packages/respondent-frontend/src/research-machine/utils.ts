import { nanoid } from 'nanoid';
import type { Question, Research } from 'shared';

import type {
  AnswerStackRecord,
  PendingEvent,
  PrototypeScreenState,
  ResearchEvent,
  ResearchMachineContext,
  ResearchState,
} from './types';

export const calculateNextScreen = ({ research, state }: { research: Research; state: ResearchState }): ResearchState => {
  const currentQuestionId = state.questionId;
  const currentQuestionIndex = currentQuestionId
    ? research.questions.findIndex((question) => question.id === currentQuestionId)
    : -1;
  const nextQuestion = research.questions[currentQuestionIndex + 1];

  if (!nextQuestion) {
    return {
      ...state,
      questionId: undefined,
      finished: true,
    };
  }

  return {
    ...state,
    questionId: nextQuestion.id,
    answerStack: [...state.answerStack, createAnswerStackRecord(nextQuestion)],
  };
};

export const getQuestion = (research: Research, questionId: string) => {
  const question = research.questions.find((question) => question.id === questionId);
  if (!question) throw new Error(`Question with id ${questionId} not found!`);
  return question;
};

export const getAnswerStackRecord = (answerStack: AnswerStackRecord[], questionId: string) => {
  const answerStackRecord = answerStack.find((record) => record.questionId === questionId);
  if (!answerStackRecord) throw new Error(`Answer stack record for question with id ${questionId} not found!`);
  return answerStackRecord;
};

export const getAnswerStackLastRecord = (state: ResearchState) => {
  const answerStack = state.answerStack;
  return answerStack[answerStack.length - 1];
};

export const updateAnswerStackRecord = (answerStack: AnswerStackRecord[], nextRecord: AnswerStackRecord) => {
  return answerStack.map((record) => {
    if (record.questionId === nextRecord.questionId) {
      return nextRecord;
    }

    return record;
  });
};

export const generatePrototypeScreenState = (screenId: string): PrototypeScreenState => {
  const startTs = Date.now();
  return {
    screenId,
    ssid: nanoid(10),
    startTs,
    endTs: startTs,
    clicks: [],
  };
};

export const createAnswerStackRecord = (question: Question): AnswerStackRecord => {
  if (question.type === 'prototype') {
    const [firstScreen] = question.screens;
    const startScreen = question.screens.find((screen) => screen.data.startScreen);
    const screenId = startScreen?.id ?? firstScreen?.id;

    return {
      submitted: false,
      questionId: question.id,
      type: question.type,
      givenUp: false,
      completed: false,
      startTs: Date.now(),
      endTs: null,
      answers: [generatePrototypeScreenState(screenId)],
    };
  }

  return {
    submitted: false,
    questionId: question.id,
    type: question.type,
    answers: [],
  };
};

export const createResearchState = (): ResearchState => {
  return {
    sessionId: nanoid(),
    answerStack: [],
    pendingEvents: [],
    started: false,
    finished: false,
  };
};

export const createInitialContext = (research: Research & { id: string }): ResearchMachineContext => {
  return {
    research,
    state: createResearchState(),
    eventSenderError: false,
  };
};

export const createPendingEvent = (event: ResearchEvent): PendingEvent => {
  return {
    id: nanoid(10),
    payload: event,
    status: 'scheduled',
  };
};

export const pushPendingEvent = (state: ResearchState, event: ResearchEvent): ResearchState => {
  const pendingEvents = state.pendingEvents;

  const isAlreadyScheduled = pendingEvents.some((pendingEvent) => {
    switch (event.type) {
      case 'research-load':
        return pendingEvent.payload.type === event.type;
      case 'research-start':
        return pendingEvent.payload.type === event.type;
      case 'research-answer':
        return pendingEvent.payload.type === event.type && pendingEvent.payload.questionId === event.questionId;
      case 'research-finish':
        return pendingEvent.payload.type === event.type;
      default:
        break;
    }
  });

  if (isAlreadyScheduled) return state;

  return {
    ...state,
    pendingEvents: [...pendingEvents, createPendingEvent(event)],
  };
};

export const updatePrototypeLastScreenState = (
  answers: PrototypeScreenState[],
  cb: (state: PrototypeScreenState) => PrototypeScreenState,
): PrototypeScreenState[] => {
  return answers.map((answer, index) => {
    if (index === answers.length - 1) {
      return cb(answer);
    }
    return answer;
  });
};

export const getPrototypeLastScreenState = (answers: PrototypeScreenState[]): PrototypeScreenState | undefined => {
  return answers[answers.length - 1];
};

export function assertAnswerStackRecordType<T extends AnswerStackRecord['type']>(
  record: AnswerStackRecord,
  type: T,
): asserts record is Extract<AnswerStackRecord, { type: T }> {
  if (record.type !== type) {
    throw new Error(`Expected ${type}, but get ${record.type}`);
  }
}
