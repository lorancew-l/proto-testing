import { CenteredContentWrapper } from '../ui';

import styles from './question-wrapper.module.css';

export const QuestionWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <CenteredContentWrapper>
      <div className={styles.wrapper}>{children}</div>
    </CenteredContentWrapper>
  );
};
