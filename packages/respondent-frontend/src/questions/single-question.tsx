import { Controls } from './controls';
import { QuestionAnswers } from './question-answers';
import { QuestionText } from './question-text';
import { QuestionWrapper } from './question-wrapper';
import { QuestionProps } from './types';

export const SingleQuestion = ({ question, state }: QuestionProps<'single'>) => {
  return (
    <QuestionWrapper>
      <QuestionText text={question.text} />

      <QuestionAnswers answers={question.answers} answeredIds={state.answers} type="single" />

      <Controls />
    </QuestionWrapper>
  );
};
