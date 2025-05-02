import { useId } from 'react';

import { isNumber } from 'lodash';

import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';

import { FieldsWithType, useFieldController } from '../../store';

type TextPaths = FieldsWithType<string>;
type NumberPaths = FieldsWithType<number>;

export const FormSelect = <T extends string | number>({
  path,
  options,
  label,
}: {
  path: T extends number ? NumberPaths : TextPaths;
  options: { value: T; label: string }[];
  label?: string;
}) => {
  const { value, onChange } = useFieldController(path);

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

  return (
    <FormControl fullWidth>
      <InputLabel id={id}>{label}</InputLabel>
      <Select
        label={label}
        labelId={id}
        size="small"
        value={value === undefined ? '' : value.toString()}
        onChange={handleChange}
        displayEmpty
      >
        {options.map((option) => (
          <MenuItem key={option.label} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
