import { useId } from 'react';

import { isNumber } from 'lodash';

import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

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

export type SelectOption<T> = { value: T; label: React.ReactNode };

export type UncontrolledSelectProps<T> = {
  value: T | undefined;
  options: SelectOption<T extends string | number ? T : string>[];
  label?: string;
  variant?: 'default' | 'inline';
  placeholder?: string;
  className?: string;
  onChange: (value: T) => void;
  multiple?: boolean;
};

export const UncontrolledSelect = <T extends string | number | string[]>({
  value,
  options,
  label,
  variant,
  placeholder,
  className,
  onChange,
  multiple,
}: UncontrolledSelectProps<T>) => {
  const { classes, cx } = useStyles();

  const handleChange = (event: SelectChangeEvent<T>) => {
    const rawValue = event.target.value;
    const numberInput = isNumber(options[0].value);

    if (multiple) {
      const value = typeof rawValue === 'string' ? rawValue.split(',') : rawValue;
      onChange(value as T);
    } else if (numberInput) {
      onChange(Number(rawValue) as T);
    } else {
      onChange(rawValue as T);
    }
  };

  const id = useId();

  const select = (
    <Select
      label={label}
      labelId={id}
      size="small"
      value={value === undefined || value === '' ? '' : isNumber(value) ? (value.toString() as T) : value}
      className={cx(className, { [classes.inline]: variant === 'inline' })}
      onChange={handleChange}
      renderValue={(value) => {
        const isEmpty = Array.isArray(value) ? !value.length : !value;
        if (isEmpty) {
          return <Typography color="gray">{placeholder}</Typography>;
        }

        let label: React.ReactNode = '';
        if (multiple && Array.isArray(value)) {
          const labels = value
            .map((value) => options.find((option) => option.value === value))
            .filter((it): it is NonNullable<typeof it> => !!it);
          return (
            <Box sx={{ display: 'flex', gap: 0.25 }}>
              {labels.map((label, index) => (
                <Box key={label.value} sx={{ display: 'flex', alignItems: 'center' }}>
                  {label.label}
                  {index !== labels.length - 1 && ','}
                </Box>
              ))}
            </Box>
          );
        } else {
          label = options.find((option) => option.value === value)?.label;
        }

        return <Typography>{label}</Typography>;
      }}
      displayEmpty
      multiple={multiple}
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
