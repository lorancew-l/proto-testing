import cn from 'classnames';

import styles from './rich-text.module.css';

export const RichText = ({ text, className }: { text: string; className?: string }) => {
  return (
    <div
      className={cn(className, styles.text)}
      dangerouslySetInnerHTML={{
        __html: text,
      }}
    />
  );
};
