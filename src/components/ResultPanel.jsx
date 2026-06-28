import React from 'react';
import StarRating from './StarRating';
import { buildReportText, copyToClipboard, downloadTextFile } from '../utils/reportUtils';
import { useApp } from '../context/AppContext';
import styles from './ResultPanel.module.css';

/* ── icon map ── */
const FLAG_ICONS = {
  ok: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  warn: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  err: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

export default function ResultPanel({ result, onRatingChange, onRegenerate }) {
  const { showToast } = useApp();

  const handleCopy = () => {
    copyToClipboard(buildReportText(result))
      .then(() => showToast('Copied to clipboard!'))
      .catch(() => showToast('Copy failed — try again.'));
  };

  const handleExport = () => {
    const text     = buildReportText(result);
    const filename = `DocCheck_${result.driverName.replace(/\s+/g, '_')}_${result.id}.txt`;
    downloadTextFile(text, filename);
    showToast('Report exported!');
  };

  return (
    <section className={styles.section} aria-label="Validation results">
      <div className={styles.card}>

        {/* Header */}
        <div className={styles.resultHeader}>
          <div>
            <h2 className={styles.driverName}>{result.driverName}</h2>
            <p className={styles.meta}>
              License: {result.licenseNum} &nbsp;&middot;&nbsp; Checked: {result.timestamp}
              &nbsp;&middot;&nbsp; {result.files.length} file{result.files.length !== 1 ? 's' : ''} uploaded
            </p>
          </div>

          <div className={styles.actions}>
            <button className={styles.actionBtn} onClick={handleCopy} title="Copy report">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Copy
            </button>
            <button className={styles.actionBtn} onClick={handleExport} title="Export as .txt">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export
            </button>
            <button className={styles.actionBtn} onClick={onRegenerate} title="Re-run validation">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
              </svg>
              Regenerate
            </button>
          </div>
        </div>

        {/* Summary badges */}
        <div className={styles.summary}>
          <span className={`${styles.badge} ${styles.badgeGreen}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {result.okCount} Verified
          </span>
          <span className={`${styles.badge} ${styles.badgeAmber}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
            </svg>
            {result.warnCount} Warning{result.warnCount !== 1 ? 's' : ''}
          </span>
          <span className={`${styles.badge} ${styles.badgeRed}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {result.errCount} Issue{result.errCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Flag list */}
        <ul className={styles.flagList}>
          {result.flags.map((f, i) => (
            <li
              key={i}
              className={`${styles.flagRow} ${styles[f.type]}`}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <span className={styles.flagIcon}>{FLAG_ICONS[f.type]}</span>
              <div className={styles.flagBody}>
                <div className={styles.flagLabel}>{f.label}</div>
                <div className={styles.flagDetail}>{f.detail}</div>
              </div>
            </li>
          ))}
        </ul>

        {/* Star rating */}
        <StarRating
          value={result.rating}
          onChange={onRatingChange}
        />
      </div>
    </section>
  );
}
