import { UncontrolledSelect, UncontrolledSelectProps } from '../../select';
import { FieldsWithType, useFieldController } from '../../store';

type TextPaths = FieldsWithType<string>;
type NumberPaths = FieldsWithType<number>;

export const FormSelect = <T extends string | number>({
  path,
  ...props
}: Omit<UncontrolledSelectProps<T>, 'value' | 'onChange'> & { path: T extends number ? NumberPaths : TextPaths }) => {
  const { value, onChange } = useFieldController(path);

  // @ts-ignore
  return <UncontrolledSelect<number | string> value={value} onChange={onChange} {...props} />;
};
