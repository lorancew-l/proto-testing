import { Controls } from './controls';
import { QuestionAnswers } from './question-answers';
import { QuestionText } from './question-text';
import { QuestionWrapper } from './question-wrapper';
import { QuestionProps } from './types';

export const MultipleQuestion = ({ question, state }: QuestionProps<'multiple'>) => {
  return (
    <QuestionWrapper>
      <QuestionText text={question.text} />

      <QuestionAnswers answers={question.answers} answeredIds={state.answers} type="multiple" />

      <Controls />
    </QuestionWrapper>
  );
};
