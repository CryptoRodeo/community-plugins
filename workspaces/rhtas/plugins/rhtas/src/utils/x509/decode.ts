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

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { X509Certificate } from '@peculiar/x509';
import { EXTENSIONS_CONFIG } from './extensions';

dayjs.extend(relativeTime);

function toRelativeDateString(date: Date): string {
  return `${dayjs().to(date)} (${dayjs(date).format()})`;
}

function bufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map(x => x.toString(16).padStart(2, '0'))
    .join(':');
}

export function decodex509(rawCertificate: string) {
  const cert = new X509Certificate(rawCertificate);
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  const decodedExtensions: Record<string, {}> = {};
  for (const extension of cert.extensions) {
    const criticalLabel = extension.critical ? ' (critical)' : '';

    const config = EXTENSIONS_CONFIG[extension.type];
    if (config) {
      decodedExtensions[`${config.name}${criticalLabel}`] =
        config.toJSON(extension);
    } else {
      const text = bufferToHex(extension.value);
      decodedExtensions[`${extension.type}${criticalLabel}`] = text;
    }
  }

  const decodedCert = {
    data: {
      'Serial Number': `0x${cert.serialNumber}`,
    },
    Signature: {
      Issuer: cert.issuer,
      Validity: {
        'Not Before': toRelativeDateString(cert.notBefore),
        'Not After': toRelativeDateString(cert.notAfter),
      },
      Algorithm: cert.publicKey.algorithm,
      Subject: cert.subjectName,
    },
    'X509v3 extensions': decodedExtensions,
  };
  return decodedCert;
}

export function hasValidPublicCertificate(decoded: string): boolean {
  // Check if it's a certificate (not just a public key)
  if (!decoded.includes('BEGIN CERTIFICATE')) {
    return false;
  }

  // Try to parse the certificate
  const cert = new X509Certificate(decoded);
  const now = new Date();
  if (cert.notBefore > now || cert.notAfter < now) {
    return false;
  }

  return true;
}
