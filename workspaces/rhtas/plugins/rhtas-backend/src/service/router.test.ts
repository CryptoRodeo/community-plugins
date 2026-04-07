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
import express from 'express';
import request from 'supertest';
import { createRouter } from './router';
import { LoggerService } from '@backstage/backend-plugin-api';
import { ConfigReader } from '@backstage/config';

// Mock node-fetch
jest.mock('node-fetch');
const mockFetch = require('node-fetch') as jest.MockedFunction<
  typeof import('node-fetch').default
>;

function makeMockResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: async () => body,
  } as unknown as import('node-fetch').Response;
}

describe('createRouter', () => {
  let app: express.Express;

  const mockLogger: LoggerService = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis(),
  };

  const mockConfig = new ConfigReader({
    rhtas: {
      consoleUrl: 'http://localhost:8080',
      rekorUrl: 'http://localhost:3000',
    },
  });

  const mockHttpAuth = {
    credentials: jest.fn(),
    issueUserCookie: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const router = await createRouter({
      logger: mockLogger,
      config: mockConfig,
      httpAuth: mockHttpAuth as any,
    });
    app = express().use(router);
  });

  describe('GET /health', () => {
    it('returns health status from console', async () => {
      mockFetch.mockResolvedValueOnce(makeMockResponse({ status: 'ok' }));
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });

    it('returns 502 when console is unreachable', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection refused'));
      const res = await request(app).get('/health');
      expect(res.status).toBe(502);
      expect(res.body.error).toBe('RHTAS console is unreachable');
    });
  });

  describe('POST /artifacts/verify', () => {
    it('returns 400 when ociImage is missing', async () => {
      const res = await request(app).post('/artifacts/verify').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('ociImage is required');
    });

    it('forwards verify request to console', async () => {
      const mockResult = {
        signatures: [],
        attestations: [],
        summary: {},
        artifact: {},
      };
      mockFetch.mockResolvedValueOnce(makeMockResponse(mockResult));
      const res = await request(app)
        .post('/artifacts/verify')
        .send({ ociImage: 'registry.example.com/image:latest' });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockResult);
    });

    it('returns 502 when console fails', async () => {
      mockFetch.mockResolvedValueOnce(makeMockResponse({}, 500));
      const res = await request(app)
        .post('/artifacts/verify')
        .send({ ociImage: 'registry.example.com/image:latest' });
      expect(res.status).toBe(502);
    });
  });

  describe('GET /artifacts/image', () => {
    it('returns 400 when uri is missing', async () => {
      const res = await request(app).get('/artifacts/image');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('uri query parameter is required');
    });

    it('forwards image metadata request', async () => {
      const mockResult = {
        image: 'registry.example.com/image:latest',
        registry: 'registry.example.com',
        digest: 'sha256:abc',
        metadata: {
          mediaType: 'application/vnd.oci.image.manifest.v1+json',
          size: 1024,
          created: '2025-01-01T00:00:00Z',
        },
      };
      mockFetch.mockResolvedValueOnce(makeMockResponse(mockResult));
      const res = await request(app).get(
        '/artifacts/image?uri=registry.example.com/image:latest',
      );
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockResult);
    });
  });

  describe('GET /trust/config', () => {
    it('returns trust config', async () => {
      const mockResult = {
        fulcioCertAuthorities: [],
      };
      mockFetch.mockResolvedValueOnce(makeMockResponse(mockResult));
      const res = await request(app).get('/trust/config');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockResult);
    });

    it('forwards tufRepoUrl query param', async () => {
      mockFetch.mockResolvedValueOnce(makeMockResponse({}));
      await request(app).get(
        '/trust/config?tufRepoUrl=https://custom-tuf.example.com',
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          'tufRepoUrl=https%3A%2F%2Fcustom-tuf.example.com',
        ),
      );
    });
  });

  describe('GET /trust/target', () => {
    it('returns 400 when target is missing', async () => {
      const res = await request(app).get('/trust/target');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('target query parameter is required');
    });
  });

  describe('POST /rekor/search', () => {
    it('returns 400 when query or type is missing', async () => {
      const res = await request(app).post('/rekor/search').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe(
        'query and type are required in request body',
      );
    });

    it('forwards search to Rekor instance', async () => {
      const mockResult = [{ abc: { body: 'test' } }];
      mockFetch.mockResolvedValueOnce(makeMockResponse(mockResult));
      const res = await request(app)
        .post('/rekor/search')
        .send({ query: 'user@example.com', type: 'email' });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockResult);
    });
  });

  describe('GET /rekor/entries-by-index/:logIndex', () => {
    it('forwards request to Rekor instance', async () => {
      const mockResult = { abc: { logIndex: 42 } };
      mockFetch.mockResolvedValueOnce(makeMockResponse(mockResult));
      const res = await request(app).get('/rekor/entries-by-index/42');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockResult);
    });

    it('returns 502 when Rekor is unreachable', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection refused'));
      const res = await request(app).get('/rekor/entries-by-index/42');
      expect(res.status).toBe(502);
    });
  });
});
