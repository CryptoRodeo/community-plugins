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
} from '@patternfly/react-core';

/**
 * Empty state shown when a trust root has no certificates.
 */
export function CertificateDoesNotExist() {
  return (
    <Bullseye>
      <EmptyState
        titleText="Certificate does not exist"
        headingLevel="h6"
        status={EmptyStateStatus.info}
      >
        <EmptyStateBody>
          Currently this trust root does not have any have certificates to
          display
        </EmptyStateBody>
      </EmptyState>
    </Bullseye>
  );
}
