'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import ManagerModal from './ManagerModal';
import FormOverlay from './FormOverlay';
import ImageUploadZone from '@/components/manage/editors/ImageUploadZone';
import { MOCK_IMAGE_STYLES } from '@/lib/mock-data';
import { useChat } from '@/lib/chat-context';
import styles from './ManagerModal.module.css';

type StyleFormMode = {
  type: 'style';
  style?: { id: string; name: string; description: string; image: string; previews: string[] };
} | null;

export default function ImageStyleModal() {
  const { dispatch } = useChat();
  const [styleForm, setStyleForm] = useState<StyleFormMode>(null);
  const [name, setName] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [llmGuidance, setLlmGuidance] = useState('');

  const handleClose = () => {
    dispatch({ type: 'SET_MANAGER_MODAL', payload: null });
    setStyleForm(null);
  };

  const openStyleForm = (
    style?: { id: string; name: string; description: string; image: string; previews: string[] }
  ) => {
    setStyleForm({ type: 'style', style });
    setName(style?.name ?? '');
    setImages(style?.previews ?? []);
    setLlmGuidance('');
  };

  const closeStyleForm = () => {
    setStyleForm(null);
    setName('');
    setImages([]);
    setLlmGuidance('');
  };

  const handleSave = () => {
    closeStyleForm();
  };

  const stylesList = MOCK_IMAGE_STYLES;

  return (
    <>
      <ManagerModal title="Image Styles" onClose={handleClose}>
        <div className={styles.sectionTitle}>Image Styles</div>
        <p className={styles.sectionDescription}>
          Create image styles with reference images and LLM guidance for generation.
        </p>
        <button className={styles.btnPrimary} onClick={() => openStyleForm()} style={{ marginBottom: 16 }}>
          Add Image Style
        </button>
        {stylesList.length > 0 ? (
          <div className={styles.list}>
            {stylesList.map((style) => (
              <div key={style.id} className={styles.listItem} onClick={() => openStyleForm(style)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={style.image} alt="" className={styles.listItemThumb} />
                <div className={styles.listItemInfo}>
                  <span className={styles.listItemName}>{style.name}</span>
                  <span className={styles.listItemMeta}>{style.description}</span>
                </div>
                <div className={styles.listItemActions} onClick={(e) => e.stopPropagation()}>
                  <button className={styles.actionBtn} title="Edit" onClick={() => openStyleForm(style)}>
                    <PencilSimple size={14} />
                  </button>
                  <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} title="Delete">
                    <Trash size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p>No image styles yet</p>
            <p>Add your first style to get started.</p>
          </div>
        )}
      </ManagerModal>

      <AnimatePresence>
        {styleForm && (
          <FormOverlay
            key="image-style-form"
            title={styleForm.style ? 'Edit Image Style' : 'Add Image Style'}
            onClose={closeStyleForm}
          >
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Name</label>
              <input
                className={styles.fieldInput}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Photography, Illustration"
              />
              <label className={styles.fieldLabel} style={{ marginTop: 12 }}>
                Reference Images
              </label>
              <ImageUploadZone
                images={images}
                onChange={setImages}
                maxImages={15}
                label="Drop images here or click to upload"
                sublabel="Up to 15 images (PNG, JPG, WebP)"
              />
              <label className={styles.fieldLabel} style={{ marginTop: 12 }}>
                LLM Guidance
              </label>
              <textarea
                className={styles.fieldTextarea}
                value={llmGuidance}
                onChange={(e) => setLlmGuidance(e.target.value)}
                placeholder="Describe the style for the AI model. What should it emphasize? What mood, colors, composition?"
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button className={styles.btnPrimary} onClick={handleSave}>
                  Save Style
                </button>
                <button
                  className={styles.btnPrimary}
                  style={{ background: 'var(--color-gray-200)', color: 'var(--color-black)' }}
                  onClick={closeStyleForm}
                >
                  Cancel
                </button>
              </div>
            </div>
          </FormOverlay>
        )}
      </AnimatePresence>
    </>
  );
}
