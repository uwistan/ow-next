'use client';

import { useEffect, useRef } from 'react';
import { Robot } from '@phosphor-icons/react';
import cn from 'classnames';
import Avatar from '@/components/common/Avatar';
import { ChatMessage } from '@/lib/chat-context';
import { MOCK_USER } from '@/lib/mock-data';
import styles from './ChatMessages.module.css';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isGenerating?: boolean;
}

export default function ChatMessages({ messages, isGenerating }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.messages}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(styles.message, msg.role === 'user' ? styles.user : styles.assistant)}
          >
            <div className={styles.avatar}>
              {msg.role === 'user' ? (
                <Avatar src={MOCK_USER.avatarUrl} name={MOCK_USER.name} size="sm" />
              ) : (
                <div className={styles.botAvatar}>
                  <Robot size={16} weight="fill" />
                </div>
              )}
            </div>
            <div className={styles.bubble}>
              <span className={styles.sender}>
                {msg.role === 'user' ? MOCK_USER.name : 'Open Wonder'}
              </span>
              <div className={styles.content}>
                {msg.content}
                {msg.tags && msg.tags.length > 0 && (
                  <span className={styles.tags}>
                    {msg.tags.map((tag) => (
                      <span key={tag.id} className={styles.tag}>
                        {tag.name}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className={cn(styles.message, styles.assistant)}>
            <div className={styles.avatar}>
              <div className={styles.botAvatar}>
                <Robot size={16} weight="fill" />
              </div>
            </div>
            <div className={styles.bubble}>
              <span className={styles.sender}>Open Wonder</span>
              <div className={styles.typing}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
