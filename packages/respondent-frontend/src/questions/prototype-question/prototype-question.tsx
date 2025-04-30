import { useState } from 'react';

import cn from 'classnames';
import { PrototypeArea } from 'shared';

import { getPrototypeLastScreenState, useResearchMachineContext } from '../../research-machine';
import { QuestionProps } from '../types';

import styles from './prototype-question.module.css';
import { PrototypeScreen } from './prototype-screen';
import { Sidebar } from './sidebar';
import { TaskDescription } from './task-description';
import { TaskSuccess } from './task-success';

export const PrototypeQuestion = ({ question, state }: QuestionProps<'prototype'>) => {
  const [taskDescriptionOpen, setTaskDescriptionOpen] = useState(true);
  const { send } = useResearchMachineContext();

  const currentScreenId = state.type === 'prototype' ? (getPrototypeLastScreenState(state.answers)?.screenId ?? null) : null;
  const currentScreen = currentScreenId ? (question.screens.find((screen) => screen.id === currentScreenId) ?? null) : null;
  const completed = state.type === 'prototype' && state.completed;

  const handleScreenClick = (click: { x: number; y: number }, area: PrototypeArea | null) => {
    send({
      type: 'selectAnswer',
      answer: {
        type: 'prototype',
        click: { ...click, area },
      },
    });
  };

  const handleAnswer = () => {
    send({ type: 'answer' });
  };

  const handleGiveUp = () => {
    send({ type: 'selectAnswer', answer: { type: 'prototype', givenUp: true } });
  };

  return (
    <div className={styles.root}>
      <Sidebar open={taskDescriptionOpen || completed}>
        {completed ? (
          <TaskSuccess onContinue={handleAnswer} />
        ) : (
          <TaskDescription
            title={question.text}
            description={question.description}
            onContinue={() => setTaskDescriptionOpen(false)}
            onGiveUp={handleGiveUp}
          />
        )}
      </Sidebar>

      {!taskDescriptionOpen && (
        <button type="button" className={styles.showTaskButton} onClick={() => setTaskDescriptionOpen(true)}>
          <span>?</span>
        </button>
      )}

      {currentScreen && <PrototypeScreen screen={currentScreen} onClick={handleScreenClick} />}

      <div
        className={cn(styles.backdrop, {
          [styles.blur]: !completed,
          [styles.tint]: completed,
          [styles.on]: taskDescriptionOpen || completed,
        })}
      />
    </div>
  );
};
