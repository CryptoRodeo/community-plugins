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
export {
  rhtasPlugin,
  EntityRhtasTrustRootContent,
  EntityRhtasArtifactsContent,
  EntityRhtasRekorContent,
  EntityRhtasOperationsContent,
} from './plugin';
export { rhtasApiRef } from './api/RhtasApi';
export type { RhtasApi } from './api/RhtasApi';
export { RhtasClient } from './api/RhtasClient';
export {
  RHTAS_ANNOTATION,
  isRhtasAvailable,
} from './components/shared/RhtasAnnotation';
export {
  rootRouteRef,
  trustRootRouteRef,
  artifactsRouteRef,
  rekorSearchRouteRef,
  rekorEntryRouteRef,
} from './routes';
export {
  useTrustConfig,
  useTrustRootMetadata,
  useTrustTargetCertificates,
  useVerifyArtifact,
  useImageMetadata,
  useRekorSearch,
  useRekorEntry,
} from './hooks/queries';
export { useTableControls } from './hooks/useTableControls';
export type {
  TableControls,
  UseTableControlsOptions,
  SortDirection,
} from './hooks/useTableControls';
