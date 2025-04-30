import { Button } from '../../ui';
import { RichText } from '../rich-text';

import styles from './task-description.module.css';

export const TaskDescription = ({
  title,
  description,
  onContinue,
  onGiveUp,
}: {
  title: string;
  description: string;
  onContinue: VoidFunction;
  onGiveUp: VoidFunction;
}) => {
  return (
    <>
      <div>
        <RichText text={title} className={styles.title} />

        <RichText text={description} className={styles.description} />
      </div>

      <div className={styles.actions}>
        <Button variant="plain" onClick={onGiveUp}>
          Не могу выполнить задание
        </Button>

        <Button onClick={onContinue}>Продолжить</Button>
      </div>
    </>
  );
};
