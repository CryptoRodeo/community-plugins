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
 * A Fulcio certificate authority entry.
 */
export interface FulcioCertAuthority {
  subject: string;
  pem: string;
}

/**
 * Trust configuration from the TUF repository.
 */
export interface TrustConfig {
  fulcioCertAuthorities: FulcioCertAuthority[];
}

/**
 * Information about a TUF root metadata entry.
 */
export interface RootMetadataInfo {
  version: string;
  expires: string;
  status: string;
}

/**
 * List of root metadata entries.
 */
export interface RootMetadataInfoList {
  'repo-url'?: string;
  data: RootMetadataInfo[];
}

/**
 * Information about a TUF target.
 */
export interface TargetInfo {
  name: string;
  type: string;
  status: string;
  content: string;
}

/**
 * List of TUF targets.
 */
export interface TargetsList {
  data: TargetInfo[];
}

/**
 * Content of a TUF target.
 */
export interface TargetContent {
  content: string;
}

/**
 * Information about a certificate in the trust store.
 */
export interface CertificateInfo {
  subject: string;
  issuer: string;
  type: string;
  status: string;
  target: string;
  expiration: string;
  pem: string;
}

/**
 * List of certificates in the trust store.
 */
export interface CertificateInfoList {
  data: CertificateInfo[];
}
