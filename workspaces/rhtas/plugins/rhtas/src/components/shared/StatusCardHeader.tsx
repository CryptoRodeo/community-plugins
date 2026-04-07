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

import type { ReactNode } from 'react';
import {
  CardHeader,
  CardTitle,
  Label,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import QuestionCircleIcon from '@patternfly/react-icons/dist/esm/icons/question-circle-icon';

/** Maps verification status to PatternFly Label color. */
export function verificationStatusToLabelColor(
  status: string,
): 'green' | 'red' | 'yellow' | 'grey' {
  switch (status) {
    case 'verified':
      return 'green';
    case 'failed':
      return 'red';
    case 'partial':
      return 'yellow';
    default:
      return 'grey';
  }
}

function statusIcon(status: string): ReactNode {
  switch (status) {
    case 'verified':
      return <CheckCircleIcon />;
    case 'failed':
      return <ExclamationCircleIcon />;
    case 'partial':
      return <ExclamationTriangleIcon />;
    default:
      return <QuestionCircleIcon />;
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'verified':
      return 'Verified';
    case 'failed':
      return 'Failed';
    case 'partial':
      return 'Partially Verified';
    default:
      return 'Unsigned';
  }
}

/** Props for StatusCardHeader. */
export interface StatusCardHeaderProps {
  title: string;
  status?: string;
  registryUrl?: string;
  onExpand?: () => void;
}

/**
 * Card header with a verification status badge and optional external registry link.
 * Used for artifact cards to show verification state prominently.
 */
export function StatusCardHeader({
  title,
  status,
  registryUrl,
  onExpand,
}: StatusCardHeaderProps) {
  return (
    <CardHeader onExpand={onExpand}>
      <CardTitle>
        <Split hasGutter>
          <SplitItem>
            {registryUrl ? (
              <a href={registryUrl} target="_blank" rel="noopener noreferrer">
                {title} <ExternalLinkAltIcon />
              </a>
            ) : (
              title
            )}
          </SplitItem>
          {status && (
            <SplitItem>
              <Label
                color={verificationStatusToLabelColor(status)}
                icon={statusIcon(status)}
              >
                {statusLabel(status)}
              </Label>
            </SplitItem>
          )}
        </Split>
      </CardTitle>
    </CardHeader>
  );
}
