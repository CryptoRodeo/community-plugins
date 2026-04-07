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
import { EmptyState, EmptyStateBody } from '@patternfly/react-core';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';

/** Props for NoDataEmptyState. */
export interface NoDataEmptyStateProps {
  title?: string;
  body?: string;
}

/**
 * Empty state displayed when no data is available for a section
 * (e.g., no signatures or attestations found).
 */
export function NoDataEmptyState({
  title = 'No data found',
  body,
}: NoDataEmptyStateProps) {
  return (
    <EmptyState titleText={title} icon={SearchIcon} headingLevel="h4">
      {body && <EmptyStateBody>{body}</EmptyStateBody>}
    </EmptyState>
  );
}
