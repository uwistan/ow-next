import type { CreativeMode } from '@/lib/chat-context';

/**
 * Modes that exist in the codebase but are currently hidden from the UI
 * (tabs, feature cards, history filter). Set to empty array to show all modes.
 */
export const HIDDEN_MODES: CreativeMode[] = ['create', 'product', 'character'];

export function isModeVisible(mode: CreativeMode): boolean {
  return !HIDDEN_MODES.includes(mode);
}
