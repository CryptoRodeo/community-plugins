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
import { Icon, type IconComponentProps } from '@patternfly/react-core';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import MinusIcon from '@patternfly/react-icons/dist/esm/icons/minus-icon';
import TimesCircleIcon from '@patternfly/react-icons/dist/esm/icons/times-circle-icon';
import WarningTriangleIcon from '@patternfly/react-icons/dist/esm/icons/warning-triangle-icon';

/** Props for CertificateStatusIcon. */
export interface CertificateStatusIconProps {
  status: string;
  iconProps?: IconComponentProps;
}

/**
 * Renders a PatternFly Icon with appropriate status color
 * for certificate status (active/expiring/expired).
 */
export function CertificateStatusIcon({
  status,
  iconProps,
}: CertificateStatusIconProps) {
  const normalized = status.toLocaleLowerCase();

  if (normalized === 'active' || normalized === 'valid') {
    return (
      <Icon status="success" {...iconProps}>
        <CheckCircleIcon />
      </Icon>
    );
  }
  if (normalized === 'expired') {
    return (
      <Icon status="danger" {...iconProps}>
        <TimesCircleIcon />
      </Icon>
    );
  }
  if (normalized === 'expiring') {
    return (
      <Icon status="warning" {...iconProps}>
        <WarningTriangleIcon />
      </Icon>
    );
  }
  return (
    <Icon size="xl">
      <MinusIcon />
    </Icon>
  );
}
