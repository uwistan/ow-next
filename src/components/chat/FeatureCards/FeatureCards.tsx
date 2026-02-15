'use client';

import { Sparkle, Package, UserCircle, PaintBrush } from '@phosphor-icons/react';
import { useChat, CreativeMode } from '@/lib/chat-context';
import styles from './FeatureCards.module.css';

const FEATURES: { id: CreativeMode; icon: React.ReactNode; title: string; description: string }[] = [
  {
    id: 'imagine',
    icon: <Sparkle size={22} weight="duotone" />,
    title: 'Imagine',
    description: 'Build images or videos on brand',
  },
  {
    id: 'product',
    icon: <Package size={22} weight="duotone" />,
    title: 'Product',
    description: 'Integrate products into photographs',
  },
  {
    id: 'character',
    icon: <UserCircle size={22} weight="duotone" />,
    title: 'Character',
    description: 'Create on-brand images with characters',
  },
  {
    id: 'create',
    icon: <PaintBrush size={22} weight="duotone" />,
    title: 'Create',
    description: 'Create on-brand ads',
  },
];

export default function FeatureCards() {
  const { dispatch } = useChat();

  return (
    <div className={styles.grid}>
      {FEATURES.map((feature) => (
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
