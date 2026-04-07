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
import { type ReactNode, useState } from 'react';
import { dump, load } from 'js-yaml';
import { Convert } from 'pvtsutils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTermHelpText,
  DescriptionListDescription,
  Divider,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  PageSection,
  Spinner,
} from '@patternfly/react-core';
import { ArrowLeftIcon } from '@patternfly/react-icons';
import { useRekorEntry } from '../../hooks/queries';
import { formatIntegratedTime } from '../../utils/rekor';
import { Hash } from './shared/Hash';
import { PublicKey } from './shared/PublicKey';
import { Signature } from './shared/Signature';

/** Props for RekorEntryPage. */
export interface RekorEntryPageProps {
  logIndex: string;
  onBack: () => void;
}

const DUMP_OPTIONS = {
  replacer: (_key: string, value: string) => {
    if (Convert.isBase64(value)) {
      try {
        const decodedVal = window.atob(value);
        if (decodedVal.startsWith('-----BEGIN')) {
          return decodedVal;
        }
        return load(decodedVal);
      } catch (_e) {
        return value;
      }
    }
    return value;
  },
};

function tryJSONParse(content?: string): unknown {
  if (!content) {
    return content;
  }
  try {
    return JSON.parse(content);
  } catch (_e) {
    return content;
  }
}

export function EntryCard({
  title,
  content,
  dividerProps = {},
}: {
  title: ReactNode;
  content: ReactNode;
  dividerProps?: { display?: string };
}) {
  return (
    <Flex style={{ padding: '1em' }}>
      <Divider
        orientation={{ default: 'vertical' }}
        style={{ margin: 'inherit 1em', ...dividerProps }}
      />
      <FlexItem>
        <h3>{title}</h3>
        <div
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'start',
          }}
        >
          {content}
        </div>
      </FlexItem>
    </Flex>
  );
}

/**
 * Detail view for a single Rekor entry fetched by logIndex.
 */
