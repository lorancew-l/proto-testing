import React, { useMemo } from 'react';

import { range } from 'lodash';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Switch, Typography } from '@mui/material';

import { nanoid } from 'nanoid';
import { DisplayRuleOperand, DisplayRuleOperator, DisplayRuleType, Question } from 'shared';
import { makeStyles } from 'tss-react/mui';

import { RichText } from '../../rich-text';
import { SelectOption, UncontrolledSelect } from '../../select';
import { useEditPageStore, useFieldController } from '../../store';

import { FormSelect } from './form-select';
import { FormTextInput } from './form-text-input';

const useStyles = makeStyles<void, 'deleteOperandButton'>()((theme, _, classes) => ({
  block: {
    paddingLeft: theme.spacing(1),
    borderLeft: `2px solid #d5d6da`,
  },
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
  ruleOperand: {
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

export const DisplayRule = ({ path, questionIndex }: { path: `research.questions.${number}`; questionIndex: number }) => {
  const { classes } = useStyles();

  const { value, onChange, getCurrentValue } = useFieldController(`${path}.displayRule`);

  const handleChange = (_: unknown, checked: boolean) => {
    onChange(checked ? { displayType: 'show', operands: [], operators: [] } : null);
  };

  const handleAppendOperand = () => {
    const rule = getCurrentValue();
    if (!rule) return;
    onChange({
      ...rule,
      operands: [...rule.operands, { id: nanoid(10), type: 'utm', operator: 'equals', name: '', value: '' }],
      operators: rule.operands.length ? [...rule.operators, 'and'] : [],
    });
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
      <div className={classes.switch}>
        <Typography color="text.secondary">Показать по условию</Typography>

        <Switch checked={!!value} onChange={handleChange} />
      </div>

      {value && (
        <>
          <DisplayType path={path} />

          <div className={classes.block}>
            {value.operands.map((operand, index) => (
              <React.Fragment key={operand.id}>
                <RuleOperand
                  path={`${path}.displayRule.operands.${index}`}
                  questionIndex={questionIndex}
                  onDelete={() => handleDeleteOperand(operand.id, index)}
                />

                {index !== value.operands.length - 1 && <RuleOperator path={`${path}.displayRule.operators.${index}`} />}
              </React.Fragment>
            ))}

            <button className={classes.addOperandButton} onClick={handleAppendOperand}>
              <AddIcon />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const displayTypeOptions = [
  { value: 'show', label: 'Показывать' },
  { value: 'hide', label: 'Скрывать' },
] satisfies SelectOption<DisplayRuleType>[];
const DisplayType = ({ path }: { path: `research.questions.${number}` }) => {
  const { classes } = useStyles();

  return (
    <div className={classes.displayType}>
      <FormSelect path={`${path}.displayRule.displayType`} options={displayTypeOptions} variant="inline" />
      <span>этот вопрос, если</span>
    </div>
  );
};

const RuleOperand = ({
  path,
  questionIndex,
  onDelete,
}: {
  path: `research.questions.${number}.displayRule.operands.${number}`;
  questionIndex: number;
  onDelete: () => void;
}) => {
  const { classes } = useStyles();

  const { value, onChange } = useFieldController(path);

  const questions = useEditPageStore((state) => state.research.questions);
  const options = useMemo(() => getDisplayRuleSourceOptions(questions, questionIndex), [questionIndex, questions]);

  const selectedOption = useMemo(() => {
    const option = options.find((option) =>
      value?.type === 'answer' ? option.value === value?.questionId : option.value === 'utm',
    );
    return option;
  }, [options, value]);

  const handleSourceChange = (optionValue: string) => {
    const option = options.find((option) => option.value === optionValue);
    if (!option) return;

    if (option.data.type === 'utm') {
      onChange({
        id: value?.id ?? nanoid(10),
        type: 'utm',
        operator: option.data.operators[0].value ?? '',
        name: '',
      });
    }

    if (option.data.type === 'answer') {
      onChange({
        id: value?.id ?? nanoid(10),
        type: 'answer',
        operator: option.data.operators[0].value ?? '',
        questionId: option.data.questionId,
        answerId: '',
      });
    }
  };

  return (
    <div className={classes.ruleOperand}>
      <div className={classes.ruleOperandContent}>
        <UncontrolledSelect
          value={selectedOption?.value}
          onChange={handleSourceChange}
          placeholder="Выберите тип условия"
          variant="inline"
          options={options}
        />

        {value?.type === 'answer' && selectedOption?.data.type === 'answer' && (
          <>
            <div className={classes.operandSettings}>
              <FormSelect path={`${path}.operator`} variant="inline" options={selectedOption.data.operators} />

              {selectedOption.data.questionType === 'free-text' ? (
                <FormTextInput path={`${path}.answerId`} placeholder="Введите текст" variant="standard" />
              ) : (
                <FormSelect
                  path={`${path}.answerId`}
                  variant="inline"
                  placeholder="Выберите ответ"
                  options={selectedOption.data.answers}
                />
              )}
            </div>
          </>
        )}

        {value?.type === 'utm' && selectedOption?.data.type === 'utm' && (
          <div className={classes.operandSettings}>
            <FormSelect
              path={`${path}.operator`}
              variant="inline"
              className={classes.operatorSelect}
              options={selectedOption.data.operators}
            />

            <FormTextInput path={`${path}.name`} variant="standard" placeholder="Название" />
            {value.operator !== 'exists' && value.operator !== 'not-exists' && (
              <FormTextInput path={`${path}.value`} variant="standard" placeholder="Значение" />
            )}
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
  { value: 'and', label: 'и' },
  { value: 'or', label: 'или' },
] satisfies SelectOption<DisplayRuleOperator>[];
const RuleOperator = ({ path }: { path: `research.questions.${number}.displayRule.operators.${number}` }) => {
  const { classes } = useStyles();

  return (
    <div className={classes.ruleOperator}>
      <FormSelect path={path} variant="inline" options={operatorTypeOptions} />
    </div>
  );
};

type UTMOperator = Extract<DisplayRuleOperand, { type: 'utm' }>['operator'];
type AnswerOperator = Extract<DisplayRuleOperand, { type: 'answer' }>['operator'];
type DisplayRuleSourceOption =
  | {
      label: React.ReactNode;
      value: string;
      data: {
        type: 'answer';
        questionId: string;
        questionType: Question['type'];
        answers: { value: string; label: React.ReactNode }[];
        operators: { value: AnswerOperator; label: string }[];
      };
    }
  | { label: React.ReactNode; value: string; data: { type: 'utm'; operators: { value: UTMOperator; label: string }[] } };
const getDisplayRuleSourceOptions = (questions: Question[], questionIndex: number): DisplayRuleSourceOption[] => {
  const options: DisplayRuleSourceOption[] = [
    {
      label: 'UTM параметр',
      value: 'utm',
      data: {
        type: 'utm',
        operators: [
          { value: 'equals', label: 'Равен' },
          { value: 'not-equals', label: 'Не равен' },
          { value: 'exists', label: 'Есть в ссылке' },
          { value: 'not-exists', label: 'Нет в ссылке' },
        ],
      },
    },
  ];

  const relevantQuestions = questions.slice(0, questionIndex);

  for (const [index, question] of relevantQuestions.entries()) {
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

    const operators: { value: AnswerOperator; label: string }[] = (() => {
      switch (question.type) {
        case 'single':
          return [
            { value: 'equals', label: 'Равен' },
            { value: 'not-equals', label: 'Равен' },
          ];
        case 'multiple':
          return [
            { value: 'equals', label: 'Равен' },
            { value: 'not-equals', label: 'Не равен' },
          ];
        case 'rating':
          return [
            { value: 'equals', label: '=' },
            { value: 'not-equals', label: '!=' },
            { value: 'greater', label: '>' },
            { value: 'less', label: '<' },
          ];
        case 'prototype':
          return [
            { value: 'equals', label: 'Равен' },
            { value: 'not-equals', label: 'Не равен' },
          ];
        case 'free-text':
          return [
            { value: 'contain', label: 'Содержит' },
            { value: 'not-contain', label: 'Не содержит' },
          ];
        default:
          return [];
      }
    })();

    options.push({
      label,
      value: question.id,
      data: { type: 'answer', questionType: question.type, questionId: question.id, answers, operators },
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
