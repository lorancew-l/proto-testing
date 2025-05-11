import { useEffect, useMemo } from 'react';

import { Box, Typography } from '@mui/material';

import { useGetResearchFilterSuggestionsRequest } from '../../../../api';

import { UncontrolledFilterAutocomplete } from './filter-autocomplete';
import { useFieldController } from './filter-store';

type RefererFilterProps = {
  researchId: string;
};

export const RefererFilter = ({ researchId }: RefererFilterProps) => {
  const { value, onChange } = useFieldController('referer');
  const { isLoading, data: suggestions, getResearchFilterSuggestions } = useGetResearchFilterSuggestionsRequest('referer');

  const { keySuggestions, valueSuggestions } = useMemo(() => {
    if (!suggestions) return { keySuggestions: [], valueSuggestions: [] };

    const keySuggestions = Object.keys(suggestions);
    const valueSuggestions = value?.key ? (suggestions[value.key] ?? []) : [];

    return { keySuggestions, valueSuggestions };
  }, [suggestions, value?.key]);

  const handleKeyChange = (value: string | null) => {
    if (value === null) {
      onChange(null);
    } else {
      onChange({ key: value, value: null });
    }
  };

  const handleValueChange = (value: string[] | null) => {
    onChange((prev) => (prev?.key ? { key: prev.key, value } : null));
  };

  useEffect(() => {
    getResearchFilterSuggestions(researchId);
  }, [researchId]);

  return (
    <Box sx={{ display: 'flex', gap: 1.5, flexDirection: 'column' }}>
      <Typography variant="body1" fontWeight="bold">
        UTM-метка
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
        <UncontrolledFilterAutocomplete<string>
          label="Название"
          value={value?.key ?? null}
          onChange={handleKeyChange}
          options={keySuggestions}
          loading={isLoading}
          fullWidth
        />

        <UncontrolledFilterAutocomplete<string[]>
          label="Значения"
          value={value?.value ?? null}
          onChange={handleValueChange}
          options={valueSuggestions}
          loading={isLoading}
          fullWidth
          multiple
        />
      </Box>
    </Box>
  );
};
