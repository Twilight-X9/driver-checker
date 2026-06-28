import React from 'react';
import { useApp } from '../context/AppContext';
import styles from './Toast.module.css';

export default function Toast() {
  const { toast } = useApp();

  return (
    <div className={`${styles.toast} ${toast ? styles.visible : ''}`} role="status" aria-live="polite">
      {toast}
    </div>
  );
}
