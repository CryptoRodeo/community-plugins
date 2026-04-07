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
  EmptyStateStatus,
  EmptyStateVariant,
} from '@patternfly/react-core';

/**
 * Error state shown when certificate information cannot be retrieved.
 */
export function ErrorRetrievingCertificate() {
  return (
    <Bullseye>
      <EmptyState
        headingLevel="h4"
        titleText="Error retrieving certificate information"
        status={EmptyStateStatus.danger}
        variant={EmptyStateVariant.lg}
      >
        <EmptyStateBody className="pf-v6-u-font-size--xs">
          Due to issues with extracting certificate information, we could not
          find any valid certificates. The system will automatically retry again
          in 30 seconds.
        </EmptyStateBody>
      </EmptyState>
    </Bullseye>
  );
}
