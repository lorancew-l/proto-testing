import { memo } from 'react';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import { Question as ResearchQuestion } from 'shared';
import { makeStyles } from 'tss-react/mui';

import { useEditPageActions } from '../store';

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
    [`&:hover .${classes.actionsContainer}`]: {
      visibility: 'visible',
    },
    [`&:focus-within .${classes.actionsContainer}`]: {
      visibility: 'visible',
    },
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
    [`:hover .${classes.addQuestionButton}`]: {
      visibility: 'visible',
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

export const Question = memo(({ question, index, last }: { question: ResearchQuestion; index: number; last: boolean }) => {
  const Component = questionTypeToComponent[question.type] as React.ComponentType<{ question: ResearchQuestion; index: number }>;

  return (
    <QuestionWrapper id={question.id} index={index} type={question.type} last={last}>
      <Component question={question} index={index} />
    </QuestionWrapper>
  );
});

Question.displayName = 'Question';

const QuestionWrapper = ({
  id,
  type,
  last,
  index,
  children,
}: {
  id: string;
  type: ResearchQuestion['type'];
  last: boolean;
  index: number;
  children: React.ReactNode;
}) => {
  const { classes } = useStyles();
  const { insertQuestion } = useEditPageActions();

  return (
    <>
      <li className={classes.questionWrapper}>
        <div className={classes.header}>
          <div className={classes.headerItemWrapper}>
            <QuestionTypeSelect id={id} type={type} />
          </div>

          <div className={classes.headerItemWrapper}>
            <span className={classes.index}>{`${index + 1}.`}</span>
          </div>

          <div className={classes.questionText}>
            <QuestionText path={`research.data.questions.${index}.text`} />
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
