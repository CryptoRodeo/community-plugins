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
import { TransparencyLogEntry } from './rekor';

/**
 * Role of a certificate in the chain.
 */
export enum CertificateRole {
  Leaf = 'leaf',
  Intermediate = 'intermediate',
  Root = 'root',
  Unknown = 'unknown',
}

/**
 * Parsed certificate details.
 */
export interface ParsedCertificate {
  role: CertificateRole;
  subject: string;
  issuer: string;
  serialNumber?: string;
  notBefore: string;
  notAfter: string;
  sans: string[];
  isCa: boolean;
  pem: string;
}

/**
 * Status of a signature verification (object with per-aspect status).
 */
export interface SignatureStatus {
  signature: 'verified' | 'failed';
  chain: 'verified' | 'failed';
  rekor: 'verified' | 'failed';
}

/**
 * Status of an attestation verification (object with per-aspect status).
 */
export interface AttestationStatus {
  attestation: 'verified' | 'failed';
  chain: 'verified' | 'failed';
  rekor: 'verified' | 'failed';
}

/**
 * View of a signature with verification details.
 * Matches the rhtas-console OpenAPI SignatureView schema.
 */
export interface SignatureView {
  id: number;
  digest: string;
  signingCertificate: ParsedCertificate;
  certificateChain: ParsedCertificate[];
  rekorEntry?: TransparencyLogEntry;
  rawBundleJson: string;
  timestamp?: string;
  signatureStatus: SignatureStatus;
}

/**
 * View of an attestation with verification details.
 * Matches the rhtas-console OpenAPI AttestationView schema.
 */
export interface AttestationView {
  id: number;
  digest: string;
  signingCertificate?: ParsedCertificate;
  certificateChain?: ParsedCertificate[];
  type: string;
  rekorEntry?: TransparencyLogEntry;
  rawBundleJson: string;
  rawStatementJson: string;
  predicateType: string;
  timestamp?: string;
  payloadType?: string;
  attestationStatus: AttestationStatus;
}
