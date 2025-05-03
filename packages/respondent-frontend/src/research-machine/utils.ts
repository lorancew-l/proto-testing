import { nanoid } from 'nanoid';
import type { DisplayRule, DisplayRuleOperand, Question, Research } from 'shared';

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

  let nextQuestion: Question | undefined;

  for (let index = currentQuestionIndex + 1; index < research.questions.length; index++) {
    const question = research.questions[index];

    if (computeDisplayRule(question.displayRule, state.answerStack, window.location.href)) {
      nextQuestion = question;
      break;
    }
  }

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

export const getAnswerStackRecordSafe = (answerStack: AnswerStackRecord[], questionId: string) => {
  try {
    return getAnswerStackRecord(answerStack, questionId);
  } catch {
    return null;
  }
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
      questionId: question.id,
      type: question.type,
      givenUp: false,
      completed: false,
      startTs: Date.now(),
      endTs: null,
      answers: [generatePrototypeScreenState(screenId)],
    };
  }

  if (question.type === 'free-text') {
    return {
      questionId: question.id,
      type: question.type,
      text: '',
    };
  }

  return {
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

function evaluateAnswerOperand(
  operand: Extract<DisplayRuleOperand, { type: 'answer' }>,
  answerStack: AnswerStackRecord[],
): boolean {
  const record = getAnswerStackRecordSafe(answerStack, operand.questionId);
  if (!record) return false;

  switch (operand.operator) {
    case 'equals': {
      if (record.type === 'prototype') {
        return operand.answerId === 'completed' ? record.completed : operand.answerId === 'givenUp' ? record.givenUp : false;
      }
      return 'answers' in record ? record.answers.some((a) => a === operand.answerId) : false;
    }
    case 'not-equals': {
      if (record.type === 'prototype') {
        return operand.answerId === 'completed' ? !record.completed : operand.answerId === 'givenUp' ? !record.givenUp : false;
      }
      return 'answers' in record ? record.answers.every((a) => a === operand.answerId) : false;
    }
    case 'greater': {
      return 'answers' in record
        ? record.answers.every((a) => {
            try {
              const actual = Number(a);
              const expected = Number(operand.answerId);
              return isNaN(actual) || isNaN(expected) ? false : actual > expected;
            } catch {
              return false;
            }
          })
        : false;
    }
    case 'less': {
      return 'answers' in record
        ? record.answers.every((a) => {
            try {
              const actual = Number(a);
              const expected = Number(operand.answerId);
              return isNaN(actual) || isNaN(expected) ? false : actual < expected;
            } catch {
              return false;
            }
          })
        : false;
    }
    case 'contain':
      return 'text' in record && record.text.includes(operand.answerId);
    case 'not-contain':
      return 'text' in record && !record.text.includes(operand.answerId);
    default:
      return false;
  }
}

function evaluateUTMOperand(operand: Extract<DisplayRuleOperand, { type: 'utm' }>, referer: string): boolean {
  const params = new URLSearchParams(referer);
  const actualValue = params.get(operand.name);

  switch (operand.operator) {
    case 'equals':
      return actualValue === operand.value;
    case 'not-equals':
      return actualValue !== operand.value;
    case 'exists': {
      return !!actualValue;
    }
    case 'not-exists': {
      return !actualValue;
    }
    default:
      return false;
  }
}

function evaluateOperand(operand: DisplayRuleOperand, answerStack: AnswerStackRecord[], referer: string): boolean {
  switch (operand.type) {
    case 'answer':
      return evaluateAnswerOperand(operand, answerStack);
    case 'utm':
      return evaluateUTMOperand(operand, referer);
    default:
      return false;
  }
}

function computeDisplayRule(rule: DisplayRule | null, answerStack: AnswerStackRecord[], referer: string): boolean {
  if (!rule) return true;

  const values: boolean[] = rule.operands.map((op) => evaluateOperand(op, answerStack, referer));
  const operators = rule.operators;

  let result = values[0];
  for (let i = 0; i < operators.length; i++) {
    const op = operators[i];
    const next = values[i + 1];
    result = op === 'and' ? result && next : result || next;
  }

  return rule.displayType === 'show' ? result : !result;
}
