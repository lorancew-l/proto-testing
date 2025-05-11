import React, { useMemo } from 'react';

import { range } from 'lodash';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Typography } from '@mui/material';

import { nanoid } from 'nanoid';
import { Question } from 'shared';
import { makeStyles } from 'tss-react/mui';

import { RichText } from '../../rich-text';
import { SelectOption, UncontrolledSelect } from '../../select';

import { useFieldController } from './filter-store';

const useStyles = makeStyles<void, 'deleteOperandButton'>()((theme, _, classes) => ({
  switch: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  displayType: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    marginBottom: theme.spacing(1),
  },
  addOperandButton: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: '1px solid #d5d6da',
    backgroundColor: 'transparent',
    width: 24,
    height: 24,
    position: 'relative',
    '&:hover': {
      opacity: 0.7,
    },
    '& > *': {
      display: 'flex',
      alignItems: 'center',
    },
  },
  operatorSelect: {
    flexShrink: 0,
  },
  filterOperand: {
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'flex-start',
    [`&:hover .${classes.deleteOperandButton}`]: {
      visibility: 'visible',
    },
  },
  ruleOperandContent: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.75),
    marginBottom: theme.spacing(2),
  },
  ruleOperator: {
    marginBottom: theme.spacing(2),
  },
  operandSettings: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
  },
  utmSettings: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.75),
  },
  ruleLabelText: {
    '& p': {
      maxWidth: 250,
      overflow: 'hidden',
      textWrap: 'nowrap',
      textOverflow: 'ellipsis',
    },
  },
  deleteOperandButton: {
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    visibility: 'hidden',
  },
}));

export const AnswerFilter = ({ questions }: { questions: Question[] }) => {
  const { classes } = useStyles();

  const { value, onChange, getCurrentValue } = useFieldController('answer');

  const options = useMemo(() => getAnswerFilterOptions(questions), [questions]);

  const handleAppendOperand = () => {
    const rule = getCurrentValue();
    const [option] = options;

    if (option) {
      onChange({
        ...rule,
        operands: [
          ...(rule?.operands ?? []),
          { id: nanoid(10), type: option.data.type, questionId: option.data.questionId, answers: [] },
        ],
        operators: rule?.operands.length ? [...rule.operators, 'and'] : [],
      });
    }
  };

  const handleDeleteOperand = (id: string, index: number) => {
    const rule = getCurrentValue();
    if (!rule) return;

    const operandIndex = Math.max(0, index - 1);
    onChange({
      ...rule,
      operands: rule.operands.filter((operand) => operand.id !== id),
      operators: rule.operators.filter((_, opIndex) => opIndex !== operandIndex),
    });
  };

  return (
    <div>
      <Typography variant="body1" fontWeight="bold" sx={{ marginBottom: 2 }}>
        Ответы на вопрос
      </Typography>

      {value?.operands.map((operand, index) => (
        <React.Fragment key={operand.id}>
          <FilterOperand
            options={options}
            path={`answer.operands.${index}`}
            onDelete={() => handleDeleteOperand(operand.id, index)}
          />

          {index !== value.operands.length - 1 && <RuleOperator path={`answer.operators.${index}`} />}
        </React.Fragment>
      ))}

      <button className={classes.addOperandButton} onClick={handleAppendOperand}>
        <AddIcon />
      </button>
    </div>
  );
};

const FilterOperand = ({
  path,
  options,
  onDelete,
}: {
  options: AnswerFilterOption[];
  path: `answer.operands.${number}`;
  onDelete: () => void;
}) => {
  const { classes } = useStyles();
  const { value, onChange } = useFieldController(path);

  const selectedOption = useMemo(() => options.find((option) => option.value === value?.questionId), [options, value]);

  const handleQuestionChange = (optionValue: string) => {
    const option = options.find((option) => option.value === optionValue);
    if (!option) return;

    onChange({
      id: value?.id ?? nanoid(10),
      type: option.data.type,
      questionId: option.data.questionId,
      answers: [],
    });
  };

  return (
    <div className={classes.filterOperand}>
      <div className={classes.ruleOperandContent}>
        <UncontrolledSelect
          options={options}
          value={selectedOption?.value}
          onChange={handleQuestionChange}
          placeholder="Выберите вопрос"
          variant="inline"
        />

        {!!selectedOption && (
          <div className={classes.operandSettings}>
            <AnswerSelect path={`${path}.answers`} options={selectedOption.data.answers} />
          </div>
        )}
      </div>

      <button className={classes.deleteOperandButton} onClick={onDelete}>
        <DeleteIcon color="action" />
      </button>
    </div>
  );
};

const operatorTypeOptions = [
  { value: 'and' as const, label: 'и' },
  { value: 'or' as const, label: 'или' },
];
const RuleOperator = ({ path }: { path: `answer.operators.${number}` }) => {
  const { value, onChange } = useFieldController(path);

  const { classes } = useStyles();

  return (
    <div className={classes.ruleOperator}>
      <UncontrolledSelect<'and' | 'or'> value={value} onChange={onChange} options={operatorTypeOptions} variant="inline" />
    </div>
  );
};

type AnswerFilterOption = {
  label: React.ReactNode;
  value: string;
  data: {
    type: Question['type'];
    questionId: string;
    answers: { value: string; label: React.ReactNode }[];
  };
};
const getAnswerFilterOptions = (questions: Question[]): AnswerFilterOption[] => {
  const options: AnswerFilterOption[] = [];

  for (const [index, question] of questions.entries()) {
    const label = <RuleLabelText order={index + 1} text={question.text} />;

    const answers: { value: string; label: React.ReactNode }[] = (() => {
      switch (question.type) {
        case 'single':
          return question.answers.map((answer) => ({ value: answer.id, label: <RuleLabelText text={answer.text} /> }));
        case 'multiple':
          return question.answers.map((answer) => ({ value: answer.id, label: <RuleLabelText text={answer.text} /> }));
        case 'rating':
          return range(question.min, question.max + 1).map((rating) => ({ value: rating.toString(), label: rating.toString() }));
        case 'prototype':
          return [
            { value: 'completed', label: 'Завершил' },
            { value: 'givenUp', label: 'Сдался' },
          ];
        case 'free-text':
          return [];
        default:
          return [];
      }
    })();

    options.push({
      label,
      value: question.id,
      data: { type: question.type, questionId: question.id, answers },
    });
  }

  return options;
};

const RuleLabelText = ({ text, order }: { text: string; order?: number }) => {
  const { classes } = useStyles();
  return (
    <p
      style={{
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      {order !== undefined && <span>{`${order}.`}</span>}

      <RichText className={classes.ruleLabelText} text={text} />
    </p>
  );
};

const AnswerSelect = ({ path, options }: { path: `answer.operands.${number}.answers`; options: SelectOption<string>[] }) => {
  const { value, onChange } = useFieldController(path);

  return (
    <UncontrolledSelect<string[]>
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Ответ"
      variant="inline"
      multiple
    />
  );
};
