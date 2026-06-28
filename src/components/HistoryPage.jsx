import React from 'react';
import { useApp } from '../context/AppContext';
import { buildReportText, downloadTextFile } from '../utils/reportUtils';
import styles from './HistoryPage.module.css';

export default function HistoryPage() {
  const { history, deleteHistoryItem, showToast } = useApp();

  const handleExport = (item) => {
    const text = buildReportText(item);
    const filename = `DocCheck_${item.driverName.replace(/\s+/g, '_')}_${item.id}.txt`;
    downloadTextFile(text, filename);
    showToast('Report exported!');
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this record?')) return;
    deleteHistoryItem(id);
    showToast('Entry deleted.');
  };

  if (history.length === 0) {
    return (
      <div className={styles.emptyState}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>No checks yet. Run your first document check.</p>
      </div>
    );
  }

  return (
    <ul className={styles.list}>
      {history.map((item, idx) => {
        const hasIssues   = item.errCount > 0;
        const hasWarnings = item.warnCount > 0;
        const allClear    = !hasIssues && !hasWarnings;

        return (
          <li key={item.id} className={styles.item} style={{ animationDelay: `${idx * 0.05}s` }}>

            <div className={styles.itemMain}>
              <div className={styles.driverName}>{item.driverName}</div>
              <div className={styles.meta}>
                {item.timestamp} &nbsp;&middot;&nbsp; License: {item.licenseNum}
                {item.rating > 0 && (
                  <span className={styles.stars}>&nbsp;&middot;&nbsp; {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</span>
                )}
              </div>
            </div>

            <div className={styles.badges}>
              {hasIssues && (
                <span className={`${styles.badge} ${styles.red}`}>
                  {item.errCount} issue{item.errCount > 1 ? 's' : ''}
                </span>
              )}
              {hasWarnings && (
                <span className={`${styles.badge} ${styles.amber}`}>
                  {item.warnCount} warning{item.warnCount > 1 ? 's' : ''}
                </span>
              )}
              {allClear && (
                <span className={`${styles.badge} ${styles.green}`}>All clear</span>
              )}
            </div>

            <div className={styles.itemActions}>
              <button className={styles.btn} onClick={() => handleExport(item)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export
              </button>
              <button
                className={`${styles.btn} ${styles.danger}`}
                onClick={() => handleDelete(item.id)}
                aria-label="Delete"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                </svg>
              </button>
            </div>

          </li>
        );
      })}
    </ul>
  );
}
