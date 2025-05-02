import { Box, Chip } from '@mui/material';

import { FieldsWithType, useFieldController } from '../../store';

type TextPaths = FieldsWithType<string>;

export const ChipSelect = ({ path, options }: { path: TextPaths; options: { value: string; label: string }[] }) => {
  const { value, onChange } = useFieldController(path);

  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {options.map((option) => (
        <Chip
          size="small"
          variant="outlined"
          label={option.label}
          onClick={() => onChange(option.value)}
          {...(value === option.value && { sx: { borderColor: 'primary.main' } })}
        />
      ))}
    </Box>
  );
};
