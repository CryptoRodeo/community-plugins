/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useCallback, useMemo, useState } from 'react';
import type { ThProps } from '@patternfly/react-table';

// Re-export types from FilterToolbar
export type {
  IFilterCategory,
  FilterValue,
  IFilterValues,
} from '../components/shared/FilterToolbar';
import type {
  IFilterCategory,
  FilterValue,
  IFilterValues,
} from '../components/shared/FilterToolbar';

/** Sort direction. */
export type SortDirection = 'asc' | 'desc';

// ---------------------------------------------------------------------------
// Legacy useTableControls (kept for backward compatibility with other consumers)
// ---------------------------------------------------------------------------

/** Options for initializing table controls. */
export interface UseTableControlsOptions<T> {
  items: T[];
  initialPage?: number;
  initialPerPage?: number;
  initialSortColumn?: string;
  initialSortDirection?: SortDirection;
  filterFn?: (item: T, filters: Record<string, string>) => boolean;
  sortFn?: (a: T, b: T, column: string, direction: SortDirection) => number;
}

/** Return value of the useTableControls hook. */
export interface TableControls<T> {
  page: number;
  perPage: number;
  sortColumn: string | undefined;
  sortDirection: SortDirection;
  filters: Record<string, string>;
  expandedIds: Set<string | number>;
  filteredItems: T[];
  paginatedItems: T[];
  totalFilteredCount: number;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setSort: (column: string, direction: SortDirection) => void;
  setFilter: (key: string, value: string) => void;
  clearFilters: () => void;
  toggleExpanded: (id: string | number) => void;
  isExpanded: (id: string | number) => boolean;
}

/**
 * Reusable hook for table state management including filtering,
 * sorting, pagination, and row expansion.
 */
