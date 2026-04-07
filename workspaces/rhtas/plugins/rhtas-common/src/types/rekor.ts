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

/**
 * A transparency log entry as returned by the rhtas-console API.
 * Used inside SignatureView and AttestationView.
 */
export interface TransparencyLogEntry {
  logIndex: number;
  logId?: LogId;
  kindVersion?: KindVersion;
  integratedTime: number;
  inclusionPromise?: InclusionPromise;
  inclusionProof?: InclusionProof;
  canonicalizedBody: string;
}

/**
 * Log identifier (from the console API).
 */
export interface LogId {
  keyId: string;
}

/**
 * Kind and version of a Rekor entry.
 */
export interface KindVersion {
  kind: string;
  version: string;
}

/**
 * Inclusion promise from the transparency log.
 */
export interface InclusionPromise {
  signedEntryTimestamp: string;
}

/**
 * Inclusion proof from the transparency log.
 */
export interface InclusionProof {
  checkpoint?: Checkpoint;
  hashes: string[];
  logIndex: number;
  rootHash: string;
  treeSize: number;
}

/**
 * Checkpoint from the transparency log.
 */
export interface Checkpoint {
  envelope: string;
}

/**
 * Verification data for a raw Rekor log entry.
 */
export interface Verification {
  inclusionProof?: RawInclusionProof;
  signedEntryTimestamp?: string;
}

/**
 * Inclusion proof as returned by the raw Rekor API.
 */
export interface RawInclusionProof {
  checkpoint?: string;
  hashes: string[];
  logIndex: number;
  rootHash: string;
  treeSize: number;
}

/**
 * A raw Rekor log entry as returned directly by the Rekor API.
 * Used for Rekor search results and entry detail pages.
 */
export interface RawRekorLogEntry {
  body: string;
  integratedTime: number;
  logID: string;
  logIndex: number;
  verification?: Verification;
  attestation?: {
    data: string;
  };
}

/**
 * Public key from the Rekor instance (console API format).
 */
export interface RekorPublicKey {
  publicKey: string;
}

/**
 * Collection of raw Rekor log entries keyed by UUID.
 */
export type TlogEntries = Record<string, RawRekorLogEntry>;

/**
 * Search type for Rekor queries.
 */
export type RekorSearchType =
  | 'email'
  | 'hash'
  | 'commitHash'
  | 'uuid'
  | 'logIndex';

/**
 * Parameters for searching the Rekor transparency log.
 */
export interface RekorSearchParams {
  query: string;
  type: RekorSearchType;
}
