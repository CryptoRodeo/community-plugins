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
import { type ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TestApiProvider } from '@backstage/test-utils';
import { rhtasApiRef } from '../../api/RhtasApi';
import { RhtasApi } from '../../api/RhtasApi';
import { TrustRootPage } from './TrustRootPage';

// Mock patternfly/react-charts to avoid victory-chart dependency issue in tests
jest.mock('@patternfly/react-charts/victory', () => ({
  ChartDonut: () => null,
}));

const createWrapper = (mockApi: Partial<RhtasApi>) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <TestApiProvider apis={[[rhtasApiRef, mockApi as RhtasApi]]}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TestApiProvider>
  );
};

describe('TrustRootPage', () => {
  it('should render loading state', () => {
    const mockApi: Partial<RhtasApi> = {
      getTrustConfig: () => new Promise(() => {}),
      getRootMetadataInfo: () => new Promise(() => {}),
      getTargetCertificates: () => new Promise(() => {}),
    };

    const Wrapper = createWrapper(mockApi);
    render(
      <Wrapper>
        <TrustRootPage />
      </Wrapper>,
    );

    expect(screen.getByText('Loading trust root data...')).toBeInTheDocument();
  });

  it('should render error state', async () => {
    const mockApi: Partial<RhtasApi> = {
      getTrustConfig: jest
        .fn()
        .mockRejectedValue(new Error('Connection refused')),
      getRootMetadataInfo: jest
        .fn()
        .mockRejectedValue(new Error('Connection refused')),
      getTargetCertificates: jest
        .fn()
        .mockRejectedValue(new Error('Connection refused')),
    };

    const Wrapper = createWrapper(mockApi);
    render(
      <Wrapper>
        <TrustRootPage />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load trust root data'),
      ).toBeInTheDocument();
    });
    expect(screen.getByText('Connection refused')).toBeInTheDocument();
  });

  it('should render tabs when data is loaded', async () => {
    const mockApi: Partial<RhtasApi> = {
      getTrustConfig: jest.fn().mockResolvedValue({
        tufRepoUrl: 'https://tuf-repo-cdn.sigstore.dev',
        rootMetadata: [],
        targets: [],
      }),
      getRootMetadataInfo: jest.fn().mockResolvedValue({ data: [] }),
      getTargetCertificates: jest.fn().mockResolvedValue({ data: [] }),
    };

    const Wrapper = createWrapper(mockApi);
    render(
      <Wrapper>
        <TrustRootPage />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });
    expect(screen.getByText('Certificates')).toBeInTheDocument();
    expect(screen.getByText('Root Details')).toBeInTheDocument();
  });

  it('should render empty state when config is null', async () => {
    const mockApi: Partial<RhtasApi> = {
      getTrustConfig: jest.fn().mockResolvedValue(null),
      getRootMetadataInfo: jest.fn().mockResolvedValue({ data: [] }),
      getTargetCertificates: jest.fn().mockResolvedValue({ data: [] }),
    };

    const Wrapper = createWrapper(mockApi);
    render(
      <Wrapper>
        <TrustRootPage />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(
        screen.getByText('No trust configuration available.'),
      ).toBeInTheDocument();
    });
  });

  it('should render card-based RootDetails with latest metadata entry', async () => {
    const mockApi: Partial<RhtasApi> = {
      getTrustConfig: jest.fn().mockResolvedValue({
        tufRepoUrl: 'https://tuf-repo-cdn.sigstore.dev',
        rootMetadata: [],
        targets: [],
      }),
      getRootMetadataInfo: jest.fn().mockResolvedValue({
        'repo-url': 'https://tuf-repo-cdn.sigstore.dev',
        data: [
          { version: '1', expires: '2025-01-01T00:00:00Z', status: 'expired' },
          { version: '3', expires: '2027-06-15T00:00:00Z', status: 'active' },
          { version: '2', expires: '2026-03-10T00:00:00Z', status: 'expiring' },
        ],
      }),
      getTargetCertificates: jest.fn().mockResolvedValue({ data: [] }),
    };

    const Wrapper = createWrapper(mockApi);
    render(
      <Wrapper>
        <TrustRootPage />
      </Wrapper>,
    );

    // Wait for data and click Root Details tab
    await waitFor(() => {
      expect(screen.getByText('Root Details')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Root Details'));

    // Card titles
    await waitFor(() => {
      expect(screen.getByText('Root details')).toBeInTheDocument();
    });
    expect(screen.getByText('Metadata')).toBeInTheDocument();

    // Type description
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('tuf')).toBeInTheDocument();

    // Latest version (version 3) should be displayed
    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    // Expires date for version 3
    expect(screen.getByText('Expires')).toBeInTheDocument();
    expect(screen.getByText('Jun 15, 2027')).toBeInTheDocument();

    // Status for version 3
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should render MetadataNotAvailable when metadata query returns null', async () => {
    const mockApi: Partial<RhtasApi> = {
      getTrustConfig: jest.fn().mockResolvedValue({
        tufRepoUrl: 'https://tuf-repo-cdn.sigstore.dev',
        rootMetadata: [],
        targets: [],
      }),
      getRootMetadataInfo: jest.fn().mockResolvedValue(null),
      getTargetCertificates: jest.fn().mockResolvedValue({ data: [] }),
    };

    const Wrapper = createWrapper(mockApi);
    render(
      <Wrapper>
        <TrustRootPage />
      </Wrapper>,
    );

    // Wait for data and click Root Details tab
    await waitFor(() => {
      expect(screen.getByText('Root Details')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Root Details'));

    await waitFor(() => {
      expect(
        screen.getByText('Latest root metadata not available'),
      ).toBeInTheDocument();
    });
    expect(screen.getByText('No metadata list found')).toBeInTheDocument();
  });
});
