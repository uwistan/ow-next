'use client';

import { useRouter } from 'next/navigation';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import cn from 'classnames';
import { useChat } from '@/lib/chat-context';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import ManagePanel, { managePanelStyles as styles } from './ManagePanel';

export default function ProductsList() {
  const { dispatch } = useChat();
  const router = useRouter();

  const handleClose = () => dispatch({ type: 'SET_MANAGE_PANEL', payload: null });

  const handleCreate = () => {
    handleClose();
    router.push('/manage/products/new');
  };

  const handleEdit = (id: string) => {
    handleClose();
    router.push(`/manage/products/${id}`);
  };

  return (
    <ManagePanel
      title="Manage Products"
      onClose={handleClose}
      onCreateNew={handleCreate}
      createLabel="New Product"
    >
      {MOCK_PRODUCTS.length === 0 ? (
        <div className={styles.empty}>
          <p>No products yet</p>
          <p>Add your first product to start generating product shots.</p>
        </div>
      ) : (
        MOCK_PRODUCTS.map((product) => (
          <button
            key={product.id}
            className={styles.listItem}
            onClick={() => handleEdit(product.id)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.image} alt="" className={styles.listItemThumb} />
            <div className={styles.listItemInfo}>
              <span className={styles.listItemName}>{product.name}</span>
              <span className={styles.listItemMeta}>{product.category}</span>
            </div>
            <div className={styles.listItemActions}>
              <button
                className={styles.actionBtn}
                onClick={(e) => { e.stopPropagation(); handleEdit(product.id); }}
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
