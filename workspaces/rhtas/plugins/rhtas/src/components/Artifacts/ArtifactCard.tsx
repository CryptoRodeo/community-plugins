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

import { useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  CardTitle,
  Content,
  Label,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import {
  ArtifactSummaryView,
  ImageMetadataResponse,
  VerifyArtifactResponse,
} from '@backstage-community/plugin-rhtas-common';
import { ArtifactSummary } from './ArtifactSummary';
import { ArtifactSignatures } from './ArtifactSignatures';
import { ArtifactAttestations } from './ArtifactAttestations';
import {
  capitalizeFirstLetter,
  verificationStatusToLabelColor,
} from '../../utils/formatters';
import { NoDataEmptyState } from '../shared/NoDataEmptyState';

/** Props for ArtifactCard. */
export interface ArtifactCardProps {
  metadata: ImageMetadataResponse;
  verification?: VerifyArtifactResponse;
  summary?: ArtifactSummaryView;
}

/** Main artifact display with separate cards for details, signatures, and attestations. */
export function ArtifactCard({
  metadata,
  verification,
  summary,
}: ArtifactCardProps) {
  const [isSignaturesExpanded, setIsSignaturesExpanded] = useState(false);
  const [isAttestationsExpanded, setIsAttestationsExpanded] = useState(false);

  const title = metadata.image ?? 'Unknown Image';
  const registryUrl = `https://${metadata.registry}`;
  const verificationStatus = summary?.overallStatus;

  return (
    <Stack hasGutter>
      <StackItem>
        <Card id="artifact-details-card" style={{ overflowY: 'hidden' }}>
          <CardHeader>
            <Content>
              <CardTitle>Artifact details</CardTitle>
              <Button
                variant="link"
                href={registryUrl}
                component="a"
                icon={<ExternalLinkAltIcon />}
                iconPosition="end"
                target="_blank"
                aria-label="artifact link"
                rel="noopener noreferrer"
                style={{ padding: '0', marginRight: '1rem' }}
              >
                {title}
              </Button>
              <Label
                color={verificationStatusToLabelColor(verificationStatus ?? '')}
              >
                {verificationStatus
                  ? capitalizeFirstLetter(verificationStatus)
                  : 'Unknown'}
              </Label>
            </Content>
          </CardHeader>
          <CardBody>
            <ArtifactSummary
              metadata={metadata}
              verification={verification}
              summary={summary}
            />
          </CardBody>
        </Card>
      </StackItem>

      {verification && (
        <>
          <StackItem>
            <Card
              id="artifact-signatures-card"
              isExpanded={isSignaturesExpanded}
            >
              <CardHeader
                onExpand={() => setIsSignaturesExpanded(prev => !prev)}
              >
                <CardTitle>
                  Signatures ({verification.signatures?.length ?? 0})
                </CardTitle>
              </CardHeader>
              <CardExpandableContent>
                <CardBody>
                  {verification.signatures?.length ? (
                    <ArtifactSignatures signatures={verification.signatures} />
                  ) : (
                    <NoDataEmptyState />
                  )}
                </CardBody>
              </CardExpandableContent>
            </Card>
          </StackItem>

          <StackItem>
            <Card
              id="artifact-attestations-card"
              isExpanded={isAttestationsExpanded}
            >
              <CardHeader
                onExpand={() => setIsAttestationsExpanded(prev => !prev)}
              >
                <CardTitle>
                  Attestations ({verification.attestations?.length ?? 0})
                </CardTitle>
              </CardHeader>
              <CardExpandableContent>
                <CardBody>
                  {verification.attestations?.length ? (
                    <ArtifactAttestations
                      attestations={verification.attestations}
                    />
                  ) : (
                    <NoDataEmptyState />
                  )}
                </CardBody>
              </CardExpandableContent>
            </Card>
          </StackItem>
        </>
      )}
    </Stack>
  );
}
