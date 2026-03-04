'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { X } from '@phosphor-icons/react';
import styles from './ManagerModal.module.css';

interface FormOverlayProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function FormOverlay({ title, onClose, children }: FormOverlayProps) {
  return (
    <>
      <motion.div
        className={styles.formOverlayBackdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className={styles.formOverlayWrapper}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={styles.formOverlayModal}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.formOverlayHeader}>
            <h3 className={styles.formOverlayTitle}>{title}</h3>
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={18} />
            </button>
          </div>
          <div className={styles.formOverlayBody}>{children}</div>
        </motion.div>
      </motion.div>
    </>
  );
}
