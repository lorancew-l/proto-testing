import cn from 'classnames';

import StarFilledIcon from '../assets/star-filled.svg?react';
import StarIcon from '../assets/star.svg?react';
import { useResearchMachineContext } from '../research-machine';

import { Controls } from './controls';
import { QuestionText } from './question-text';
import { QuestionWrapper } from './question-wrapper';
import styles from './rating-question.module.css';
import { RichText } from './rich-text';
import { QuestionProps } from './types';

export const RatingQuestion = ({ question, state }: QuestionProps<'rating'>) => {
  const ratingRange = range(question.min, question.max);
  const { send } = useResearchMachineContext();

  return (
    <QuestionWrapper>
      <QuestionText text={question.text} />

      <div className={styles.labels}>
        <ScaleLabel value={question.min} text={question.minLabel} />
        <ScaleLabel value={question.max} text={question.maxLabel} />
      </div>

      <ol className={styles.ratingContainer}>
        {ratingRange.map((rating) => {
          const active = state.answers.includes(String(rating));
          return (
            <li
              key={rating}
              role="button"
              className={cn(styles.rating, {
                [styles.ratingStar]: question.preset === 'stars',
                [styles.active]: active,
              })}
              onClick={() => send({ type: 'selectAnswer', answer: { type: 'rating', answerId: String(rating) } })}
            >
              {question.preset === 'digits' && rating}
              {question.preset === 'stars' &&
                (active ? <StarFilledIcon className={styles.star} /> : <StarIcon className={styles.star} />)}
            </li>
          );
        })}
      </ol>

      <Controls />
    </QuestionWrapper>
  );
};

const ScaleLabel = ({ text, value }: { text: string; value: number }) => {
  return (
    <div className={styles.label}>
      {`${value}`}
      <span>—</span>
      <RichText text={text} />
    </div>
  );
};

function range(min: number, max: number): number[] {
  const result: number[] = [];

  for (let i = min; i <= max; i++) {
    result.push(i);
  }

  return result;
}
