import type { SingleQuestion as SingleQuestionType } from 'shared';

import { QuestionAnswers } from './question-answers';

export const SingleQuestion = ({ question, index }: { question: SingleQuestionType; index: number }) => {
  return (
    <>
      <QuestionAnswers questionId={question.id} questionIndex={index} answers={question.answers} />
    </>
  );
};
