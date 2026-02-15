'use client';

import { motion } from 'framer-motion';
import { useChat, ActiveView } from '@/lib/chat-context';
import styles from './FlipToggle.module.css';

const VIEWS: { id: ActiveView; label: string }[] = [
  { id: 'create', label: 'Brand Assistant' },
  { id: 'library', label: 'Library' },
];

export default function FlipToggle() {
  const { state, dispatch } = useChat();

  return (
    <div className={styles.toggle}>
      {VIEWS.map((view) => {
        const isActive = state.activeView === view.id;
        return (
          <button
            key={view.id}
            className={styles.option}
            onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: view.id })}
          >
            {isActive && (
              <motion.span
                className={styles.indicator}
                layoutId="flipIndicator"
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 30,
                }}
              />
            )}
            <span className={isActive ? styles.labelActive : styles.label}>
              {view.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
