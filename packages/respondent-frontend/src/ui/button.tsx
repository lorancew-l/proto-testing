import cn from 'classnames';

import { CircularLoader } from '../ui';

import styles from './button.module.css';

export const Button = ({
  children,
  loading,
  onClick,
  className,
  variant = 'contained',
  fullWidth,
}: {
  children: React.ReactNode;
  loading?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  variant?: 'plain' | 'contained';
  fullWidth?: boolean;
}) => {
  return (
    <button
      type="button"
      className={cn(styles.button, className, {
        [styles.loading]: loading,
        [styles.fullWidth]: fullWidth,
        [styles.contained]: variant === 'contained',
        [styles.plain]: variant === 'plain',
      })}
      onClick={onClick}
    >
      {loading && <CircularLoader className={styles.loader} size={16} />}
      <div className={styles.content}>{children}</div>
    </button>
  );
};
