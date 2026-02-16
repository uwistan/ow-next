'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { X, Plus } from '@phosphor-icons/react';
import styles from './ManagePanel.module.css';

interface ManagePanelProps {
  title: string;
  onClose: () => void;
  onCreateNew?: () => void;
  createLabel?: string;
  children: ReactNode;
}

export default function ManagePanel({
  title,
  onClose,
  onCreateNew,
  createLabel = 'Create New',
  children,
}: ManagePanelProps) {
  return (
    <>
      <motion.div
        className={styles.backdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className={styles.panel}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {onCreateNew && (
          <button className={styles.createBtn} onClick={onCreateNew}>
            <Plus size={16} />
            {createLabel}
          </button>
        )}

        <div className={styles.list}>{children}</div>
      </motion.div>
    </>
  );
}

/* ── Re-export styles for list items used by panel content components ── */
export { styles as managePanelStyles };
