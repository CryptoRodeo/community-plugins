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
  Divider,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Flex,
  FlexItem,
  List,
  ListItem,
} from '@patternfly/react-core';
import { InfoAltIcon } from '@patternfly/react-icons';
import { ChartDonut } from '@patternfly/react-charts/victory';
import { ChartThemeColor } from '@patternfly/react-charts/victory';
import { CertificateInfo } from '@backstage-community/plugin-rhtas-common';
import dayjs from 'dayjs';
import { RepositoryNotInitiated } from './RepositoryNotInitiated';
import { LoadingWrapper } from '../shared/LoadingWrapper';
import { formatShortDate } from '../../utils/formatters';

/** Props for Overview. */
export interface OverviewProps {
  certificates: CertificateInfo[];
  isFetching: boolean;
  fetchError?: Error | unknown;
  rootLink?: string;
}

/**
 * Trust Root Overview tab: certificate health donut chart
 * and list of expiring certificates.
 */
export function Overview({
  certificates,
  isFetching,
  fetchError,
  rootLink,
}: OverviewProps) {
  const chartDonutData = useMemo(
    () =>
      certificates.reduce<Record<string, number>>((acc, cert) => {
        acc[cert.status] = (acc[cert.status] || 0) + 1;
        return acc;
      }, {}),
    [certificates],
  );

  const totalCertificates = useMemo(
    () => Object.values(chartDonutData).reduce((sum, v) => sum + v, 0),
    [chartDonutData],
  );

  const expiringCerts = useMemo(
    () =>
      certificates
        .filter(c => c.status.toLowerCase() === 'expiring')
        .sort(
          (a, b) =>
            dayjs(a.expiration).valueOf() - dayjs(b.expiration).valueOf(),
        ),
    [certificates],
  );

  if (certificates.length === 0) {
    return <RepositoryNotInitiated rootLink={rootLink} />;
  }

  return (
    <LoadingWrapper isLoading={isFetching} error={fetchError}>
      <Flex direction={{ default: 'column', md: 'row' }}>
        <FlexItem
          alignSelf={{ default: 'alignSelfStretch' }}
          flex={{ md: 'flex_1' }}
        >
          <Card isPlain>
            <CardTitle>Certificate health</CardTitle>
            <CardBody>
              <div style={{ height: '230px', width: '350px' }}>
                <ChartDonut
                  constrainToVisibleArea
                  data={Object.entries(chartDonutData).map(([key, value]) => ({
                    x: key,
                    y: value,
                  }))}
                  labels={({ datum }: { datum: { x: string; y: number } }) =>
                    `${datum.x}: ${datum.y}`
                  }
                  legendData={Object.entries(chartDonutData).map(
                    ([key, value]) => ({
                      name: `${key}: ${value}`,
                    }),
                  )}
                  legendOrientation="vertical"
                  legendPosition="right"
                  name="Certificates"
                  ariaTitle="Certificates donut chart"
                  padding={{ bottom: 20, left: 20, right: 140, top: 20 }}
                  themeColor={ChartThemeColor.multiOrdered}
                  title={totalCertificates.toString()}
                  subTitle="Certificates"
                  width={350}
                />
              </div>
            </CardBody>
          </Card>
        </FlexItem>
        <Divider
          orientation={{ md: 'vertical' }}
          inset={{ default: 'inset3xl' }}
        />
        <FlexItem
          alignSelf={{ default: 'alignSelfStretch' }}
          flex={{ md: 'flex_1' }}
        >
          <Card isPlain>
            <CardTitle>Expiring soon</CardTitle>
            <CardBody>
              {expiringCerts.length === 0 ? (
                <EmptyState variant={EmptyStateVariant.xs} icon={InfoAltIcon}>
                  <EmptyStateBody>
                    There are no certificates expiring soon.
                  </EmptyStateBody>
                </EmptyState>
              ) : (
                <List isPlain>
                  {expiringCerts.map(item => (
                    <ListItem
                      key={`${item.type}-${item.issuer}-${item.subject}-${item.target}`}
                    >
                      <Flex
                        spaceItems={{ default: 'spaceItemsSm' }}
                        alignItems={{ default: 'alignItemsCenter' }}
                        flexWrap={{ default: 'nowrap' }}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        <FlexItem>{item.issuer}</FlexItem>
                        <Divider orientation={{ default: 'vertical' }} />
                        <FlexItem>{formatShortDate(item.expiration)}</FlexItem>
                      </Flex>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardBody>
          </Card>
        </FlexItem>
      </Flex>
    </LoadingWrapper>
  );
}
