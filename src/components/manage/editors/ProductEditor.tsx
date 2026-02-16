'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FloppyDisk } from '@phosphor-icons/react';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import ImageUploadZone from './ImageUploadZone';
import styles from './EditorLayout.module.css';

interface ProductEditorProps {
  productId?: string;
}

const CATEGORIES = [
  'Electronics', 'Footwear', 'Health', 'Beauty',
  'Accessories', 'Home', 'Fitness', 'Food & Beverage',
];

export default function ProductEditor({ productId }: ProductEditorProps) {
  const router = useRouter();
  const existing = productId ? MOCK_PRODUCTS.find((p) => p.id === productId) : null;

  const [name, setName] = useState(existing?.name ?? '');
  const [category, setCategory] = useState(existing?.category ?? '');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>(existing ? [existing.image] : []);

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
          {existing ? 'Edit Product' : 'New Product'}
        </h2>
        <div className={styles.actions}>
          <button className={styles.btnSecondary} onClick={() => router.push('/')}>
            Cancel
          </button>
          <button className={styles.btnPrimary} onClick={handleSave}>
            <FloppyDisk size={16} />
            Save Product
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Product Details</h3>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Product Name</label>
              <input
                className={styles.fieldInput}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Wireless Headphones Pro"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Category</label>
              <div className={styles.optionPills}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`${styles.optionPill} ${category === cat ? styles.optionPillActive : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Description</label>
              <textarea
                className={styles.fieldTextarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the product so the AI understands its features..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Product Images</h3>
          <p className={styles.sectionDescription}>
            Upload product photos from different angles. Primary image will be used
            as the thumbnail.
          </p>
          <ImageUploadZone
            images={images}
            onChange={setImages}
            maxImages={10}
            label="Drop product images here"
            sublabel="Up to 10 images (PNG, JPG, WebP)"
          />
        </div>
      </div>
    </div>
  );
}
