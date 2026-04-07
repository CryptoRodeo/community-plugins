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
import { lazy, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { RekorSearchPage } from './Rekor/RekorSearchPage';
import { RekorEntryPage } from './Rekor/RekorEntryPage';
import { useDarkTheme } from '../hooks/useDarkTheme';
import '@patternfly/react-core/dist/styles/base.css';
import './patternfly-backstage-overrides.css';

const TrustRootPageLazy = lazy(() =>
  import('./TrustRoot/TrustRootPage').then(m => ({
    default: m.TrustRootPage,
  })),
);

const ArtifactsPageLazy = lazy(() =>
  import('./Artifacts/ArtifactsPage').then(m => ({
    default: m.ArtifactsPage,
  })),
);

/**
 * Internal router for the Rekor section, handling sub-navigation
 * between the search page and individual entry detail views.
 */
export function RekorRouter() {
  const [selectedLogIndex, setSelectedLogIndex] = useState<string | null>(null);

  if (selectedLogIndex) {
    return (
      <RekorEntryPage
        logIndex={selectedLogIndex}
        onBack={() => setSelectedLogIndex(null)}
      />
    );
  }

  return <RekorSearchPage />;
}

/**
 * Main router component for the RHTAS plugin, handling navigation
 * between Trust Root, Artifacts, and Rekor views.
 */
export function Router() {
  useDarkTheme();

  return (
    <Routes>
      <Route path="/trust-root" element={<TrustRootPageLazy />} />
      <Route path="/artifacts" element={<ArtifactsPageLazy />} />
      <Route path="/rekor" element={<RekorRouter />} />
      <Route path="/" element={<TrustRootPageLazy />} />
    </Routes>
  );
}
