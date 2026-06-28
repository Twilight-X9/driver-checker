import React from 'react';
import { formatBytes } from '../utils/reportUtils';
import styles from './UploadZone.module.css';

export default function UploadZone({ uploadHook }) {
  const {
    files, dragging,
    inputRef, accepted,
    onDragOver, onDragLeave, onDrop,
    onInputChange, openPicker, removeFile,
  } = uploadHook;

  return (
    <div className={styles.wrapper}>
      {/* Drop target */}
      <div
        className={`${styles.zone} ${dragging ? styles.dragOver : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={openPicker}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && openPicker()}
        aria-label="Upload documents"
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accepted}
          className={styles.hiddenInput}
          onChange={onInputChange}
        />

        <div className={styles.uploadIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
          </svg>
        </div>

        <div className={styles.uploadTitle}>
          {dragging ? 'Drop files here…' : 'Drag & drop or click to upload'}
        </div>
        <div className={styles.uploadSub}>
          Required: Driving License &middot; RC &middot; Aadhaar Card
        </div>
        <div className={styles.tags}>
          {['PDF', 'JPG', 'PNG', 'Max 10 MB each'].map((t) => (
            <span key={t} className={styles.tag}>{t}</span>
          ))}
        </div>
      </div>

      {/* Uploaded file list */}
      {files.length > 0 && (
        <ul className={styles.fileList}>
          {files.map((f) => (
            <li key={f.name} className={styles.fileItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.checkIcon}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className={styles.fileName}>{f.name}</span>
              <span className={styles.fileSize}>{formatBytes(f.size)}</span>
              <button
                className={styles.removeBtn}
                onClick={(e) => { e.stopPropagation(); removeFile(f.name); }}
                aria-label={`Remove ${f.name}`}
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
