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
import { Entity } from '@backstage/catalog-model';

/**
 * Annotation key used to indicate that an entity has RHTAS enabled.
 * Add this annotation to catalog entities to opt into RHTAS tabs.
 *
 * @example
 * ```yaml
 * metadata:
 *   annotations:
 *     rhtas.redhat.com/enabled: 'true'
 * ```
 *
 * @public
 */
export const RHTAS_ANNOTATION = 'rhtas.redhat.com/enabled';

/**
 * Checks whether an entity has the RHTAS annotation, indicating
 * that RHTAS tabs should be displayed for this entity.
 *
 * @example
 * ```tsx
 * <EntitySwitch.Case if={isRhtasAvailable}>
 *   <EntityRhtasTrustRootContent />
 *   <EntityRhtasOperationsContent />
 * </EntitySwitch.Case>
 * ```
 *
 * @public
 */
export function isRhtasAvailable(entity: Entity): boolean {
  return Boolean(entity.metadata.annotations?.[RHTAS_ANNOTATION]);
}
