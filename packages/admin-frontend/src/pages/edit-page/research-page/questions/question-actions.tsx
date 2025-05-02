import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';

import { makeStyles } from 'tss-react/mui';

import { useEditPageActions, useEditPageStore } from '../../store';

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
    '&:not(:disabled):hover': {
      opacity: 0.7,
    },
    '&:not(:last-child)': {
      marginRight: theme.spacing(1),
    },
    '&:disabled': {
      opacity: 0.5,
    },
  },
}));

export const QuestionActions = ({ id, className }: { id: string; className: string }) => {
  const { classes, cx } = useStyles();

  const { duplicateQuestion, removeQuestion } = useEditPageActions();
  const canDelete = useEditPageStore((store) => store.research.questions.length > 1);

  const handleRemoveQuestion = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    removeQuestion(id);
  };

  return (
    <div className={cx(className, classes.container)}>
      <button className={classes.button} onClick={() => duplicateQuestion(id)}>
        <ContentCopyIcon color="action" fontSize="small" />
      </button>

      <button className={classes.button} onClick={handleRemoveQuestion} disabled={!canDelete}>
        <DeleteIcon color="action" fontSize="medium" />
      </button>
    </div>
  );
};
