import React from 'react';
import { useApp } from '../context/AppContext';
import styles from './Header.module.css';

export default function Header() {
  const { page, navigate, logout } = useApp();

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.logoText}>Manivtha Tours &amp; Travels</div>
        <div className={styles.logoSub}>Driver Onboarding</div>
      </div>

      <nav className={styles.nav}>
        <button
          className={`${styles.navBtn} ${page === 'checker' ? styles.active : ''}`}
          onClick={() => navigate('checker')}
        >
          Verification
        </button>
        <button
          className={`${styles.navBtn} ${page === 'history' ? styles.active : ''}`}
          onClick={() => navigate('history')}
        >
          History
        </button>
        <div className={styles.divider} />
        <button className={styles.logoutBtn} onClick={logout}>
          Sign out
        </button>
      </nav>
    </header>
  );
}
