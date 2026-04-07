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
  ClipboardCopy,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  DescriptionListDescription,
  Label,
  LabelGroup,
  Popover,
} from '@patternfly/react-core';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import QuestionCircleIcon from '@patternfly/react-icons/dist/esm/icons/question-circle-icon';
import {
  ArtifactSummaryView,
  ImageMetadataResponse,
  VerifyArtifactResponse,
} from '@backstage-community/plugin-rhtas-common';
import { formatDate } from '../../utils/formatters';

/** Props for ArtifactSummary. */
export interface ArtifactSummaryProps {
  metadata: ImageMetadataResponse;
  verification?: VerifyArtifactResponse;
  summary?: ArtifactSummaryView;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/** Multi-section summary of an artifact's metadata and verification status. */
export function ArtifactSummary({
  metadata,
  verification,
  summary,
}: ArtifactSummaryProps) {
  const signatureCount =
    summary?.signatureCount ?? verification?.signatures?.length ?? 0;
  const attestationCount =
    summary?.attestationCount ?? verification?.attestations?.length ?? 0;
  const rekorEntryCount =
    summary?.rekorEntryCount ??
    (verification
      ? new Set(
          [...verification.signatures, ...verification.attestations]
            .map(entry => entry.rekorEntry?.logIndex)
            .filter((idx): idx is number => idx !== undefined),
        ).size
      : 0);

  const overallStatus = summary?.overallStatus;

  const identities = summary?.identities ?? [];
  const uniqueIdentities = identities.filter(
    (item, index, self) =>
      self.findIndex(
        other => other.value === item.value && other.source === item.source,
      ) === index,
  );

  return (
    <DescriptionList columnModifier={{ default: '2Col' }}>
      <DescriptionListGroup>
        <DescriptionListTermHelpText>
          <Popover
            headerContent={<div>Digest</div>}
            bodyContent={<div>The SHA256 digest of the container image.</div>}
          >
            <DescriptionListTermHelpTextButton>
              Digest
            </DescriptionListTermHelpTextButton>
          </Popover>
        </DescriptionListTermHelpText>
        <DescriptionListDescription>
          <ClipboardCopy
            isReadOnly
            isCode
            hoverTip="Copy"
            clickTip="Copied"
            variant="inline-compact"
            truncation={{ maxCharsDisplayed: 14 }}
          >
            {metadata.digest}
          </ClipboardCopy>
        </DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <DescriptionListTermHelpText>
          <Popover
            headerContent={<div>Registry</div>}
            bodyContent={
              <div>The container registry where the image is hosted.</div>
            }
          >
            <DescriptionListTermHelpTextButton>
              Registry
            </DescriptionListTermHelpTextButton>
          </Popover>
        </DescriptionListTermHelpText>
        <DescriptionListDescription>
          {metadata.registry}
        </DescriptionListDescription>
      </DescriptionListGroup>

      {metadata.metadata.mediaType && (
        <DescriptionListGroup>
          <DescriptionListTermHelpText>
            <Popover
              headerContent={<div>Media Type</div>}
              bodyContent={
                <div>The OCI media type of the container image manifest.</div>
              }
            >
              <DescriptionListTermHelpTextButton>
                Media Type
              </DescriptionListTermHelpTextButton>
            </Popover>
          </DescriptionListTermHelpText>
          <DescriptionListDescription>
            {metadata.metadata.mediaType}
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}

      <DescriptionListGroup>
        <DescriptionListTermHelpText>
          <Popover
            headerContent={<div>Size</div>}
            bodyContent={<div>The total size of the container image.</div>}
          >
            <DescriptionListTermHelpTextButton>
              Size
            </DescriptionListTermHelpTextButton>
          </Popover>
        </DescriptionListTermHelpText>
        <DescriptionListDescription>
          {formatBytes(metadata.metadata.size)}
        </DescriptionListDescription>
      </DescriptionListGroup>

      {metadata.metadata.created && (
        <DescriptionListGroup>
          <DescriptionListTermHelpText>
            <Popover
              headerContent={<div>Created</div>}
              bodyContent={
                <div>
                  The date and time when the container image was created.
                </div>
              }
            >
              <DescriptionListTermHelpTextButton>
                Created
              </DescriptionListTermHelpTextButton>
            </Popover>
          </DescriptionListTermHelpText>
          <DescriptionListDescription>
            {formatDate(metadata.metadata.created)}
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}

      <DescriptionListGroup>
        <DescriptionListTermHelpText>
          <Popover
            headerContent={<div>Labels</div>}
            bodyContent={
              <div>OCI labels associated with the container image.</div>
            }
          >
            <DescriptionListTermHelpTextButton>
              Labels
            </DescriptionListTermHelpTextButton>
          </Popover>
        </DescriptionListTermHelpText>
        <DescriptionListDescription>
          {metadata.metadata.labels &&
          Object.keys(metadata.metadata.labels).length > 0 ? (
            <LabelGroup>
              {Object.entries(metadata.metadata.labels).map(([key, value]) => (
                <Label key={key} color="blue">
                  {key}: {value}
                </Label>
              ))}
            </LabelGroup>
          ) : (
            'None'
          )}
        </DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <DescriptionListTermHelpText>
          <Popover
            headerContent={<div>Verification</div>}
            bodyContent={
              <div>
                The overall verification status of the artifact's signatures and
                attestations.
              </div>
            }
          >
            <DescriptionListTermHelpTextButton>
              Verification
            </DescriptionListTermHelpTextButton>
          </Popover>
        </DescriptionListTermHelpText>
        <DescriptionListDescription>
          {(!verification || !overallStatus) && (
            <Label color="grey" icon={<QuestionCircleIcon />}>
              Not verified
            </Label>
          )}
          {overallStatus === 'verified' && (
            <Label color="green" icon={<CheckCircleIcon />}>
              Verified
            </Label>
          )}
          {overallStatus === 'failed' && (
            <Label color="red" icon={<ExclamationCircleIcon />}>
              Failed
            </Label>
          )}
          {overallStatus === 'unsigned' && (
            <Label color="yellow" icon={<QuestionCircleIcon />}>
              Unsigned
            </Label>
          )}
        </DescriptionListDescription>
      </DescriptionListGroup>

      {uniqueIdentities.length > 0 && (
        <DescriptionListGroup>
          <DescriptionListTermHelpText>
            <Popover
              headerContent={<div>Identities</div>}
              bodyContent={
                <div>
                  The signing identities (SANs and issuers) associated with this
                  artifact's signatures and attestations.
                </div>
              }
            >
              <DescriptionListTermHelpTextButton>
                Identities
              </DescriptionListTermHelpTextButton>
            </Popover>
          </DescriptionListTermHelpText>
          <DescriptionListDescription>
            {uniqueIdentities.map((id, index) => (
              <div key={`${id.value}-${id.source}-${index}`}>
                <Label isCompact>{id.value}</Label>{' '}
              </div>
            ))}
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}

      <DescriptionListGroup>
        <DescriptionListTermHelpText>
          <Popover
            headerContent={<div>Signatures</div>}
            bodyContent={
              <div>
                The number of cryptographic signatures found for this artifact.
              </div>
            }
          >
            <DescriptionListTermHelpTextButton>
              Signatures
            </DescriptionListTermHelpTextButton>
          </Popover>
        </DescriptionListTermHelpText>
        <DescriptionListDescription>
          {signatureCount}
        </DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <DescriptionListTermHelpText>
          <Popover
            headerContent={<div>Attestations</div>}
            bodyContent={
              <div>
                The number of in-toto attestations found for this artifact.
              </div>
            }
          >
            <DescriptionListTermHelpTextButton>
              Attestations
            </DescriptionListTermHelpTextButton>
          </Popover>
        </DescriptionListTermHelpText>
        <DescriptionListDescription>
          {attestationCount}
        </DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <DescriptionListTermHelpText>
          <Popover
            headerContent={<div>Rekor Entries</div>}
            bodyContent={
              <div>
                The number of transparency log entries recorded in Rekor for
                this artifact.
              </div>
            }
          >
            <DescriptionListTermHelpTextButton>
              Rekor Entries
            </DescriptionListTermHelpTextButton>
          </Popover>
        </DescriptionListTermHelpText>
        <DescriptionListDescription>
          {rekorEntryCount}
        </DescriptionListDescription>
      </DescriptionListGroup>

      {summary?.timeCoherence && (
        <DescriptionListGroup>
          <DescriptionListTermHelpText>
            <Popover
              headerContent={<div>Time Coherence</div>}
              bodyContent={
                <div>
                  Indicates whether all signing timestamps for the artifact are
                  consistent and within expected bounds.
                </div>
              }
            >
              <DescriptionListTermHelpTextButton>
                Time Coherence
              </DescriptionListTermHelpTextButton>
            </Popover>
          </DescriptionListTermHelpText>
          <DescriptionListDescription>
            {summary.timeCoherence.status === 'ok'
              ? `OK (${formatDate(
                  summary.timeCoherence.minIntegratedTime,
                )} – ${formatDate(summary.timeCoherence.maxIntegratedTime)})`
              : summary.timeCoherence.status}
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
    </DescriptionList>
  );
}
