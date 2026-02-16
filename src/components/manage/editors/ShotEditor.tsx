'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FloppyDisk } from '@phosphor-icons/react';
import { MOCK_PRODUCT_STYLES } from '@/lib/mock-data';
import ImageUploadZone from './ImageUploadZone';
import styles from './EditorLayout.module.css';

interface ShotEditorProps {
  shotId?: string;
}

export default function ShotEditor({ shotId }: ShotEditorProps) {
  const router = useRouter();
  const existing = shotId ? MOCK_PRODUCT_STYLES.find((s) => s.id === shotId) : null;

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [images, setImages] = useState<string[]>(existing?.previews ?? []);

  const handleSave = () => {
    router.push('/');
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => router.push('/')}>
          <ArrowLeft size={16} />
          Back
        </button>
        <h2 className={styles.pageTitle}>
          {existing ? 'Edit Shot Style' : 'New Shot Style'}
        </h2>
        <div className={styles.actions}>
          <button className={styles.btnSecondary} onClick={() => router.push('/')}>
            Cancel
          </button>
          <button className={styles.btnPrimary} onClick={handleSave}>
            <FloppyDisk size={16} />
            Save Shot Style
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Shot Style Details</h3>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Name</label>
              <input
                className={styles.fieldInput}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Studio Shot, Lifestyle, Flat Lay"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Description</label>
              <textarea
                className={styles.fieldTextarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the shot style — lighting, angle, background, mood..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Reference Images</h3>
          <p className={styles.sectionDescription}>
            Upload 2-5 reference images showing this shot style. These help the AI
            replicate the composition, lighting, and overall feel.
          </p>
          <ImageUploadZone
            images={images}
            onChange={setImages}
            maxImages={5}
            label="Drop reference images here"
            sublabel="Up to 5 images (PNG, JPG, WebP)"
          />
        </div>
      </div>
    </div>
  );
}
