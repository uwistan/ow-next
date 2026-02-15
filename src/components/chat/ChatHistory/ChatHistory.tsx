'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  X,
  Sparkle,
  Package,
  UserCircle,
  PaintBrush,
  ChatCircle,
  FunnelSimple,
} from '@phosphor-icons/react';
import cn from 'classnames';
import { useChat, CreativeMode } from '@/lib/chat-context';
import styles from './ChatHistory.module.css';

const MODE_ICONS: Record<CreativeMode, React.ReactNode> = {
  idle: <ChatCircle size={14} />,
  imagine: <Sparkle size={14} />,
  product: <Package size={14} />,
  character: <UserCircle size={14} />,
  create: <PaintBrush size={14} />,
};

const MODE_LABELS: Record<CreativeMode, string> = {
  idle: 'General',
  imagine: 'Imagine',
  product: 'Product',
  character: 'Character',
  create: 'Create',
};

const MODE_COLORS: Record<CreativeMode, string> = {
  idle: 'var(--color-gray-500)',
  imagine: 'var(--color-purplish-blue)',
  product: '#e67e22',
  character: '#2ecc71',
  create: '#e74c3c',
};

const FILTER_OPTIONS: { id: CreativeMode | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'idle', label: 'General' },
  { id: 'imagine', label: 'Imagine' },
  { id: 'product', label: 'Product' },
  { id: 'character', label: 'Character' },
  { id: 'create', label: 'Create' },
];

export default function ChatHistory() {
  const { state, dispatch } = useChat();
  const [filter, setFilter] = useState<CreativeMode | 'all'>(
    // Default filter to current mode if in a creative area
    state.mode !== 'idle' ? state.mode : 'all'
  );

  if (!state.historyOpen) return null;

  const handleNewChat = () => {
    dispatch({ type: 'NEW_CHAT' });
    dispatch({ type: 'SET_HISTORY_OPEN', payload: false });
  };

  const handleLoadSession = (id: string) => {
    dispatch({ type: 'LOAD_SESSION', payload: id });
  };

  const handleClose = () => {
    dispatch({ type: 'SET_HISTORY_OPEN', payload: false });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);
    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${Math.floor(diffHrs)}h ago`;
    if (diffHrs < 48) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredSessions =
    filter === 'all'
      ? state.sessions
      : state.sessions.filter((s) => s.mode === filter);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className={styles.backdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      />

      {/* Panel */}
      <motion.div
        className={styles.panel}
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>History</h3>
          <button className={styles.closeBtn} onClick={handleClose}>
            <X size={16} />
          </button>
        </div>

        <button className={styles.newChatBtn} onClick={handleNewChat}>
          <Plus size={16} />
          New Chat
        </button>

        {/* Filter pills */}
        <div className={styles.filterRow}>
          <FunnelSimple size={14} className={styles.filterIcon} />
          <div className={styles.filterPills}>
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                className={cn(styles.filterPill, filter === opt.id && styles.filterPillActive)}
                onClick={() => setFilter(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.list}>
          {filteredSessions.length === 0 ? (
            <p className={styles.empty}>
              {filter === 'all'
                ? 'No previous conversations'
                : `No ${MODE_LABELS[filter as CreativeMode].toLowerCase()} conversations yet`}
            </p>
          ) : (
            filteredSessions.map((session) => (
              <button
                key={session.id}
                className={cn(
                  styles.sessionItem,
                  state.currentSession?.id === session.id && styles.sessionItemActive
                )}
                onClick={() => handleLoadSession(session.id)}
              >
                <span
                  className={styles.sessionIcon}
                  style={{ color: MODE_COLORS[session.mode] }}
                >
                  {MODE_ICONS[session.mode]}
                </span>
                <div className={styles.sessionInfo}>
                  <span className={styles.sessionTitle}>{session.title}</span>
                  <span className={styles.sessionMeta}>
                    <span
                      className={styles.modeBadge}
                      style={{ color: MODE_COLORS[session.mode] }}
                    >
                      {MODE_LABELS[session.mode]}
                    </span>
                    &middot; {session.messages.length} msg &middot; {formatDate(session.createdAt)}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </motion.div>
    </>
  );
}
