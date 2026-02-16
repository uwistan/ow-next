'use client';

import { useState } from 'react';
import cn from 'classnames';
import Stepper from './Stepper';
import styles from './EditorLayout.module.css';

const WIZARD_STEPS = ['Basics', 'Appearance', 'Face', 'Style', 'Review'];

const GENDERS = ['Female', 'Male', 'Non-binary'];
const AGE_RANGES = ['18-25', '26-35', '36-45', '46-55', '56+'];
const BODY_TYPES = ['Slim', 'Average', 'Athletic', 'Curvy', 'Plus-size'];
const SKIN_TONES = ['#FFDBB4', '#EDB98A', '#D08B5B', '#AE5D29', '#694D3D', '#3B2219'];
const HAIR_COLORS = ['#2C1B18', '#4A2912', '#8B4513', '#DAA520', '#CD853F', '#FAFAD2', '#FF4500', '#808080'];
const HAIR_STYLES = ['Short straight', 'Short curly', 'Medium straight', 'Medium wavy', 'Long straight', 'Long curly', 'Bun', 'Braids', 'Bald'];
const EYE_COLORS = ['Brown', 'Blue', 'Green', 'Hazel', 'Gray'];
const CLOTHING_STYLES = ['Business formal', 'Business casual', 'Smart casual', 'Streetwear', 'Athleisure', 'Minimal'];

interface WizardData {
  name: string;
  role: string;
  gender: string;
  ageRange: string;
  skinTone: string;
  bodyType: string;
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  clothingStyle: string;
  accessories: string;
}

interface CharacterWizardProps {
  onComplete: (data: WizardData) => void;
  onCancel: () => void;
}

