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
import { type KeyboardEvent, useEffect, useState } from 'react';
import {
  Button,
  ButtonVariant,
  InputGroup,
  InputGroupItem,
  SearchInput,
  TextInput,
  ToolbarFilter,
  ToolbarItem,
} from '@patternfly/react-core';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import { type IFilterControlProps } from './FilterToolbar';

/** Props for SearchFilterControl. */
export interface SearchFilterControlProps<TFilterCategoryKey extends string>
  extends IFilterControlProps<TFilterCategoryKey> {
  placeholderText: string;
  isNumeric?: boolean;
}

/**
 * Text search input that submits on Enter key press and displays
 * active filter values as toolbar chips.
 */
export function SearchFilterControl<TFilterCategoryKey extends string>({
  categoryKey,
  filterValue,
  setFilterValue,
  showToolbarItem,
  isDisabled,
  placeholderText,
  isNumeric = false,
}: SearchFilterControlProps<TFilterCategoryKey>) {
  const [inputValue, setInputValue] = useState(filterValue?.[0] ?? '');

  useEffect(() => {
    setInputValue(filterValue?.[0] ?? '');
  }, [filterValue]);

  const onFilterSubmit = () => {
    const trimmed = inputValue.trim().replace(/\s+/g, ' ');
    setFilterValue(trimmed ? [trimmed] : []);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      onFilterSubmit();
    }
  };

  return (
    <ToolbarItem hidden={!showToolbarItem}>
      <ToolbarFilter
        labels={filterValue?.filter(Boolean) ?? []}
        deleteLabel={() => setFilterValue([])}
        categoryName={String(categoryKey)}
        showToolbarItem={showToolbarItem}
      >
        {isNumeric ? (
          <InputGroup>
            <InputGroupItem isFill>
              <TextInput
                type="number"
                value={inputValue}
                onChange={(_event, value) => setInputValue(value)}
                onKeyDown={onKeyDown}
                placeholder={placeholderText}
                isDisabled={isDisabled}
              />
            </InputGroupItem>
            <InputGroupItem>
              <Button
                variant={ButtonVariant.control}
                onClick={onFilterSubmit}
                isDisabled={isDisabled}
              >
                <SearchIcon />
              </Button>
            </InputGroupItem>
          </InputGroup>
        ) : (
          <SearchInput
            placeholder={placeholderText}
            value={inputValue}
            onChange={(_event, value) => setInputValue(value)}
            onSearch={onFilterSubmit}
            onKeyDown={onKeyDown}
            onClear={() => {
              setInputValue('');
              setFilterValue([]);
            }}
            isDisabled={isDisabled}
          />
        )}
      </ToolbarFilter>
    </ToolbarItem>
  );
}
