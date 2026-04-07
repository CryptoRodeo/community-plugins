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
import { createApiRef } from '@backstage/core-plugin-api';
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

/**
 * API interface for the RHTAS plugin.
 * @public
 */
export interface RhtasApi {
  healthCheck(): Promise<HealthResponse>;
  verifyArtifact(
    request: VerifyArtifactRequest,
  ): Promise<VerifyArtifactResponse>;
  getImageMetadata(uri: string): Promise<ImageMetadataResponse>;
  getArtifactPolicies(artifact: string): Promise<ArtifactPolicies>;
  getTrustConfig(tufRepoUrl?: string): Promise<TrustConfig>;
  getRootMetadataInfo(tufRepoUrl?: string): Promise<RootMetadataInfoList>;
  getTargets(tufRepoUrl?: string): Promise<TargetsList>;
  getTarget(target: string, tufRepoUrl?: string): Promise<TargetContent>;
  getTargetCertificates(tufRepoUrl?: string): Promise<CertificateInfoList>;
  getRekorEntry(uuid: string): Promise<TransparencyLogEntry>;
  getRekorPublicKey(): Promise<RekorPublicKey>;
  searchRekorEntries(query: string, type: string): Promise<TlogEntries>;
  getRekorEntryByIndex(logIndex: string): Promise<TlogEntries>;
}

/**
 * API reference for the RHTAS plugin.
 * @public
 */
export const rhtasApiRef = createApiRef<RhtasApi>({
  id: 'plugin.rhtas.api',
});
