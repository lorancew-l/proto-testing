import { useEffect, useRef } from 'react';

import { debounce, omit } from 'lodash';

import { Typography } from '@mui/material';

import { Question } from 'shared';
import { makeStyles } from 'tss-react/mui';

import { Sidebar } from '../../sidebar';

import { AnswerFilter } from './answer-filter';
import { FilterAutocomplete } from './filter-autocomplete';
import { FilterSelect } from './filter-select';
import { Filters, useFilterStore } from './filter-store';
import { RefererFilter } from './referer-filter';

const useStyles = makeStyles()((theme) => ({
  filterList: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    overflowY: 'auto',
    padding: theme.spacing(1, 0),
    maxHeight: 'calc(100vh - 185px)',
  },
}));

export const FilterSidebar = ({
  isLoading,
  researchId,
  questions,
  onFilterChange,
}: {
  isLoading: boolean;
  researchId: string;
  questions: Question[];
  onFilterChange: (filters: Filters) => void;
}) => {
  const { classes } = useStyles();
  const actualOnFilterChange = useRef(onFilterChange);
  actualOnFilterChange.current = onFilterChange;

  useEffect(() => {
    const debouncedFilterChange = debounce((filters: Filters) => actualOnFilterChange.current(filters), 500);
    return useFilterStore.subscribe((state) => debouncedFilterChange(omit(state, 'actions')));
  }, []);

  return (
    <Sidebar isLoading={isLoading}>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Фильтры
      </Typography>

      <div className={classes.filterList}>
        <FilterSelect
          path="completed"
          label="Тип прохождения"
          options={[
            { value: 'all', label: 'Все прохождения' },
            { value: 'completed', label: 'Завершенные прохождения' },
            { value: 'uncompleted', label: 'Незавершенные прохождения' },
          ]}
        />

        <FilterAutocomplete path="device" label="Устройство" researchId={researchId} />

        <FilterAutocomplete path="os" label="Операционная система" researchId={researchId} />

        <FilterAutocomplete path="browser" label="Браузер" researchId={researchId} />

        <RefererFilter researchId={researchId} />

        <AnswerFilter questions={questions} />
      </div>
    </Sidebar>
  );
};
