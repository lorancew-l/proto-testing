import { Controls } from './controls';
import { QuestionAnswers } from './question-answers';
import { QuestionText } from './question-text';
import { QuestionWrapper } from './question-wrapper';
import { QuestionProps } from './types';
import { ValidationError } from './validation-error';

export const SingleQuestion = ({ question, state, error }: QuestionProps<'single'>) => {
  return (
    <QuestionWrapper>
      <QuestionText text={question.text} />

      {error && <ValidationError error={error} />}

      <QuestionAnswers answers={question.answers} answeredIds={state.answers} type="single" />

      <Controls requiresAnswer={question.requiresAnswer} />
    </QuestionWrapper>
  );
};
