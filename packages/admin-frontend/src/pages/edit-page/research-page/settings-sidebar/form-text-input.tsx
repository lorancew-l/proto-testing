import { TextField } from '@mui/material';

import { FieldsWithType, useFieldController } from '../../store';

type TextPaths = FieldsWithType<string>;

export const FormTextInput = ({ path, label }: { path: TextPaths; label?: string }) => {
  const { value, onChange } = useFieldController(path);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return <TextField value={value} onChange={handleChange} variant="outlined" size="small" label={label} />;
};
