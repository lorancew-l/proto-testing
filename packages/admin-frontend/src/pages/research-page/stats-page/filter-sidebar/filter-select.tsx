import { useId } from 'react';

import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';

import { FieldsWithType, useFieldController } from './filter-store';

type SelectPath = FieldsWithType<string | null>;

type FilterSelectProps = {
  path: SelectPath;
  options: { value: string; label: React.ReactNode }[];
  label?: string;
};

export const FilterSelect = ({ path, options, label }: FilterSelectProps) => {
  const { value, onChange } = useFieldController(path);

  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value as string);
  };

  const id = useId();

  return (
    <FormControl fullWidth>
      <InputLabel id={id}>{label}</InputLabel>

      <Select
        size="small"
        label={label}
        labelId={id}
        value={value === undefined ? '' : value.toString()}
        onChange={handleChange}
        displayEmpty
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
