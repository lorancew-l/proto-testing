import type { Question } from 'shared';

import { PrototypeQuestion } from './prototype-question';
import { SingleQuestion } from './single-question';
import { QuestionProps } from './types';

export const questionTypeToComponent: {
  [T in Question['type']]: React.ComponentType<QuestionProps<T>>;
} = {
  single: SingleQuestion,
  multiple: () => null,
  rating: () => null,
  prototype: PrototypeQuestion,
};
