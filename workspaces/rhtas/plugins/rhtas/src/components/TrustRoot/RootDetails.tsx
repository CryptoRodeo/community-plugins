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
import { useMemo } from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTermHelpText,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { RootMetadataInfoList } from '@backstage-community/plugin-rhtas-common';
import { CertificateStatusIcon } from '../shared/CertificateStatusIcon';
import {
  capitalizeFirstLetter,
  formatShortDate,
  universalComparator,
} from '../../utils/formatters';

/** Props for RootDetails. */
export interface RootDetailsProps {
  rootMetadataList: RootMetadataInfoList;
}

/**
 * Displays the latest TUF root metadata entry in a card-based layout.
 */
export function RootDetails({ rootMetadataList }: RootDetailsProps) {
  const latestMetadataInfo = useMemo(() => {
    const metadataInfo = [...rootMetadataList.data]
      .sort((a, b) => universalComparator(a.version, b.version, 'en'))
      .reverse();
    return metadataInfo[0] ? metadataInfo[0] : null;
  }, [rootMetadataList]);

  return (
    <Stack hasGutter>
      <StackItem>
        <Card isPlain>
          <CardTitle>Root details</CardTitle>
          <CardBody>
            <DescriptionList
              aria-label="Metadata"
              columnModifier={{ default: '2Col' }}
            >
              <DescriptionListGroup>
                <DescriptionListTermHelpText>Type</DescriptionListTermHelpText>
                <DescriptionListDescription>tuf</DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardBody>
        </Card>
      </StackItem>
      <StackItem>
        <Card isPlain>
          <CardTitle>Metadata</CardTitle>
          <CardBody>
            <DescriptionList
              aria-label="Metadata"
              columnModifier={{ default: '2Col' }}
            >
              <DescriptionListGroup>
                <DescriptionListTermHelpText>
                  Version
                </DescriptionListTermHelpText>
                <DescriptionListDescription>
                  {latestMetadataInfo?.version}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTermHelpText>
                  Expires
                </DescriptionListTermHelpText>
                <DescriptionListDescription>
                  {latestMetadataInfo?.expires
                    ? formatShortDate(latestMetadataInfo.expires)
                    : ''}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTermHelpText>
                  Status
                </DescriptionListTermHelpText>
                <DescriptionListDescription>
                  {latestMetadataInfo && (
                    <>
                      <CertificateStatusIcon
                        status={latestMetadataInfo.status}
                      />{' '}
                      {capitalizeFirstLetter(latestMetadataInfo.status ?? '')}
                    </>
                  )}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardBody>
        </Card>
      </StackItem>
    </Stack>
  );
}
