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
  ActionsColumn,
  ExpandableRowContent,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import {
  ClipboardCopy,
  CodeBlock,
  CodeBlockCode,
  Content,
  Stack,
  StackItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  SearchInput,
  Timestamp,
  TimestampTooltipVariant,
  Truncate,
} from '@patternfly/react-core';
import { CheckIcon, TimesIcon } from '@patternfly/react-icons';
import { AttestationView } from '@backstage-community/plugin-rhtas-common';
import { NoDataEmptyState } from '../shared/NoDataEmptyState';
import { SimplePagination } from '../shared/SimplePagination';
import { LeafCertificate } from './LeafCertificate';
import { CertificateChain } from './CertificateChain';
import { RekorEntryPanel } from './RekorEntryPanel';
import { useTableControls } from '../../hooks/useTableControls';
import {
  toIdentity,
  truncateHash,
  relativeDateString,
} from '../../utils/formatters';

/** Props for ArtifactAttestations. */
export interface ArtifactAttestationsProps {
  attestations: AttestationView[];
}

function downloadBundle(att: AttestationView) {
  if (!att.rawBundleJson) return;
  const blob = new Blob([att.rawBundleJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sigstore-bundle-${
    att.digest ? att.digest.substring(0, 12) : 'bundle'
  }.json`;
  a.click();
  URL.revokeObjectURL(url);
}

const columnNames = {
  identity: 'Identity',
  digest: 'Digest',
  attestationType: 'Attestation Type',
  timestamp: 'Timestamp',
  attestationVerified: 'Attestation',
  rekorVerified: 'Rekor',
};

/** Table of AttestationView items with expandable rows, toolbar, and pagination. */
export function ArtifactAttestations({
  attestations,
}: ArtifactAttestationsProps) {
  const tableControls = useTableControls<AttestationView>({
    items: attestations,
    initialPerPage: 10,
    filterFn: (item, filters) => {
      const search = filters.identity?.toLowerCase() ?? '';
      if (!search) return true;
      if (!item.signingCertificate) return false;
      const identity = toIdentity(item.signingCertificate);
      return identity.toLowerCase().includes(search);
    },
  });

  if (attestations.length === 0) {
    return (
      <NoDataEmptyState
        title="No attestations found"
        body="No attestations were found for this artifact."
      />
    );
  }

  const { paginatedItems, page, perPage, totalFilteredCount, filters } =
    tableControls;

  const paginationProps = {
    itemCount: totalFilteredCount,
    page,
    perPage,
    onSetPage: tableControls.setPage,
    onPerPageSelect: tableControls.setPerPage,
  };

  return (
    <>
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            <SearchInput
              placeholder="Filter by identity..."
              value={filters.identity ?? ''}
              onChange={(_event, value) =>
                tableControls.setFilter('identity', value)
              }
              onClear={() => tableControls.setFilter('identity', '')}
            />
          </ToolbarItem>
          <ToolbarItem variant="pagination">
            <SimplePagination {...paginationProps} />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table aria-label="Artifact attestations">
        <Thead>
          <Tr>
            <Th screenReaderText="Row expansion" />
            <Th>{columnNames.identity}</Th>
            <Th>{columnNames.digest}</Th>
            <Th>{columnNames.attestationType}</Th>
            <Th>{columnNames.timestamp}</Th>
            <Th>{columnNames.attestationVerified}</Th>
            <Th>{columnNames.rekorVerified}</Th>
            <Th screenReaderText="Actions" />
          </Tr>
        </Thead>
        {paginatedItems.map((att, index) => {
          const globalIndex = (page - 1) * perPage + index;
          const rowId = `att-${globalIndex}`;
          const identity = att.signingCertificate
            ? toIdentity(att.signingCertificate)
            : '-';
          const expanded = tableControls.isExpanded(rowId);

          return (
            <Tbody key={rowId} isExpanded={expanded}>
              <Tr>
                <Td
                  expand={{
                    rowIndex: globalIndex,
                    isExpanded: expanded,
                    onToggle: () => tableControls.toggleExpanded(rowId),
                  }}
                />
                <Td dataLabel={columnNames.identity}>
                  <Truncate maxCharsDisplayed={20} content={identity} />
                </Td>
                <Td dataLabel={columnNames.digest}>
                  <ClipboardCopy
                    isReadOnly
                    hoverTip="Copy"
                    clickTip="Copied"
                    variant="inline-compact"
                  >
                    {truncateHash(att.digest)}
                  </ClipboardCopy>
                </Td>
                <Td dataLabel={columnNames.attestationType}>
                  {att.predicateType}
                </Td>
                <Td dataLabel={columnNames.timestamp}>
                  {typeof att.timestamp === 'string'
                    ? (() => {
                        const date = new Date(att.timestamp);
                        return (
                          <Timestamp
                            tooltip={{
                              variant: TimestampTooltipVariant.default,
                            }}
                            date={date}
                          >
                            {relativeDateString(date)}
                          </Timestamp>
                        );
                      })()
                    : 'N/A'}
                </Td>
                <Td dataLabel={columnNames.attestationVerified}>
                  {att.attestationStatus.attestation === 'verified' ? (
                    <CheckIcon />
                  ) : (
                    <TimesIcon />
                  )}
                </Td>
                <Td dataLabel={columnNames.rekorVerified}>
                  {att.attestationStatus.rekor === 'verified' ? (
                    <CheckIcon />
                  ) : (
                    <TimesIcon />
                  )}
                </Td>
                <Td isActionCell>
                  {att.rawBundleJson && (
                    <ActionsColumn
                      items={[
                        {
                          title: 'Download bundle',
                          onClick: () => downloadBundle(att),
                        },
                      ]}
                    />
                  )}
                </Td>
              </Tr>
              <Tr isExpanded={expanded}>
                <Td colSpan={8}>
                  <ExpandableRowContent>
                    <Stack hasGutter>
                      {att.signingCertificate && (
                        <StackItem>
                          <LeafCertificate
                            certificate={att.signingCertificate}
                          />
                        </StackItem>
                      )}
                      {att.certificateChain &&
                        att.certificateChain.length > 0 && (
                          <StackItem>
                            <CertificateChain
                              certificates={att.certificateChain}
                              chainStatus={att.attestationStatus.chain}
                            />
                          </StackItem>
                        )}
                      <StackItem>
                        <RekorEntryPanel
                          rekorEntry={att.rekorEntry}
                          rekorStatus={att.attestationStatus.rekor}
                        />
                      </StackItem>
                      {att.rawStatementJson && (
                        <StackItem>
                          <Content component="h4">Statement</Content>
                          <CodeBlock>
                            <CodeBlockCode>
                              {JSON.stringify(
                                JSON.parse(att.rawStatementJson),
                                null,
                                2,
                              )}
                            </CodeBlockCode>
                          </CodeBlock>
                        </StackItem>
                      )}
                    </Stack>
                  </ExpandableRowContent>
                </Td>
              </Tr>
            </Tbody>
          );
        })}
      </Table>
      <SimplePagination {...paginationProps} />
    </>
  );
}
