/**
 * Current mode for @-mention filtering. Updated by ChatInput when mode changes.
 * - product: only products in @ list
 * - character: only characters in @ list
 * - imagine | assistant: both products and characters
 */
let currentMentionMode: string = 'imagine';

export function setMentionMode(mode: string): void {
  currentMentionMode = mode;
}

export function getMentionMode(): string {
  return currentMentionMode;
}
