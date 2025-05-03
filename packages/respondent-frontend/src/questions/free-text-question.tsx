import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import { useResearchMachineContext } from '../research-machine';

import { Controls } from './controls';
import styles from './free-text-question.module.css';
import { QuestionText } from './question-text';
import { QuestionWrapper } from './question-wrapper';
import { QuestionProps } from './types';
import { ValidationError } from './validation-error';

export const FreeTextQuestion = ({ question, state, error }: QuestionProps<'free-text'>) => {
  const { send } = useResearchMachineContext();

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    send({ type: 'selectAnswer', answer: { type: 'free-text', text: event.target.value } });
  };

  return (
    <QuestionWrapper>
      <QuestionText text={question.text} />

      {error && <ValidationError error={error} />}

      <div className={styles.textareaWrapper}>
        <TextareaAutosize
          className={styles.textarea}
          value={state.text}
          onChange={handleChange}
          placeholder={question.placeholder}
          maxLength={question.textLimit}
        />

        <div className={styles.charCounter}>
          {state.text.length} / {question.textLimit}
        </div>
      </div>

      <Controls requiresAnswer={question.requiresAnswer} />
    </QuestionWrapper>
  );
};
