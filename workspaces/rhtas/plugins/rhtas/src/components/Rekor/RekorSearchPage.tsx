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

import { useState, type FormEvent } from 'react';
import {
  ActionGroup,
  Alert,
  Button,
  EmptyState,
  EmptyStateBody,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Label,
  PageSection,
  Spinner,
  TextInput,
} from '@patternfly/react-core';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import { type RekorSearchType } from '@backstage-community/plugin-rhtas-common';
import { useRekorSearch } from '../../hooks/queries';
import { RekorList } from './RekorList';
import { RekorEntryPage } from './RekorEntryPage';

const ATTRIBUTE_MATCHERS: {
  attribute: RekorSearchType;
  pattern: RegExp;
}[] = [
  { attribute: 'email', pattern: /\S+@\S+\.\S+/ },
  { attribute: 'hash', pattern: /^sha256:[0-9a-fA-F]{64}$/ },
  { attribute: 'hash', pattern: /^sha1:[0-9a-fA-F]{40}$/ },
  { attribute: 'uuid', pattern: /^[0-9a-fA-F]{80}$/ },
  { attribute: 'uuid', pattern: /^[0-9a-fA-F]{64}$/ },
  { attribute: 'commitHash', pattern: /^[0-9a-fA-F]{40}$/ },
  { attribute: 'logIndex', pattern: /^\d+$/ },
];

function detectAttribute(value: string): RekorSearchType | null {
  const trimmed = value.trim();
  for (const { attribute, pattern } of ATTRIBUTE_MATCHERS) {
    if (pattern.test(trimmed)) return attribute;
  }
  return null;
}

const TYPE_LABELS: Record<RekorSearchType, string> = {
  email: 'Email',
  hash: 'Hash',
  commitHash: 'Commit Hash',
  uuid: 'UUID',
  logIndex: 'Log Index',
};

function SearchError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  let title = 'An unexpected error occurred';
  if (error instanceof Error) {
    title = error.message;
  } else if (typeof error === 'string') {
    title = error;
  }
  return (
    <Alert
      style={{ margin: '1em auto' }}
      title={title}
      variant="danger"
      actionClose={
        onRetry ? (
          <Button variant="link" onClick={onRetry}>
            Retry
          </Button>
        ) : undefined
      }
    />
  );
}

/**
 * Rekor Search page with search form that auto-detects query type,
 * results table, and detail view for individual entries.
 */
export function RekorSearchPage() {
  const [searchInput, setSearchInput] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState<string | undefined>();
  const [submittedType, setSubmittedType] = useState<string | undefined>();
  const [viewingLogIndex, setViewingLogIndex] = useState<string | undefined>();
  const [validationError, setValidationError] = useState<string | undefined>();

  const detectedType = searchInput.trim()
    ? detectAttribute(searchInput)
    : undefined;

  const { data, isLoading, error, refetch } = useRekorSearch(
    submittedQuery,
    submittedType,
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = searchInput.trim();
    if (!trimmed) return;

    const attribute = detectAttribute(trimmed);
    if (!attribute) {
      setValidationError(
        'Unrecognized format. Expected: email, hash (sha256:/sha1:), commit SHA (40 hex), UUID (64/80 hex), or log index (number).',
      );
      return;
    }

    setValidationError(undefined);
    setSubmittedQuery(trimmed);
    setSubmittedType(attribute);
    setViewingLogIndex(undefined);
  };

  const handleSearchHash = (hash: string) => {
    setSearchInput(hash);
    setValidationError(undefined);
    setSubmittedQuery(hash);
    setSubmittedType('hash');
    setViewingLogIndex(undefined);
  };

  const handleViewEntry = (logIndex: number) => {
    setViewingLogIndex(String(logIndex));
  };

  const handleBack = () => {
    setViewingLogIndex(undefined);
  };

  // Show entry detail view
  if (viewingLogIndex) {
    return <RekorEntryPage logIndex={viewingLogIndex} onBack={handleBack} />;
  }

  return (
    <PageSection>
      <Form onSubmit={handleSubmit}>
        <FormGroup
          label="Search Rekor Transparency Log"
          fieldId="rekor-search"
          labelInfo="Enter an email, SHA256 hash, commit hash, UUID, or log index"
        >
          <TextInput
            id="rekor-search"
            value={searchInput}
            onChange={(_event, value) => {
              setSearchInput(value);
              if (validationError) setValidationError(undefined);
            }}
            placeholder="e.g., user@example.com, sha256:abc123..., or 12345"
            validated={validationError ? 'error' : 'default'}
          />
          {validationError && (
            <FormHelperText>
              <HelperText>
                <HelperTextItem variant="error">
                  {validationError}
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          )}
          {!validationError && detectedType && searchInput.trim() && (
            <Label isCompact style={{ marginTop: '4px' }}>
              Detected: {TYPE_LABELS[detectedType]}
            </Label>
          )}
        </FormGroup>
        <ActionGroup>
          <Button
            variant="primary"
            type="submit"
            icon={<SearchIcon />}
            isDisabled={!searchInput.trim()}
          >
            Search
          </Button>
        </ActionGroup>
      </Form>

      {isLoading && (
        <EmptyState>
          <Spinner size="xl" />
          <EmptyStateBody>Searching Rekor...</EmptyStateBody>
        </EmptyState>
      )}

      {error && <SearchError error={error} onRetry={() => refetch()} />}

      {!isLoading && !error && data && Object.keys(data).length === 0 && (
        <EmptyState>
          <EmptyStateBody>
            No entries found matching your search.
          </EmptyStateBody>
        </EmptyState>
      )}

      {data && Object.keys(data).length > 0 && (
        <RekorList
          entries={data}
          onViewEntry={handleViewEntry}
          onSearchHash={handleSearchHash}
        />
      )}
    </PageSection>
  );
}
