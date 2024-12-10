/*
 * Copyright 2024 The Backstage Authors
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
import React from 'react';
import { Output } from '@aonic-ui/pipelines';
import { PipelineRun } from '../../types/pipelinerun';

type PipelineRunOutputProps = {
  pr: PipelineRun;
};

export const PipelineRunOutput: React.FC<PipelineRunOutputProps> = ({ pr }) => {
  return (
    <Output
      pipelineRunName="pipelineRunName"
      pipelineRunStatus={pr.status}
      enterpriseContractPolicies={pr.enterpriseContractPolicies}
      acsImageScanResult={pr.acsImageScanResults}
      acsImageCheckResults={pr.acsImageCheckResults}
      acsDeploymentCheckResults={pr.acsDeploymentCheckResults}
      results={[{ name: 'result-1', value: 'value' }]}
    />
  );
};