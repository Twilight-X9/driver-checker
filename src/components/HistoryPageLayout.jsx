import React from 'react';
import PageHeader from '../components/PageHeader';
import HistoryPage from '../components/HistoryPage';
import styles from './HistoryPageLayout.module.css';

export default function HistoryPageLayout() {
  return (
    <main className={styles.main}>
      <PageHeader
        title="Generation"
        italic="History"
        subtitle="All past document checks with saved AI validation results."
      />
      <HistoryPage />
    </main>
  );
}
