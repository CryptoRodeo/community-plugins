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
import { SignatureView, AttestationView } from './signatures';

/**
 * Request body for verifying an artifact.
 * Matches the rhtas-console OpenAPI VerifyArtifactRequest schema.
 */
export interface VerifyArtifactRequest {
  ociImage: string;
  tufRepoUrl?: string;
  bundle?: Record<string, unknown>;
  artifactDigest?: string;
  artifactDigestAlgorithm?: string;
  expectedOIDIssuer?: string;
  expectedOIDIssuerRegex?: string;
  expectedSAN?: string;
  expectedSANRegex?: string;
  requireTimestamp?: boolean;
  requireCTLog?: boolean;
  requireTLog?: boolean;
  minBundleVersion?: string;
  predicateType?: string;
}

/**
 * Response from verifying an artifact, containing signatures, attestations,
 * a summary, and the artifact metadata.
 */
export interface VerifyArtifactResponse {
  signatures: SignatureView[];
  attestations: AttestationView[];
  summary: ArtifactSummaryView;
  artifact: ImageMetadataResponse;
}

/**
 * Metadata for a container image (mediaType, size, created, labels).
 */
export interface Metadata {
  mediaType: string;
  size: number;
  created?: string;
  labels?: Record<string, string>;
}

/**
 * Response containing container image metadata and digest.
 */
export interface ImageMetadataResponse {
  image?: string;
  registry: string;
  metadata: Metadata;
  digest: string;
}

/**
 * Policy applied to an artifact.
 */
export interface ArtifactPolicy {
  name?: string;
  status?: string;
  lastChecked?: string;
}

/**
 * Attestation entry within artifact policies.
 */
export interface ArtifactPolicyAttestation {
  type?: string;
  issuer?: string;
  subject?: string;
  issuedAt?: string;
}

/**
 * Policies and attestations applied to an artifact.
 */
export interface ArtifactPolicies {
  artifact: string;
  policies: ArtifactPolicy[];
  attestations: ArtifactPolicyAttestation[];
}

/**
 * Summary view of an artifact's verification status.
 */
export interface ArtifactSummaryView {
  overallStatus: 'verified' | 'failed' | 'unsigned';
  identities: ArtifactIdentity[];
  signatureCount: number;
  attestationCount: number;
  rekorEntryCount: number;
  timeCoherence?: TimeCoherenceSummary;
}

/**
 * Identity associated with an artifact.
 */
export interface ArtifactIdentity {
  id: number;
  type: string;
  value: string;
  issuer?: string;
  source: ArtifactIdentitySource;
}

/**
 * Source of an artifact identity.
 */
export type ArtifactIdentitySource = 'san' | 'issuer' | 'other';

/**
 * Summary of time coherence verification.
 */
export interface TimeCoherenceSummary {
  status: 'ok' | 'warning' | 'error' | 'unknown';
  minIntegratedTime?: string;
  maxIntegratedTime?: string;
}
