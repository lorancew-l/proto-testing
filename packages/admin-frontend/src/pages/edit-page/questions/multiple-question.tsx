import type { MultipleQuestion as MultipleQuestionType } from 'shared';

import { QuestionAnswers } from './question-answers';

export const MultipleQuestion = ({ question, index }: { question: MultipleQuestionType; index: number }) => {
  return (
    <>
      <QuestionAnswers questionId={question.id} questionIndex={index} answers={question.answers} />
    </>
  );
};
