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

import { getPublicKeyContent, isPublicKeyValid } from '../../../utils/spec';
import PublicKeyValidity from './PublicKeyValidity';

/** Props: type, spec, apiVersion, variant */
export function PublicKey({
  type,
  spec,
  apiVersion,
  variant = 'content',
}: {
  type: string;
  apiVersion: string;
  spec: unknown;
  variant?: 'content' | 'validity';
}) {
  if (variant === 'validity') {
    return (
      <PublicKeyValidity
        isValid={isPublicKeyValid({ type, spec, apiVersion })}
      />
    );
  }

  const content = getPublicKeyContent({ type, spec, apiVersion });
  if (content === null) return <div>Unsupported type: {type}</div>;

  return (
    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
      {content}
    </div>
  );
}
