import { memo } from 'react';

import { Typography, alpha } from '@mui/material';

import { RestrictToVerticalAxis } from '@dnd-kit/abstract/modifiers';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { Question } from 'shared';
import { makeStyles } from 'tss-react/mui';

import { questionTypeToIcon } from '../../common';
import { RichText } from '../../rich-text';
import { useEditPageActions, useEditPageStore, useIsActiveQuestion } from '../../store';
import { Sidebar } from '../sidebar';

const useStyles = makeStyles()((theme) => ({
  questionList: {
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    margin: theme.spacing(2, 0),
  },
  questionItem: {
    display: 'flex',
    alignItems: 'center',
    height: 40,
    flexWrap: 'nowrap',
    gap: theme.spacing(1),
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: theme.palette.common.white,
    padding: theme.spacing(0, 1),
    cursor: 'pointer',
  },
  activeQuestion: {
    backgroundColor: alpha(theme.palette.primary.light, 0.2),
  },
  questionText: {
    minWidth: 0,
    p: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
  icon: {
    color: theme.palette.common.white,
    width: 14,
    height: 14,
  },
  iconContainer: {
    width: 18,
    height: 18,
    borderRadius: theme.shape.borderRadius * 1.5,
    backgroundColor: theme.palette.primary.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  },
}));

export const ContentSidebar = ({ isLoading }: { isLoading: boolean }) => {
  const { classes } = useStyles();

  const { moveQuestion } = useEditPageActions();
  const questions = useEditPageStore((state) => state.research.questions);

  return (
    <Sidebar isLoading={isLoading}>
      <Typography variant="h6">Содержание</Typography>

      <DragDropProvider onDragEnd={moveQuestion}>
        <ol className={classes.questionList}>
          {questions.map((question, index) => (
            <QuestionItem key={question.id} question={question} index={index} />
          ))}
        </ol>
      </DragDropProvider>
    </Sidebar>
  );
};

const QuestionItem = memo(({ question, index }: { question: Question; index: number }) => {
  const { classes, cx } = useStyles();
  // @ts-ignore
  const { ref } = useSortable({ id: question.id, index, modifiers: [RestrictToVerticalAxis], type: 'question' });
  const { setActiveEntity } = useEditPageActions();

  const Icon = questionTypeToIcon[question.type];
  const isActive = useIsActiveQuestion(question.id);
  const isEmptyText = question.text === '' || question.text === '<p></p>';

  const setQuestionActive = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    setActiveEntity({ type: 'question', questionId: question.id });
  };

  return (
    <li className={cx(classes.questionItem, { [classes.activeQuestion]: isActive })} ref={ref} onClick={setQuestionActive}>
      <div>{`${index + 1}.`}</div>

      <div className={classes.iconContainer}>
        <Icon className={classes.icon} />
      </div>

      <RichText text={isEmptyText ? 'Без названия' : question.text} className={classes.questionText} />
    </li>
  );
});
