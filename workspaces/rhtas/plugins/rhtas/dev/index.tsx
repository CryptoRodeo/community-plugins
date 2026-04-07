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
import { createDevApp } from '@backstage/dev-utils';
import { TestApiProvider } from '@backstage/test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Page, Header, TabbedLayout } from '@backstage/core-components';
import { Entity } from '@backstage/catalog-model';
import {
  rhtasPlugin,
  EntityRhtasTrustRootContent,
  EntityRhtasOperationsContent,
  rhtasApiRef,
  RhtasApi,
} from '../src';
import {
  HealthResponse,
  VerifyArtifactRequest,
  VerifyArtifactResponse,
  ImageMetadataResponse,
  ArtifactPolicies,
  TrustConfig,
  RootMetadataInfoList,
  TargetsList,
  TargetContent,
  CertificateInfoList,
  TransparencyLogEntry,
  RekorPublicKey,
  TlogEntries,
  CertificateRole,
} from '@backstage-community/plugin-rhtas-common';

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'rhtas-demo',
    namespace: 'default',
    annotations: {
      'rhtas.redhat.com/enabled': 'true',
    },
  },
  spec: {
    type: 'service',
    lifecycle: 'production',
    owner: 'team-security',
  },
};

const mockCertificate = {
  role: CertificateRole.Leaf,
  subject: 'CN=sigstore-intermediate,O=sigstore.dev',
  issuer: 'CN=sigstore-root,O=sigstore.dev',
  serialNumber: '1234567890abcdef',
  notBefore: '2025-01-01T00:00:00Z',
  notAfter: '2027-01-01T00:00:00Z',
  sans: ['developer@example.com'],
  isCa: false,
  pem: '-----BEGIN CERTIFICATE-----\nMIIBxTCCAWugAwIBAgIUExample...\n-----END CERTIFICATE-----',
};

class MockRhtasClient implements RhtasApi {
  async healthCheck(): Promise<HealthResponse> {
    return { status: 'ok' };
  }

  async verifyArtifact(
    _request: VerifyArtifactRequest,
  ): Promise<VerifyArtifactResponse> {
    return {
      signatures: [
        {
          id: 1,
          digest:
            'sha256:abc123def456789012345678901234567890123456789012345678901234',
          timestamp: '2025-06-15T10:30:00Z',
          signatureStatus: {
            signature: 'verified',
            chain: 'verified',
            rekor: 'verified',
          },
          signingCertificate: mockCertificate,
          certificateChain: [
            {
              ...mockCertificate,
              role: CertificateRole.Intermediate,
              subject: 'CN=sigstore-intermediate,O=sigstore.dev',
            },
            {
              ...mockCertificate,
              role: CertificateRole.Root,
              subject: 'CN=sigstore-root,O=sigstore.dev',
              isCa: true,
            },
          ],
          rekorEntry: {
            logIndex: 12345678,
            logId: {
              keyId:
                'c0d23d6ad406973f9559f3ba2d1ca01f84147d8ffc5b8445c224f98b9591801d',
            },
            integratedTime: 1718451000,
            canonicalizedBody: '',
          },
          rawBundleJson: '{}',
        },
      ],
      attestations: [
        {
          id: 1,
          predicateType: 'https://slsa.dev/provenance/v1',
          payloadType: 'application/vnd.in-toto+json',
          type: 'dsse',
          digest:
            'sha256:abc123def456789012345678901234567890123456789012345678901234',
          timestamp: '2025-06-15T10:30:00Z',
          attestationStatus: {
            attestation: 'verified',
            chain: 'verified',
            rekor: 'verified',
          },
          signingCertificate: mockCertificate,
          certificateChain: [],
          rekorEntry: {
            logIndex: 12345679,
            integratedTime: 1718451000,
            canonicalizedBody: '',
          },
          rawBundleJson: '{}',
          rawStatementJson: JSON.stringify(
            { predicateType: 'https://slsa.dev/provenance/v1' },
            null,
            2,
          ),
        },
      ],
      summary: {
        overallStatus: 'verified',
        identities: [
          {
            id: 1,
            type: 'email',
            value: 'developer@example.com',
            source: 'san',
          },
        ],
        signatureCount: 1,
        attestationCount: 1,
        rekorEntryCount: 2,
        timeCoherence: { status: 'ok' },
      },
      artifact: {
        image: 'quay.io/example/my-app:v1.2.3',
        registry: 'quay.io',
        digest:
          'sha256:abc123def456789012345678901234567890123456789012345678901234',
        metadata: {
          mediaType: 'application/vnd.oci.image.manifest.v1+json',
          size: 52428800,
          created: '2025-06-15T08:00:00Z',
          labels: { os: 'linux', architecture: 'amd64' },
        },
      },
    };
  }

