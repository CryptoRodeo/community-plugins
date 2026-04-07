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
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  AlertVariant,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Dropdown,
  DropdownItem,
  DropdownList,
  Label,
  MenuToggle,
} from '@patternfly/react-core';
import EllipsisVIcon from '@patternfly/react-icons/dist/esm/icons/ellipsis-v-icon';
import { ParsedCertificate } from '@backstage-community/plugin-rhtas-common';
import { sha256FingerprintFromPem } from '../../utils/certificate';

/** Props for LeafCertificate. */
export interface LeafCertificateProps {
  certificate: ParsedCertificate;
}

interface ToastAlert {
  key: number;
  variant: AlertVariant;
  title: string;
}

/** Displays the signing (leaf) certificate details with fingerprint and actions. */
export function LeafCertificate({ certificate }: LeafCertificateProps) {
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [alerts, setAlerts] = useState<ToastAlert[]>([]);
  const alertKeyRef = useRef(0);

  useEffect(() => {
    if (certificate.pem) {
      sha256FingerprintFromPem(certificate.pem).then(
        fp => setFingerprint(fp),
        () => setFingerprint(null),
      );
    }
  }, [certificate.pem]);

  const addAlert = (variant: AlertVariant, title: string) => {
    const key = alertKeyRef.current++;
    setAlerts(prev => [...prev, { key, variant, title }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.key !== key));
    }, 5000);
  };

  const handleCopyPem = async () => {
    setIsDropdownOpen(false);
    try {
      await window.navigator.clipboard.writeText(certificate.pem);
      addAlert(AlertVariant.success, 'PEM copied to clipboard');
    } catch {
      addAlert(AlertVariant.danger, 'Failed to copy PEM to clipboard');
    }
  };

  return (
    <>
      <AlertGroup isToast isLiveRegion>
        {alerts.map(alert => (
          <Alert
            key={alert.key}
            variant={alert.variant}
            title={alert.title}
            actionClose={
              <AlertActionCloseButton
                onClose={() =>
                  setAlerts(prev => prev.filter(a => a.key !== alert.key))
                }
              />
            }
          />
        ))}
      </AlertGroup>
      <Card isCompact>
        <CardHeader
          actions={{
            actions: (
              <Dropdown
                isOpen={isDropdownOpen}
                onSelect={() => setIsDropdownOpen(false)}
                onOpenChange={setIsDropdownOpen}
                toggle={toggleRef => (
                  <MenuToggle
                    ref={toggleRef}
                    variant="plain"
                    onClick={() => setIsDropdownOpen(prev => !prev)}
                    isExpanded={isDropdownOpen}
                    aria-label="Certificate actions"
                  >
                    <EllipsisVIcon />
                  </MenuToggle>
                )}
                popperProps={{ position: 'right' }}
              >
                <DropdownList>
                  <DropdownItem key="copy-pem" onClick={handleCopyPem}>
                    Copy PEM to clipboard
                  </DropdownItem>
                </DropdownList>
              </Dropdown>
            ),
          }}
        >
          <CardTitle>Signing Certificate</CardTitle>
        </CardHeader>
        <CardBody>
          <DescriptionList isHorizontal>
            <DescriptionListGroup>
              <DescriptionListTerm>Subject</DescriptionListTerm>
              <DescriptionListDescription>
                {certificate.subject}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Issuer</DescriptionListTerm>
              <DescriptionListDescription>
                {certificate.issuer}
              </DescriptionListDescription>
            </DescriptionListGroup>
            {certificate.sans.length > 0 && (
              <DescriptionListGroup>
                <DescriptionListTerm>SANs</DescriptionListTerm>
                <DescriptionListDescription>
                  {certificate.sans.join(', ')}
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}
            <DescriptionListGroup>
              <DescriptionListTerm>Serial Number</DescriptionListTerm>
              <DescriptionListDescription>
                {certificate.serialNumber}
              </DescriptionListDescription>
            </DescriptionListGroup>
            {fingerprint && (
              <DescriptionListGroup>
                <DescriptionListTerm>Fingerprint</DescriptionListTerm>
                <DescriptionListDescription
                  style={{ fontFamily: 'monospace', fontSize: '0.85em' }}
                >
                  {fingerprint}
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}
            <DescriptionListGroup>
              <DescriptionListTerm>Valid From</DescriptionListTerm>
              <DescriptionListDescription>
                {new Date(certificate.notBefore).toLocaleString()}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Valid Until</DescriptionListTerm>
              <DescriptionListDescription>
                {new Date(certificate.notAfter).toLocaleString()}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Is CA</DescriptionListTerm>
              <DescriptionListDescription>
                <Label color={certificate.isCa ? 'blue' : 'grey'}>
                  {certificate.isCa ? 'Yes' : 'No'}
                </Label>
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </CardBody>
      </Card>
    </>
  );
}
