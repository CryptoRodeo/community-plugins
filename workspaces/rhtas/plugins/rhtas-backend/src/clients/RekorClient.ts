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
import type {
  RekorSearchParams,
  TlogEntries,
} from '@backstage-community/plugin-rhtas-common';
import fetch from 'node-fetch';

export class RekorClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  async searchLogEntries(params: RekorSearchParams): Promise<TlogEntries[]> {
    const { query, type } = params;

    if (type === 'logIndex') {
      return this.getLogEntriesByIndex(query);
    }

    if (type === 'uuid') {
      const entry = await this.getLogEntryByUuid(query);
      return [entry];
    }

    const searchBody = this.buildSearchBody(query, type);
    const response = await fetch(
      `${this.baseUrl}/api/v1/log/entries/retrieve`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchBody),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Rekor search failed: ${response.status} ${response.statusText}`,
      );
    }

    return response.json() as Promise<TlogEntries[]>;
  }

  async getLogEntryByIndex(logIndex: string): Promise<TlogEntries> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/log/entries?logIndex=${encodeURIComponent(
        logIndex,
      )}`,
    );
    if (!response.ok) {
      throw new Error(
        `Rekor entry lookup failed: ${response.status} ${response.statusText}`,
      );
    }
    return response.json() as Promise<TlogEntries>;
  }

  async getLogEntryByUuid(uuid: string): Promise<TlogEntries> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/log/entries/${encodeURIComponent(uuid)}`,
    );
    if (!response.ok) {
      throw new Error(
        `Rekor entry lookup failed: ${response.status} ${response.statusText}`,
      );
    }
    return response.json() as Promise<TlogEntries>;
  }

  private async getLogEntriesByIndex(logIndex: string): Promise<TlogEntries[]> {
    const entry = await this.getLogEntryByIndex(logIndex);
    return [entry];
  }

  private buildSearchBody(
    query: string,
    type: string,
  ): Record<string, unknown> {
    switch (type) {
      case 'email':
        return { query: { operator: 'and', email: query } };
      case 'hash':
        return {
          query: {
            operator: 'and',
            hash: `sha256:${query.replace(/^sha256:/, '')}`,
          },
        };
      case 'commitHash':
        return { query: { operator: 'and', hash: query } };
      default:
        return { query: { operator: 'and', hash: query } };
    }
  }
}
