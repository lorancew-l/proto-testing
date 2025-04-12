import OkIcon from '../../assets/ok.svg?react';
import { useIsSubmittingAnswer } from '../../research-machine/research-machine';
import { Button } from '../../ui';

import styles from './task-success.module.css';

export const TaskSuccess = ({ onContinue }: { onContinue: VoidFunction }) => {
  const submitting = useIsSubmittingAnswer();

  return (
    <div className={styles.container}>
      <span className={styles.message}>
        <OkIcon />
        Вы успешно выполнили задание!
      </span>

      <Button loading={submitting} className={styles.continueButton} onClick={onContinue}>
        Продолжить
      </Button>
    </div>
  );
};
