import { nanoid } from 'nanoid';

import {
  BaseAnswer,
  BaseQuestion,
  FreeTextQuestion,
  MultipleQuestion,
  PrototypeQuestion,
  Question,
  RatingQuestion,
  Research,
  SingleQuestion,
} from './types';

export const generateAnswer = <T extends Extract<Question, { answers: unknown[] }>>(
  type: T['type'],
  overrides?: Partial<T['answers'][number]>,
) => {
  const baseAnswer: BaseAnswer = {
    id: nanoid(10),
    text: '',
    ...overrides,
  };

  switch (type) {
    case 'single': {
      return baseAnswer;
    }
    case 'multiple': {
      return baseAnswer;
    }
    default: {
      return baseAnswer;
    }
  }
};

export const generateQuestion = <T extends Question['type']>(
  type: T,
  overrides?: Partial<Extract<Question, { type: T }>>,
): Question => {
  const baseQuestion: BaseQuestion = {
    id: nanoid(10),
    text: '',
    requiresAnswer: true,
    displayRule: null,
  };

  switch (type) {
    case 'single':
      return {
        type,
        answers: [generateAnswer('single'), generateAnswer('single')],
        ...baseQuestion,
        ...overrides,
      } satisfies SingleQuestion;
    case 'multiple':
      return {
        type,
        answers: [generateAnswer('multiple'), generateAnswer('multiple')],
        ...baseQuestion,
        ...overrides,
      } satisfies MultipleQuestion;
    case 'rating':
      return {
        type,
        min: 1,
        max: 5,
        minLabel: '',
        maxLabel: '',
        preset: 'stars',
        ...baseQuestion,
        ...overrides,
      } satisfies RatingQuestion;
    case 'free-text':
      return {
        type,
        textLimit: 250,
        placeholder: '',
        ...baseQuestion,
        ...overrides,
      } satisfies FreeTextQuestion;
    case 'prototype':
      return {
        type,
        description: '',
        showAreaOnMisclick: false,
        screens: [generatePrototypeScreen({ x: 0, y: 0 })],
        ...baseQuestion,
        ...overrides,
      } satisfies PrototypeQuestion;
    default: {
      return baseQuestion as Question;
    }
  }
};

export const generatePrototypeScreen = (position: { x: number; y: number }, imageSrc: string = '') => {
  return {
    id: nanoid(10),
    position: { x: position.x, y: position.y },
    data: { imageSrc, description: '', areas: [], startScreen: false, targetScreen: false },
  };
};

export const generateResearch = (): Research => {
  return {
    questions: [generateQuestion('single')],
  };
};
