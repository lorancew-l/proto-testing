import OkIcon from '../assets/ok.svg?react';
import { CenteredContentWrapper } from '../ui';

import styles from './final-screen.module.css';

export const FinalScreen = () => {
  return (
    <CenteredContentWrapper>
      <div className={styles.content}>
        <OkIcon />

        <span>Спасибо за участие в исследовании!</span>
      </div>
    </CenteredContentWrapper>
  );
};
