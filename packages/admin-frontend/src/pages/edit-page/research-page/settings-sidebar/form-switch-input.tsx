import { Switch, Typography } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

import { FieldsWithType, useFieldController } from '../../store';

const useStyles = makeStyles()((theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
  },
}));

type BooleanPaths = FieldsWithType<boolean>;

export const FormSwitchInput = ({ path, label }: { path: BooleanPaths; label?: string }) => {
  const { classes } = useStyles();
  const { value, onChange } = useFieldController(path);

  const handleChange = (_: unknown, checked: boolean) => {
    onChange(checked);
  };

  return (
    <div className={classes.container}>
      <Typography>{label}</Typography>

      <Switch checked={value} onChange={handleChange} />
    </div>
  );
};
