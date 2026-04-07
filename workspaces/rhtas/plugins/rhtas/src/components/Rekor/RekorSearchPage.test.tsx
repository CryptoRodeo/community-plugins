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
import { RekorSearchPage } from './RekorSearchPage';

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

describe('RekorSearchPage', () => {
  it('should render the search form', () => {
    const mockApi: Partial<RhtasApi> = {
      searchRekorEntries: jest.fn(),
    };

    const Wrapper = createWrapper(mockApi);
    render(
      <Wrapper>
        <RekorSearchPage />
      </Wrapper>,
    );

    expect(
      screen.getByText('Search Rekor Transparency Log'),
    ).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('should disable search button when input is empty', () => {
    const mockApi: Partial<RhtasApi> = {
      searchRekorEntries: jest.fn(),
    };

    const Wrapper = createWrapper(mockApi);
    render(
      <Wrapper>
        <RekorSearchPage />
      </Wrapper>,
    );

    const searchButton = screen.getByRole('button', { name: /search/i });
    expect(searchButton).toBeDisabled();
  });

  it('should detect email search type', () => {
    const mockApi: Partial<RhtasApi> = {
      searchRekorEntries: jest.fn(),
    };

    const Wrapper = createWrapper(mockApi);
    render(
      <Wrapper>
        <RekorSearchPage />
      </Wrapper>,
    );

    const input = screen.getByPlaceholderText(
      'e.g., user@example.com, sha256:abc123..., or 12345',
    );
    fireEvent.change(input, {
      target: { value: 'user@example.com' },
    });

    expect(screen.getByText('Detected: Email')).toBeInTheDocument();
  });

  it('should detect log index search type', () => {
    const mockApi: Partial<RhtasApi> = {
      searchRekorEntries: jest.fn(),
    };

    const Wrapper = createWrapper(mockApi);
    render(
      <Wrapper>
        <RekorSearchPage />
      </Wrapper>,
    );

    const input = screen.getByPlaceholderText(
      'e.g., user@example.com, sha256:abc123..., or 12345',
    );
    fireEvent.change(input, {
      target: { value: '12345' },
    });

    expect(screen.getByText('Detected: Log Index')).toBeInTheDocument();
  });

  it('should detect hash search type', () => {
    const mockApi: Partial<RhtasApi> = {
      searchRekorEntries: jest.fn(),
    };

    const Wrapper = createWrapper(mockApi);
    render(
      <Wrapper>
        <RekorSearchPage />
      </Wrapper>,
    );

    const input = screen.getByPlaceholderText(
      'e.g., user@example.com, sha256:abc123..., or 12345',
    );
    const hashValue =
      'sha256:abc123def4567890123456789012345678901234567890123456789012345678';
    fireEvent.change(input, { target: { value: hashValue } });

    expect(screen.getByText('Detected: Hash')).toBeInTheDocument();
  });

  it('should show loading state after form submission', async () => {
    const mockApi: Partial<RhtasApi> = {
      searchRekorEntries: () => new Promise(() => {}),
    };

    const Wrapper = createWrapper(mockApi);
    render(
      <Wrapper>
        <RekorSearchPage />
      </Wrapper>,
    );

    const input = screen.getByPlaceholderText(
      'e.g., user@example.com, sha256:abc123..., or 12345',
    );
    fireEvent.change(input, {
      target: { value: 'user@example.com' },
    });

    const form = input.closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Searching Rekor...')).toBeInTheDocument();
    });
  });

  it('should show error state on API failure', async () => {
    const mockApi: Partial<RhtasApi> = {
      searchRekorEntries: jest
        .fn()
        .mockRejectedValue(new Error('Service unavailable')),
    };

    const Wrapper = createWrapper(mockApi);
    render(
      <Wrapper>
        <RekorSearchPage />
      </Wrapper>,
    );

    const input = screen.getByPlaceholderText(
      'e.g., user@example.com, sha256:abc123..., or 12345',
    );
    fireEvent.change(input, {
      target: { value: 'user@example.com' },
    });

    const form = input.closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Search failed')).toBeInTheDocument();
    });
    expect(screen.getByText('Service unavailable')).toBeInTheDocument();
  });

  it('should show empty state when no results found', async () => {
    const mockApi: Partial<RhtasApi> = {
      searchRekorEntries: jest.fn().mockResolvedValue({}),
    };

    const Wrapper = createWrapper(mockApi);
    render(
      <Wrapper>
        <RekorSearchPage />
      </Wrapper>,
    );

    const input = screen.getByPlaceholderText(
      'e.g., user@example.com, sha256:abc123..., or 12345',
    );
    fireEvent.change(input, {
      target: { value: 'user@example.com' },
    });

    const form = input.closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText('No entries found matching your search.'),
      ).toBeInTheDocument();
    });
  });
});
