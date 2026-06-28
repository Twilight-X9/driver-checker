import React from 'react';
import styles from './ProgressSteps.module.css';

const STEPS = [
  { label: 'Fill Details' },
  { label: 'Upload Docs' },
  { label: 'AI Validation' },
];

export default function ProgressSteps({ currentStep, completedSteps }) {
  return (
    <div className={styles.steps}>
      {STEPS.map((s, i) => {
        const num = i + 1;
        const done    = completedSteps.includes(num);
        const active  = currentStep === num;

        return (
          <React.Fragment key={num}>
            <div
              className={`${styles.step}
                ${done   ? styles.done   : ''}
                ${active ? styles.active : ''}`}
            >
              <div className={styles.stepNum}>
                {done ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : num}
              </div>
              <span className={styles.stepLabel}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={styles.sep} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
