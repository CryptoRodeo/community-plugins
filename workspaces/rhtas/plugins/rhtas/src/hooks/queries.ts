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
import { useQuery } from '@tanstack/react-query';
import { useApi } from '@backstage/core-plugin-api';
import { rhtasApiRef } from '../api/RhtasApi';
import { VerifyArtifactRequest } from '@backstage-community/plugin-rhtas-common';

/** Fetch trust configuration. */
export function useTrustConfig(tufRepoUrl?: string) {
  const api = useApi(rhtasApiRef);
  return useQuery({
    queryKey: ['rhtas', 'trustConfig', tufRepoUrl],
    queryFn: () => api.getTrustConfig(tufRepoUrl),
  });
}

/** Fetch TUF root metadata info. */
export function useTrustRootMetadata(tufRepoUrl?: string) {
  const api = useApi(rhtasApiRef);
  return useQuery({
    queryKey: ['rhtas', 'rootMetadata', tufRepoUrl],
    queryFn: () => api.getRootMetadataInfo(tufRepoUrl),
  });
}

/** Fetch target certificates from the trust store. */
export function useTrustTargetCertificates(tufRepoUrl?: string) {
  const api = useApi(rhtasApiRef);
  return useQuery({
    queryKey: ['rhtas', 'targetCertificates', tufRepoUrl],
    queryFn: () => api.getTargetCertificates(tufRepoUrl),
  });
}

/** Verify an artifact's signatures and attestations. */
export function useVerifyArtifact(request: VerifyArtifactRequest | undefined) {
  const api = useApi(rhtasApiRef);
  return useQuery({
    queryKey: ['rhtas', 'verifyArtifact', request?.ociImage],
    queryFn: () => api.verifyArtifact(request!),
    enabled: !!request?.ociImage,
  });
}

/** Fetch image metadata for a container image URI. */
export function useImageMetadata(uri: string | undefined) {
  const api = useApi(rhtasApiRef);
  return useQuery({
    queryKey: ['rhtas', 'imageMetadata', uri],
    queryFn: () => api.getImageMetadata(uri!),
    enabled: !!uri,
  });
}

/** Search Rekor transparency log entries. */
export function useRekorSearch(
  query: string | undefined,
  type: string | undefined,
) {
  const api = useApi(rhtasApiRef);
  return useQuery({
    queryKey: ['rhtas', 'rekorSearch', query, type],
    queryFn: () => api.searchRekorEntries(query!, type!),
    enabled: !!query && !!type,
  });
}

/** Fetch a single Rekor entry by log index. */
export function useRekorEntry(logIndex: string | undefined) {
  const api = useApi(rhtasApiRef);
  return useQuery({
    queryKey: ['rhtas', 'rekorEntry', logIndex],
    queryFn: () => api.getRekorEntryByIndex(logIndex!),
    enabled: !!logIndex,
  });
}
