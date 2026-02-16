'use client';

import { Check } from '@phosphor-icons/react';
import cn from 'classnames';
import styles from './Stepper.module.css';

interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}

export default function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className={styles.stepper}>
      {steps.map((label, i) => {
        const isActive = i === currentStep;
        const isCompleted = i < currentStep;

        return (
          <div key={i} style={{ display: 'contents' }}>
            <button
              className={styles.step}
              onClick={() => onStepClick?.(i)}
              type="button"
            >
              <span
                className={cn(
                  styles.stepCircle,
                  isActive && styles.stepCircleActive,
                  isCompleted && styles.stepCircleCompleted
                )}
              >
                {isCompleted ? <Check size={14} weight="bold" /> : i + 1}
              </span>
              <span
                className={cn(
                  styles.stepLabel,
                  (isActive || isCompleted) && styles.stepLabelActive
                )}
              >
                {label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  styles.stepConnector,
                  isCompleted && styles.stepConnectorCompleted
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
