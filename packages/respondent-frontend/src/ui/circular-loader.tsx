import styles from './circular-loader.module.css';

export const CircularLoader = ({ size = 16, color, className }: { size: number; color?: string; className?: string }) => {
  return (
    <div className={className}>
      <div className={styles.loader} style={{ width: size, height: size, borderWidth: size / 8, borderColor: color }} />
    </div>
  );
};
