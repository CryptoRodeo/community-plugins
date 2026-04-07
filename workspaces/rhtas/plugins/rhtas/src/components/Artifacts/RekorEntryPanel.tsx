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
  Card,
  CardBody,
  ClipboardCopy,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
} from '@patternfly/react-core';
import { TransparencyLogEntry } from '@backstage-community/plugin-rhtas-common';
import { StatusCardHeader } from '../shared/StatusCardHeader';
import { formatIntegratedTime } from '../../utils/rekor';
import { truncateHash } from '../../utils/formatters';

/** Props for RekorEntryPanel. */
export interface RekorEntryPanelProps {
  rekorEntry?: TransparencyLogEntry;
  rekorStatus?: string;
}

/** Displays Rekor transparency log entry details with StatusCardHeader. */
export function RekorEntryPanel({
  rekorEntry,
  rekorStatus,
}: RekorEntryPanelProps) {
  if (!rekorEntry) {
    return null;
  }

  const logIndex = rekorEntry.logIndex;
  const logId = rekorEntry.logId?.keyId;
  const integratedTime = rekorEntry.integratedTime;
  const entryType = rekorEntry.kindVersion
    ? `${rekorEntry.kindVersion.kind}/${rekorEntry.kindVersion.version}`
    : undefined;
  const treeSize = rekorEntry.inclusionProof?.treeSize;
  const proofHashes = rekorEntry.inclusionProof?.hashes;
  const signedEntryTimestamp =
    rekorEntry.inclusionPromise?.signedEntryTimestamp;

  const proofDepth = proofHashes?.length;

  let setHex = '';
  if (signedEntryTimestamp) {
    try {
      const binary = atob(signedEntryTimestamp);
      setHex = Array.from(binary, byte =>
        byte.charCodeAt(0).toString(16).padStart(2, '0'),
      ).join('');
    } catch {
      setHex = signedEntryTimestamp;
    }
  }

  return (
    <Card isCompact>
      <StatusCardHeader title="Rekor Transparency Log" status={rekorStatus} />
      <CardBody>
        <DescriptionList isHorizontal isCompact>
          {entryType && (
            <DescriptionListGroup>
              <DescriptionListTerm>Entry Type</DescriptionListTerm>
              <DescriptionListDescription>
                {entryType}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {integratedTime !== undefined && (
            <DescriptionListGroup>
              <DescriptionListTerm>Integrated Time</DescriptionListTerm>
              <DescriptionListDescription>
                {formatIntegratedTime(integratedTime)}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {logId && (
            <DescriptionListGroup>
              <DescriptionListTerm>Log ID</DescriptionListTerm>
              <DescriptionListDescription>
                <ClipboardCopy
                  isReadOnly
                  hoverTip="Copy"
                  clickTip="Copied"
                  variant="inline-compact"
                >
                  {truncateHash(logId)}
                </ClipboardCopy>
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {logIndex !== undefined && (
            <DescriptionListGroup>
              <DescriptionListTerm>Log Index</DescriptionListTerm>
              <DescriptionListDescription>
                {logIndex}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {treeSize !== undefined && (
            <DescriptionListGroup>
              <DescriptionListTerm>Tree Size</DescriptionListTerm>
              <DescriptionListDescription>
                {treeSize}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {proofDepth !== undefined && (
            <DescriptionListGroup>
              <DescriptionListTerm>Proof Depth</DescriptionListTerm>
              <DescriptionListDescription>
                {proofDepth}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {setHex && (
            <DescriptionListGroup>
              <DescriptionListTerm>Signed Entry Timestamp</DescriptionListTerm>
              <DescriptionListDescription>
                <ClipboardCopy
                  isReadOnly
                  hoverTip="Copy"
                  clickTip="Copied"
                  variant="inline-compact"
                >
                  {truncateHash(setHex, 32)}
                </ClipboardCopy>
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
        </DescriptionList>
      </CardBody>
    </Card>
  );
}
