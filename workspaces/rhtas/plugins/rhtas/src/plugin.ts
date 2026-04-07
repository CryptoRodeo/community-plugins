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
import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { rhtasApiRef } from './api/RhtasApi';
import { RhtasClient } from './api/RhtasClient';
import { rootRouteRef } from './routes';

/**
 * The RHTAS frontend plugin.
 * @public
 */
export const rhtasPlugin = createPlugin({
  id: 'rhtas',
  apis: [
    createApiFactory({
      api: rhtasApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new RhtasClient({ discoveryApi, fetchApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

/**
 * Entity content component for the Trust Root tab.
 * @public
 */
export const EntityRhtasTrustRootContent = rhtasPlugin.provide(
  createRoutableExtension({
    name: 'EntityRhtasTrustRootContent',
    component: () =>
      import('./components/withDarkMode').then(
        m => m.TrustRootPageWithDarkMode,
      ),
    mountPoint: rootRouteRef,
  }),
);

/**
 * Entity content component for the Artifacts tab.
 * @public
 */
export const EntityRhtasArtifactsContent = rhtasPlugin.provide(
  createRoutableExtension({
    name: 'EntityRhtasArtifactsContent',
    component: () =>
      import('./components/withDarkMode').then(
        m => m.ArtifactsPageWithDarkMode,
      ),
    mountPoint: rootRouteRef,
  }),
);

/**
 * Entity content component for the Rekor Search tab.
 * @public
 */
export const EntityRhtasRekorContent = rhtasPlugin.provide(
  createRoutableExtension({
    name: 'EntityRhtasRekorContent',
    component: () =>
      import('./components/withDarkMode').then(m => m.RekorRouterWithDarkMode),
    mountPoint: rootRouteRef,
  }),
);

/**
 * Entity content component with Artifacts and Rekor tabs.
 * @public
 */
export const EntityRhtasOperationsContent = rhtasPlugin.provide(
  createRoutableExtension({
    name: 'EntityRhtasOperationsContent',
    component: () =>
      import('./components/withDarkMode').then(
        m => m.RhtasOperationsContentWithDarkMode,
      ),
    mountPoint: rootRouteRef,
  }),
);
