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
  Alert,
  Button,
  Card,
  CardBody,
  EmptyState,
  EmptyStateBody,
  Form,
  FormGroup,
  PageSection,
  Spinner,
  TextInput,
  ActionGroup,
} from '@patternfly/react-core';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import { useImageMetadata, useVerifyArtifact } from '../../hooks/queries';
import { ArtifactResults } from './ArtifactResults';

/**
 * Artifacts page with search form for container image URI
 * and verification results display.
 */
export function ArtifactsPage() {
  const [searchUri, setSearchUri] = useState('');
  const [submittedUri, setSubmittedUri] = useState<string | undefined>();

  const metadataQuery = useImageMetadata(submittedUri);
  const verifyQuery = useVerifyArtifact(
    submittedUri ? { ociImage: submittedUri } : undefined,
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = searchUri.trim();
    if (trimmed) {
      if (trimmed === submittedUri) {
        metadataQuery.refetch();
        verifyQuery.refetch();
      } else {
        setSubmittedUri(trimmed);
      }
    }
  };

  const isLoading = metadataQuery.isLoading || verifyQuery.isLoading;
  const error = metadataQuery.error || verifyQuery.error;

  return (
    <PageSection>
      <Card>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <FormGroup label="Container Image URI" fieldId="image-uri">
              <TextInput
                id="image-uri"
                value={searchUri}
                onChange={(_event, value) => setSearchUri(value)}
                placeholder="e.g., quay.io/myorg/myimage:latest"
              />
            </FormGroup>
            <ActionGroup>
              <Button
                variant="primary"
                type="submit"
                icon={<SearchIcon />}
                isDisabled={!searchUri.trim()}
              >
                Search
              </Button>
            </ActionGroup>
          </Form>
        </CardBody>
      </Card>

      {isLoading && (
        <EmptyState>
          <Spinner size="xl" />
          <EmptyStateBody>Loading artifact data...</EmptyStateBody>
        </EmptyState>
      )}

      {error && (
        <Alert
          variant="danger"
          title="Failed to load artifact data"
          actionClose={
            <Button
              variant="link"
              onClick={() => {
                metadataQuery.refetch();
                verifyQuery.refetch();
              }}
            >
              Retry
            </Button>
          }
        >
          {error instanceof Error ? error.message : String(error)}
        </Alert>
      )}

      {!isLoading && !error && submittedUri && !metadataQuery.data && (
        <EmptyState>
          <EmptyStateBody>
            No metadata found for the specified image.
          </EmptyStateBody>
        </EmptyState>
      )}

      {(metadataQuery.data || verifyQuery.data?.artifact) && (
        <ArtifactResults
          metadata={verifyQuery.data?.artifact ?? metadataQuery.data!}
          verification={verifyQuery.data}
          summary={verifyQuery.data?.summary}
        />
      )}
    </PageSection>
  );
}
