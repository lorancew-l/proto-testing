import { TextField } from '@mui/material';

import { FieldsWithType, useFieldController } from '../../store';

type NumberPaths = FieldsWithType<number>;

export const FormNumberInput = ({
  path,
  label,
  min,
  max,
  fullWidth,
}: {
  path: NumberPaths;
  label?: string;
  min?: number;
  max?: number;
  fullWidth?: boolean;
}) => {
  const { value, onChange } = useFieldController(path);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value));
  };

  return (
    <TextField
      size="small"
      type="number"
      variant="outlined"
      label={label}
      value={value}
      onChange={handleChange}
      inputProps={{ min, max }}
      fullWidth={fullWidth}
    />
  );
};
