import { useId } from 'react';

import { isNumber } from 'lodash';

import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

import { FieldsWithType, useFieldController } from '../../store';

const useStyles = makeStyles()((theme) => ({
  inline: {
    minWidth: 0,
    height: 28,
    padding: theme.spacing(0.5),
    '.MuiSelect-outlined': {
      paddingLeft: `${theme.spacing(0.25)} !important`,
      paddingRight: `${theme.spacing(2.25)} !important`,
      paddingTop: '0 !important',
      paddingBottom: '0 !important',
    },
    '.MuiSelect-icon': {
      right: '0 !important',
      backgroundColor: theme.palette.common.white,
    },
  },
}));

type TextPaths = FieldsWithType<string>;
type NumberPaths = FieldsWithType<number>;

export type SelectOption<T> = { value: T; label: React.ReactNode };

export const FormSelect = <T extends string | number>({
  path,
  ...props
}: Omit<UncontrolledSelectProps<T>, 'value' | 'onChange'> & { path: T extends number ? NumberPaths : TextPaths }) => {
  const { value, onChange } = useFieldController(path);

  // @ts-ignore
  return <UncontrolledSelect<number | string> value={value} onChange={onChange} {...props} />;
};

type UncontrolledSelectProps<T> = {
  value: T | undefined;
  options: SelectOption<T>[];
  label?: string;
  variant?: 'default' | 'inline';
  placeholder?: string;
  className?: string;
  onChange: (value: T) => void;
};

export const UncontrolledSelect = <T extends string | number>({
  value,
  options,
  label,
  variant,
  placeholder,
  className,
  onChange,
}: UncontrolledSelectProps<T>) => {
  const { classes, cx } = useStyles();

  const handleChange = (event: SelectChangeEvent<string>) => {
    const numberInput = isNumber(options[0].value);

    if (numberInput) {
      // @ts-ignore
      onChange(Number(event.target.value));
    } else {
      // @ts-ignore
      onChange(event.target.value);
    }
  };

  const id = useId();

  const select = (
    <Select
      label={label}
      labelId={id}
      size="small"
      value={value === undefined || value === '' ? '' : value.toString()}
      className={cx(className, { [classes.inline]: variant === 'inline' })}
      onChange={handleChange}
      renderValue={(value) => {
        if (!value) {
          return <Typography color="gray">{placeholder}</Typography>;
        }

        const label = options.find((option) => option.value === value)?.label;
        return <Typography>{label}</Typography>;
      }}
      displayEmpty
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );

  if (variant === 'inline') return select;

  return (
    <FormControl fullWidth>
      <InputLabel id={id}>{label}</InputLabel>
      {select}
    </FormControl>
  );
};
