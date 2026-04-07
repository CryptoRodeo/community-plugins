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
import { useState } from 'react';
import {
  PageSection,
  Tab,
  TabTitleText,
  Tabs,
  TabContent,
} from '@patternfly/react-core';
import { ArtifactsPage } from './Artifacts/ArtifactsPage';
import { RekorRouter } from './Router';
/**
 * Entity content component with tabs for Artifacts and Rekor.
 * @public
 */
export function RhtasOperationsContent() {
  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

  return (
    <PageSection>
      <Tabs
        activeKey={activeTabKey}
        onSelect={(_event, tabIndex) => setActiveTabKey(tabIndex)}
        aria-label="RHTAS operations tabs"
      >
        <Tab eventKey={0} title={<TabTitleText>Artifacts</TabTitleText>}>
          <TabContent id="rhtas-artifacts-tab">
            <ArtifactsPage />
          </TabContent>
        </Tab>
        <Tab eventKey={1} title={<TabTitleText>Rekor</TabTitleText>}>
          <TabContent id="rhtas-rekor-tab">
            <RekorRouter />
          </TabContent>
        </Tab>
      </Tabs>
    </PageSection>
  );
}
