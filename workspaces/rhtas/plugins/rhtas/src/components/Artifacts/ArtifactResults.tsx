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
  ArtifactSummaryView,
  ImageMetadataResponse,
  VerifyArtifactResponse,
} from '@backstage-community/plugin-rhtas-common';
import { Panel, PanelMain, PanelMainBody } from '@patternfly/react-core';
import { ArtifactCard } from './ArtifactCard';

/** Props for ArtifactResults. */
export interface ArtifactResultsProps {
  metadata: ImageMetadataResponse;
  verification?: VerifyArtifactResponse;
  summary?: ArtifactSummaryView;
}

/** Container that renders ArtifactCard when data is available. */
export function ArtifactResults({
  metadata,
  verification,
  summary,
}: ArtifactResultsProps) {
  return (
    <div>
      <Panel>
        <PanelMain>
          <PanelMainBody>Showing 1 of 1</PanelMainBody>
        </PanelMain>
      </Panel>
      <ArtifactCard
        metadata={metadata}
        verification={verification}
        summary={summary}
      />
    </div>
  );
}
