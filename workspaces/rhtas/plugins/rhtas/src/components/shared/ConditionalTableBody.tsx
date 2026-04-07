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
import { type ReactNode } from 'react';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { Tbody, Td, Tr } from '@patternfly/react-table';
import { NoDataEmptyState } from './NoDataEmptyState';

/** Props for ConditionalTableBody. */
export interface ConditionalTableBodyProps {
  numRenderedColumns: number;
  isLoading?: boolean;
  isError?: boolean;
  isNoData?: boolean;
  errorEmptyState?: ReactNode;
  noDataEmptyState?: ReactNode;
  children: ReactNode;
}

/**
 * Wraps table content and conditionally shows loading spinner,
 * error state, or empty state based on boolean props.
 */
export function ConditionalTableBody({
  numRenderedColumns,
  isLoading,
  isError,
  isNoData,
  errorEmptyState,
  noDataEmptyState,
  children,
}: ConditionalTableBodyProps) {
  if (isLoading) {
    return (
      <Tbody>
        <Tr>
          <Td colSpan={numRenderedColumns}>
            <Bullseye>
              <Spinner size="xl" />
            </Bullseye>
          </Td>
        </Tr>
      </Tbody>
    );
  }

  if (isError) {
    return (
      <Tbody>
        <Tr>
          <Td colSpan={numRenderedColumns}>
            <Bullseye>
              {errorEmptyState ?? (
                <NoDataEmptyState
                  title="Error loading data"
                  body="An error occurred while loading data."
                />
              )}
            </Bullseye>
          </Td>
        </Tr>
      </Tbody>
    );
  }

  if (isNoData) {
    return (
      <Tbody>
        <Tr>
          <Td colSpan={numRenderedColumns}>
            <Bullseye>{noDataEmptyState ?? <NoDataEmptyState />}</Bullseye>
          </Td>
        </Tr>
      </Tbody>
    );
  }

  return <>{children}</>;
}
