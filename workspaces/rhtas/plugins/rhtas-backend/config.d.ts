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
export interface Config {
  rhtas: {
    /**
     * URL of the RHTAS console backend.
     * @visibility backend
     */
    consoleUrl: string;

    /**
     * URL of the Rekor transparency log instance.
     * Defaults to https://rekor.sigstore.dev
     * @visibility backend
     */
    rekorUrl?: string;

    /**
     * Default TUF repository URL.
     * Defaults to https://tuf-repo-cdn.sigstore.dev
     * @visibility backend
     */
    tufRepoUrl?: string;
  };
}
