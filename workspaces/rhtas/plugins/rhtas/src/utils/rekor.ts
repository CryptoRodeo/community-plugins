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
import { TransparencyLogEntry } from '@backstage-community/plugin-rhtas-common';

/**
 * Convert a Unix epoch timestamp (seconds) to a formatted date string.
 */
export function formatIntegratedTime(epoch: number): string {
  return dayjs.unix(epoch).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * Extract and hex-encode the signed entry timestamp (SET) from a
 * TransparencyLogEntry's verification.signedEntryTimestamp field.
 * The SET is base64-encoded; this returns it as a hex string.
 */
export function getRekorSetBytes(entry: TransparencyLogEntry): string {
  const set = entry.inclusionPromise?.signedEntryTimestamp;
  if (!set) return '';

  try {
    const binary = atob(set);
    return Array.from(binary, byte =>
      byte.charCodeAt(0).toString(16).padStart(2, '0'),
    ).join('');
  } catch {
    return set;
  }
}

/**
 * Extract the entry type (kind) from a Rekor entry's base64-encoded
 * canonicalized body.
 */
export function getRekorEntryType(body: string): string {
  try {
    const decoded = JSON.parse(atob(body));
    return decoded.kind ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Base64 decode and JSON parse a Rekor entry's canonicalized body.
 */
export function decodeCanonicalizedBody(
  base64Body: string,
): Record<string, unknown> | null {
  try {
    return JSON.parse(atob(base64Body));
  } catch {
    return null;
  }
}

/**
 * Extract hash algorithm and value from a decoded Rekor entry spec.
 */
export function extractHashFromSpec(
  spec: Record<string, unknown>,
): { algorithm: string; value: string } | null {
  const data = spec.data as Record<string, unknown> | undefined;
  const hash = data?.hash as Record<string, unknown> | undefined;
  if (hash?.algorithm && hash?.value) {
    return {
      algorithm: hash.algorithm as string,
      value: hash.value as string,
    };
  }
  return null;
}
