import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { FieldPathValue, Path } from 'react-hook-form';

import { get, isFunction } from 'lodash';

import { PrototypeScreen } from 'shared';

import { Fields, useEditPageActions, useEditPageStore, useFieldController, useFieldWatch } from '../../store';

const PrototypeScreenSettingsContext = createContext<{ path: `research.data.questions.${number}.screens`; index: number } | null>(
  null,
);

export const PrototypeScreenSettingsContextProvider = ({ index, children }: { index: number; children: React.ReactNode }) => {
  const value = useMemo(() => ({ path: `research.data.questions.${index}.screens`, index }) as const, [index]);
  return <PrototypeScreenSettingsContext value={value}>{children}</PrototypeScreenSettingsContext>;
};

export const usePrototypeScreenSettingsContext = () => {
  const value = useContext(PrototypeScreenSettingsContext);
  if (!value) throw new Error('PrototypeScreenSettingsContext is required!');
  return value;
};

export const useScreenIndex = (screenId: string) => {
  const { path } = usePrototypeScreenSettingsContext();
  return useEditPageStore((state) => get(state, path, [])?.findIndex((screen) => screen.id === screenId));
};

const useScreenPath = <T extends Path<PrototypeScreen>>(screenId: string, field: T) => {
  const { path } = usePrototypeScreenSettingsContext();
  const index = useScreenIndex(screenId);
  return `${path}.${index}.${field}` as const;
};

export const useScreenController = <T extends Path<PrototypeScreen>>(screenId: string, field: T) => {
  const path = useScreenPath(screenId, field);
  return useFieldController(path);
};

export const useScreenWatch = <T extends Path<PrototypeScreen>>(screenId: string, field: T) => {
  const path = useScreenPath(screenId, field);
  return useFieldWatch(path);
};

export const useScreenSetValue = <T extends Path<PrototypeScreen>>(screenId: string, field: T) => {
  const {
    form: { getFieldValue, setFieldValue },
  } = useEditPageActions();
  const path = useScreenPath(screenId, field);

  return {
    getFieldValue: () => getFieldValue(path),
    setFieldValue: (
      value:
        | FieldPathValue<Fields, typeof path>
        | ((value: FieldPathValue<Fields, typeof path>) => FieldPathValue<Fields, typeof path>),
    ) => {
      if (isFunction(value)) {
        setFieldValue(path, value(getFieldValue(path)));
      } else {
        setFieldValue(path, value);
      }
    },
  };
};

export const useSubscribeScreenChanges = <T extends Path<PrototypeScreen>>(
  screenId: string,
  field: T,
  callback: (state: FieldPathValue<Fields, `research.data.questions.${number}.screens.${number}.${T}`>) => void,
) => {
  const path = useScreenPath(screenId, field);

  const actualCallback = useRef(callback);

  useEffect(() => {
    return useEditPageStore.subscribe(
      (state) => get(state, path) as any,
      (state) => actualCallback.current(get(state, path)),
    );
  }, [path]);
};
