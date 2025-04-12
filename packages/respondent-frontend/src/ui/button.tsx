import cn from 'classnames';

import { CircularLoader } from '../ui';

import styles from './button.module.css';

export const Button = ({
  children,
  loading,
  onClick,
  className,
}: {
  children: React.ReactNode;
  loading?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}) => {
  return (
    <button type="button" className={cn(styles.button, className, { [styles.loading]: loading })} onClick={onClick}>
      {loading && <CircularLoader className={styles.loader} size={16} />}
      <div className={styles.content}>{children}</div>
    </button>
  );
};
