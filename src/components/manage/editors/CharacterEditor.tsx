'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FloppyDisk } from '@phosphor-icons/react';
import cn from 'classnames';
import { MOCK_CHARACTERS } from '@/lib/mock-data';
import ImageUploadZone from './ImageUploadZone';
import CharacterWizard from './CharacterWizard';
import styles from './EditorLayout.module.css';

interface CharacterEditorProps {
  characterId?: string;
}

type EditorTab = 'upload' | 'wizard';

export default function CharacterEditor({ characterId }: CharacterEditorProps) {
  const router = useRouter();
  const existing = characterId ? MOCK_CHARACTERS.find((c) => c.id === characterId) : null;

  const [tab, setTab] = useState<EditorTab>('upload');
  const [name, setName] = useState(existing?.name ?? '');
  const [role, setRole] = useState(existing?.role ?? '');
  const [images, setImages] = useState<string[]>(existing ? [existing.image] : []);

  const handleSave = () => {
    router.push('/');
  };

  const handleWizardComplete = (data: { name: string; role: string }) => {
    // In production, would send wizard data to AI to generate reference images
    setName(data.name);
    setRole(data.role);
    // Mock: switch to upload tab with auto-generated images
    setTab('upload');
    setImages([
      `https://i.pravatar.cc/400?u=${data.name}-1`,
      `https://i.pravatar.cc/400?u=${data.name}-2`,
      `https://i.pravatar.cc/400?u=${data.name}-3`,
      `https://i.pravatar.cc/400?u=${data.name}-4`,
    ]);
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => router.push('/')}>
          <ArrowLeft size={16} />
          Back
        </button>
        <h2 className={styles.pageTitle}>
          {existing ? 'Edit Character' : 'New Character'}
        </h2>
        <div className={styles.actions}>
          <button className={styles.btnSecondary} onClick={() => router.push('/')}>
            Cancel
          </button>
          {tab === 'upload' && (
            <button className={styles.btnPrimary} onClick={handleSave}>
              <FloppyDisk size={16} />
              Save Character
            </button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        {/* Tab toggle: Upload vs Wizard */}
        {!existing && (
          <div className={styles.tabToggle}>
            <button
              className={cn(styles.tabToggleBtn, tab === 'upload' && styles.tabToggleBtnActive)}
              onClick={() => setTab('upload')}
            >
              Upload Existing Images
            </button>
            <button
              className={cn(styles.tabToggleBtn, tab === 'wizard' && styles.tabToggleBtnActive)}
              onClick={() => setTab('wizard')}
            >
              Create with Wizard
            </button>
          </div>
        )}

        {/* Path A: Upload existing images */}
        {tab === 'upload' && (
          <>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Character Details</h3>
              <div className={styles.fieldGroup}>
                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Name</label>
                    <input
                      className={styles.fieldInput}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sarah Chen"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Role</label>
                    <input
                      className={styles.fieldInput}
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Tech Founder"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Character Images</h3>
              <p className={styles.sectionDescription}>
                Upload photos of your character from different angles and expressions.
                More images help the AI create more accurate and consistent results.
              </p>
              <ImageUploadZone
                images={images}
                onChange={setImages}
                maxImages={50}
                label="Drop character images here"
                sublabel="Up to 50 images for best results (PNG, JPG, WebP)"
              />
            </div>
          </>
        )}

        {/* Path B: Step-by-step wizard */}
        {tab === 'wizard' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Create Character</h3>
            <p className={styles.sectionDescription}>
              Define your character step by step. The AI will generate
              reference images based on your specifications.
            </p>
            <CharacterWizard
              onComplete={handleWizardComplete}
              onCancel={() => setTab('upload')}
            />
          </div>
        )}
      </div>
    </div>
  );
}
