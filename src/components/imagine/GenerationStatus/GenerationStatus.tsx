'use client';

import { useEffect, useState } from 'react';
import cn from 'classnames';
import styles from './GenerationStatus.module.css';

const STEPS = [
  { label: 'Enhancing your prompt' },
  { label: 'Bringing your idea to life' },
  { label: 'Refining details' },
  { label: 'Generating images' },
] as const;

const STEP_DURATION = 2800;

interface GenerationStatusProps {
  className?: string;
  /** Whether the animation is active */
  active?: boolean;
}

export default function GenerationStatus({
  className,
  active = true,
}: GenerationStatusProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [animState, setAnimState] = useState<'entering' | 'visible' | 'exiting'>('entering');

  useEffect(() => {
    if (!active) return;

    // Start entering
    setAnimState('entering');
    const enterTimer = setTimeout(() => setAnimState('visible'), 50);

    const interval = setInterval(() => {
      // Start exit animation
      setAnimState('exiting');

      // After exit completes, switch to next step and enter
      setTimeout(() => {
        setCurrentStep((prev) => (prev + 1) % STEPS.length);
        setAnimState('entering');

        // Trigger enter animation on next frame
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setAnimState('visible');
          });
        });
      }, 400);
    }, STEP_DURATION);

    return () => {
      clearTimeout(enterTimer);
      clearInterval(interval);
    };
  }, [active]);

  if (!active) return null;

  const step = STEPS[currentStep];
  const isStarRotated = currentStep % 2 === 1;

  return (
    <div className={cn(styles.container, className)}>
      <div className={cn(styles.star, isStarRotated && styles.starRotated)}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5L7 0Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <span
        className={cn(
          styles.label,
          animState === 'entering' && styles.labelEntering,
          animState === 'visible' && styles.labelVisible,
          animState === 'exiting' && styles.labelExiting
        )}
      >
        {step.label}
      </span>
    </div>
  );
}
