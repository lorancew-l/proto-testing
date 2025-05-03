import type { Question } from 'shared';

import { FreeTextQuestion } from './free-text-question';
import { MultipleQuestion } from './multiple-question';
import { PrototypeQuestion } from './prototype-question';
import { RatingQuestion } from './rating-question';
import { SingleQuestion } from './single-question';
import { QuestionProps } from './types';

export const questionTypeToComponent: {
  [T in Question['type']]: React.ComponentType<QuestionProps<T>>;
} = {
  single: SingleQuestion,
  multiple: MultipleQuestion,
  rating: RatingQuestion,
  'free-text': FreeTextQuestion,
  prototype: PrototypeQuestion,
};
