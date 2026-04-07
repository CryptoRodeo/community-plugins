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
import { ClipboardCopy, ClipboardCopyVariant } from '@patternfly/react-core';

/** Props for CopyToClipboard. */
export interface CopyToClipboardProps {
  text: string;
  variant?: 'inline-compact' | 'expansion';
  isCode?: boolean;
  hoverTip?: string;
  clickTip?: string;
}

/**
 * Button component that copies text to clipboard using PatternFly's
 * ClipboardCopy with tooltip confirmation.
 */
export function CopyToClipboard({
  text,
  variant = 'inline-compact',
  isCode = false,
  hoverTip = 'Copy',
  clickTip = 'Copied',
}: CopyToClipboardProps) {
  return (
    <ClipboardCopy
      isReadOnly
      isCode={isCode}
      variant={
        variant === 'expansion'
          ? ClipboardCopyVariant.expansion
          : ClipboardCopyVariant.inlineCompact
      }
      hoverTip={hoverTip}
      clickTip={clickTip}
    >
      {text}
    </ClipboardCopy>
  );
}
