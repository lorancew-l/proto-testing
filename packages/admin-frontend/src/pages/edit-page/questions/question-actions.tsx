import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';

import { makeStyles } from 'tss-react/mui';

import { useEditPageActions } from '../store';

const useStyles = makeStyles()((theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
  },
  button: {
    all: 'unset',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    '&:hover': {
      opacity: 0.7,
    },
    '&:not(:last-child)': {
      marginRight: theme.spacing(1),
    },
  },
}));

export const QuestionActions = ({ id, className }: { id: string; className: string }) => {
  const { classes, cx } = useStyles();

  const { duplicateQuestion, removeQuestion } = useEditPageActions();

  return (
    <div className={cx(className, classes.container)}>
      <button className={classes.button} onClick={() => duplicateQuestion(id)}>
        <ContentCopyIcon color="action" fontSize="small" />
      </button>

      <button className={classes.button} onClick={() => removeQuestion(id)}>
        <DeleteIcon color="action" fontSize="medium" />
      </button>
    </div>
  );
};
