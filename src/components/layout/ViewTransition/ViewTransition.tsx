'use client';

import { motion } from 'framer-motion';
import { useChat } from '@/lib/chat-context';
import styles from './ViewTransition.module.css';

interface ViewTransitionProps {
  createView: React.ReactNode;
  libraryView: React.ReactNode;
}

const springTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

export default function ViewTransition({ createView, libraryView }: ViewTransitionProps) {
  const { state } = useChat();
  const isCreate = state.activeView === 'create';

  return (
    <div className={styles.container}>
      {/* Create View – always mounted */}
      <motion.div
        className={styles.view}
        initial={{ x: '0%', opacity: 1, scale: 1 }}
        animate={{
          x: isCreate ? '0%' : '-5%',
          opacity: isCreate ? 1 : 0,
          scale: isCreate ? 1 : 0.98,
        }}
        transition={springTransition}
        style={{
          pointerEvents: isCreate ? 'auto' : 'none',
          position: isCreate ? 'relative' : 'absolute',
          zIndex: isCreate ? 1 : 0,
        }}
      >
        {createView}
      </motion.div>

      {/* Library View – always mounted, starts hidden */}
      <motion.div
        className={styles.view}
        initial={{ x: '5%', opacity: 0, scale: 0.98 }}
        animate={{
          x: isCreate ? '5%' : '0%',
          opacity: isCreate ? 0 : 1,
          scale: isCreate ? 0.98 : 1,
        }}
        transition={springTransition}
        style={{
          pointerEvents: isCreate ? 'none' : 'auto',
          position: isCreate ? 'absolute' : 'relative',
          zIndex: isCreate ? 0 : 1,
        }}
      >
        {libraryView}
      </motion.div>
    </div>
  );
}
