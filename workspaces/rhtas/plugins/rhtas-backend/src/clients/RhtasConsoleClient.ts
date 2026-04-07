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
import type {
  HealthResponse,
  VerifyArtifactRequest,
  VerifyArtifactResponse,
  ImageMetadataResponse,
  ArtifactPolicies,
  TrustConfig,
  RootMetadataInfoList,
  TargetsList,
  TargetContent,
  CertificateInfoList,
  TransparencyLogEntry,
  RekorPublicKey,
} from '@backstage-community/plugin-rhtas-common';
import fetch from 'node-fetch';

/** Error that preserves the upstream HTTP status code. */
export class ConsoleHttpError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
    this.name = 'ConsoleHttpError';
  }
}

export class RhtasConsoleClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  async healthCheck(): Promise<HealthResponse> {
    return this.get('/healthz');
  }

  async verifyArtifact(
    request: VerifyArtifactRequest,
  ): Promise<VerifyArtifactResponse> {
    return this.post('/api/v1/artifacts/verify', request);
  }

  async getImageMetadata(uri: string): Promise<ImageMetadataResponse> {
    return this.get(`/api/v1/artifacts/image?uri=${encodeURIComponent(uri)}`);
  }

  async getArtifactPolicies(artifact: string): Promise<ArtifactPolicies> {
    return this.get(
      `/api/v1/artifacts/${encodeURIComponent(artifact)}/policies`,
    );
  }

  async getTrustConfig(tufRepoUrl?: string): Promise<TrustConfig> {
    const params = tufRepoUrl
      ? `?tufRepoUrl=${encodeURIComponent(tufRepoUrl)}`
      : '';
    return this.get(`/api/v1/trust/config${params}`);
  }

  async getRootMetadataInfo(
    tufRepoUrl?: string,
  ): Promise<RootMetadataInfoList> {
    const params = tufRepoUrl
      ? `?tufRepoUrl=${encodeURIComponent(tufRepoUrl)}`
      : '';
    return this.get(`/api/v1/trust/root-metadata-info${params}`);
  }

  async getTargets(tufRepoUrl?: string): Promise<TargetsList> {
    const params = tufRepoUrl
      ? `?tufRepoUrl=${encodeURIComponent(tufRepoUrl)}`
      : '';
    return this.get(`/api/v1/trust/targets${params}`);
  }

  async getTarget(target: string, tufRepoUrl?: string): Promise<TargetContent> {
    const params = new URLSearchParams();
    params.set('target', target);
    if (tufRepoUrl) {
      params.set('tufRepoUrl', tufRepoUrl);
    }
    return this.get(`/api/v1/trust/target?${params.toString()}`);
  }

  async getTargetCertificates(
    tufRepoUrl?: string,
  ): Promise<CertificateInfoList> {
    const params = tufRepoUrl
      ? `?tufRepoUrl=${encodeURIComponent(tufRepoUrl)}`
      : '';
    return this.get(`/api/v1/trust/targets/certificates${params}`);
  }

  async getRekorEntry(uuid: string): Promise<TransparencyLogEntry> {
    return this.get(`/api/v1/rekor/entries/${encodeURIComponent(uuid)}`);
  }

  async getRekorPublicKey(): Promise<RekorPublicKey> {
    return this.get('/api/v1/rekor/public-key');
  }

  private async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`);
    if (!response.ok) {
      throw new ConsoleHttpError(
        `RHTAS console request failed: ${response.status} ${response.statusText}`,
        response.status,
      );
    }
    return response.json() as Promise<T>;
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new ConsoleHttpError(
        `RHTAS console request failed: ${response.status} ${response.statusText}`,
        response.status,
      );
    }
    return response.json() as Promise<T>;
  }
}