export function useTableControls<T>(
  options: UseTableControlsOptions<T>,
): TableControls<T> {
  const {
    items,
    initialPage = 1,
    initialPerPage = 20,
    initialSortColumn,
    initialSortDirection = 'asc',
    filterFn,
    sortFn,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPageState] = useState(initialPerPage);
  const [sortColumn, setSortColumn] = useState<string | undefined>(
    initialSortColumn,
  );
  const [sortDirection, setSortDirection] =
    useState<SortDirection>(initialSortDirection);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(
    new Set(),
  );

  const filteredItems = useMemo(() => {
    let result = items;
    if (filterFn) {
      const hasActiveFilters = Object.values(filters).some(v => v !== '');
      if (hasActiveFilters) {
        result = result.filter(item => filterFn(item, filters));
      }
    }
    if (sortFn && sortColumn) {
      result = [...result].sort((a, b) =>
        sortFn(a, b, sortColumn, sortDirection),
      );
    }
    return result;
  }, [items, filters, filterFn, sortColumn, sortDirection, sortFn]);

  const totalFilteredCount = filteredItems.length;

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredItems.slice(start, start + perPage);
  }, [filteredItems, page, perPage]);

  const setPerPage = useCallback((newPerPage: number) => {
    setPerPageState(newPerPage);
    setPage(1);
  }, []);

  const setSort = useCallback((column: string, direction: SortDirection) => {
    setSortColumn(column);
    setSortDirection(direction);
  }, []);

  const setFilter = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  const toggleExpanded = useCallback((id: string | number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const isExpanded = useCallback(
    (id: string | number) => expandedIds.has(id),
    [expandedIds],
  );

  return {
    page,
    perPage,
    sortColumn,
    sortDirection,
    filters,
    expandedIds,
    filteredItems,
    paginatedItems,
    totalFilteredCount,
    setPage,
    setPerPage,
    setSort,
    setFilter,
    clearFilters,
    toggleExpanded,
    isExpanded,
  };
}

// ---------------------------------------------------------------------------
// New PF-based table control hooks (console-ui pattern)
// ---------------------------------------------------------------------------

/** Filter state management hook. */
export function useFilterState<TFilterCategoryKey extends string>() {
  const [filterValues, setFilterValues] = useState<
    IFilterValues<TFilterCategoryKey>
  >({});

  const setFilterValue = useCallback(
    (category: TFilterCategoryKey, value: FilterValue) => {
      setFilterValues(prev => ({ ...prev, [category]: value }));
    },
    [],
  );

  const clearAllFilters = useCallback(() => {
    setFilterValues({});
  }, []);

  return { filterValues, setFilterValue, clearAllFilters };
}

/** Sort state. */
export interface ActiveSort {
  columnKey: string;
  direction: SortDirection;
}

/** Sort state management hook. */
export function useSortState(options?: {
  initialSort?: ActiveSort;
  sortableColumns?: string[];
}) {
  const [activeSort, setActiveSort] = useState<ActiveSort | null>(
    options?.initialSort ?? null,
  );

  const setSort = useCallback((columnKey: string, direction: SortDirection) => {
    setActiveSort({ columnKey, direction });
  }, []);

  return { activeSort, setSort };
}

/** Pagination state management hook. */
export function usePaginationState(options?: {
  initialPage?: number;
  initialPerPage?: number;
}) {
  const [pageNumber, setPageNumber] = useState(options?.initialPage ?? 1);
  const [itemsPerPage, setItemsPerPageState] = useState(
    options?.initialPerPage ?? 10,
  );

  const setItemsPerPage = useCallback((value: number) => {
    setItemsPerPageState(value);
    setPageNumber(1);
  }, []);

  return { pageNumber, itemsPerPage, setPageNumber, setItemsPerPage };
}

/** Expansion state management hook. */
export function useExpansionState() {
  const [expandedCells, setExpandedCells] = useState<Record<string, boolean>>(
    {},
  );
  return { expandedCells, setExpandedCells };
}

/** Derived state from local items with filtering, sorting, and pagination. */
export function useLocalTableControlDerivedState<
  TItem,
  TFilterCategoryKey extends string,
>(args: {
  items: TItem[];
  filterCategories: IFilterCategory<TItem, TFilterCategoryKey>[];
  activeFilters: IFilterValues<TFilterCategoryKey>;
  getSortValues?: (item: TItem) => Record<string, string | number>;
  activeSort: ActiveSort | null;
  pageNumber: number;
  itemsPerPage: number;
}) {
  const {
    items,
    filterCategories,
    activeFilters,
    getSortValues,
    activeSort,
    pageNumber,
    itemsPerPage,
  } = args;

  return useMemo(() => {
    // Filter
    let filtered = items;
    for (const cat of filterCategories) {
      const vals = activeFilters[cat.categoryKey];
      if (!vals || vals.length === 0 || !cat.matcher) continue;
      filtered = filtered.filter(item => vals.some(v => cat.matcher!(v, item)));
    }

    // Sort
    let sorted = filtered;
    if (activeSort && getSortValues) {
      sorted = [...filtered].sort((a, b) => {
        const aVals = getSortValues(a);
        const bVals = getSortValues(b);
        const aVal = aVals[activeSort.columnKey];
        const bVal = bVals[activeSort.columnKey];
        let cmp: number;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          cmp = aVal - bVal;
        } else {
          cmp = String(aVal).localeCompare(String(bVal));
        }
        return activeSort.direction === 'asc' ? cmp : -cmp;
      });
    }

    // Paginate
    const totalItemCount = sorted.length;
    const start = (pageNumber - 1) * itemsPerPage;
    const currentPageItems = sorted.slice(start, start + itemsPerPage);

    return { totalItemCount, currentPageItems };
  }, [
    items,
    filterCategories,
    activeFilters,
    getSortValues,
    activeSort,
    pageNumber,
    itemsPerPage,
  ]);
}

/** Options for usePFTable. */
export interface UsePFTableOptions<TItem, TFilterCategoryKey extends string> {
  items: TItem[];
  idProperty: keyof TItem;
  columns: string[];
  filtering: {
    filterCategories: IFilterCategory<TItem, TFilterCategoryKey>[];
  };
  sorting?: {
    sortableColumns: string[];
    initialSort?: ActiveSort;
    getSortValues?: (item: TItem) => Record<string, string | number>;
  };
  pagination?: {
    initialPage?: number;
    initialPerPage?: number;
  };
}

