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
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TestApiProvider } from '@backstage/test-utils';
import { rhtasApiRef } from '../../api/RhtasApi';
import { RhtasApi } from '../../api/RhtasApi';
import {
  VerifyArtifactResponse,
  ImageMetadataResponse,
} from '@backstage-community/plugin-rhtas-common';
import { ArtifactsPage } from './ArtifactsPage';

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

const mockVerifyResponse: VerifyArtifactResponse = {
  signatures: [],
  attestations: [],
  summary: {
    overallStatus: 'verified',
    identities: [],
    signatureCount: 1,
    attestationCount: 0,
    rekorEntryCount: 1,
  },
  artifact: {
    image: 'quay.io/test/image:v1',
    registry: 'quay.io',
    metadata: {
      mediaType: 'application/vnd.oci.image.manifest.v1+json',
      size: 1024,
      created: '2025-01-01T00:00:00Z',
    },
    digest: 'sha256:abc123def456',
  },
};

const mockMetadataResponse: ImageMetadataResponse = {
  image: 'quay.io/test/image:v1',
  registry: 'quay.io',
  metadata: {
    mediaType: 'application/vnd.oci.image.manifest.v1+json',
    size: 1024,
    created: '2025-01-01T00:00:00Z',
  },
  digest: 'sha256:abc123def456',
};

describe('ArtifactsPage', () => {
  it('should render the search form', () => {
    const mockApi: Partial<RhtasApi> = {
      getImageMetadata: jest.fn(),
      verifyArtifact: jest.fn(),
    };

    const Wrapper = createWrapper(mockApi);
    render(
      <Wrapper>
        <ArtifactsPage />
      </Wrapper>,
    );

    expect(screen.getByText('Container Image URI')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('should disable search button when input is empty', () => {
    const mockApi: Partial<RhtasApi> = {
      getImageMetadata: jest.fn(),
      verifyArtifact: jest.fn(),
    };

    const Wrapper = createWrapper(mockApi);
    render(
      <Wrapper>
        <ArtifactsPage />
      </Wrapper>,
    );

    const searchButton = screen.getByRole('button', { name: /search/i });
    expect(searchButton).toBeDisabled();
  });

  it('should show loading state after form submission', async () => {
    const mockApi: Partial<RhtasApi> = {
      getImageMetadata: () => new Promise(() => {}),
      verifyArtifact: () => new Promise(() => {}),
    };

    const Wrapper = createWrapper(mockApi);
    render(
      <Wrapper>
        <ArtifactsPage />
      </Wrapper>,
    );

    const input = screen.getByPlaceholderText(
      'e.g., quay.io/myorg/myimage:latest',
    );
    fireEvent.change(input, {
      target: { value: 'quay.io/test/image:v1' },
    });

    const form = input.closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Loading artifact data...')).toBeInTheDocument();
    });
  });

  it('should show error state on API failure', async () => {
    const mockApi: Partial<RhtasApi> = {
      getImageMetadata: jest.fn().mockRejectedValue(new Error('Not found')),
      verifyArtifact: jest.fn().mockRejectedValue(new Error('Not found')),
    };

    const Wrapper = createWrapper(mockApi);
    render(
      <Wrapper>
        <ArtifactsPage />
      </Wrapper>,
    );

    const input = screen.getByPlaceholderText(
      'e.g., quay.io/myorg/myimage:latest',
    );
    fireEvent.change(input, {
      target: { value: 'quay.io/test/image:v1' },
    });

    const form = input.closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load artifact data'),
      ).toBeInTheDocument();
    });
  });

  it('should display Showing 1 of 1 when results are loaded', async () => {
    const mockApi: Partial<RhtasApi> = {
      getImageMetadata: jest.fn().mockResolvedValue(mockMetadataResponse),
      verifyArtifact: jest.fn().mockResolvedValue(mockVerifyResponse),
    };

    const Wrapper = createWrapper(mockApi);
    render(
      <Wrapper>
        <ArtifactsPage />
      </Wrapper>,
    );

    const input = screen.getByPlaceholderText(
      'e.g., quay.io/myorg/myimage:latest',
    );
    fireEvent.change(input, {
      target: { value: 'quay.io/test/image:v1' },
    });

    const form = input.closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Showing 1 of 1')).toBeInTheDocument();
    });
  });

  it('should refetch when the same URI is submitted twice', async () => {
    const getImageMetadata = jest.fn().mockResolvedValue(mockMetadataResponse);
    const verifyArtifact = jest.fn().mockResolvedValue(mockVerifyResponse);

    const mockApi: Partial<RhtasApi> = {
      getImageMetadata,
      verifyArtifact,
    };

    const Wrapper = createWrapper(mockApi);
    render(
      <Wrapper>
        <ArtifactsPage />
      </Wrapper>,
    );

    const input = screen.getByPlaceholderText(
      'e.g., quay.io/myorg/myimage:latest',
    );
    fireEvent.change(input, {
      target: { value: 'quay.io/test/image:v1' },
    });

    const form = input.closest('form')!;
    fireEvent.submit(form);

    // Wait for the first fetch to complete
    await waitFor(() => {
      expect(screen.getByText('Showing 1 of 1')).toBeInTheDocument();
    });

    // Submit the same URI again — should trigger refetch
    fireEvent.submit(form);

    await waitFor(() => {
      expect(getImageMetadata.mock.calls.length).toBeGreaterThanOrEqual(2);
      expect(verifyArtifact.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });
});
