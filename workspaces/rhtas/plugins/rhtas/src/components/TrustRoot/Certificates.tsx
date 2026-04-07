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
import { useCallback, useMemo, useState, type Key } from 'react';
import dayjs from 'dayjs';
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  type AlertProps,
  CodeBlock,
  CodeBlockCode,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
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
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { type CertificateInfo } from '@backstage-community/plugin-rhtas-common';
import { CertificateStatusIcon } from '../shared/CertificateStatusIcon';
import { FilterToolbar } from '../shared/FilterToolbar';
import { SearchFilterControl } from '../shared/SearchFilterControl';
import { MultiselectFilterControl } from '../shared/MultiselectFilterControl';
import { SimplePagination } from '../shared/SimplePagination';
import { ConditionalTableBody } from '../shared/ConditionalTableBody';
import { CertificateDoesNotExist } from './ErrorStates/CertificateDoesNotExist';
import { ErrorRetrievingCertificate } from './ErrorStates/ErrorRetrievingCertificate';
import { formatDate, stringMatcher } from '../../utils/formatters';
import { usePFToolbarTable } from '../../hooks/useTableControls';

/** Props for CertificatesTable / Certificates. */
export interface CertificatesProps {
  certificates: CertificateInfo[];
  isFetching: boolean;
  fetchError: Error | null;
}

interface ToastAlert {
  key: Key;
  title: string;
  variant: AlertProps['variant'];
}

type FilterCategoryKey = 'subject' | 'status';

interface CertificateWithId extends CertificateInfo {
  _ui_unique_id: string;
}

/**
 * Certificate table with category-based filtering, sorting, pagination,
 * expandable PEM rows, copy/download actions, and toast alerts.
 */
