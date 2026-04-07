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
import { RhtasClient } from './RhtasClient';
import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';

describe('RhtasClient', () => {
  const mockBaseUrl = 'http://localhost:7007/api/rhtas';

  const discoveryApi: DiscoveryApi = {
    getBaseUrl: jest.fn().mockResolvedValue(mockBaseUrl),
  };

  let fetchFn: jest.Mock;
  let fetchApi: FetchApi;
  let client: RhtasClient;

  beforeEach(() => {
    fetchFn = jest.fn();
    fetchApi = { fetch: fetchFn };
    client = new RhtasClient({ discoveryApi, fetchApi });
  });

  function mockResponse(data: unknown, ok = true, status = 200) {
    fetchFn.mockResolvedValue({
      ok,
      status,
      statusText: ok ? 'OK' : 'Error',
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    });
  }

  describe('healthCheck', () => {
    it('should call GET /health', async () => {
      mockResponse({ status: 'ok' });
      const result = await client.healthCheck();
      expect(fetchFn).toHaveBeenCalledWith(`${mockBaseUrl}/health`, undefined);
      expect(result).toEqual({ status: 'ok' });
    });
  });

  describe('verifyArtifact', () => {
    it('should call POST /artifacts/verify with request body', async () => {
      const request = { ociImage: 'quay.io/test:v1' };
      const response = {
        signatures: [],
        attestations: [],
        summary: {},
        artifact: {},
      };
      mockResponse(response);

      const result = await client.verifyArtifact(request);

      expect(fetchFn).toHaveBeenCalledWith(`${mockBaseUrl}/artifacts/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      expect(result).toEqual(response);
    });
  });

  describe('getImageMetadata', () => {
    it('should call GET /artifacts/image with uri param', async () => {
      const response = {
        image: 'quay.io/test:v1',
        registry: 'quay.io',
        digest: 'sha256:abc',
        metadata: {
          mediaType: 'application/vnd.oci.image.manifest.v1+json',
          size: 100,
          created: '2025-01-01',
        },
      };
      mockResponse(response);

      const result = await client.getImageMetadata('quay.io/test:v1');

      expect(fetchFn).toHaveBeenCalledWith(
        `${mockBaseUrl}/artifacts/image?uri=quay.io%2Ftest%3Av1`,
        undefined,
      );
      expect(result).toEqual(response);
    });
  });

  describe('getArtifactPolicies', () => {
    it('should call GET /artifacts/:artifact/policies', async () => {
      const response = {
        artifact: 'test',
        policies: [
          {
            name: 'sig-required',
            status: 'passed',
            lastChecked: '2025-01-01T00:00:00Z',
          },
        ],
        attestations: [],
      };
      mockResponse(response);

      const result = await client.getArtifactPolicies('quay.io/test:v1');

      expect(fetchFn).toHaveBeenCalledWith(
        `${mockBaseUrl}/artifacts/quay.io%2Ftest%3Av1/policies`,
        undefined,
      );
      expect(result).toEqual(response);
    });
  });

  describe('getTrustConfig', () => {
    it('should call GET /trust/config without params', async () => {
      const response = { fulcioCertAuthorities: [] };
      mockResponse(response);

      await client.getTrustConfig();

      expect(fetchFn).toHaveBeenCalledWith(
        `${mockBaseUrl}/trust/config`,
        undefined,
      );
    });

    it('should pass tufRepoUrl as query param', async () => {
      mockResponse({});

      await client.getTrustConfig('https://custom-tuf.example.com');

      expect(fetchFn).toHaveBeenCalledWith(
        `${mockBaseUrl}/trust/config?tufRepoUrl=https%3A%2F%2Fcustom-tuf.example.com`,
        undefined,
      );
    });
  });

  describe('getRootMetadataInfo', () => {
    it('should call GET /trust/root-metadata-info', async () => {
      mockResponse({ data: [] });

      await client.getRootMetadataInfo();

      expect(fetchFn).toHaveBeenCalledWith(
        `${mockBaseUrl}/trust/root-metadata-info`,
        undefined,
      );
    });
  });

  describe('getTargets', () => {
    it('should call GET /trust/targets', async () => {
      mockResponse({ data: [] });

      await client.getTargets();

      expect(fetchFn).toHaveBeenCalledWith(
        `${mockBaseUrl}/trust/targets`,
        undefined,
      );
    });
  });

  describe('getTarget', () => {
    it('should call GET /trust/target with target and tufRepoUrl params', async () => {
      mockResponse({ content: 'PEM...' });

      await client.getTarget('fulcio.crt', 'https://tuf.example.com');

      expect(fetchFn).toHaveBeenCalledWith(
        `${mockBaseUrl}/trust/target?target=fulcio.crt&tufRepoUrl=https%3A%2F%2Ftuf.example.com`,
        undefined,
      );
    });
  });

  describe('getTargetCertificates', () => {
    it('should call GET /trust/targets/certificates', async () => {
      mockResponse({ data: [] });

      await client.getTargetCertificates();

      expect(fetchFn).toHaveBeenCalledWith(
        `${mockBaseUrl}/trust/targets/certificates`,
        undefined,
      );
    });
  });

  describe('getRekorEntry', () => {
    it('should call GET /rekor/entries/:uuid', async () => {
      mockResponse({
        logIndex: 1,
        logId: { keyId: 'abc' },
        integratedTime: 1718451000,
        canonicalizedBody: '',
      });

      await client.getRekorEntry('abc123');

      expect(fetchFn).toHaveBeenCalledWith(
        `${mockBaseUrl}/rekor/entries/abc123`,
        undefined,
      );
    });
  });

  describe('getRekorPublicKey', () => {
    it('should call GET /rekor/public-key', async () => {
      mockResponse({
        publicKey:
          '-----BEGIN PUBLIC KEY-----\nkey...\n-----END PUBLIC KEY-----',
      });

      await client.getRekorPublicKey();

      expect(fetchFn).toHaveBeenCalledWith(
        `${mockBaseUrl}/rekor/public-key`,
        undefined,
      );
    });
  });

  describe('searchRekorEntries', () => {
    it('should call POST /rekor/search with query and type', async () => {
      mockResponse({});

      await client.searchRekorEntries('user@example.com', 'email');

      expect(fetchFn).toHaveBeenCalledWith(`${mockBaseUrl}/rekor/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'user@example.com', type: 'email' }),
      });
    });
  });

  describe('getRekorEntryByIndex', () => {
    it('should call GET /rekor/entries-by-index/:logIndex', async () => {
      mockResponse({});

      await client.getRekorEntryByIndex('12345');

      expect(fetchFn).toHaveBeenCalledWith(
        `${mockBaseUrl}/rekor/entries-by-index/12345`,
        undefined,
      );
    });
  });

  describe('error handling', () => {
    it('should throw on non-ok response', async () => {
      mockResponse({ error: 'not found' }, false, 404);

      await expect(client.healthCheck()).rejects.toThrow(
        'RHTAS API request failed: 404 Error - {"error":"not found"}',
      );
    });
  });
});
