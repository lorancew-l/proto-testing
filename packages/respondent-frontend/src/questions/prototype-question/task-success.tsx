import OkIcon from '../../assets/ok.svg?react';

import styles from './task-success.module.css';

export const TaskSuccess = ({ onContinue }: { onContinue: VoidFunction }) => {
  return (
    <div className={styles.container}>
      <span className={styles.message}>
        <OkIcon />
        Вы успешно выполнили задание!
      </span>

      <button type="button" className={styles.continueButton} onClick={onContinue}>
        Продолжить
      </button>
    </div>
  );
};
