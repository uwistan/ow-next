import type { CreativeMode } from '@/lib/chat-context';

/**
 * Modes that are unlocked for the current brand/plan.
 * Locked modes appear grayed out with a hover popover (unlock/contact).
 */
export const UNLOCKED_MODES: CreativeMode[] = ['imagine', 'assistant', 'product', 'character'];

export function isModeUnlocked(mode: CreativeMode): boolean {
  return UNLOCKED_MODES.includes(mode);
}
