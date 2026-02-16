'use client';

import { useRouter } from 'next/navigation';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import cn from 'classnames';
import { useChat } from '@/lib/chat-context';
import { MOCK_CHARACTERS } from '@/lib/mock-data';
import ManagePanel, { managePanelStyles as styles } from './ManagePanel';

export default function CharactersList() {
  const { dispatch } = useChat();
  const router = useRouter();

  const handleClose = () => dispatch({ type: 'SET_MANAGE_PANEL', payload: null });

  const handleCreate = () => {
    handleClose();
    router.push('/manage/characters/new');
  };

  const handleEdit = (id: string) => {
    handleClose();
    router.push(`/manage/characters/${id}`);
  };

  return (
    <ManagePanel
      title="Manage Characters"
      onClose={handleClose}
      onCreateNew={handleCreate}
      createLabel="New Character"
    >
      {MOCK_CHARACTERS.length === 0 ? (
        <div className={styles.empty}>
          <p>No characters yet</p>
          <p>Create your first brand character to start generating scenes.</p>
        </div>
      ) : (
        MOCK_CHARACTERS.map((char) => (
          <button
            key={char.id}
            className={styles.listItem}
            onClick={() => handleEdit(char.id)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={char.image}
              alt=""
              className={cn(styles.listItemThumb, styles.listItemThumbRound)}
            />
            <div className={styles.listItemInfo}>
              <span className={styles.listItemName}>{char.name}</span>
              <span className={styles.listItemMeta}>{char.role}</span>
            </div>
            <div className={styles.listItemActions}>
              <button
                className={styles.actionBtn}
                onClick={(e) => { e.stopPropagation(); handleEdit(char.id); }}
              >
                <PencilSimple size={14} />
              </button>
              <button
                className={cn(styles.actionBtn, styles.actionBtnDanger)}
                onClick={(e) => e.stopPropagation()}
              >
                <Trash size={14} />
              </button>
            </div>
          </button>
        ))
      )}
    </ManagePanel>
  );
}
