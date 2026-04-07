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
import { Label } from '@patternfly/react-core';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import QuestionCircleIcon from '@patternfly/react-icons/dist/esm/icons/question-circle-icon';

/** Props for StatusIcon. */
export interface StatusIconProps {
  status: 'verified' | 'failed' | 'unsigned' | string;
}

/** Generic status icon for verified/failed/unsigned states. */
export function StatusIcon({ status }: StatusIconProps) {
  switch (status) {
    case 'verified':
      return (
        <Label color="green" icon={<CheckCircleIcon />}>
          Verified
        </Label>
      );
    case 'failed':
      return (
        <Label color="red" icon={<ExclamationCircleIcon />}>
          Failed
        </Label>
      );
    case 'unsigned':
      return (
        <Label color="grey" icon={<QuestionCircleIcon />}>
          Unsigned
        </Label>
      );
    default:
      return <Label color="grey">{status}</Label>;
  }
}
