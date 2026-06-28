import React, { useState } from 'react';
import styles from './StarRating.module.css';

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export default function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className={styles.bar}>
      <span className={styles.label}>Rate this result:</span>
      <div className={styles.stars} role="group" aria-label="Star rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            className={`${styles.star} ${display >= n ? styles.lit : ''}`}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
      <span className={styles.ratingText}>
        {display > 0 ? LABELS[display] : 'Not rated'}
      </span>
    </div>
  );
}