  async getImageMetadata(_uri: string): Promise<ImageMetadataResponse> {
    return {
      image: 'quay.io/example/my-app:v1.2.3',
      registry: 'quay.io',
      digest:
        'sha256:abc123def456789012345678901234567890123456789012345678901234',
      metadata: {
        mediaType: 'application/vnd.oci.image.manifest.v1+json',
        size: 52428800,
        created: '2025-06-15T08:00:00Z',
        labels: { os: 'linux', architecture: 'amd64' },
      },
    };
  }

  async getArtifactPolicies(_artifact: string): Promise<ArtifactPolicies> {
    return {
      artifact: 'quay.io/example/my-app:v1.2.3',
      policies: [
        {
          name: 'require-signature',
          status: 'passed',
          lastChecked: '2025-06-15T10:30:00Z',
        },
        {
          name: 'require-attestation',
          status: 'passed',
          lastChecked: '2025-06-15T10:30:00Z',
        },
      ],
      attestations: [
        {
          type: 'provenance',
          issuer: 'sigstore.dev',
          subject: 'developer@example.com',
          issuedAt: '2025-06-15T10:30:00Z',
        },
      ],
    };
  }

  async getTrustConfig(_tufRepoUrl?: string): Promise<TrustConfig> {
    return {
      fulcioCertAuthorities: [
        {
          subject: 'CN=sigstore-root,O=sigstore.dev',
          pem: '-----BEGIN CERTIFICATE-----\nMIIBxTCCAWugAwIBAgIURoot...\n-----END CERTIFICATE-----',
        },
      ],
    };
  }

  async getRootMetadataInfo(
    _tufRepoUrl?: string,
  ): Promise<RootMetadataInfoList> {
    return {
      'repo-url': 'https://tuf-repo-cdn.sigstore.dev',
      data: [
        { version: '5', expires: '2026-06-01T00:00:00Z', status: 'active' },
        { version: '4', expires: '2025-12-01T00:00:00Z', status: 'active' },
        { version: '3', expires: '2025-06-01T00:00:00Z', status: 'expired' },
      ],
    };
  }

  async getTargets(_tufRepoUrl?: string): Promise<TargetsList> {
    return {
      data: [
        {
          name: 'fulcio_v1.crt.pem',
          type: 'fulcio',
          status: 'Active',
          content:
            '-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----',
        },
        {
          name: 'rekor.pub',
          type: 'rekor',
          status: 'Active',
          content: '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----',
        },
      ],
    };
  }

  async getTarget(
    _target: string,
    _tufRepoUrl?: string,
  ): Promise<TargetContent> {
    return {
      content:
        '-----BEGIN CERTIFICATE-----\nMIIBxTCCAWugAwIBAgIUExample...\n-----END CERTIFICATE-----',
    };
  }

  async getTargetCertificates(
    _tufRepoUrl?: string,
  ): Promise<CertificateInfoList> {
    return {
      data: [
        {
          subject: 'CN=sigstore-root,O=sigstore.dev',
          issuer: 'CN=sigstore-root,O=sigstore.dev',
          type: 'fulcio',
          status: 'active',
          target: 'fulcio_v1.crt.pem',
          expiration: '2034-01-01T00:00:00Z',
          pem: '-----BEGIN CERTIFICATE-----\nMIIBxTCCAWugAwIBAgIURoot...\n-----END CERTIFICATE-----',
        },
        {
          subject: 'CN=sigstore-intermediate,O=sigstore.dev',
          issuer: 'CN=sigstore-root,O=sigstore.dev',
          type: 'fulcio',
          status: 'active',
          target: 'fulcio_v1.crt.pem',
          expiration: '2026-06-01T00:00:00Z',
          pem: '-----BEGIN CERTIFICATE-----\nMIIBxTCCAWugAwIBAgIUIntermediate...\n-----END CERTIFICATE-----',
        },
        {
          subject: 'CN=expiring-cert,O=example.com',
          issuer: 'CN=sigstore-intermediate,O=sigstore.dev',
          type: 'fulcio',
          status: 'expiring',
          target: 'fulcio_v1.crt.pem',
          expiration: '2025-07-01T00:00:00Z',
          pem: '-----BEGIN CERTIFICATE-----\nMIIBxTCCAWugAwIBAgIUExpiring...\n-----END CERTIFICATE-----',
        },
        {
          subject: 'CN=expired-cert,O=example.com',
          issuer: 'CN=sigstore-intermediate,O=sigstore.dev',
          type: 'fulcio',
          status: 'expired',
          target: 'fulcio_v1.crt.pem',
          expiration: '2024-01-01T00:00:00Z',
          pem: '-----BEGIN CERTIFICATE-----\nMIIBxTCCAWugAwIBAgIUExpired...\n-----END CERTIFICATE-----',
        },
      ],
    };
  }

