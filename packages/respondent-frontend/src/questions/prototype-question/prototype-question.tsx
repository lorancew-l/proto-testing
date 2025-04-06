import { useState } from 'react';

import cn from 'classnames';

import { useResearchMachineContext } from '../../research-machine';
import { QuestionProps } from '../types';

import styles from './prototype-question.module.css';
import { PrototypeScreen } from './prototype-screen';
import { Sidebar } from './sidebar';
import { TaskDescription } from './task-description';
import { TaskSuccess } from './task-success';

export const PrototypeQuestion = ({ question, state }: QuestionProps<'prototype'>) => {
  const [taskDescriptionOpen, setTaskDescriptionOpen] = useState(true);
  const { send } = useResearchMachineContext();

  const currentScreen = state.screenId ? question.screens.find((screen) => screen.id === state.screenId) : null;

  const isTargetReached = !!currentScreen && currentScreen.data.areas.every((area) => !area.goToScreenId);

  return (
    <div className={styles.root}>
      <Sidebar open={taskDescriptionOpen || isTargetReached}>
        {isTargetReached ? (
          <TaskSuccess onContinue={() => send({ type: 'answer' })} />
        ) : (
          <TaskDescription title={question.text} description="Placeholder" onContinue={() => setTaskDescriptionOpen(false)} />
        )}
      </Sidebar>

      {!taskDescriptionOpen && (
        <button type="button" className={styles.showTaskButton} onClick={() => setTaskDescriptionOpen(true)}>
          <span>?</span>
        </button>
      )}

      {currentScreen && <PrototypeScreen screen={currentScreen} />}

      <div
        className={cn(styles.backdrop, {
          [styles.blur]: !isTargetReached,
          [styles.tint]: isTargetReached,
          [styles.on]: taskDescriptionOpen || isTargetReached,
        })}
      />
    </div>
  );
};
