import type { Question } from 'shared';

import { FinalScreen } from './final-screen';
import { questionTypeToComponent } from './questions';
import { QuestionProps } from './questions/types';
import { getAnswerStackRecord } from './research-machine';
import { useResearchSelector } from './research-machine/research-machine';
import { SendEventErrorScreen } from './send-event-error-screen';

export const App = () => {
  const question = useResearchSelector((context) => {
    const questionId = context.state.questionId;
    return context.research.questions.find((question) => question.id === questionId);
  });

  const questionState = useResearchSelector((context) => {
    const questionId = context.state.questionId;
    if (!questionId) return null;

    const questionState = getAnswerStackRecord(context.state.answerStack, questionId);
    return questionState;
  });

  const finished = useResearchSelector((context) => context.state.finished);
  const eventSenderError = useResearchSelector((context) => context.eventSenderError);
  const validationError = useResearchSelector((context) => context.validationError);

  if (eventSenderError) {
    return <SendEventErrorScreen />;
  }

  if (finished) {
    return <FinalScreen />;
  }

  if (!question || !questionState) return null;

  const Component = questionTypeToComponent[question.type] as React.ComponentType<QuestionProps<Question['type']>>;
  return <Component question={question} state={questionState} error={validationError} />;
};