  async getRekorEntry(_uuid: string): Promise<TransparencyLogEntry> {
    return {
      logIndex: 12345678,
      logId: {
        keyId:
          'c0d23d6ad406973f9559f3ba2d1ca01f84147d8ffc5b8445c224f98b9591801d',
      },
      integratedTime: 1718451000,
      canonicalizedBody: btoa(
        JSON.stringify({
          apiVersion: '0.0.1',
          kind: 'hashedrekord',
          spec: {
            data: {
              hash: {
                algorithm: 'sha256',
                value:
                  'abc123def456789012345678901234567890123456789012345678901234',
              },
            },
            signature: {
              content: 'MEUCIQExample...',
              publicKey: { content: 'LS0tLS1CRUdJTi...' },
            },
          },
        }),
      ),
    };
  }

  async getRekorPublicKey(): Promise<RekorPublicKey> {
    return {
      publicKey:
        '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkq...\n-----END PUBLIC KEY-----',
    };
  }

  async searchRekorEntries(
    _query: string,
    _type: string,
  ): Promise<TlogEntries> {
    return {
      '24296fb24b8ad77a': {
        body: btoa(
          JSON.stringify({ kind: 'hashedrekord', apiVersion: '0.0.1' }),
        ),
        integratedTime: 1718451000,
        logID:
          'c0d23d6ad406973f9559f3ba2d1ca01f84147d8ffc5b8445c224f98b9591801d',
        logIndex: 12345678,
        verification: { signedEntryTimestamp: 'MEUCIQDExample...' },
      },
      '35407ac35c9be88b': {
        body: btoa(JSON.stringify({ kind: 'dsse', apiVersion: '0.0.1' })),
        integratedTime: 1718364600,
        logID:
          'c0d23d6ad406973f9559f3ba2d1ca01f84147d8ffc5b8445c224f98b9591801d',
        logIndex: 12345677,
        verification: { signedEntryTimestamp: 'MEUCIQDExample2...' },
      },
    };
  }

  async getRekorEntryByIndex(_logIndex: string): Promise<TlogEntries> {
    return {
      '24296fb24b8ad77aa309e39d3de994960c86cbc5ee41a0300d5c9e38fb5bf2c1e2e83ba38f8ee988':
        {
          body: btoa(
            JSON.stringify({
              apiVersion: '0.0.1',
              kind: 'hashedrekord',
              spec: {
                data: {
                  hash: {
                    algorithm: 'sha256',
                    value:
                      'abc123def456789012345678901234567890123456789012345678901234',
                  },
                },
                signature: {
                  content: 'MEUCIQExample...',
                  publicKey: { content: 'LS0tLS1CRUdJTi...' },
                },
              },
            }),
          ),
          integratedTime: 1718451000,
          logID:
            'c0d23d6ad406973f9559f3ba2d1ca01f84147d8ffc5b8445c224f98b9591801d',
          logIndex: 12345678,
          verification: {
            signedEntryTimestamp: 'MEUCIQDExample...',
            inclusionProof: {
              checkpoint:
                'rekor.sigstore.dev - 2605736670972794746\n98765432\nabc123def456==\n',
              hashes: ['hash1', 'hash2', 'hash3'],
              logIndex: 12345678,
              rootHash: 'rootHashExample123',
              treeSize: 98765432,
            },
          },
        },
    };
  }
}

createDevApp()
  .registerPlugin(rhtasPlugin)
  .addPage({
    element: (
      <TestApiProvider apis={[[rhtasApiRef, new MockRhtasClient()]]}>
        <EntityProvider entity={mockEntity}>
          <Page themeId="service">
            <Header type="component — service" title="RHTAS Demo Application" />
            <TabbedLayout>
              <TabbedLayout.Route path="/" title="Trust Root">
                <EntityRhtasTrustRootContent />
              </TabbedLayout.Route>
              <TabbedLayout.Route path="/operations" title="Operations">
                <EntityRhtasOperationsContent />
              </TabbedLayout.Route>
            </TabbedLayout>
          </Page>
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'RHTAS',
    path: '/rhtas',
  })
  .render();
