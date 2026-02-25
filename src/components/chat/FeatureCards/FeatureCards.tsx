'use client';

import { Sparkle, Package, UserCircle, PaintBrush, ChatCircle } from '@phosphor-icons/react';
import { useChat, CreativeMode } from '@/lib/chat-context';
import { useBrand } from '@/lib/brand-context';
import { isModeVisible } from '@/lib/mode-visibility';
import styles from './FeatureCards.module.css';

const FEATURES: { id: CreativeMode; icon: React.ReactNode; title: string; description: string; alwaysShow?: boolean }[] = [
  { id: 'imagine', icon: <Sparkle size={22} weight="duotone" />, title: 'Imagine', description: 'Build images or videos on brand', alwaysShow: true },
  { id: 'product', icon: <Package size={22} weight="duotone" />, title: 'Product', description: 'Integrate products into photographs', alwaysShow: true },
  { id: 'character', icon: <UserCircle size={22} weight="duotone" />, title: 'Character', description: 'Create on-brand images with characters', alwaysShow: true },
  { id: 'create', icon: <PaintBrush size={22} weight="duotone" />, title: 'Create', description: 'Create on-brand ads', alwaysShow: true },
  { id: 'assistant', icon: <ChatCircle size={22} weight="duotone" />, title: 'Chat', description: 'Chat with your brand assistant', alwaysShow: false },
];

export default function FeatureCards() {
  const { dispatch } = useChat();
  const { hasAssistant } = useBrand();

  const visibleFeatures = FEATURES.filter(
    (f) => isModeVisible(f.id) && (f.alwaysShow || (f.id === 'assistant' && hasAssistant))
  );

  return (
    <div className={styles.grid}>
      {visibleFeatures.map((feature) => (
        <button
          key={feature.id}
          className={styles.card}
          onClick={() => dispatch({ type: 'SET_MODE', payload: feature.id })}
        >
          <span className={styles.icon}>{feature.icon}</span>
          <span className={styles.title}>{feature.title}</span>
          <span className={styles.description}>{feature.description}</span>
        </button>
      ))}
    </div>
  );
}
