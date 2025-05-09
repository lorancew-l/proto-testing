import cn from 'classnames';

import CheckMarkIcon from '../assets/check-mark.svg?react';
import { useResearchMachineContext } from '../research-machine';

import styles from './question-answers.module.css';
import { RichText } from './rich-text';

export const QuestionAnswers = ({
  type,
  answers,
  answeredIds,
}: {
  type: 'single' | 'multiple';
  answers: { id: string; text: string }[];
  answeredIds: string[];
}) => {
  const { send } = useResearchMachineContext();

  return (
    <ol className={styles.answerList}>
      {answers.map((answer) => {
        const selected = answeredIds.includes(answer.id);
        return (
          <li
            key={answer.id}
            className={cn(styles.answer, { [styles.selected]: selected })}
            onClick={() => {
              send({ type: 'selectAnswer', answer: { type, answerId: answer.id } });
            }}
          >
            <div className={styles.indicator}>
              {type === 'single' && <RadioIndicator active={selected} />}
              {type === 'multiple' && <CheckboxIndicator active={selected} />}
            </div>

            <RichText text={answer.text} />
          </li>
        );
      })}
    </ol>
  );
};

const RadioIndicator = ({ active }: { active: boolean }) => {
  return <div className={cn(styles.radioIndicator, { [styles.active]: active })}></div>;
};

const CheckboxIndicator = ({ active }: { active: boolean }) => {
  return (
    <div className={cn(styles.checkboxIndicator, { [styles.active]: active })}>
      <CheckMarkIcon />
    </div>
  );
};
