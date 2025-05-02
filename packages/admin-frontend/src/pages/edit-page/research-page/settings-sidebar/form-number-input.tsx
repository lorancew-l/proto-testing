import { TextField } from '@mui/material';

import { FieldsWithType, useFieldController } from '../../store';

type NumberPaths = FieldsWithType<number>;

export const FormNumberInput = ({ path, label }: { path: NumberPaths; label?: string }) => {
  const { value, onChange } = useFieldController(path);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value));
  };

  return (
    <TextField
      size="small"
      variant="outlined"
      label={label}
      value={value}
      onChange={handleChange}
      InputProps={{ type: 'number' }}
    />
  );
};
