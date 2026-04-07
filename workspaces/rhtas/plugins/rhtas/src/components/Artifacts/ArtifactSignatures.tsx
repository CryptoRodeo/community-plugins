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
import { SignatureView } from '@backstage-community/plugin-rhtas-common';
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

/** Props for ArtifactSignatures. */
export interface ArtifactSignaturesProps {
  signatures: SignatureView[];
}

function downloadBundle(sig: SignatureView) {
  if (!sig.rawBundleJson) return;
  const blob = new Blob([sig.rawBundleJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sigstore-bundle-${
    sig.digest ? sig.digest.substring(0, 12) : 'bundle'
  }.json`;
  a.click();
  URL.revokeObjectURL(url);
}

const columnNames = {
  identity: 'Identity',
  digest: 'Digest',
  signedOn: 'Signed On',
  signatureVerified: 'Signed',
  chainVerified: 'Chain',
  rekorVerified: 'Rekor',
};

/** Table of SignatureView items with expandable rows, toolbar, and pagination. */
export function ArtifactSignatures({ signatures }: ArtifactSignaturesProps) {
  const tableControls = useTableControls<SignatureView>({
    items: signatures,
    initialPerPage: 10,
    filterFn: (item, filters) => {
      const search = filters.identity?.toLowerCase() ?? '';
      if (!search) return true;
      const identity = toIdentity(item.signingCertificate);
      return identity.toLowerCase().includes(search);
    },
  });

  if (signatures.length === 0) {
    return (
      <NoDataEmptyState
        title="No signatures found"
        body="No signatures were found for this artifact."
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
      <Table aria-label="Artifact signatures">
        <Thead>
          <Tr>
            <Th screenReaderText="Row expansion" />
            <Th>{columnNames.identity}</Th>
            <Th>{columnNames.digest}</Th>
            <Th>{columnNames.signedOn}</Th>
            <Th>{columnNames.signatureVerified}</Th>
            <Th>{columnNames.chainVerified}</Th>
            <Th>{columnNames.rekorVerified}</Th>
            <Th screenReaderText="Actions" />
          </Tr>
        </Thead>
        {paginatedItems.map((sig, index) => {
          const globalIndex = (page - 1) * perPage + index;
          const rowId = `sig-${globalIndex}`;
          const identity = toIdentity(sig.signingCertificate);
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
                    {truncateHash(sig.digest)}
                  </ClipboardCopy>
                </Td>
                <Td dataLabel={columnNames.signedOn}>
                  {typeof sig.timestamp === 'string'
                    ? (() => {
                        const date = new Date(sig.timestamp);
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
                <Td dataLabel={columnNames.signatureVerified}>
                  {sig.signatureStatus.signature === 'verified' ? (
                    <CheckIcon />
                  ) : (
                    <TimesIcon />
                  )}
                </Td>
                <Td dataLabel={columnNames.chainVerified}>
                  {sig.signatureStatus.chain === 'verified' ? (
                    <CheckIcon />
                  ) : (
                    <TimesIcon />
                  )}
                </Td>
                <Td dataLabel={columnNames.rekorVerified}>
                  {sig.signatureStatus.rekor === 'verified' ? (
                    <CheckIcon />
                  ) : (
                    <TimesIcon />
                  )}
                </Td>
                <Td isActionCell>
                  {sig.rawBundleJson && (
                    <ActionsColumn
                      items={[
                        {
                          title: 'Download bundle',
                          onClick: () => downloadBundle(sig),
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
                      <StackItem>
                        <LeafCertificate certificate={sig.signingCertificate} />
                      </StackItem>
                      {sig.certificateChain.length > 0 && (
                        <StackItem>
                          <CertificateChain
                            certificates={sig.certificateChain}
                            chainStatus={sig.signatureStatus.chain}
                          />
                        </StackItem>
                      )}
                      <StackItem>
                        <RekorEntryPanel
                          rekorEntry={sig.rekorEntry}
                          rekorStatus={sig.signatureStatus.rekor}
                        />
                      </StackItem>
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
