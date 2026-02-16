'use client';

import { useRouter } from 'next/navigation';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import cn from 'classnames';
import { useChat } from '@/lib/chat-context';
import { MOCK_BRAND_STYLES } from '@/lib/mock-data';
import ManagePanel, { managePanelStyles as styles } from './ManagePanel';

export default function StylesList() {
  const { dispatch } = useChat();
  const router = useRouter();

  const handleClose = () => dispatch({ type: 'SET_MANAGE_PANEL', payload: null });

  const handleCreate = () => {
    handleClose();
    router.push('/manage/styles/new');
  };

  const handleEdit = (id: string) => {
    handleClose();
    router.push(`/manage/styles/${id}`);
  };

  return (
    <ManagePanel
      title="Manage Styles"
      onClose={handleClose}
      onCreateNew={handleCreate}
      createLabel="New Style"
    >
      {MOCK_BRAND_STYLES.length === 0 ? (
        <div className={styles.empty}>
          <p>No styles yet</p>
          <p>Create your first brand image style to get started.</p>
        </div>
      ) : (
        MOCK_BRAND_STYLES.map((style) => (
          <button
            key={style.id}
            className={styles.listItem}
            onClick={() => handleEdit(style.id)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={style.image} alt="" className={styles.listItemThumb} />
            <div className={styles.listItemInfo}>
              <span className={styles.listItemName}>{style.name}</span>
              <span className={styles.listItemMeta}>
                {style.description} &middot; {style.previews.length} references
              </span>
            </div>
            <div className={styles.previewGrid}>
              {style.previews.slice(0, 3).map((url, i) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img key={i} src={url} alt="" className={styles.previewGridImg} />
              ))}
            </div>
            <div className={styles.listItemActions}>
              <button
                className={styles.actionBtn}
                onClick={(e) => { e.stopPropagation(); handleEdit(style.id); }}
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
