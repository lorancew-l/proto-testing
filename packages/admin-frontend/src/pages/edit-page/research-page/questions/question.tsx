import React, { memo, useEffect, useRef } from 'react';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { alpha } from '@mui/material';

import { Question as ResearchQuestion } from 'shared';
import { makeStyles } from 'tss-react/mui';

import { useEditPageActions, useIsActiveQuestion } from '../../store';

import { MultipleQuestion } from './multiple-question';
import { PrototypeQuestion } from './prototype-question';
import { QuestionActions } from './question-actions';
import { QuestionText } from './question-text';
import { QuestionTypeSelect } from './question-type-select';
import { RatingQuestion } from './rating-question';
import { SingleQuestion } from './single-question';

const useStyles = makeStyles<void, 'actionsContainer' | 'addQuestionButton'>()((theme, _, classes) => ({
  questionWrapper: {
    appearance: 'none',
    listStyleType: 'none',
    width: '100%',
    boxSizing: 'border-box',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.common.white,
    borderRadius: theme.shape.borderRadius * 4,
    border: `1px solid #d5d6da`,
    scrollMargin: theme.spacing(2),
    [`&:hover .${classes.actionsContainer}`]: {
      visibility: 'visible',
    },
    [`&:focus-within .${classes.actionsContainer}`]: {
      visibility: 'visible',
    },
  },
  activeQuestion: {
    outline: `2px solid ${theme.palette.primary.main}`,
  },
  actionsContainer: {
    marginLeft: theme.spacing(2),
    visibility: 'hidden',
  },
  header: {
    marginTop: -5,
    display: 'flex',
    alignItems: 'flex-start',
    fontSize: 16,
    marginBottom: theme.spacing(1),
    '& > *': {
      flexShrink: 0,
    },
  },
  index: {
    fontWeight: theme.typography.fontWeightBold,
    margin: theme.spacing(0, 0.75, 0, 1),
  },
  questionText: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  separatorRoot: {
    all: 'unset',
    cursor: 'pointer',
    height: 24,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    [`&:hover .${classes.addQuestionButton}, &:hover:before, &:hover:after`]: {
      visibility: 'visible',
    },
    ['&:before, &:after']: {
      content: '""',
      position: 'absolute',
      visibility: 'hidden',
      top: '50%',
      transform: 'translateY(-50%)',
      backgroundColor: alpha(theme.palette.action.active, 0.2),
      width: `calc(50% - 12px - calc(${theme.spacing(1)}))`,
      height: 1,
    },
    '&:before': {
      left: theme.spacing(1),
    },
    '&:after': {
      right: theme.spacing(1),
    },
  },
  addQuestionButton: {
    width: 18,
    height: 18,
    visibility: 'hidden',
    cursor: 'pointer',
    color: theme.palette.action.active,
    '&:hover': {
      opacity: 0.7,
    },
  },
  headerItemWrapper: {
    display: 'flex',
    alignItems: 'center',
    height: 29,
  },
}));

type QuestionType = ResearchQuestion['type'];

const questionTypeToComponent: {
  [T in QuestionType]: React.ComponentType<{ question: Extract<ResearchQuestion, { type: T }>; index: number }>;
} = {
  single: SingleQuestion,
  multiple: MultipleQuestion,
  rating: RatingQuestion,
  prototype: PrototypeQuestion,
};

export const Question = memo(({ question, index }: { question: ResearchQuestion; index: number }) => {
  const Component = questionTypeToComponent[question.type] as React.ComponentType<{ question: ResearchQuestion; index: number }>;

  return (
    <QuestionWrapper key={question.type} id={question.id} index={index} type={question.type}>
      <Component question={question} index={index} />
    </QuestionWrapper>
  );
});

Question.displayName = 'Question';

const QuestionWrapper = ({
  id,
  type,
  index,
  children,
}: {
  id: string;
  type: ResearchQuestion['type'];
  index: number;
  children: React.ReactNode;
}) => {
  const { classes, cx } = useStyles();
  const {
    insertQuestion,
    setActiveEntity,
    form: { registerField, unregisterField },
  } = useEditPageActions();
  const isActive = useIsActiveQuestion(id);

  const questionPath = `research.questions.${index}` as const;

  const ref = useRef<HTMLLIElement | null>(null);

  const setQuestionActive = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    setActiveEntity({ type: 'question', questionId: id });
  };

  useEffect(() => {
    if (ref.current) {
      registerField(
        questionPath,
        {
          focus: () => ref.current?.focus(),
          scrollIntoView: () => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        },
        id,
      );
    }

    return () => unregisterField(questionPath);
  }, [questionPath, id]);

  return (
    <>
      <li ref={ref} className={cx(classes.questionWrapper, { [classes.activeQuestion]: isActive })} onClick={setQuestionActive}>
        <div className={classes.header}>
          <div className={classes.headerItemWrapper}>
            <QuestionTypeSelect id={id} type={type} />
          </div>

          <div className={classes.headerItemWrapper}>
            <span className={classes.index}>{`${index + 1}.`}</span>
          </div>

          <div className={classes.questionText}>
            <QuestionText path={`${questionPath}.text`} />
          </div>

          <div className={classes.headerItemWrapper}>
            <QuestionActions id={id} className={classes.actionsContainer} />
          </div>
        </div>

        {children}
      </li>

      <Separator onClick={() => insertQuestion(index + 1)} />
    </>
  );
};

const Separator = ({ onClick }: { onClick: VoidFunction }) => {
  const { classes } = useStyles();

  return (
    <button className={classes.separatorRoot} onClick={onClick}>
      <AddCircleOutlineIcon className={classes.addQuestionButton} />
    </button>
  );
};
