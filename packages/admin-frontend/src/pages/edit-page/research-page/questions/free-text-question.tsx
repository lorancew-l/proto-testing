import { TextareaAutosize } from '@mui/material';

import { FreeTextQuestion as FreeTextQuestionType } from 'shared';
import { makeStyles } from 'tss-react/mui';

import { useFieldController } from '../../store';

const useStyles = makeStyles()((theme) => ({
  wrapper: {
    position: 'relative',
  },
  textarea: {
    resize: 'none',
    minHeight: 100,
    width: '100%',
    border: '2px solid #d5d6da',
    outline: 'none',
    color: theme.palette.action.active,
    borderRadius: theme.shape.borderRadius * 3,
    backgroundColor: 'transparent',
    padding: theme.spacing(1),
    fontSize: '17px',
    fontFamily: "Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  charCounter: {
    position: 'absolute',
    bottom: theme.spacing(1.5),
    right: theme.spacing(1.5),
    fontSize: '14px',
    color: theme.palette.action.active,
    pointerEvents: 'none',
  },
}));

export const FreeTextQuestion = ({ question, index }: { question: FreeTextQuestionType; index: number }) => {
  const { value, onChange } = useFieldController(`research.questions.${index}.placeholder`);
  const { classes } = useStyles();

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className={classes.wrapper}>
      <TextareaAutosize
        className={classes.textarea}
        value={value}
        onChange={handleChange}
        placeholder="Введите описание вопроса"
      />

      <div className={classes.charCounter}>
        {0} / {question.textLimit}
      </div>
    </div>
  );
};
