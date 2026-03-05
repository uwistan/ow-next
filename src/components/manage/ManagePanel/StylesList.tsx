'use client';

import { useRouter } from 'next/navigation';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import { useChat } from '@/lib/chat-context';
import IconButton from '@/components/common/IconButton';
import { MOCK_BRAND_STYLES } from '@/lib/mock-data';
import ManagePanel, { managePanelStyles as styles } from './ManagePanel';

export default function StylesList() {
  const { dispatch } = useChat();
  const router = useRouter();

  const handleClose = () => dispatch({ type: 'SET_MANAGE_PANEL', payload: null });

  const handleEdit = (id: string) => {
    handleClose();
    router.push(`/manage/styles/${id}`);
  };

  return (
    <ManagePanel title="Manage Styles" onClose={handleClose}>
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
              <IconButton
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); handleEdit(style.id); }}
              >
                <PencilSimple size={14} />
              </IconButton>
              <IconButton
                variant="ghost"
                size="sm"
                color="danger"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash size={14} />
              </IconButton>
            </div>
          </button>
        ))
      )}
    </ManagePanel>
  );
}