export function RekorEntryPage({ logIndex, onBack }: RekorEntryPageProps) {
  const { data, isLoading, error, refetch } = useRekorEntry(logIndex);

  type PanelId =
    | 'body-content'
    | 'attestation-content'
    | 'verification-content';
  const [expanded, setExpanded] = useState<PanelId[]>([]);

  const toggle = (id: PanelId) => {
    const index = expanded.indexOf(id);
    const newExpanded: PanelId[] =
      index >= 0
        ? [...expanded.slice(0, index), ...expanded.slice(index + 1)]
        : [...expanded, id];
    setExpanded(newExpanded);
  };

  if (isLoading) {
    return (
      <PageSection>
        <EmptyState>
          <Spinner size="xl" />
          <EmptyStateBody>Loading Rekor entry...</EmptyStateBody>
        </EmptyState>
      </PageSection>
    );
  }

  if (error) {
    return (
      <PageSection>
        <Alert
          variant="danger"
          title="Failed to load Rekor entry"
          actionClose={
            <Button variant="link" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          {error instanceof Error ? error.message : String(error)}
        </Alert>
      </PageSection>
    );
  }

  if (!data) {
    return (
      <PageSection>
        <EmptyState>
          <EmptyStateBody>
            No entry found for log index {logIndex}.
          </EmptyStateBody>
        </EmptyState>
      </PageSection>
    );
  }

  const entries = Object.entries(data);
  if (entries.length === 0) {
    return (
      <PageSection>
        <EmptyState>
          <EmptyStateBody>
            No entry found for log index {logIndex}.
          </EmptyStateBody>
        </EmptyState>
      </PageSection>
    );
  }

  const [uuid, entry] = entries[0];
  const body = JSON.parse(atob(entry.body)) as {
    kind: string;
    apiVersion: string;
    spec: unknown;
  };

  let rawAttestation = entry.attestation?.data as string | undefined;
  for (let i = 0; Convert.isBase64(rawAttestation) && i < 3; i++) {
    rawAttestation = window.atob(rawAttestation);
  }
  const attestation = tryJSONParse(rawAttestation) as
    | string
    | Record<string, unknown>
    | undefined;

  return (
    <PageSection>
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <BreadcrumbItem>
          <Button variant="link" isInline onClick={onBack}>
            <ArrowLeftIcon /> Logs
          </Button>
        </BreadcrumbItem>
        <BreadcrumbItem isActive>{entry.logIndex}</BreadcrumbItem>
      </Breadcrumb>

      <Flex
        direction={{ default: 'column' }}
        spaceItems={{ default: 'spaceItemsXl' }}
      >
        <FlexItem>
          <Card>
            <CardHeader>
              <CardTitle>Log details</CardTitle>
            </CardHeader>
            <CardBody>
              <DescriptionList columnModifier={{ default: '1Col' }}>
                <DescriptionList columnModifier={{ default: '3Col' }}>
                  <DescriptionListGroup>
                    <DescriptionListTermHelpText>
                      Type
                    </DescriptionListTermHelpText>
                    <DescriptionListDescription>
                      {body.kind}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTermHelpText>
                      Log index
                    </DescriptionListTermHelpText>
                    <DescriptionListDescription>
                      {entry.logIndex}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTermHelpText>
                      Integrated time
                    </DescriptionListTermHelpText>
                    <DescriptionListDescription>
                      {formatIntegratedTime(entry.integratedTime)}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
                <DescriptionList columnModifier={{ default: '1Col' }}>
                  <DescriptionListGroup>
                    <DescriptionListTermHelpText>
                      Entry UUID
                    </DescriptionListTermHelpText>
                    <DescriptionListDescription>
                      {uuid}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTermHelpText>
                      Hash
                    </DescriptionListTermHelpText>
                    <DescriptionListDescription>
                      <Hash type={body.kind} spec={body.spec} />
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTermHelpText>
                      Signature
                    </DescriptionListTermHelpText>
                    <DescriptionListDescription>
                      <Signature
                        type={body.kind}
                        apiVersion={body.apiVersion}
                        spec={body.spec}
                      />
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </DescriptionList>
              </DescriptionList>
            </CardBody>
          </Card>
        </FlexItem>

        <FlexItem>
          <Card>
            <CardHeader>
              <CardTitle>Public Key Certificate</CardTitle>
            </CardHeader>
            <CardBody>
              <PublicKey
                type={body.kind}
                apiVersion={body.apiVersion}
                spec={body.spec}
              />
            </CardBody>
          </Card>
        </FlexItem>

        <FlexItem>
          <Card>
            <CardHeader>
              <CardTitle>Recommended safety guardrails</CardTitle>
            </CardHeader>
            <CardBody>
              <Accordion>
                <AccordionItem isExpanded={expanded.includes('body-content')}>
                  <AccordionToggle
                    id="body-header"
                    aria-controls="body-content"
                    onClick={() => toggle('body-content')}
                  >
                    Raw Body
                  </AccordionToggle>
                  <AccordionContent>
                    {expanded.includes('body-content') && (
                      <Content
                        style={{
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                        }}
                      >
                        {dump(body, DUMP_OPTIONS)}
                      </Content>
                    )}
                  </AccordionContent>
                </AccordionItem>

                {attestation && (
                  <AccordionItem
                    isExpanded={expanded.includes('attestation-content')}
                  >
                    <AccordionToggle
                      aria-controls="attestation-content"
                      id="attestation-header"
                      onClick={() => toggle('attestation-content')}
                    >
                      Attestation
                    </AccordionToggle>
                    <AccordionContent>
                      {expanded.includes('attestation-content') && (
                        <Content
                          style={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all',
                          }}
                        >
                          {dump(attestation)}
                        </Content>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                )}

                {entry.verification && (
                  <AccordionItem
                    isExpanded={expanded.includes('verification-content')}
                  >
                    <AccordionToggle
                      aria-controls="verification-content"
                      id="verification-header"
                      onClick={() => toggle('verification-content')}
                    >
                      Verification
                    </AccordionToggle>
                    <AccordionContent>
                      {expanded.includes('verification-content') && (
                        <Content
                          style={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all',
                          }}
                        >
                          {dump(entry.verification)}
                        </Content>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </CardBody>
          </Card>
        </FlexItem>
      </Flex>
    </PageSection>
  );
}
