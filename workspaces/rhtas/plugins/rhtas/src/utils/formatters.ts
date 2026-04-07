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
import {
  ParsedCertificate,
  RekorSearchType,
} from '@backstage-community/plugin-rhtas-common';

dayjs.extend(relativeTime);

/** Standard date format for rendering dates in tables. */
export const RENDER_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/** Format a date string to a human-readable format. Returns empty string if value is falsy. */
export function formatDate(value?: string | null): string {
  return value ? dayjs(value).format(RENDER_DATE_FORMAT) : '';
}

/** Case-insensitive substring matcher for filter categories. */
export function stringMatcher(filterValue: string, value: string): boolean {
  if (!value) return false;
  return value.toLowerCase().includes(filterValue.toLowerCase());
}

/** Format an ISO date string to a short date format (e.g. "Jan 15, 2025"). */
export function formatShortDate(isoString: string): string {
  return dayjs(isoString).format('MMM DD, YYYY');
}

/** Truncate a hash value for display, showing first N characters. */
export function truncateHash(hash: string, length = 16): string {
  if (hash.length <= length) {
    return hash;
  }
  return `${hash.substring(0, length)}...`;
}

/** Format bytes to human-readable file size. */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Auto-detect the type of Rekor search query based on input pattern.
 * Recognizes: log index (numeric), UUID (64-char hex), SHA256 hash,
 * email address, commit hash (40-char hex).
 */
export function detectSearchType(input: string): RekorSearchType {
  const trimmed = input.trim();

  if (/^\d+$/.test(trimmed)) {
    return 'logIndex';
  }

  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return 'uuid';
  }

  if (/^sha256:[0-9a-fA-F]{64}$/.test(trimmed)) {
    return 'hash';
  }

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return 'email';
  }

  if (/^[0-9a-fA-F]{40}$/.test(trimmed)) {
    return 'commitHash';
  }

  if (/^[0-9a-fA-F]+$/.test(trimmed)) {
    return 'hash';
  }

  return 'email';
}

/**
 * Extract the primary identity string from a ParsedCertificate.
 * Prefers SAN email > SAN URI > subject CN.
 */
export function toIdentity(cert: ParsedCertificate): string {
  if (cert.sans.length > 0) {
    return cert.sans[0];
  }
  return cert.subject || 'Unknown';
}

/**
 * Map a verification status string to a PatternFly Label color.
 * 'verified' → 'green', 'failed' → 'red', 'unsigned' → 'grey'.
 */
export function verificationStatusToLabelColor(
  status: string,
): 'green' | 'red' | 'grey' {
  switch (status) {
    case 'verified':
      return 'green';
    case 'failed':
      return 'red';
    default:
      return 'grey';
  }
}

/** Convert a Date to a human-readable relative time string (e.g. '3 days ago'). */
export function relativeDateString(date: Date): string {
  return dayjs().to(date);
}

/** Capitalize the first letter of a string. */
export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Locale-aware numeric string comparison. */
function localeNumericCompare(a: string, b: string, locale: string): number {
  return a.localeCompare(b, locale ?? 'en', { numeric: true });
}

/** Universal comparator: numeric comparison for numbers, locale-aware string comparison otherwise. */
export function universalComparator(a: any, b: any, locale: string): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  const strA = a === null || a === undefined ? '' : String(a);
  const strB = b === null || b === undefined ? '' : String(b);
  return localeNumericCompare(strA, strB, locale);
}
