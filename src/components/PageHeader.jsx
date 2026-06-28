import React from 'react';
import styles from './PageHeader.module.css';

export default function PageHeader({ title, italic, subtitle }) {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>
        {title} <em>{italic}</em>
      </h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}
