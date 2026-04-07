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
  LoggerService,
  RootConfigService,
  HttpAuthService,
} from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import {
  RhtasConsoleClient,
  ConsoleHttpError,
} from '../clients/RhtasConsoleClient';
import { RekorClient } from '../clients/RekorClient';

/** Return the upstream status code if available, otherwise 502. */
function upstreamStatus(error: unknown): number {
  return error instanceof ConsoleHttpError ? error.statusCode : 502;
}

export interface RhtasRouterOptions {
  logger: LoggerService;
  config: RootConfigService;
  httpAuth: HttpAuthService;
}

const DEFAULT_REKOR_URL = 'https://rekor.sigstore.dev';

export async function createRouter(
  options: RhtasRouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  const consoleUrl = config.getString('rhtas.consoleUrl');
  const rekorUrl =
    config.getOptionalString('rhtas.rekorUrl') ?? DEFAULT_REKOR_URL;

  const consoleClient = new RhtasConsoleClient(consoleUrl);
  const rekorClient = new RekorClient(rekorUrl);

  logger.info(`RHTAS backend plugin initialized (console: ${consoleUrl})`);

  const router = Router();
  router.use(express.json());

  // Health check
  router.get('/health', async (_req, res) => {
    try {
      const result = await consoleClient.healthCheck();
      res.json(result);
    } catch (error) {
      res
        .status(upstreamStatus(error))
        .json({ error: 'RHTAS console is unreachable' });
    }
  });

  // Artifact verification
  router.post('/artifacts/verify', async (req, res) => {
    const { ociImage, tufRepoUrl } = req.body;
    if (!ociImage) {
      res.status(400).json({ error: 'ociImage is required' });
      return;
    }
    try {
      const result = await consoleClient.verifyArtifact({
        ociImage,
        tufRepoUrl,
      });
      res.json(result);
    } catch (error) {
      res
        .status(upstreamStatus(error))
        .json({ error: 'Failed to verify artifact' });
    }
  });

  // Image metadata
  router.get('/artifacts/image', async (req, res) => {
    const uri = req.query.uri as string;
    if (!uri) {
      res.status(400).json({ error: 'uri query parameter is required' });
      return;
    }
    try {
      const result = await consoleClient.getImageMetadata(uri);
      res.json(result);
    } catch (error) {
      res
        .status(upstreamStatus(error))
        .json({ error: 'Failed to get image metadata' });
    }
  });

  // Artifact policies
  router.get('/artifacts/:artifact/policies', async (req, res) => {
    try {
      const result = await consoleClient.getArtifactPolicies(
        req.params.artifact,
      );
      res.json(result);
    } catch (error) {
      res
        .status(upstreamStatus(error))
        .json({ error: 'Failed to get artifact policies' });
    }
  });

  // Trust config
  router.get('/trust/config', async (req, res) => {
    try {
      const result = await consoleClient.getTrustConfig(
        req.query.tufRepoUrl as string | undefined,
      );
      res.json(result);
    } catch (error) {
      res
        .status(upstreamStatus(error))
        .json({ error: 'Failed to get trust config' });
    }
  });

  // Root metadata info
  router.get('/trust/root-metadata-info', async (req, res) => {
    try {
      const result = await consoleClient.getRootMetadataInfo(
        req.query.tufRepoUrl as string | undefined,
      );
      res.json(result);
    } catch (error) {
      res
        .status(upstreamStatus(error))
        .json({ error: 'Failed to get root metadata info' });
    }
  });

  // Targets
  router.get('/trust/targets', async (req, res) => {
    try {
      const result = await consoleClient.getTargets(
        req.query.tufRepoUrl as string | undefined,
      );
      res.json(result);
    } catch (error) {
      res
        .status(upstreamStatus(error))
        .json({ error: 'Failed to get targets' });
    }
  });

  // Single target
  router.get('/trust/target', async (req, res) => {
    const target = req.query.target as string;
    if (!target) {
      res.status(400).json({ error: 'target query parameter is required' });
      return;
    }
    try {
      const result = await consoleClient.getTarget(
        target,
        req.query.tufRepoUrl as string | undefined,
      );
      res.json(result);
    } catch (error) {
      res.status(upstreamStatus(error)).json({ error: 'Failed to get target' });
    }
  });

  // Target certificates
  router.get('/trust/targets/certificates', async (req, res) => {
    try {
      const result = await consoleClient.getTargetCertificates(
        req.query.tufRepoUrl as string | undefined,
      );
      res.json(result);
    } catch (error) {
      res
        .status(upstreamStatus(error))
        .json({ error: 'Failed to get target certificates' });
    }
  });

  // Rekor entry by UUID
  router.get('/rekor/entries/:uuid', async (req, res) => {
    try {
      const result = await consoleClient.getRekorEntry(req.params.uuid);
      res.json(result);
    } catch (error) {
      res
        .status(upstreamStatus(error))
        .json({ error: 'Failed to get Rekor entry' });
    }
  });

  // Rekor public key
  router.get('/rekor/public-key', async (_req, res) => {
    try {
      const result = await consoleClient.getRekorPublicKey();
      res.json(result);
    } catch (error) {
      res
        .status(upstreamStatus(error))
        .json({ error: 'Failed to get Rekor public key' });
    }
  });

  // Rekor search (proxied to Rekor instance)
  router.post('/rekor/search', async (req, res) => {
    const { query, type } = req.body;
    if (!query || !type) {
      res
        .status(400)
        .json({ error: 'query and type are required in request body' });
      return;
    }
    try {
      const result = await rekorClient.searchLogEntries({ query, type });
      res.json(result);
    } catch (error) {
      res.status(502).json({ error: 'Failed to search Rekor entries' });
    }
  });

  // Rekor entry by log index (proxied to Rekor instance)
  router.get('/rekor/entries-by-index/:logIndex', async (req, res) => {
    try {
      const result = await rekorClient.getLogEntryByIndex(req.params.logIndex);
      res.json(result);
    } catch (error) {
      res.status(502).json({ error: 'Failed to get Rekor entry by index' });
    }
  });

  return router;
}
