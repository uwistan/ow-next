'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FloppyDisk } from '@phosphor-icons/react';
import { MOCK_BRAND_STYLES } from '@/lib/mock-data';
import ImageUploadZone from './ImageUploadZone';
import styles from './EditorLayout.module.css';

interface StyleEditorProps {
  styleId?: string;
}

export default function StyleEditor({ styleId }: StyleEditorProps) {
  const router = useRouter();
  const existing = styleId ? MOCK_BRAND_STYLES.find((s) => s.id === styleId) : null;

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [images, setImages] = useState<string[]>(existing?.previews ?? []);

  const handleSave = () => {
    // Mock save — in production would call an API
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
          {existing ? 'Edit Style' : 'New Style'}
        </h2>
        <div className={styles.actions}>
          <button className={styles.btnSecondary} onClick={() => router.push('/')}>
            Cancel
          </button>
          <button className={styles.btnPrimary} onClick={handleSave}>
            <FloppyDisk size={16} />
            Save Style
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Style Details</h3>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Name</label>
              <input
                className={styles.fieldInput}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Photography, Illustration, Bold"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Description</label>
              <textarea
                className={styles.fieldTextarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the visual style so the AI can apply it consistently..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Reference Images</h3>
          <p className={styles.sectionDescription}>
            Upload 5-15 reference images that represent this style. The AI will
            use these to understand and replicate the aesthetic.
          </p>
          <ImageUploadZone
            images={images}
            onChange={setImages}
            maxImages={15}
            label="Drop reference images here"
            sublabel="Up to 15 images (PNG, JPG, WebP)"
          />
        </div>
      </div>
    </div>
  );
}
