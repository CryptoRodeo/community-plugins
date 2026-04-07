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

import { dump } from 'js-yaml';
import { decodex509, hasValidPublicCertificate } from './x509/decode';

interface SpecInput {
  type: string;
  spec: unknown;
  apiVersion?: string;
}

/** Shape of hashedrekord/rekord spec */
interface RekorSpec {
  data: { hash?: { algorithm: string; value: string } };
  signature: { content?: string; publicKey?: { content?: string } };
}

/** Shape of intoto v0.0.1 spec */
interface IntotoV001Spec {
  publicKey?: string;
  content: { payloadHash?: { algorithm: string; value: string } };
}

/** Shape of intoto v0.0.2 spec */
interface IntotoV002Spec {
  content: {
    envelope?: { signatures: Array<{ sig?: string; publicKey?: string }> };
    payloadHash?: { algorithm: string; value: string };
  };
}

/** Shape of dsse v0.0.1 spec */
interface DSSESpec {
  payloadHash?: { algorithm: string; value: string };
  signatures?: Array<{ signature?: string; verifier?: string }>;
}

export function getHash({ type, spec }: SpecInput): string | null {
  switch (type) {
    case 'hashedrekord':
    case 'rekord': {
      const s = spec as RekorSpec;
      return `${s.data.hash?.algorithm}:${s.data.hash?.value}`;
    }
    case 'intoto': {
      const s = spec as IntotoV001Spec | IntotoV002Spec;
      return `${s.content.payloadHash?.algorithm}:${s.content.payloadHash?.value}`;
    }
    case 'dsse': {
      const s = spec as DSSESpec;
      return `${s.payloadHash?.algorithm}:${s.payloadHash?.value}`;
    }
    default:
      return null;
  }
}

export function getShortCommitHash(hash: string): string {
  if (hash === '-') {
    return '-';
  }
  const hashValue = hash.includes(':') ? hash.split(':')[1] : hash;
  return hashValue.slice(0, 7);
}

export function getSignature({
  type,
  spec,
  apiVersion,
}: SpecInput): string | null {
  switch (type) {
    case 'hashedrekord':
    case 'rekord': {
      const s = spec as RekorSpec;
      return s.signature.content ?? '';
    }
    case 'intoto': {
      if (apiVersion === '0.0.1') {
        return 'Missing for intoto v0.0.1 entries';
      }
      const s = spec as IntotoV002Spec;
      const signature = s.content.envelope?.signatures[0];
      return window.atob(signature?.sig || '');
    }
    case 'dsse': {
      const s = spec as DSSESpec;
      const sig = s.signatures?.[0];
      return sig?.signature ?? '';
    }
    default:
      return null;
  }
}

function getRawPublicKeyCert({
  type,
  spec,
  apiVersion,
}: SpecInput): string | null {
  switch (type) {
    case 'hashedrekord':
    case 'rekord': {
      const s = spec as RekorSpec;
      return window.atob(s.signature.publicKey?.content ?? '');
    }
    case 'intoto': {
      if (apiVersion === '0.0.1') {
        const s = spec as IntotoV001Spec;
        return window.atob(s.publicKey || '');
      }
      const s = spec as IntotoV002Spec;
      const signature = s.content.envelope?.signatures[0];
      return window.atob(signature?.publicKey || '');
    }
    case 'dsse': {
      const s = spec as DSSESpec;
      const sig = s.signatures?.[0];
      return window.atob(sig?.verifier ?? '');
    }
    default:
      return null;
  }
}

export function getPublicKeyContent(input: SpecInput): string | null {
  const certContent = getRawPublicKeyCert(input);
  if (certContent === null) return null;

  if (certContent.includes('BEGIN CERTIFICATE')) {
    return dump(decodex509(certContent), {
      noArrayIndent: true,
      lineWidth: -1,
    });
  }
  return certContent;
}

export function isPublicKeyValid(input: SpecInput): boolean {
  const certContent = getRawPublicKeyCert(input);
  if (certContent === null) return false;
  return hasValidPublicCertificate(certContent);
}
