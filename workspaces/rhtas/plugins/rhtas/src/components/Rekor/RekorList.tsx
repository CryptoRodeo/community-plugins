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
  useCallback,
  useMemo,
  useState,
  type MouseEvent,
  type Ref,
} from 'react';
import {
  Button,
  Flex,
  FlexItem,
  Label,
  MenuToggle,
  MenuToggleElement,
  Pagination,
  Select,
  SelectList,
  SelectOption,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { SearchInput } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  ThProps,
} from '@patternfly/react-table';
import { RawRekorLogEntry } from '@backstage-community/plugin-rhtas-common';
import { useTableControls, SortDirection } from '../../hooks/useTableControls';
import { formatIntegratedTime } from '../../utils/rekor';
import { getHash, getSignature } from '../../utils/spec';
import { Hash } from './shared/Hash';
import { Signature } from './shared/Signature';
import { PublicKey } from './shared/PublicKey';

interface RekorBody {
  kind: string;
  spec: unknown;
  apiVersion: string;
}

/** A parsed entry for table display. */
interface RekorListEntry {
  uuid: string;
  logIndex: number;
  integratedTime: number;
  body: RekorBody;
}

/** Props for RekorList. */
export interface RekorListProps {
  entries: Record<string, RawRekorLogEntry>;
  onViewEntry: (logIndex: number) => void;
  onSearchHash?: (hash: string) => void;
}

function toListEntries(
  entries: Record<string, RawRekorLogEntry>,
): RekorListEntry[] {
  return Object.entries(entries).map(([uuid, entry]) => {
    let body: RekorBody = { kind: '', spec: {}, apiVersion: '' };
    try {
      const decoded = JSON.parse(atob(entry.body));
      body = {
        kind: decoded.kind ?? '',
        spec: decoded.spec ?? {},
        apiVersion: decoded.apiVersion ?? '',
      };
    } catch {
      // leave defaults
    }
    return {
      uuid,
      logIndex: entry.logIndex,
      integratedTime: entry.integratedTime,
      body,
    };
  });
}

const columns = [
  { key: 'commitHash', label: 'Commit Hash' },
  { key: 'logIndex', label: 'Log Index' },
  { key: 'entryUuid', label: 'Entry UUID' },
  { key: 'type', label: 'Type' },
  { key: 'signature', label: 'Signature' },
  { key: 'publicCert', label: 'Public Certificate' },
  { key: 'integratedTime', label: 'Integrated time' },
  { key: 'action', label: 'Action' },
];

function sortEntries(
  a: RekorListEntry,
  b: RekorListEntry,
  column: string,
  direction: SortDirection,
): number {
  let cmp = 0;
  if (column === 'logIndex') {
    cmp = a.logIndex - b.logIndex;
  } else if (column === 'integratedTime') {
    cmp = a.integratedTime - b.integratedTime;
  } else if (column === 'type') {
    cmp = a.body.kind.localeCompare(b.body.kind);
  } else {
    cmp = 0;
  }
  return direction === 'asc' ? cmp : -cmp;
}

function filterEntries(
  entry: RekorListEntry,
  filters: Record<string, string>,
): boolean {
  const text = filters.text?.toLowerCase();
  if (text) {
    const hash =
      getHash({ type: entry.body.kind, spec: entry.body.spec }) ?? '';
    if (
      !hash.toLowerCase().includes(text) &&
      !entry.uuid.toLowerCase().includes(text)
    ) {
      return false;
    }
  }
  const typeFilter = filters.type;
  if (typeFilter) {
    const selected = typeFilter.split(',').filter(Boolean);
    if (selected.length > 0 && !selected.includes(entry.body.kind)) {
      return false;
    }
  }
  return true;
}

/**
 * PatternFly Table displaying Rekor search results with
 * filtering, sorting, and pagination.
 */
