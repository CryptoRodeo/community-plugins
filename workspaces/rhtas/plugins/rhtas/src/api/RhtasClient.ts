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
import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import {
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
  TlogEntries,
} from '@backstage-community/plugin-rhtas-common';
import { RhtasApi } from './RhtasApi';

/**
 * Implementation of the RHTAS API client.
 * @public
 */
export class RhtasClient implements RhtasApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  private async getBaseUrl(): Promise<string> {
    return this.discoveryApi.getBaseUrl('rhtas');
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(`${baseUrl}${path}`, init);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `RHTAS API request failed: ${response.status} ${response.statusText} - ${text}`,
      );
    }
    return response.json() as Promise<T>;
  }

  async healthCheck(): Promise<HealthResponse> {
    return this.request('/health');
  }

  async verifyArtifact(
    request: VerifyArtifactRequest,
  ): Promise<VerifyArtifactResponse> {
    return this.request('/artifacts/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  async getImageMetadata(uri: string): Promise<ImageMetadataResponse> {
    const params = new URLSearchParams({ uri });
    return this.request(`/artifacts/image?${params}`);
  }

  async getArtifactPolicies(artifact: string): Promise<ArtifactPolicies> {
    return this.request(`/artifacts/${encodeURIComponent(artifact)}/policies`);
  }

  async getTrustConfig(tufRepoUrl?: string): Promise<TrustConfig> {
    const params = new URLSearchParams();
    if (tufRepoUrl) params.set('tufRepoUrl', tufRepoUrl);
    const query = params.toString();
    return this.request(`/trust/config${query ? `?${query}` : ''}`);
  }

  async getRootMetadataInfo(
    tufRepoUrl?: string,
  ): Promise<RootMetadataInfoList> {
    const params = new URLSearchParams();
    if (tufRepoUrl) params.set('tufRepoUrl', tufRepoUrl);
    const query = params.toString();
    return this.request(`/trust/root-metadata-info${query ? `?${query}` : ''}`);
  }

  async getTargets(tufRepoUrl?: string): Promise<TargetsList> {
    const params = new URLSearchParams();
    if (tufRepoUrl) params.set('tufRepoUrl', tufRepoUrl);
    const query = params.toString();
    return this.request(`/trust/targets${query ? `?${query}` : ''}`);
  }

  async getTarget(target: string, tufRepoUrl?: string): Promise<TargetContent> {
    const params = new URLSearchParams({ target });
    if (tufRepoUrl) params.set('tufRepoUrl', tufRepoUrl);
    return this.request(`/trust/target?${params}`);
  }

  async getTargetCertificates(
    tufRepoUrl?: string,
  ): Promise<CertificateInfoList> {
    const params = new URLSearchParams();
    if (tufRepoUrl) params.set('tufRepoUrl', tufRepoUrl);
    const query = params.toString();
    return this.request(
      `/trust/targets/certificates${query ? `?${query}` : ''}`,
    );
  }

  async getRekorEntry(uuid: string): Promise<TransparencyLogEntry> {
    return this.request(`/rekor/entries/${encodeURIComponent(uuid)}`);
  }

  async getRekorPublicKey(): Promise<RekorPublicKey> {
    return this.request('/rekor/public-key');
  }

  async searchRekorEntries(query: string, type: string): Promise<TlogEntries> {
    return this.request('/rekor/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, type }),
    });
  }

  async getRekorEntryByIndex(logIndex: string): Promise<TlogEntries> {
    return this.request(
      `/rekor/entries-by-index/${encodeURIComponent(logIndex)}`,
    );
  }
}
