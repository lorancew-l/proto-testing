import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Typography } from '@mui/material';

import { RestrictToVerticalAxis } from '@dnd-kit/abstract/modifiers';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { makeStyles } from 'tss-react/mui';

import { InlineRichEditor } from '../inline-rich-editor';
import { useEditPageActions, useFieldController } from '../store';

const useStyles = makeStyles<void, 'deleteButton'>()((theme, _, classes) => ({
  list: {
    all: 'unset',
    appearance: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  answer: {
    all: 'unset',
    appearance: 'none',
    display: 'flex',
    alignItems: 'center',
    borderRadius: theme.shape.borderRadius * 1.5,
    border: `1px solid #d5d6da`,
    background: theme.palette.common.white,
    width: 'fit-content',
    minWidth: 0,
    maxWidth: '100%',
    padding: theme.spacing(0.25, 0.5),
    [`&:hover .${classes.deleteButton}`]: {
      visibility: 'visible',
    },
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
  },
  deleteButton: {
    visibility: 'hidden',
  },
  answerText: {
    flexShrink: 1,
    minWidth: 0,
  },
  addAnswerButton: {
    all: 'unset',
    appearance: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius * 1.5,
    border: `1px solid #d5d6da`,
    width: 'fit-content',
    minWidth: 0,
    maxWidth: '100%',
    padding: theme.spacing(0.25, 0.5),
    '&:hover': {
      opacity: 0.7,
    },
  },
}));

export const QuestionAnswers = ({
  questionId,
  questionIndex,
  answers,
}: {
  questionId: string;
  questionIndex: number;
  answers: { id: string }[];
}) => {
  const { classes } = useStyles();
  const { appendAnswer, removeAnswer, moveAnswer } = useEditPageActions();

  return (
    <ol className={classes.list}>
      <DragDropProvider onDragEnd={(event) => moveAnswer(questionId, event)}>
        {answers.map((answer, index) => (
          <QuestionAnswer
            key={answer.id}
            id={answer.id}
            questionIndex={questionIndex}
            index={index}
            onRemove={() => removeAnswer(questionId, answer.id)}
          />
        ))}
      </DragDropProvider>

      <AddAnswerButton onClick={() => appendAnswer(questionId)} />
    </ol>
  );
};

const QuestionAnswer = ({
  id,
  questionIndex,
  index,
  onRemove,
}: {
  id: string;
  questionIndex: number;
  index: number;
  onRemove: VoidFunction;
}) => {
  const { classes, cx } = useStyles();

  const { ref } = useSortable({ id, index, modifiers: [RestrictToVerticalAxis] });

  return (
    <li className={classes.answer} ref={ref}>
      <button className={classes.button}>
        <DragIndicatorIcon color="action" fontSize="small" />
      </button>

      <div className={classes.answerText}>
        <AnswerText path={`research.questions.${questionIndex}.answers.${index}.text`} />
      </div>

      <button className={cx(classes.button, classes.deleteButton)} onClick={onRemove}>
        <DeleteIcon color="action" fontSize="medium" />
      </button>
    </li>
  );
};

const AnswerText = ({ path }: { path: `research.questions.${number}.answers.${number}.text` }) => {
  const { value, onChange, ref } = useFieldController(path);

  return <InlineRichEditor value={value ?? ''} onChange={onChange} placeholder="Введите текст ответа" ref={ref} />;
};

const AddAnswerButton = ({ onClick }: { onClick: VoidFunction }) => {
  const { classes } = useStyles();

  return (
    <button className={classes.addAnswerButton} onClick={onClick}>
      <AddIcon />
      <Typography>{'Добавить вопрос'}</Typography>
    </button>
  );
};
