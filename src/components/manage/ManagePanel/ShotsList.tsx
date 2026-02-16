'use client';

import { useRouter } from 'next/navigation';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import cn from 'classnames';
import { useChat } from '@/lib/chat-context';
import { MOCK_PRODUCT_STYLES } from '@/lib/mock-data';
import ManagePanel, { managePanelStyles as styles } from './ManagePanel';

export default function ShotsList() {
  const { dispatch } = useChat();
  const router = useRouter();

  const handleClose = () => dispatch({ type: 'SET_MANAGE_PANEL', payload: null });

  const handleCreate = () => {
    handleClose();
    router.push('/manage/shots/new');
  };

  const handleEdit = (id: string) => {
    handleClose();
    router.push(`/manage/shots/${id}`);
  };

  return (
    <ManagePanel
      title="Manage Shot Styles"
      onClose={handleClose}
      onCreateNew={handleCreate}
      createLabel="New Shot Style"
    >
      {MOCK_PRODUCT_STYLES.length === 0 ? (
        <div className={styles.empty}>
          <p>No shot styles yet</p>
          <p>Define your first shot style to guide product photography.</p>
        </div>
      ) : (
        MOCK_PRODUCT_STYLES.map((shot) => (
          <button
            key={shot.id}
            className={styles.listItem}
            onClick={() => handleEdit(shot.id)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shot.image} alt="" className={styles.listItemThumb} />
            <div className={styles.listItemInfo}>
              <span className={styles.listItemName}>{shot.name}</span>
              <span className={styles.listItemMeta}>
                {shot.description} &middot; {shot.previews.length} refs
              </span>
            </div>
            <div className={styles.previewGrid}>
              {shot.previews.slice(0, 2).map((url, i) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img key={i} src={url} alt="" className={styles.previewGridImg} />
              ))}
            </div>
            <div className={styles.listItemActions}>
              <button
                className={styles.actionBtn}
                onClick={(e) => { e.stopPropagation(); handleEdit(shot.id); }}
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