export function RekorList({
  entries,
  onViewEntry,
  onSearchHash,
}: RekorListProps) {
  const [typeSelectOpen, setTypeSelectOpen] = useState(false);

  const listEntries = useMemo(() => toListEntries(entries), [entries]);

  const entryTypes = useMemo(() => {
    const types = new Set(listEntries.map(e => e.body.kind).filter(Boolean));
    return Array.from(types).sort();
  }, [listEntries]);

  const table = useTableControls<RekorListEntry>({
    items: listEntries,
    initialSortColumn: 'integratedTime',
    initialSortDirection: 'desc',
    initialPerPage: 20,
    filterFn: filterEntries,
    sortFn: sortEntries,
  });

  const selectedTypes = useMemo(() => {
    const raw = table.filters.type;
    return raw ? raw.split(',').filter(Boolean) : [];
  }, [table.filters.type]);

  const onTypeSelect = useCallback(
    (_event: MouseEvent | undefined, value: string | number | undefined) => {
      const strVal = String(value);
      const current = selectedTypes;
      const next = current.includes(strVal)
        ? current.filter(s => s !== strVal)
        : [...current, strVal];
      table.setFilter('type', next.join(','));
    },
    [selectedTypes, table],
  );

  const getSortParams = (columnKey: string): ThProps['sort'] => ({
    sortBy: {
      index: columns.findIndex(c => c.key === table.sortColumn),
      direction: table.sortDirection,
    },
    onSort: (_event, _index, direction) => {
      table.setSort(columnKey, direction as SortDirection);
    },
    columnIndex: columns.findIndex(c => c.key === columnKey),
  });

  return (
    <>
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            <SearchInput
              placeholder="Filter by hash or UUID"
              value={table.filters.text ?? ''}
              onChange={(_event, value) => table.setFilter('text', value)}
              onClear={() => table.setFilter('text', '')}
            />
          </ToolbarItem>
          {entryTypes.length > 0 && (
            <ToolbarItem>
              <Select
                isOpen={typeSelectOpen}
                onOpenChange={setTypeSelectOpen}
                onSelect={onTypeSelect}
                toggle={(toggleRef: Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setTypeSelectOpen(prev => !prev)}
                  >
                    Entry Type{' '}
                    {selectedTypes.length > 0 && `(${selectedTypes.length})`}
                  </MenuToggle>
                )}
              >
                <SelectList>
                  {entryTypes.map(t => (
                    <SelectOption
                      key={t}
                      value={t}
                      hasCheckbox
                      isSelected={selectedTypes.includes(t)}
                    >
                      {t}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
            </ToolbarItem>
          )}
        </ToolbarContent>
      </Toolbar>
      <Table aria-label="Rekor search results">
        <Thead>
          <Tr>
            {columns.map(col => {
              if (col.key === 'action') {
                return <Th key={col.key} screenReaderText="Actions" />;
              }
              const sortable = ['logIndex', 'integratedTime', 'type'].includes(
                col.key,
              );
              return (
                <Th
                  key={col.key}
                  sort={sortable ? getSortParams(col.key) : undefined}
                >
                  {col.label}
                </Th>
              );
            })}
          </Tr>
        </Thead>
        <Tbody>
          {table.paginatedItems.map(row => (
            <Tr key={row.uuid}>
              <Td dataLabel="Commit Hash" modifier="breakWord">
                <Button
                  variant="link"
                  isInline
                  onClick={() => {
                    const hash = getHash({
                      type: row.body.kind,
                      spec: row.body.spec,
                    });
                    if (hash && onSearchHash) onSearchHash(hash);
                  }}
                >
                  <Label isCompact color="blue" variant="outline">
                    <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                      <FlexItem>
                        <Hash
                          spec={row.body.spec}
                          type={row.body.kind}
                          variant="short"
                        />
                      </FlexItem>
                      <FlexItem>
                        <ExternalLinkAltIcon />
                      </FlexItem>
                    </Flex>
                  </Label>
                </Button>
              </Td>
              <Td dataLabel="Log Index">{row.logIndex}</Td>
              <Td dataLabel="Entry UUID" modifier="truncate">
                {row.uuid}
              </Td>
              <Td dataLabel="Type">{row.body.kind}</Td>
              <Td
                dataLabel="Signature"
                modifier="truncate"
                tooltip={getSignature({
                  apiVersion: row.body.apiVersion,
                  spec: row.body.spec,
                  type: row.body.kind,
                })}
              >
                <Signature
                  apiVersion={row.body.apiVersion}
                  spec={row.body.spec}
                  type={row.body.kind}
                />
              </Td>
              <Td dataLabel="Public Certificate">
                <PublicKey
                  apiVersion={row.body.apiVersion}
                  spec={row.body.spec}
                  type={row.body.kind}
                  variant="validity"
                />
              </Td>
              <Td dataLabel="Integrated time">
                {formatIntegratedTime(row.integratedTime)}
              </Td>
              <Td dataLabel="Actions">
                <Button
                  variant="link"
                  isInline
                  onClick={() => onViewEntry(row.logIndex)}
                >
                  View details
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Pagination
        itemCount={table.totalFilteredCount}
        page={table.page}
        perPage={table.perPage}
        onSetPage={(_event, p) => table.setPage(p)}
        onPerPageSelect={(_event, pp) => table.setPerPage(pp)}
        perPageOptions={[
          { title: '10', value: 10 },
          { title: '20', value: 20 },
          { title: '50', value: 50 },
        ]}
      />
    </>
  );
}
