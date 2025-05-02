import styles from './validation-error.module.css';

export const ValidationError = ({ error }: { error: string }) => {
  return <div className={styles.error}>{error}</div>;
};
