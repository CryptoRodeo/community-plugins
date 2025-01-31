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
import { quayViewPermission } from '@backstage-community/plugin-quay-common';
import {
  HttpAuthService,
  LoggerService,
  PermissionsService,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { NotAllowedError } from '@backstage/errors';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';
import express from 'express';
import Router from 'express-promise-router';
import { QuayApi } from '../api/QuayApi';

export interface RouterOptions {
  quayApi?: QuayApi;
  logger: LoggerService;
  config: Config;
  permissions: PermissionsService;
  httpAuth: HttpAuthService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, permissions, httpAuth } = options;

  if (!config) {
    throw new Error('Missing configuration for Quay plugin');
  }

  const quayApi = options.quayApi ?? QuayApi.fromConfig(config, logger);

  const router = Router();
  router.use(express.json());

  const permissionIntegrationRouter = createPermissionIntegrationRouter({
    permissions: [quayViewPermission],
  });

  // Add permission middleware
  const checkPermission = async (
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction,
  ): Promise<void> => {
    try {
      const decision = (
        await permissions.authorize([{ permission: quayViewPermission }], {
          credentials: await httpAuth.credentials(req),
        })
      )[0];

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError('Unauthorized');
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };

  router.use(permissionIntegrationRouter);
  router.use('/repository', checkPermission);

  const validateParams = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): void => {
    const { org, repo } = req.params;
    if (!org || !repo) {
      res.status(400).json({ error: 'Missing required parameters' });

      return;
    }
    next();
  };

  router.use('/repository/:org/:repo', validateParams);

  router.get('/repository/:org/:repo/tag', async (req, res) => {
    const { org, repo } = req.params;
    const { page, limit } = req.query;

    const tags = await quayApi.getTags(
      org,
      repo,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );

    res.status(200).json(tags);
  });

  router.get(
    '/repository/:org/:repo/manifest/:digest/labels',
    async (req, res) => {
      const { org, repo, digest } = req.params;
      const labels = await quayApi.getLabels(org, repo, digest);

      res.status(200).json(labels);
    },
  );

  router.get(
    '/repository/:org/:repo/manifest/:digest/security',
    async (req, res) => {
      const { org, repo, digest } = req.params;

      const securityDetails = await quayApi.getSecurityDetails(
        org,
        repo,
        digest,
      );

      res.status(200).json(securityDetails);
    },
  );

  router.get('/repository/:org/:repo/manifest/:digest', async (req, res) => {
    const { org, repo, digest } = req.params;
    const manifest = await quayApi.getManifestByDigest(org, repo, digest);

    res.status(200).json(manifest);
  });

  return router;
}
