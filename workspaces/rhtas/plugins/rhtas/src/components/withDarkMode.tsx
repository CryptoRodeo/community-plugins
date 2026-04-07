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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDarkTheme } from '../hooks/useDarkTheme';
import { TrustRootPage } from './TrustRoot/TrustRootPage';
import { ArtifactsPage } from './Artifacts/ArtifactsPage';
import { RekorRouter } from './Router';
import { RhtasOperationsContent } from './RhtasOperationsContent';
import '@patternfly/react-core/dist/styles/base.css';
import './patternfly-backstage-overrides.css';

const queryClient = new QueryClient();

export function TrustRootPageWithDarkMode() {
  useDarkTheme();
  return (
    <QueryClientProvider client={queryClient}>
      <TrustRootPage />
    </QueryClientProvider>
  );
}

export function RhtasOperationsContentWithDarkMode() {
  useDarkTheme();
  return (
    <QueryClientProvider client={queryClient}>
      <RhtasOperationsContent />
    </QueryClientProvider>
  );
}

export function ArtifactsPageWithDarkMode() {
  useDarkTheme();
  return (
    <QueryClientProvider client={queryClient}>
      <ArtifactsPage />
    </QueryClientProvider>
  );
}

export function RekorRouterWithDarkMode() {
  useDarkTheme();
  return (
    <QueryClientProvider client={queryClient}>
      <RekorRouter />
    </QueryClientProvider>
  );
}
