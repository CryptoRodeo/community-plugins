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
  Alert,
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  PageSection,
  Spinner,
  Tab,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core';
import {
  useTrustConfig,
  useTrustRootMetadata,
  useTrustTargetCertificates,
} from '../../hooks/queries';
import { Overview } from './Overview';
import { Certificates } from './Certificates';
import { RootDetails } from './RootDetails';
import { MetadataNotAvailable } from './ErrorStates/MetadataNotAvailable';

/**
 * Trust Root page with three sub-tabs: Overview, Certificates, Root Details.
 */
export function TrustRootPage() {
  const [activeTab, setActiveTab] = useState<string | number>(0);

  const configQuery = useTrustConfig();
  const metadataQuery = useTrustRootMetadata();
  const certificatesQuery = useTrustTargetCertificates();

  const isLoading =
    configQuery.isLoading ||
    metadataQuery.isLoading ||
    certificatesQuery.isLoading;
  const error =
    configQuery.error || metadataQuery.error || certificatesQuery.error;

  if (isLoading) {
    return (
      <PageSection>
        <EmptyState>
          <Spinner size="xl" />
          <EmptyStateBody>Loading trust root data...</EmptyStateBody>
        </EmptyState>
      </PageSection>
    );
  }

  if (error) {
    return (
      <PageSection>
        <Alert
          variant="danger"
          title="Failed to load trust root data"
          actionClose={
            <Button
              variant="link"
              onClick={() => {
                configQuery.refetch();
                metadataQuery.refetch();
                certificatesQuery.refetch();
              }}
            >
              Retry
            </Button>
          }
        >
          {error instanceof Error ? error.message : String(error)}
        </Alert>
      </PageSection>
    );
  }

  const certificates = certificatesQuery.data?.data ?? [];
  const config = configQuery.data;

  if (!config) {
    return (
      <PageSection>
        <EmptyState>
          <EmptyStateBody>No trust configuration available.</EmptyStateBody>
          <EmptyStateFooter>
            <EmptyStateActions>
              <Button variant="primary" onClick={() => configQuery.refetch()}>
                Retry
              </Button>
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
      </PageSection>
    );
  }

  return (
    <PageSection>
      <Tabs
        activeKey={activeTab}
        onSelect={(_event, tabIndex) => setActiveTab(tabIndex)}
      >
        <Tab eventKey={0} title={<TabTitleText>Overview</TabTitleText>}>
          <Overview
            certificates={certificates}
            isFetching={certificatesQuery.isLoading}
            fetchError={certificatesQuery.error}
            rootLink={metadataQuery.data?.['repo-url']}
          />
        </Tab>
        <Tab eventKey={1} title={<TabTitleText>Certificates</TabTitleText>}>
          <Certificates
            certificates={certificates}
            isFetching={certificatesQuery.isLoading}
            fetchError={certificatesQuery.error ?? null}
          />
        </Tab>
        <Tab eventKey={2} title={<TabTitleText>Root Details</TabTitleText>}>
          {metadataQuery.data ? (
            <RootDetails rootMetadataList={metadataQuery.data} />
          ) : (
            <MetadataNotAvailable errorInfo="No metadata list found" />
          )}
        </Tab>
      </Tabs>
    </PageSection>
  );
}
