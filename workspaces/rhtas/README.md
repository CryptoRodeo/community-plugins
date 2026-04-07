# RHTAS Workspace

This workspace contains Backstage plugins for [Red Hat Trusted Artifact Signer (RHTAS)](https://docs.redhat.com/en/documentation/red_hat_trusted_artifact_signer), providing artifact signing verification, transparency log search, and trust root management directly within Backstage catalog entity pages.

## Plugins

- [rhtas](./plugins/rhtas): Frontend plugin that provides entity tab UI for Trust Root, Artifacts, and Rekor Search views.
- [rhtas-backend](./plugins/rhtas-backend): Backend plugin that proxies requests to the RHTAS console backend and Rekor transparency log.
- [rhtas-common](./plugins/rhtas-common): Shared TypeScript types used by both frontend and backend plugins.

## Prerequisites

- A running [rhtas-console](https://github.com/securesign/rhtas-console) instance
- A Rekor transparency log instance (defaults to the public [Sigstore Rekor](https://rekor.sigstore.dev))

## Installation

Install the frontend and backend packages in your Backstage app:

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-rhtas-backend
yarn --cwd packages/app add @backstage-community/plugin-rhtas
```

### Backend Setup

Add the backend plugin to your `packages/backend/src/index.ts`:

```ts
const backend = createBackend();

// ... other plugins
backend.add(import('@backstage-community/plugin-rhtas-backend'));

backend.start();
```

### Frontend Setup

Add the entity tab to your `packages/app/src/components/catalog/EntityPage.tsx`:

```tsx
import {
  EntityRhtasTrustRootContent,
  EntityRhtasOperationsContent,
  isRhtasAvailable,
} from '@backstage-community/plugin-rhtas';

// In your entity page definition:
<EntitySwitch.Case if={isRhtasAvailable}>
  <EntityRhtasTrustRootContent />
  <EntityRhtasOperationsContent />
</EntitySwitch.Case>;
```

You can also use individual tab components for more control:

```tsx
import {
  EntityRhtasTrustRootContent,
  EntityRhtasOperationsContent,
  EntityRhtasArtifactsContent,
  EntityRhtasRekorContent,
} from '@backstage-community/plugin-rhtas';
```

## Configuration

Add the following to your `app-config.yaml`:

```yaml
rhtas:
  # Required: URL of the rhtas-console backend
  consoleUrl: http://localhost:8080
  # Optional: URL of the Rekor transparency log instance
  # Defaults to https://rekor.sigstore.dev
  rekorUrl: https://rekor.sigstore.dev
  # Optional: URL of the TUF repository
  # Defaults to https://tuf-repo-cdn.sigstore.dev
  tufRepoUrl: https://tuf-repo-cdn.sigstore.dev
```

## Annotating Catalog Entities

To enable the RHTAS tabs on a catalog entity, add the `rhtas.redhat.com/enabled` annotation:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  annotations:
    rhtas.redhat.com/enabled: 'true'
spec:
  type: service
  lifecycle: production
  owner: my-team
```
