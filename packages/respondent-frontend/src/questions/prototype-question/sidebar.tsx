import cn from 'classnames';

import styles from './sidebar.module.css';

export const Sidebar = ({ open, children }: { open: boolean; children: React.ReactNode }) => {
  return <aside className={cn(styles.sidebar, { [styles.closed]: !open })}>{children}</aside>;
};
