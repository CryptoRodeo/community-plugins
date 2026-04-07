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
import { type ReactNode, type Ref, useState } from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  type MenuToggleElement,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import FilterIcon from '@patternfly/react-icons/dist/esm/icons/filter-icon';

/** A filter category definition for table filtering. */
export interface IFilterCategory<TItem, TFilterCategoryKey extends string> {
  categoryKey: TFilterCategoryKey;
  matcher?: (filter: string, item: TItem) => boolean;
  logicOperator?: 'AND' | 'OR';
}

/** A filter value — array of selected strings, or undefined/null. */
export type FilterValue = string[] | undefined | null;

/** Map of filter category keys to their current values. */
export type IFilterValues<TFilterCategoryKey extends string> = Partial<
  Record<TFilterCategoryKey, FilterValue>
>;

/** Props passed to individual filter controls. */
export interface IFilterControlProps<TFilterCategoryKey extends string> {
  categoryKey: TFilterCategoryKey;
  categoryName: string;
  filterValue: FilterValue;
  setFilterValue: (newValue: FilterValue) => void;
  showToolbarItem?: boolean;
  isDisabled?: boolean;
}

/** Props for FilterToolbar. */
export interface IFilterToolbarProps<TItem, TFilterCategoryKey extends string> {
  currentFilterCategoryKey?: TFilterCategoryKey;
  setCurrentFilterCategoryKey: (value: TFilterCategoryKey) => void;
  categoryTitles: Record<TFilterCategoryKey, string>;
  filterCategories: IFilterCategory<TItem, TFilterCategoryKey>[];
  showFilterDropdown?: boolean;
  isDisabled?: boolean;
  children?: ReactNode;
}

/**
 * FilterToolbar with category dropdown to switch between filter types.
 * Renders a ToolbarToggleGroup with an optional dropdown for selecting
 * the active filter category.
 */
export function FilterToolbar<TItem, TFilterCategoryKey extends string>({
  currentFilterCategoryKey,
  setCurrentFilterCategoryKey,
  categoryTitles,
  filterCategories,
  showFilterDropdown,
  isDisabled,
  children,
}: IFilterToolbarProps<TItem, TFilterCategoryKey>) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentTitle = currentFilterCategoryKey
    ? categoryTitles[currentFilterCategoryKey]
    : '';

  return (
    <ToolbarToggleGroup
      variant="filter-group"
      toggleIcon={<FilterIcon />}
      breakpoint="2xl"
    >
      {showFilterDropdown && (
        <ToolbarItem>
          <Dropdown
            isOpen={isDropdownOpen}
            onOpenChange={setIsDropdownOpen}
            onSelect={() => setIsDropdownOpen(false)}
            toggle={(toggleRef: Ref<MenuToggleElement>) => (
              <MenuToggle
                ref={toggleRef}
                onClick={() => setIsDropdownOpen(prev => !prev)}
                isDisabled={isDisabled}
              >
                <FilterIcon /> {currentTitle}
              </MenuToggle>
            )}
          >
            <DropdownList>
              {filterCategories.map(cat => (
                <DropdownItem
                  key={cat.categoryKey}
                  onClick={() => setCurrentFilterCategoryKey(cat.categoryKey)}
                >
                  {categoryTitles[cat.categoryKey]}
                </DropdownItem>
              ))}
            </DropdownList>
          </Dropdown>
        </ToolbarItem>
      )}
      {children}
    </ToolbarToggleGroup>
  );
}
