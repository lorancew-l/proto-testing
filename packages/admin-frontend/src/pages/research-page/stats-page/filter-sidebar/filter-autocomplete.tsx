import { useEffect } from 'react';

import { CircularProgress, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';

import { useGetResearchFilterSuggestionsRequest } from '../../../../api';

import { FieldsWithType, useFieldController } from './filter-store';

type AutocompletePath = Exclude<
  FieldsWithType<string[] | null>,
  'referer.value' | 'answer.operators' | `answer.operands.${number}.answers`
>;

type FilterAutocompleteProps = {
  path: AutocompletePath;
  researchId: string;
  label: string;
};

export const FilterAutocomplete = ({ path, researchId, label }: FilterAutocompleteProps) => {
  const { value, onChange } = useFieldController(path);
  const { isLoading, data: suggestions, getResearchFilterSuggestions } = useGetResearchFilterSuggestionsRequest(path);

  useEffect(() => {
    getResearchFilterSuggestions(researchId);
  }, [researchId, path]);

  return (
    <UncontrolledFilterAutocomplete<string[]>
      label={label}
      value={value}
      onChange={onChange}
      options={suggestions ?? []}
      loading={isLoading}
      multiple
    />
  );
};

type UncontrolledFilterAutocompleteProps<T extends string | string[]> = {
  value: T | null;
  onChange: (value: T | null) => void;
  label: string;
  options: string[];
  multiple?: boolean;
  loading: boolean;
  fullWidth?: boolean;
};

export const UncontrolledFilterAutocomplete = <T extends string | string[]>({
  value,
  onChange,
  label,
  options,
  multiple,
  loading,
  fullWidth,
}: UncontrolledFilterAutocompleteProps<T>) => {
  return (
    <Autocomplete
      size="small"
      options={options}
      value={value ?? undefined}
      onChange={(_, newValue) => onChange(newValue as T | null)}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          size="small"
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      noOptionsText="Нет вариантов"
      disableCloseOnSelect={multiple}
      filterSelectedOptions
      fullWidth={fullWidth}
      multiple={multiple}
    />
  );
};
