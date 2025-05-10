import { FormLabel } from '@mui/material';

export const LabeledSetting = ({ children, label }: { children: React.ReactNode; label: string }) => {
  return (
    <div>
      <FormLabel component="div" sx={{ marginBottom: 1 }}>
        {label}
      </FormLabel>
      {children}
    </div>
  );
};
