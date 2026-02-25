'use client';

import { Sparkle, Package, UserCircle, PaintBrush, ChatCircle } from '@phosphor-icons/react';
import cn from 'classnames';
import { useChat, CreativeMode } from '@/lib/chat-context';
import { useBrand } from '@/lib/brand-context';
import { isModeVisible } from '@/lib/mode-visibility';
import styles from './ModeTabs.module.css';

const TAB_MODES: { id: CreativeMode; icon: React.ReactNode; label: string }[] = [
  { id: 'imagine', icon: <Sparkle size={16} weight="fill" />, label: 'Imagine' },
  { id: 'product', icon: <Package size={16} weight="fill" />, label: 'Product' },
  { id: 'character', icon: <UserCircle size={16} weight="fill" />, label: 'Character' },
  { id: 'create', icon: <PaintBrush size={16} weight="fill" />, label: 'Create' },
  { id: 'assistant', icon: <ChatCircle size={16} weight="fill" />, label: 'Chat' },
];

export default function ModeTabs() {
  const { state, dispatch } = useChat();
  const { hasAssistant } = useBrand();

  const effectiveMode = state.mode === 'idle' ? 'imagine' : state.mode;

  const visibleTabs = TAB_MODES.filter(
    (t) => isModeVisible(t.id) && (t.id !== 'assistant' || hasAssistant)
  );

  return (
    <div className={styles.tabs}>
      {visibleTabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={cn(styles.tab, effectiveMode === tab.id && styles.tabActive)}
          onClick={() => dispatch({ type: 'SET_MODE', payload: tab.id })}
        >
          <span className={styles.tabIcon}>{tab.icon}</span>
          <span className={styles.tabLabel}>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