export default function CharacterWizard({ onComplete, onCancel }: CharacterWizardProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>({
    name: '',
    role: '',
    gender: '',
    ageRange: '',
    skinTone: '',
    bodyType: '',
    hairColor: '',
    hairStyle: '',
    eyeColor: '',
    clothingStyle: '',
    accessories: '',
  });

  const update = (field: keyof WizardData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const canNext = (() => {
    switch (step) {
      case 0: return data.name.trim().length > 0;
      case 1: return data.gender && data.ageRange && data.skinTone;
      case 2: return data.hairStyle && data.eyeColor;
      case 3: return data.clothingStyle;
      case 4: return true;
      default: return false;
    }
  })();

  return (
    <>
      <div className={styles.stepperWrap}>
        <Stepper
          steps={WIZARD_STEPS}
          currentStep={step}
          onStepClick={(i) => { if (i < step) setStep(i); }}
        />
      </div>

      <div className={styles.wizardContent}>
        {/* Step 1: Basics */}
        {step === 0 && (
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Character Name</label>
              <input
                className={styles.fieldInput}
                value={data.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="e.g. Sarah Chen"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Role / Description</label>
              <textarea
                className={styles.fieldTextarea}
                value={data.role}
                onChange={(e) => update('role', e.target.value)}
                placeholder="e.g. Tech Founder, 30s, confident and approachable"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Step 2: Appearance */}
        {step === 1 && (
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Gender</label>
              <div className={styles.optionPills}>
                {GENDERS.map((g) => (
                  <button
                    key={g}
                    className={cn(styles.optionPill, data.gender === g && styles.optionPillActive)}
                    onClick={() => update('gender', g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Age Range</label>
              <div className={styles.optionPills}>
                {AGE_RANGES.map((a) => (
                  <button
                    key={a}
                    className={cn(styles.optionPill, data.ageRange === a && styles.optionPillActive)}
                    onClick={() => update('ageRange', a)}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Skin Tone</label>
              <div className={styles.swatchRow}>
                {SKIN_TONES.map((color) => (
                  <button
                    key={color}
                    className={cn(styles.swatch, data.skinTone === color && styles.swatchActive)}
                    style={{ background: color }}
                    onClick={() => update('skinTone', color)}
                  />
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Body Type</label>
              <div className={styles.optionPills}>
                {BODY_TYPES.map((b) => (
                  <button
                    key={b}
                    className={cn(styles.optionPill, data.bodyType === b && styles.optionPillActive)}
                    onClick={() => update('bodyType', b)}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Face */}
        {step === 2 && (
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Hair Color</label>
              <div className={styles.swatchRow}>
                {HAIR_COLORS.map((color) => (
                  <button
                    key={color}
                    className={cn(styles.swatch, data.hairColor === color && styles.swatchActive)}
                    style={{ background: color }}
                    onClick={() => update('hairColor', color)}
                  />
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Hair Style</label>
              <div className={styles.optionPills}>
                {HAIR_STYLES.map((h) => (
                  <button
                    key={h}
                    className={cn(styles.optionPill, data.hairStyle === h && styles.optionPillActive)}
                    onClick={() => update('hairStyle', h)}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Eye Color</label>
              <div className={styles.optionPills}>
                {EYE_COLORS.map((e) => (
                  <button
                    key={e}
                    className={cn(styles.optionPill, data.eyeColor === e && styles.optionPillActive)}
                    onClick={() => update('eyeColor', e)}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Style */}
        {step === 3 && (
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Clothing Style</label>
              <div className={styles.optionPills}>
                {CLOTHING_STYLES.map((c) => (
                  <button
                    key={c}
                    className={cn(styles.optionPill, data.clothingStyle === c && styles.optionPillActive)}
                    onClick={() => update('clothingStyle', c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Accessories (optional)</label>
              <input
                className={styles.fieldInput}
                value={data.accessories}
                onChange={(e) => update('accessories', e.target.value)}
                placeholder="e.g. Glasses, watch, earrings"
              />
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 4 && (
          <div>
            <p className={styles.sectionDescription}>
              Review your character details. The AI will generate reference images
              based on these specifications.
            </p>
            <div className={styles.reviewGrid}>
              <div className={styles.reviewItem}>
                <div className={styles.reviewLabel}>Name</div>
                <div className={styles.reviewValue}>{data.name || '—'}</div>
              </div>
              <div className={styles.reviewItem}>
                <div className={styles.reviewLabel}>Role</div>
                <div className={styles.reviewValue}>{data.role || '—'}</div>
              </div>
              <div className={styles.reviewItem}>
                <div className={styles.reviewLabel}>Gender</div>
                <div className={styles.reviewValue}>{data.gender || '—'}</div>
              </div>
              <div className={styles.reviewItem}>
                <div className={styles.reviewLabel}>Age</div>
                <div className={styles.reviewValue}>{data.ageRange || '—'}</div>
              </div>
              <div className={styles.reviewItem}>
                <div className={styles.reviewLabel}>Body Type</div>
                <div className={styles.reviewValue}>{data.bodyType || '—'}</div>
              </div>
              <div className={styles.reviewItem}>
                <div className={styles.reviewLabel}>Hair</div>
                <div className={styles.reviewValue}>
                  {data.hairStyle || '—'}
                </div>
              </div>
              <div className={styles.reviewItem}>
                <div className={styles.reviewLabel}>Eyes</div>
                <div className={styles.reviewValue}>{data.eyeColor || '—'}</div>
              </div>
              <div className={styles.reviewItem}>
                <div className={styles.reviewLabel}>Clothing</div>
                <div className={styles.reviewValue}>{data.clothingStyle || '—'}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.wizardNav}>
        <button
          className={styles.btnSecondary}
          onClick={() => (step === 0 ? onCancel() : setStep(step - 1))}
        >
          {step === 0 ? 'Cancel' : 'Back'}
        </button>
        {step < WIZARD_STEPS.length - 1 ? (
          <button
            className={styles.btnPrimary}
            onClick={() => setStep(step + 1)}
            disabled={!canNext}
          >
            Next
          </button>
        ) : (
          <button
            className={styles.btnPrimary}
            onClick={() => onComplete(data)}
          >
            Generate Character
          </button>
        )}
      </div>
    </>
  );
}
