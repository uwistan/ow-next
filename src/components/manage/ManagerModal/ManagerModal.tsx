'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { X } from '@phosphor-icons/react';
import styles from './ManagerModal.module.css';

interface ManagerModalProps {
  title: string;
  onClose: () => void;
  tabs?: { id: string; label: string }[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  children: ReactNode;
}

export default function ManagerModal({
  title,
  onClose,
  tabs,
  activeTab,
  onTabChange,
  children,
}: ManagerModalProps) {
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
        className={styles.modalWrapper}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {tabs && tabs.length > 0 && (
          <div className={styles.tabs}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                onClick={() => onTabChange?.(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className={styles.body}>{children}</div>
        </motion.div>
      </motion.div>
    </>
  );
}
