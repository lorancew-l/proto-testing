import OkIcon from '../assets/ok.svg?react';

import styles from './final-screen.module.css';

export const FinalScreen = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <OkIcon />

        <span>Спасибо за участие в исследовании!</span>
      </div>
    </div>
  );
};
