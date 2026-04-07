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
import {
  type KeyboardEvent,
  type Ref,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Badge,
  Button,
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  type SelectOptionProps,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  ToolbarFilter,
  ToolbarItem,
} from '@patternfly/react-core';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';
import { type IFilterControlProps } from './FilterToolbar';

/** Option definition for MultiselectFilterControl. */
export interface FilterSelectOptionProps {
  value: string;
  label?: string;
  chipLabel?: string;
  groupLabel?: string;
  optionProps?: Partial<SelectOptionProps>;
}

/** Props for MultiselectFilterControl. */
export interface MultiselectFilterControlProps<
  TFilterCategoryKey extends string,
> extends IFilterControlProps<TFilterCategoryKey> {
  selectOptions: FilterSelectOptionProps[];
  placeholderText: string;
  isScrollable?: boolean;
}

/**
 * Typeahead multi-select dropdown with checkboxes, keyboard navigation,
 * and toolbar chip integration.
 */
export function MultiselectFilterControl<TFilterCategoryKey extends string>({
  categoryKey,
  filterValue,
  setFilterValue,
  showToolbarItem,
  isDisabled,
  selectOptions,
  placeholderText,
  isScrollable,
}: MultiselectFilterControlProps<TFilterCategoryKey>) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  const selectedValues = useMemo(() => filterValue ?? [], [filterValue]);

  const filteredOptions = useMemo(() => {
    if (!inputValue) return selectOptions;
    const lower = inputValue.toLowerCase();
    return selectOptions.filter(opt => {
      const label = (opt.label ?? opt.value).toLowerCase();
      const value = opt.value.toLowerCase();
      const group = opt.groupLabel?.toLowerCase() ?? '';
      return (
        label.includes(lower) || value.includes(lower) || group.includes(lower)
      );
    });
  }, [selectOptions, inputValue]);

  const onSelect = useCallback(
    (_event: unknown, value: string | number | undefined) => {
      const strVal = String(value);
      const next = selectedValues.includes(strVal)
        ? selectedValues.filter(v => v !== strVal)
        : [...selectedValues, strVal];
      setFilterValue(next.length > 0 ? next : []);
    },
    [selectedValues, setFilterValue],
  );

  const onInputKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setFocusedItemIndex(prev => {
        const next = prev === null ? 0 : prev + 1;
        return next >= filteredOptions.length ? 0 : next;
      });
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setFocusedItemIndex(prev => {
        const next = prev === null ? filteredOptions.length - 1 : prev - 1;
        return next < 0 ? filteredOptions.length - 1 : next;
      });
    } else if (event.key === 'Enter' && focusedItemIndex !== null) {
      event.preventDefault();
      const opt = filteredOptions[focusedItemIndex];
      if (opt) {
        onSelect(event, opt.value);
      }
    } else if (event.key === 'Escape' || event.key === 'Tab') {
      setIsOpen(false);
    }
  };

  const chipLabels = useMemo(() => {
    return selectedValues.map(val => {
      const opt = selectOptions.find(o => o.value === val);
      return opt?.chipLabel ?? opt?.label ?? val;
    });
  }, [selectedValues, selectOptions]);

  const onClearInput = () => {
    setInputValue('');
    textInputRef.current?.focus();
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      onClick={() => setIsOpen(prev => !prev)}
      isExpanded={isOpen}
      isDisabled={isDisabled}
      isFullWidth
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={inputValue}
          onClick={() => setIsOpen(true)}
          onChange={(_event, value) => {
            setInputValue(value);
            setFocusedItemIndex(null);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={onInputKeyDown}
          placeholder={placeholderText}
          ref={textInputRef}
          autoComplete="off"
        />
        <TextInputGroupUtilities>
          {selectedValues.length > 0 && (
            <Badge isRead>{selectedValues.length}</Badge>
          )}
          {inputValue && (
            <Button
              variant="plain"
              onClick={onClearInput}
              aria-label="Clear input"
            >
              <TimesIcon />
            </Button>
          )}
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <ToolbarItem hidden={!showToolbarItem}>
      <ToolbarFilter
        labels={chipLabels}
        deleteLabel={(_category, label) => {
          const labelStr = String(label);
          const opt = selectOptions.find(
            o => (o.chipLabel ?? o.label ?? o.value) === labelStr,
          );
          if (opt) {
            onSelect(undefined, opt.value);
          }
        }}
        categoryName={String(categoryKey)}
        showToolbarItem={showToolbarItem}
      >
        <Select
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          onSelect={onSelect}
          toggle={toggle}
          isScrollable={isScrollable}
        >
          <SelectList>
            {filteredOptions.length === 0 ? (
              <SelectOption isDisabled>No results found</SelectOption>
            ) : (
              filteredOptions.map((opt, index) => (
                <SelectOption
                  key={opt.value}
                  value={opt.value}
                  hasCheckbox
                  isSelected={selectedValues.includes(opt.value)}
                  isFocused={focusedItemIndex === index}
                  {...opt.optionProps}
                >
                  {opt.label ?? opt.value}
                </SelectOption>
              ))
            )}
          </SelectList>
        </Select>
      </ToolbarFilter>
    </ToolbarItem>
  );
}
