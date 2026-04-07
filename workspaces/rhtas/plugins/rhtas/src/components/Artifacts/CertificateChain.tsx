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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  Card,
  CardBody,
  ClipboardCopy,
  Content,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
} from '@patternfly/react-core';
import { ParsedCertificate } from '@backstage-community/plugin-rhtas-common';
import { StatusCardHeader } from '../shared/StatusCardHeader';

/** Props for CertificateChain. */
export interface CertificateChainProps {
  certificates: ParsedCertificate[];
  chainStatus?: string;
}

/** Displays intermediate and root certificates in an accordion with chain verification status. */
export function CertificateChain({
  certificates,
  chainStatus,
}: CertificateChainProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  if (certificates.length === 0) {
    return null;
  }

  const toggle = (id: string) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    );
  };

  return (
    <Card isCompact>
      <StatusCardHeader title="Certificate Chain" status={chainStatus} />
      <CardBody>
        <Accordion asDefinitionList={false}>
          {certificates.map((cert, index) => {
            const id = `chain-cert-${index}`;
            return (
              <AccordionItem key={id} isExpanded={expandedIds.includes(id)}>
                <AccordionToggle id={id} onClick={() => toggle(id)}>
                  {cert.role.charAt(0).toUpperCase() + cert.role.slice(1)}:{' '}
                  {cert.subject}
                </AccordionToggle>
                <AccordionContent>
                  <DescriptionList isHorizontal isCompact>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Subject</DescriptionListTerm>
                      <DescriptionListDescription>
                        {cert.subject}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Issuer</DescriptionListTerm>
                      <DescriptionListDescription>
                        {cert.issuer}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Valid From</DescriptionListTerm>
                      <DescriptionListDescription>
                        {new Date(cert.notBefore).toLocaleString()}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Valid Until</DescriptionListTerm>
                      <DescriptionListDescription>
                        {new Date(cert.notAfter).toLocaleString()}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                  <Content component="h5" style={{ marginTop: '16px' }}>
                    PEM
                  </Content>
                  <ClipboardCopy
                    isCode
                    isReadOnly
                    variant="expansion"
                    hoverTip="Copy"
                    clickTip="Copied"
                  >
                    {cert.pem}
                  </ClipboardCopy>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardBody>
    </Card>
  );
}
