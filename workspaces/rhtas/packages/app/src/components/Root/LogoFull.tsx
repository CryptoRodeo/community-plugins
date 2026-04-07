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
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  svg: {
    width: 'auto',
    height: 30,
  },
  path: {
    fill: '#7df3e1',
  },
});
const LogoFull = () => {
  const classes = useStyles();

  return (
    <svg
      className={classes.svg}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 176 40"
    >
      <path
        className={classes.path}
        d="M10.71 5.55L17.46 0v40l-6.75-5.55V5.55zM24.22 5.55L17.46 0v40l6.76-5.55V5.55z"
      />
      <text
        x="34"
        y="28"
        fill="#7df3e1"
        fontFamily="sans-serif"
        fontSize="20"
        fontWeight="bold"
      >
        Backstage
      </text>
    </svg>
  );
};

export default LogoFull;
