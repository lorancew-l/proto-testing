import styles from './question-wrapper.module.css';

export const QuestionWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={styles.root}>
      <div className={styles.wrapper}>{children}</div>
    </div>
  );
};
