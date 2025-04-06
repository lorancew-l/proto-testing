import type { Question, Research } from 'shared';

import type { AnswerStackRecord, ResearchState } from './types';

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
      finishedAt: Date.now(),
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

export const updateAnswerStackRecord = (answerStack: AnswerStackRecord[], nextRecord: AnswerStackRecord) => {
  return answerStack.map((record) => {
    if (record.questionId === nextRecord.questionId) {
      return nextRecord;
    }

    return record;
  });
};

export const createAnswerStackRecord = (question: Question): AnswerStackRecord => {
  if (question.type === 'prototype') {
    const [firstScreen] = question.screens;
    return {
      questionId: question.id,
      screenId: firstScreen?.id,
      type: question.type,
      answers: [],
    };
  }

  return {
    questionId: question.id,
    type: question.type,
    answers: [],
  };
};
