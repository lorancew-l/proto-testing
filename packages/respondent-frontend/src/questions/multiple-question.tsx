import { Controls } from './controls';
import { QuestionAnswers } from './question-answers';
import { QuestionText } from './question-text';
import { QuestionWrapper } from './question-wrapper';
import { QuestionProps } from './types';
import { ValidationError } from './validation-error';

export const MultipleQuestion = ({ question, state, error }: QuestionProps<'multiple'>) => {
  return (
    <QuestionWrapper>
      <QuestionText text={question.text} />

      {error && <ValidationError error={error} />}

      <QuestionAnswers answers={question.answers} answeredIds={state.answers} type="multiple" />

      <Controls requiresAnswer={question.requiresAnswer} />
    </QuestionWrapper>
  );
};