/** Combined PF table hook. */
export function usePFTable<TItem, TFilterCategoryKey extends string>(
  options: UsePFTableOptions<TItem, TFilterCategoryKey>,
) {
  const { items, idProperty, columns, filtering, sorting, pagination } =
    options;

  const filterState = useFilterState<TFilterCategoryKey>();
  const sortState = useSortState({
    initialSort: sorting?.initialSort,
    sortableColumns: sorting?.sortableColumns,
  });
  const paginationState = usePaginationState({
    initialPage: pagination?.initialPage,
    initialPerPage: pagination?.initialPerPage,
  });
  const expansionState = useExpansionState();

  const { totalItemCount, currentPageItems } = useLocalTableControlDerivedState(
    {
      items,
      filterCategories: filtering.filterCategories,
      activeFilters: filterState.filterValues,
      getSortValues: sorting?.getSortValues,
      activeSort: sortState.activeSort,
      pageNumber: paginationState.pageNumber,
      itemsPerPage: paginationState.itemsPerPage,
    },
  );

  const getSortThProps = useCallback(
    (args: { columnKey: string }): ThProps['sort'] => {
      const colIndex = columns.indexOf(args.columnKey);
      return {
        sortBy: {
          index:
            sortState.activeSort?.columnKey === args.columnKey
              ? colIndex
              : undefined,
          direction: sortState.activeSort?.direction,
        },
        onSort: (_event, _index, direction) => {
          sortState.setSort(args.columnKey, direction as SortDirection);
        },
        columnIndex: colIndex,
      };
    },
    [columns, sortState],
  );

  const paginationProps = useMemo(
    () => ({
      itemCount: totalItemCount,
      perPage: paginationState.itemsPerPage,
      page: paginationState.pageNumber,
      onSetPage: (_event: unknown, page: number) =>
        paginationState.setPageNumber(page),
      onPerPageSelect: (_event: unknown, perPage: number) =>
        paginationState.setItemsPerPage(perPage),
    }),
    [totalItemCount, paginationState],
  );

  const paginationToolbarItemProps = useMemo(
    () => ({
      variant: 'pagination' as const,
      align: { default: 'alignEnd' as const },
    }),
    [],
  );

  const getSingleExpandButtonTdProps = useCallback(
    (args: { item: TItem; rowIndex: number }) => {
      const id = String(args.item[idProperty]);
      const isExpanded = !!expansionState.expandedCells[id];
      return {
        expand: {
          rowIndex: args.rowIndex,
          isExpanded,
          onToggle: () => {
            expansionState.setExpandedCells(prev => ({
              ...prev,
              [id]: !prev[id],
            }));
          },
        },
      };
    },
    [idProperty, expansionState],
  );

  const isCellExpanded = useCallback(
    (item: TItem) => {
      const id = String(item[idProperty]);
      return !!expansionState.expandedCells[id];
    },
    [idProperty, expansionState.expandedCells],
  );

  return {
    tableState: { currentPageItems, totalItemCount },
    propHelpers: {
      getSortThProps,
      paginationProps,
      paginationToolbarItemProps,
      getSingleExpandButtonTdProps,
    },
    expansionDerivedState: { isCellExpanded },
    filterState,
    sortState,
    paginationState,
    expansionState,
  };
}

/** Options for usePFToolbarTable (extends usePFTable with toolbar layer). */
export interface UsePFToolbarTableOptions<
  TItem,
  TFilterCategoryKey extends string,
> extends UsePFTableOptions<TItem, TFilterCategoryKey> {
  toolbar: {
    categoryTitles: Record<TFilterCategoryKey, string>;
  };
}

/** Combined PF table + toolbar hook. */
export function usePFToolbarTable<TItem, TFilterCategoryKey extends string>(
  options: UsePFToolbarTableOptions<TItem, TFilterCategoryKey>,
) {
  const pfTable = usePFTable(options);

  const categoryKeys = Object.keys(
    options.toolbar.categoryTitles,
  ) as TFilterCategoryKey[];

  const [currentFilterCategoryKey, setCurrentFilterCategoryKey] =
    useState<TFilterCategoryKey>(categoryKeys[0]);

  const toolbarProps = useMemo(
    () => ({
      clearAllFilters: pfTable.filterState.clearAllFilters,
    }),
    [pfTable.filterState.clearAllFilters],
  );

  const filterToolbarProps = useMemo(
    () => ({
      currentFilterCategoryKey,
      setCurrentFilterCategoryKey,
      categoryTitles: options.toolbar.categoryTitles,
      filterCategories: options.filtering.filterCategories,
    }),
    [
      currentFilterCategoryKey,
      options.toolbar.categoryTitles,
      options.filtering.filterCategories,
    ],
  );

  const getFilterControlProps = useCallback(
    (args: { categoryKey: TFilterCategoryKey }) => ({
      categoryKey: args.categoryKey,
      categoryName: options.toolbar.categoryTitles[args.categoryKey],
      filterValue: pfTable.filterState.filterValues[args.categoryKey],
      setFilterValue: (newValue: FilterValue) =>
        pfTable.filterState.setFilterValue(args.categoryKey, newValue),
    }),
    [options.toolbar.categoryTitles, pfTable.filterState],
  );

  return {
    ...pfTable,
    propHelpers: {
      ...pfTable.propHelpers,
      toolbarProps,
      filterToolbarProps,
      getFilterControlProps,
    },
  };
}
