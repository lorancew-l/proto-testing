import { TextField } from '@mui/material';

import { FieldsWithType, useFieldController } from '../../store';

type TextPaths = FieldsWithType<string | undefined>;

export const FormTextInput = ({
  path,
  label,
  placeholder,
  variant = 'outlined',
}: {
  path: TextPaths;
  label?: string;
  placeholder?: string;
  variant?: 'standard' | 'outlined';
}) => {
  const { value, onChange } = useFieldController(path);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <TextField value={value} onChange={handleChange} variant={variant} size="small" label={label} placeholder={placeholder} />
  );
};
