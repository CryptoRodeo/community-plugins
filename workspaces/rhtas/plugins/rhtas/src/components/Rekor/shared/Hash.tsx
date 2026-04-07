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
import { getHash, getShortCommitHash } from '../../../utils/spec';

export function Hash({
  type,
  spec,
  variant = 'default',
}: {
  type: string;
  spec: unknown;
  variant?: 'default' | 'short';
}) {
  const commitHash = getHash({ type, spec });
  if (!commitHash) return <div>Unsupported type</div>;
  return (
    <>{variant === 'short' ? getShortCommitHash(commitHash) : commitHash}</>
  );
}
