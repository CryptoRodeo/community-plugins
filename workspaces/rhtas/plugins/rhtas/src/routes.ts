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
import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'rhtas',
});

export const trustRootRouteRef = createSubRouteRef({
  id: 'rhtas:trust-root',
  parent: rootRouteRef,
  path: '/trust-root',
});

export const artifactsRouteRef = createSubRouteRef({
  id: 'rhtas:artifacts',
  parent: rootRouteRef,
  path: '/artifacts',
});

export const rekorSearchRouteRef = createSubRouteRef({
  id: 'rhtas:rekor-search',
  parent: rootRouteRef,
  path: '/rekor',
});

export const rekorEntryRouteRef = createSubRouteRef({
  id: 'rhtas:rekor-entry',
  parent: rootRouteRef,
  path: '/rekor/:logIndex',
});
