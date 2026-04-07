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
import type { ReactNode } from 'react';
import {
  Alert,
  Button,
  EmptyState,
  EmptyStateBody,
  PageSection,
  Spinner,
} from '@patternfly/react-core';

/** Props for LoadingWrapper. */
export interface LoadingWrapperProps {
  isLoading: boolean;
  error?: Error | unknown;
  loadingMessage?: string;
  errorTitle?: string;
  onRetry?: () => void;
  children: ReactNode;
}

/**
 * Wrapper component that shows a PatternFly Spinner during loading,
 * an Alert on error with optional retry, and renders children when ready.
 */
export function LoadingWrapper({
  isLoading,
  error,
  loadingMessage = 'Loading...',
  errorTitle = 'Failed to load data',
  onRetry,
  children,
}: LoadingWrapperProps) {
  if (isLoading) {
    return (
      <PageSection>
        <EmptyState>
          <Spinner size="xl" />
          <EmptyStateBody>{loadingMessage}</EmptyStateBody>
        </EmptyState>
      </PageSection>
    );
  }

  if (error) {
    return (
      <PageSection>
        <Alert
          variant="danger"
          title={errorTitle}
          actionClose={
            onRetry ? (
              <Button variant="link" onClick={onRetry}>
                Retry
              </Button>
            ) : undefined
          }
        >
          {error instanceof Error ? error.message : String(error)}
        </Alert>
      </PageSection>
    );
  }

  return <>{children}</>;
}
