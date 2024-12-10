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
import {
  TableCell,
  TableHead,
  TableRow,
  Theme,
  makeStyles,
} from '@material-ui/core';
import React from 'react';

export type PipelineRunTableColumn = Record<
  string,
  { name: string; props?: Record<string, any> }
>;

const columns: PipelineRunTableColumn = {
  pipelineRunId: {
    name: 'Pipeline Run ID',
  },
  source: {
    name: 'Source',
  },
  type: {
    name: 'Type',
  },
  critical: {
    name: 'Critical',
  },
  important: {
    name: 'Important',
  },
  moderate: {
    name: 'Moderate',
  },
  low: {
    name: 'Low',
  },
  sbom: {
    name: 'SBOM',
  },
  actions: {
    name: 'Actions',
  },
  kebab: {
    name: ' ',
  },
};

const useStyles = makeStyles((theme: Theme) => ({
  columnHeader: {
    fontWeight: 'bold',
    color: '#757575',
  },
}));

export const PipelineRunTableColumns = () => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <TableHead>
        <TableRow>
          {Object.entries(columns).map(([key, value]) => (
            <TableCell
              className={classes.columnHeader}
              {...value.props}
              key={key}
            >
              {value.name}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    </React.Fragment>
  );
};