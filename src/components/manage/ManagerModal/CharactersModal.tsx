'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import ManagerModal from './ManagerModal';
import FormOverlay from './FormOverlay';
import ImageUploadZone from '@/components/manage/editors/ImageUploadZone';
import CharacterImageUpload, { ImageWithDescription } from './CharacterImageUpload';
import { MOCK_CHARACTERS, MOCK_CHARACTER_LOCATIONS } from '@/lib/mock-data';
import { useChat } from '@/lib/chat-context';
import styles from './ManagerModal.module.css';

type TabId = 'characters' | 'locations';

type CharacterFormMode = {
  type: 'character';
  character?: { id: string; name: string; role: string; image: string };
} | null;
type LocationFormMode = {
  type: 'location';
  location?: { id: string; name: string; description: string; image: string; previews: string[] };
} | null;

export default function CharactersModal() {
  const { dispatch } = useChat();
  const [activeTab, setActiveTab] = useState<TabId>('characters');

  // Character form overlay
  const [characterForm, setCharacterForm] = useState<CharacterFormMode>(null);
  const [characterName, setCharacterName] = useState('');
  const [characterImages, setCharacterImages] = useState<ImageWithDescription[]>([]);
  const [outfit, setOutfit] = useState('');
  const [age, setAge] = useState('');
  const [mood, setMood] = useState('');
  const [height, setHeight] = useState('');

  // Location form overlay
  const [locationForm, setLocationForm] = useState<LocationFormMode>(null);
  const [locationName, setLocationName] = useState('');
  const [locationImages, setLocationImages] = useState<string[]>([]);
  const [locationDos, setLocationDos] = useState('');
  const [locationDonts, setLocationDonts] = useState('');

  const handleClose = () => {
    dispatch({ type: 'SET_MANAGER_MODAL', payload: null });
    setCharacterForm(null);
    setLocationForm(null);
  };

  const openCharacterForm = (character?: { id: string; name: string; role: string; image: string }) => {
    setCharacterForm({ type: 'character', character });
    setCharacterName(character?.name ?? '');
    setCharacterImages(character ? [{ url: character.image, description: character.role }] : []);
    setOutfit('');
    setAge('');
    setMood('');
    setHeight('');
  };

  const closeCharacterForm = () => {
    setCharacterForm(null);
    setCharacterName('');
    setCharacterImages([]);
    setOutfit('');
    setAge('');
    setMood('');
    setHeight('');
  };

  const openLocationForm = (
    location?: { id: string; name: string; description: string; image: string; previews: string[] }
  ) => {
    setLocationForm({ type: 'location', location });
    setLocationName(location?.name ?? '');
    setLocationImages(location?.previews ?? []);
    setLocationDos('');
    setLocationDonts('');
  };

  const closeLocationForm = () => {
    setLocationForm(null);
    setLocationName('');
    setLocationImages([]);
    setLocationDos('');
    setLocationDonts('');
  };

  const handleSaveCharacter = () => {
    closeCharacterForm();
  };

  const handleSaveLocation = () => {
    closeLocationForm();
  };

  const tabs = [
    { id: 'characters' as TabId, label: 'Characters' },
    { id: 'locations' as TabId, label: 'Locations' },
  ];

  return (
    <>
      <ManagerModal
        title="Character Options"
        onClose={handleClose}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as TabId)}
      >
        {activeTab === 'characters' && (
          <>
            <div className={styles.sectionTitle}>Characters</div>
            <p className={styles.sectionDescription}>
              Upload reference images with descriptions and add character traits.
            </p>
            <button className={styles.btnPrimary} onClick={() => openCharacterForm()} style={{ marginBottom: 16 }}>
              Add Character
            </button>
            {MOCK_CHARACTERS.length > 0 ? (
              <div className={styles.list}>
                {MOCK_CHARACTERS.map((char) => (
                  <div key={char.id} className={styles.listItem} onClick={() => openCharacterForm(char)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={char.image}
                      alt=""
                      className={`${styles.listItemThumb} ${styles.listItemThumbRound}`}
                    />
                    <div className={styles.listItemInfo}>
                      <span className={styles.listItemName}>{char.name}</span>
                      <span className={styles.listItemMeta}>{char.role}</span>
                    </div>
                    <div className={styles.listItemActions} onClick={(e) => e.stopPropagation()}>
                      <button className={styles.actionBtn} title="Edit" onClick={() => openCharacterForm(char)}>
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
                <p>No characters yet</p>
                <p>Add your first character to get started.</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'locations' && (
          <>
            <div className={styles.sectionTitle}>Locations</div>
            <p className={styles.sectionDescription}>
              Create locations with reference images and do&apos;s/don&apos;ts for the AI.
            </p>
            <button className={styles.btnPrimary} onClick={() => openLocationForm()} style={{ marginBottom: 16 }}>
              Add Location
            </button>
            {MOCK_CHARACTER_LOCATIONS.length > 0 ? (
              <div className={styles.list}>
                {MOCK_CHARACTER_LOCATIONS.map((loc) => (
                  <div key={loc.id} className={styles.listItem} onClick={() => openLocationForm(loc)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={loc.image} alt="" className={styles.listItemThumb} />
                    <div className={styles.listItemInfo}>
                      <span className={styles.listItemName}>{loc.name}</span>
                      <span className={styles.listItemMeta}>{loc.description}</span>
                    </div>
                    <div className={styles.listItemActions} onClick={(e) => e.stopPropagation()}>
                      <button className={styles.actionBtn} title="Edit" onClick={() => openLocationForm(loc)}>
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
                <p>No locations yet</p>
                <p>Add your first location to get started.</p>
              </div>
            )}
          </>
        )}
      </ManagerModal>

      <AnimatePresence>
        {characterForm && (
          <FormOverlay
            key="character-form"
            title={characterForm.character ? 'Edit Character' : 'Add Character'}
            onClose={closeCharacterForm}
          >
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Character Name</label>
              <input
                className={styles.fieldInput}
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="e.g. Sarah Chen"
              />
              <label className={styles.fieldLabel} style={{ marginTop: 12 }}>
                Reference Images
              </label>
              <CharacterImageUpload
                images={characterImages}
                onChange={setCharacterImages}
                maxImages={50}
                label="Drop images here or click to upload"
              />
              <div className={styles.sectionTitle} style={{ marginTop: 20, marginBottom: 8 }}>
                Character Traits
              </div>
              <label className={styles.fieldLabel}>Outfit</label>
              <input
                className={styles.fieldInput}
                value={outfit}
                onChange={(e) => setOutfit(e.target.value)}
                placeholder="What does the person wear?"
              />
              <label className={styles.fieldLabel} style={{ marginTop: 12 }}>
                Age
              </label>
              <input
                className={styles.fieldInput}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 30s, 45"
              />
              <label className={styles.fieldLabel} style={{ marginTop: 12 }}>
                Mood
              </label>
              <input
                className={styles.fieldInput}
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="e.g. confident, friendly"
              />
              <label className={styles.fieldLabel} style={{ marginTop: 12 }}>
                Height
              </label>
              <input
                className={styles.fieldInput}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. tall, average"
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button className={styles.btnPrimary} onClick={handleSaveCharacter}>
                  Save Character
                </button>
                <button
                  className={styles.btnPrimary}
                  style={{ background: 'var(--color-gray-200)', color: 'var(--color-black)' }}
                  onClick={closeCharacterForm}
                >
                  Cancel
                </button>
              </div>
            </div>
          </FormOverlay>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {locationForm && (
          <FormOverlay
            key="location-form"
            title={locationForm.location ? 'Edit Location' : 'Add Location'}
            onClose={closeLocationForm}
          >
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Location Name</label>
              <input
                className={styles.fieldInput}
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Office, Studio"
              />
              <label className={styles.fieldLabel} style={{ marginTop: 12 }}>
                Reference Images
              </label>
              <ImageUploadZone
                images={locationImages}
                onChange={setLocationImages}
                maxImages={10}
                label="Drop images here or click to upload"
                sublabel="Up to 10 images (PNG, JPG, WebP)"
              />
              <label className={styles.fieldLabel} style={{ marginTop: 12 }}>
                Do&apos;s
              </label>
              <textarea
                className={styles.fieldTextarea}
                value={locationDos}
                onChange={(e) => setLocationDos(e.target.value)}
                placeholder="What is important for this location"
              />
              <label className={styles.fieldLabel} style={{ marginTop: 12 }}>
                Don&apos;ts
              </label>
              <textarea
                className={styles.fieldTextarea}
                value={locationDonts}
                onChange={(e) => setLocationDonts(e.target.value)}
                placeholder="What should definitely not happen for this location"
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button className={styles.btnPrimary} onClick={handleSaveLocation}>
                  Save Location
                </button>
                <button
                  className={styles.btnPrimary}
                  style={{ background: 'var(--color-gray-200)', color: 'var(--color-black)' }}
                  onClick={closeLocationForm}
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
