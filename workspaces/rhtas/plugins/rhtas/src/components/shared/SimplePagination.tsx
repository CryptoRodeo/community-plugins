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
  Pagination,
  type PaginationProps,
  PaginationVariant,
} from '@patternfly/react-core';

/** Pagination state props matching the usePFToolbarTable output. */
export type PaginationStateProps = Pick<
  PaginationProps,
  'itemCount' | 'perPage' | 'page' | 'onSetPage' | 'onPerPageSelect'
>;

const PER_PAGE_OPTIONS = [
  { title: '10', value: 10 },
  { title: '20', value: 20 },
  { title: '50', value: 50 },
];

/** Props for SimplePagination — new interface with paginationProps bag. */
export interface SimplePaginationNewProps {
  paginationProps: PaginationStateProps;
  isTop: boolean;
  isCompact?: boolean;
  idPrefix?: string;
}

/** Props for SimplePagination — legacy interface with flat props. */
export interface SimplePaginationLegacyProps {
  itemCount: number;
  page: number;
  perPage: number;
  onSetPage: (page: number) => void;
  onPerPageSelect: (perPage: number) => void;
}

/** Combined props type. */
export type SimplePaginationProps =
  | SimplePaginationNewProps
  | SimplePaginationLegacyProps;

function isNewProps(
  props: SimplePaginationProps,
): props is SimplePaginationNewProps {
  return 'paginationProps' in props;
}

/**
 * PatternFly Pagination wrapper with standard page size options (10, 20, 50).
 * Supports both the new paginationProps bag interface and the legacy flat props.
 */
export function SimplePagination(props: SimplePaginationProps) {
  if (isNewProps(props)) {
    const { paginationProps, isTop, isCompact, idPrefix } = props;
    return (
      <Pagination
        id={idPrefix ? `${idPrefix}-${isTop ? 'top' : 'bottom'}` : undefined}
        variant={isTop ? PaginationVariant.top : PaginationVariant.bottom}
        isCompact={isCompact}
        perPageOptions={PER_PAGE_OPTIONS}
        {...paginationProps}
      />
    );
  }

  // Legacy interface
  const { itemCount, page, perPage, onSetPage, onPerPageSelect } = props;
  return (
    <Pagination
      itemCount={itemCount}
      page={page}
      perPage={perPage}
      onSetPage={(_event, p) => onSetPage(p)}
      onPerPageSelect={(_event, pp) => onPerPageSelect(pp)}
      perPageOptions={PER_PAGE_OPTIONS}
    />
  );
}
