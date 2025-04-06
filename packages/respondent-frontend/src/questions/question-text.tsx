import styles from './question-text.module.css';
import { RichText } from './rich-text';

export const QuestionText = ({ text }: { text: string }) => {
  return <RichText className={styles.text} text={text} />;
};