export function CertificatesTable({
  certificates,
  isFetching,
  fetchError,
}: CertificatesProps) {
  // Toast alerts
  const [alerts, setAlerts] = useState<ToastAlert[]>([]);

  const addAlert = useCallback(
    (title: string, variant: AlertProps['variant']) => {
      setAlerts(prev => [{ key: Date.now(), title, variant }, ...prev]);
    },
    [],
  );

  const removeAlert = useCallback((key: Key) => {
    setAlerts(prev => prev.filter(a => a.key !== key));
  }, []);

  // Items with unique IDs
  const items = useMemo<CertificateWithId[]>(
    () =>
      certificates.map((item, index) => ({
        ...item,
        _ui_unique_id: `${index}-${item.type}-${item.issuer}-${item.subject}-${item.target}`,
      })),
    [certificates],
  );

  // Table state
  const {
    tableState: { currentPageItems },
    propHelpers: {
      getSortThProps,
      paginationProps,
      paginationToolbarItemProps,
      toolbarProps,
      filterToolbarProps,
      getFilterControlProps,
      getSingleExpandButtonTdProps,
    },
    expansionDerivedState: { isCellExpanded },
  } = usePFToolbarTable<CertificateWithId, FilterCategoryKey>({
    items,
    idProperty: '_ui_unique_id',
    columns: ['expiration'],
    toolbar: {
      categoryTitles: { subject: 'Subject', status: 'Status' },
    },
    filtering: {
      filterCategories: [
        {
          categoryKey: 'subject',
          matcher: (filterValue, item) =>
            stringMatcher(filterValue, item.subject),
        },
        {
          categoryKey: 'status',
          matcher: (filterValue, item) =>
            filterValue.toLowerCase() === item.status.toLowerCase(),
        },
      ],
    },
    sorting: {
      sortableColumns: ['expiration'],
      initialSort: { columnKey: 'expiration', direction: 'desc' },
      getSortValues: item => ({
        expiration: dayjs(item.expiration).valueOf(),
      }),
    },
  });

  // Action handlers
  const handleCopy = useCallback(
    (pem: string) => {
      window.navigator.clipboard.writeText(pem).then(
        () => addAlert('Copied PEM to clipboard', 'success'),
        () => addAlert('Failed to copy to clipboard', 'danger'),
      );
    },
    [addAlert],
  );

  const handleDownload = useCallback((pem: string) => {
    const blob = new Blob([pem], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'certificate.pem';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, []);

  // Early returns for error/empty states
  if (fetchError) {
    return <ErrorRetrievingCertificate />;
  }

  if (certificates.length === 0) {
    return <CertificateDoesNotExist />;
  }

  return (
    <>
      <Toolbar {...toolbarProps} aria-label="certificates toolbar">
        <ToolbarContent>
          <FilterToolbar {...filterToolbarProps} showFilterDropdown>
            <SearchFilterControl
              {...getFilterControlProps({ categoryKey: 'subject' })}
              placeholderText="Search by subject"
              showToolbarItem={
                filterToolbarProps.currentFilterCategoryKey === 'subject'
              }
            />
            <MultiselectFilterControl
              {...getFilterControlProps({ categoryKey: 'status' })}
              selectOptions={[
                { value: 'active', label: 'Active' },
                { value: 'expiring', label: 'Expiring' },
                { value: 'expired', label: 'Expired' },
              ]}
              placeholderText="Status"
              showToolbarItem={
                filterToolbarProps.currentFilterCategoryKey === 'status'
              }
            />
          </FilterToolbar>
          <ToolbarItem {...paginationToolbarItemProps}>
            <SimplePagination
              idPrefix="certificates-table"
              isTop
              paginationProps={paginationProps}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <Table aria-label="certificates table" isExpandable>
        <Thead>
          <Tr>
            <Th screenReaderText="Row expansion" />
            <Th>Issuer</Th>
            <Th>Subject</Th>
            <Th>Target</Th>
            <Th width={10}>Type</Th>
            <Th width={10}>Status</Th>
            <Th width={10} {...getSortThProps({ columnKey: 'expiration' })}>
              Expiration
            </Th>
            <Th screenReaderText="Actions" />
          </Tr>
        </Thead>
        <ConditionalTableBody
          isNoData={currentPageItems.length === 0}
          numRenderedColumns={8}
          isLoading={isFetching}
          isError={!!fetchError}
        >
          {currentPageItems.map((certificate, rowIndex) => (
            <Tbody
              key={certificate._ui_unique_id}
              isExpanded={isCellExpanded(certificate)}
            >
              <Tr>
                <Td
                  {...getSingleExpandButtonTdProps({
                    item: certificate,
                    rowIndex,
                  })}
                />
                <Td dataLabel="Issuer" modifier="breakWord">
                  {certificate.issuer}
                </Td>
                <Td dataLabel="Subject" modifier="breakWord">
                  {certificate.subject}
                </Td>
                <Td dataLabel="Target" modifier="breakWord">
                  {certificate.target}
                </Td>
                <Td dataLabel="Type" width={10} modifier="truncate">
                  {certificate.type}
                </Td>
                <Td dataLabel="Status" width={10} modifier="truncate">
                  <CertificateStatusIcon status={certificate.status} />{' '}
                  {certificate.status}
                </Td>
                <Td dataLabel="Expiration" width={10} modifier="truncate">
                  {formatDate(certificate.expiration)}
                </Td>
                <Td isActionCell>
                  <ActionsColumn
                    items={[
                      {
                        title: 'Copy PEM',
                        onClick: () => handleCopy(certificate.pem),
                      },
                      {
                        title: 'Download PEM',
                        onClick: () => handleDownload(certificate.pem),
                      },
                    ]}
                  />
                </Td>
              </Tr>
              {isCellExpanded(certificate) && (
                <Tr isExpanded>
                  <Td colSpan={7} noPadding>
                    <div className={spacing.mMd}>
                      <ExpandableRowContent>
                        <DescriptionList>
                          <DescriptionListGroup>
                            <DescriptionListTerm>PEM</DescriptionListTerm>
                            <DescriptionListDescription>
                              <CodeBlock>
                                <CodeBlockCode>{certificate.pem}</CodeBlockCode>
                              </CodeBlock>
                            </DescriptionListDescription>
                          </DescriptionListGroup>
                        </DescriptionList>
                      </ExpandableRowContent>
                    </div>
                  </Td>
                </Tr>
              )}
            </Tbody>
          ))}
        </ConditionalTableBody>
      </Table>

      <SimplePagination
        idPrefix="certificates-table"
        isTop={false}
        paginationProps={paginationProps}
      />

      <AlertGroup isToast isLiveRegion hasAnimations>
        {alerts.map(alert => (
          <Alert
            key={alert.key}
            variant={alert.variant}
            title={alert.title}
            timeout={2000}
            onTimeout={() => removeAlert(alert.key)}
            actionClose={
              <AlertActionCloseButton onClose={() => removeAlert(alert.key)} />
            }
          />
        ))}
      </AlertGroup>
    </>
  );
}

/** Backward-compatible alias. */
export const Certificates = CertificatesTable;
