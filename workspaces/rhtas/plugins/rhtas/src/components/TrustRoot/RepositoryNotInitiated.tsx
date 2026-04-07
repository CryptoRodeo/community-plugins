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
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
} from '@patternfly/react-core';

/** Props for RepositoryNotInitiated. */
export interface RepositoryNotInitiatedProps {
  rootLink?: string;
}

/**
 * Empty state shown when the trust root repository has not been initialized.
 * Displays an error message indicating the system failed to build trust root
 * options and will retry in 30 seconds.
 */
export function RepositoryNotInitiated({
  rootLink,
}: RepositoryNotInitiatedProps) {
  return (
    <Bullseye>
      <EmptyState variant={EmptyStateVariant.lg} status="danger">
        <EmptyState headingLevel="h4" titleText="Repository not initialized" />
        <EmptyStateBody>
          The system failed to build trust root options and will retry in 30
          seconds.
          {rootLink && <> Failing URL: {rootLink}</>}
        </EmptyStateBody>
      </EmptyState>
    </Bullseye>
  );
}
