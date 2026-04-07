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
import * as x509 from '@peculiar/x509';

/** Parsed certificate details. */
export interface ParsedCertificateDetails {
  subject: string;
  issuer: string;
  notBefore: Date;
  notAfter: Date;
  serialNumber: string;
}

/** Certificate status based on expiration. */
export type CertificateHealthStatus = 'active' | 'expiring' | 'expired';

/** Expiration warning threshold in days. */
const EXPIRING_THRESHOLD_DAYS = 30;

/**
 * Parse a PEM-encoded certificate and return its details.
 * Returns null if the PEM cannot be parsed.
 */
export function parsePemCertificate(
  pem: string,
): ParsedCertificateDetails | null {
  try {
    const cert = new x509.X509Certificate(pem);
    return {
      subject: cert.subject,
      issuer: cert.issuer,
      notBefore: cert.notBefore,
      notAfter: cert.notAfter,
      serialNumber: cert.serialNumber,
    };
  } catch {
    return null;
  }
}

/**
 * Determine the health status of a certificate based on its expiration date.
 * Returns 'expired' if past notAfter, 'expiring' if within 30 days of
 * expiration, or 'active' otherwise.
 */
export function getCertificateStatus(
  notAfter: Date | string,
): CertificateHealthStatus {
  const expiration =
    typeof notAfter === 'string' ? new Date(notAfter) : notAfter;
  const now = new Date();

  if (expiration <= now) {
    return 'expired';
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const daysUntilExpiry = (expiration.getTime() - now.getTime()) / msPerDay;

  if (daysUntilExpiry <= EXPIRING_THRESHOLD_DAYS) {
    return 'expiring';
  }

  return 'active';
}

/**
 * Format a certificate subject DN for display.
 * Extracts the CN (Common Name) if present, otherwise returns the full subject.
 */
export function formatCertificateSubject(subject: string): string {
  const cnMatch = subject.match(/CN=([^,]+)/);
  return cnMatch ? cnMatch[1] : subject;
}

/**
 * Compute a SHA256 fingerprint from a PEM-encoded certificate.
 * Returns the fingerprint as a colon-separated hex string.
 */
export async function sha256FingerprintFromPem(pem: string): Promise<string> {
  const base64 = pem
    .replace(/-----BEGIN CERTIFICATE-----/, '')
    .replace(/-----END CERTIFICATE-----/, '')
    .replace(/\s/g, '');
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const digest = await window.crypto.subtle.digest('SHA-256', bytes);
  const hashArray = Array.from(new Uint8Array(digest));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join(':');
}
