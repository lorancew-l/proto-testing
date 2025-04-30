import styles from './centered-content-wrapper.module.css';

export const CenteredContentWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className={styles.wrapper}>{children}</div>;
};
