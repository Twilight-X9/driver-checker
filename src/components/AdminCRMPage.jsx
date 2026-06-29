import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { buildReportText, downloadTextFile } from '../utils/reportUtils';
import { supabase } from '../supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './AdminCRMPage.module.css';

export default function AdminCRMPage() {
  const { history, deleteHistoryItem, showToast, logout } = useApp();
  const [filter, setFilter] = useState('all'); // 'all', 'clear', 'issues', 'warnings'
  const [searchTerm, setSearchTerm] = useState('');
  const [realtimeData, setRealtimeData] = useState(history);

  // Sync with AppContext history and realtime updates
  useEffect(() => {
    setRealtimeData(history);
  }, [history]);

  useEffect(() => {
    // Subscribe to realtime inserts
    const channel = supabase
      .channel('public:reports')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports' }, payload => {
        setRealtimeData(prev => [payload.new, ...prev]);
        showToast('New application received in realtime!');
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'reports' }, payload => {
        setRealtimeData(prev => prev.filter(item => item.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showToast]);

  const stats = useMemo(() => {
    let clear = 0;
    let issues = 0;
    let warnings = 0;
    realtimeData.forEach(item => {
      if (item.errCount > 0) issues++;
      else if (item.warnCount > 0) warnings++;
      else clear++;
    });
    return { total: realtimeData.length, clear, issues, warnings };
  }, [realtimeData]);

  // Chart Data preparation
  const chartData = useMemo(() => {
    // Group by date
    const counts = {};
    realtimeData.forEach(item => {
      const dateObj = new Date(item.timestamp);
      if (isNaN(dateObj.getTime())) return;
      const dateStr = dateObj.toLocaleDateString();
      if (!counts[dateStr]) {
        counts[dateStr] = { date: dateStr, Clear: 0, Issues: 0, Warnings: 0 };
      }
      if (item.errCount > 0) counts[dateStr].Issues++;
      else if (item.warnCount > 0) counts[dateStr].Warnings++;
      else counts[dateStr].Clear++;
    });

    return Object.values(counts).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-7); // last 7 days
  }, [realtimeData]);

  const filteredHistory = useMemo(() => {
    return realtimeData.filter(item => {
      const matchSearch = item.driverName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.licenseNum && item.licenseNum.toLowerCase().includes(searchTerm.toLowerCase()));
      
      let matchFilter = true;
      if (filter === 'clear') matchFilter = item.errCount === 0 && item.warnCount === 0;
      if (filter === 'issues') matchFilter = item.errCount > 0;
      if (filter === 'warnings') matchFilter = item.warnCount > 0 && item.errCount === 0;

      return matchSearch && matchFilter;
    });
  }, [realtimeData, filter, searchTerm]);

  const handleExport = (item) => {
    const text = buildReportText(item);
    const filename = `DocCheck_${item.driverName.replace(/\s+/g, '_')}_${item.id}.txt`;
    downloadTextFile(text, filename);
    showToast('Report exported!');
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this record permanently?')) return;
    deleteHistoryItem(id);
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar for separate page experience */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Admin Console</h2>
        </div>
        <nav className={styles.sidebarNav}>
          <button className={`${styles.sidebarBtn} ${styles.active}`}>Dashboard</button>
        </nav>
        <button className={styles.logoutBtn} onClick={logout}>Sign Out</button>
      </aside>

      {/* Main Content Area */}
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>Overview</h1>
          <p className={styles.subtitle}>Realtime driver onboarding applications monitoring.</p>
        </header>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statInfo}>
              <h3>Total Applications</h3>
              <p>{stats.total}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statInfo}>
              <h3>All Clear</h3>
              <p>{stats.clear}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statInfo}>
              <h3>Issues Found</h3>
              <p>{stats.issues}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statInfo}>
              <h3>Warnings</h3>
              <p>{stats.warnings}</p>
            </div>
          </div>
        </div>

        {chartData.length > 0 && (
          <div className={styles.chartContainer}>
            <h3>Activity (Last 7 Days)</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="date" stroke="#888" tick={{fill: '#888'}} />
                  <YAxis stroke="#888" tick={{fill: '#888'}} allowDecimals={false} />
                  <Tooltip cursor={{fill: '#f5f5f5'}} contentStyle={{ background: '#000', color: '#fff', border: 'none' }} />
                  <Bar dataKey="Clear" stackId="a" fill="#d4d4d4" />
                  <Bar dataKey="Warnings" stackId="a" fill="#888" />
                  <Bar dataKey="Issues" stackId="a" fill="#000" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Search driver name or license..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.filters}>
            <button className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`} onClick={() => setFilter('all')}>All</button>
            <button className={`${styles.filterBtn} ${filter === 'clear' ? styles.active : ''}`} onClick={() => setFilter('clear')}>Clear</button>
            <button className={`${styles.filterBtn} ${filter === 'warnings' ? styles.active : ''}`} onClick={() => setFilter('warnings')}>Warnings</button>
            <button className={`${styles.filterBtn} ${filter === 'issues' ? styles.active : ''}`} onClick={() => setFilter('issues')}>Issues</button>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Driver Info</th>
                <th>Status</th>
                <th>Rating</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="5" className={styles.emptyState}>
                    <p>No records found.</p>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => {
                  const hasIssues = item.errCount > 0;
                  const hasWarnings = item.warnCount > 0;
                  const allClear = !hasIssues && !hasWarnings;

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className={styles.driverName}>{item.driverName}</div>
                        <div className={styles.licenseNum}>{item.licenseNum || 'N/A'}</div>
                      </td>
                      <td>
                        <div className={styles.badges}>
                          {hasIssues && <span className={`${styles.badge} ${styles.red}`}>Issues</span>}
                          {hasWarnings && <span className={`${styles.badge} ${styles.amber}`}>Warnings</span>}
                          {allClear && <span className={`${styles.badge} ${styles.green}`}>Clear</span>}
                        </div>
                      </td>
                      <td>
                        {item.rating > 0 ? (
                          <span className={styles.stars}>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</span>
                        ) : (
                          <span className={styles.noRating}>Unrated</span>
                        )}
                      </td>
                      <td className={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</td>
                      <td>
                        <div className={styles.actions}>
                          <button className={styles.actionBtn} onClick={() => handleExport(item)} title="Export">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                          </button>
                          <button className={styles.actionBtn} onClick={() => handleDelete(item.id)} title="Delete">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
