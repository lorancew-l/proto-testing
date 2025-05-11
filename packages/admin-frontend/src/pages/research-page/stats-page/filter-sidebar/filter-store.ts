import { FieldPathValue, Path } from 'react-hook-form';

import { get as _get, set as _set, isFunction } from 'lodash';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { StatFilter } from '../../../../api';

type FilterStoreState = StatFilter;
export type Filters = FilterStoreState;
export type FieldPath = Path<FilterStoreState>;

export type FieldsWithType<T, P extends FieldPath = FieldPath> = P extends unknown
  ? FieldPathValue<FilterStoreState, P> extends T
    ? P
    : never
  : never;

interface FilterStoreActions {
  getFieldValue: <T extends Path<FilterStoreState>>(field: T) => FieldPathValue<FilterStoreState, T>;
  setFieldValue: <T extends Path<FilterStoreState>>(field: T, value: FieldPathValue<FilterStoreState, T>) => void;
}

export interface FilterStore extends FilterStoreState {
  actions: FilterStoreActions;
}

const getStoreDefaultValue = (): Omit<FilterStore, 'actions'> => ({
  completed: 'all',
  referer: null,
  device: null,
  os: null,
  browser: null,
  answer: null,
});

export const useFilterStore = create<FilterStore>()(
  devtools(
    immer((set, get) => ({
      ...getStoreDefaultValue(),
      actions: {
        setFieldValue: (field, value) =>
          set((state) => {
            _set(state, field, value);
          }),
        getFieldValue: <T extends Path<FilterStoreState>>(field: T) => _get(get(), field) as FieldPathValue<FilterStoreState, T>,
      },
    })),
  ),
);

export const useFilterActions = () => useFilterStore((state) => state.actions);

export const useFieldController = <T extends Path<FilterStoreState>>(path: T) => {
  const value = useFilterStore((state) => _get(state, path));
  const { getFieldValue, setFieldValue } = useFilterActions();

  return {
    value,
    onChange: (
      value:
        | FieldPathValue<FilterStoreState, T>
        | ((value: FieldPathValue<FilterStoreState, T>) => FieldPathValue<FilterStoreState, T>),
    ) => {
      if (isFunction(value)) {
        setFieldValue(path, value(getFieldValue(path)));
      } else {
        setFieldValue(path, value);
      }
    },
    getCurrentValue: () => getFieldValue(path),
  };
};
