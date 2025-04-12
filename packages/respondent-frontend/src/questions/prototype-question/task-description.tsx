import { Button } from '../../ui';
import { RichText } from '../rich-text';

import styles from './task-description.module.css';

export const TaskDescription = ({
  title,
  description,
  onContinue,
}: {
  title: string;
  description: string;
  onContinue: VoidFunction;
}) => {
  return (
    <>
      <div>
        <RichText text={title} className={styles.title} />

        <RichText text={description} className={styles.description} />
      </div>

      <Button className={styles.continueButton} onClick={onContinue}>
        Продолжить
      </Button>
    </>
  );
};
