import React, { useCallback } from 'react';
import DriverForm from '../components/DriverForm';
import ResultPanel from '../components/ResultPanel';
import PageHeader from '../components/PageHeader';
import { useDocChecker } from '../hooks/useDocChecker';
import { useApp } from '../context/AppContext';
import styles from './CheckerPage.module.css';

export default function CheckerPage() {
  const { addToHistory, updateHistoryItem, showToast } = useApp();
  const { loading, result, setResult, check } = useDocChecker();

  const handleSubmit = useCallback(async (formData, files) => {
    const res = await check(formData, files);
    addToHistory(res);

    // Scroll to result
    setTimeout(() => {
      const el = document.getElementById('result-panel');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [check, addToHistory]);

  const handleRating = useCallback((n) => {
    if (!result) return;
    setResult((r) => ({ ...r, rating: n }));
    updateHistoryItem(result.id, { rating: n });
    const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    showToast(`Rating saved: ${labels[n]}`);
  }, [result, setResult, updateHistoryItem, showToast]);

  const handleRegenerate = useCallback(async () => {
    if (!result) return;
    showToast('Re-running validation…');
    // Re-use same form meta stored in the result
    const fakeForm = {
      driverName:    result.driverName,
      phone:         result.phone,
      licenseNum:    result.licenseNum,
      licenseExpiry: '', // expiry is pre-formatted in result
      vehicleNum:    result.vehicleNum,
      joinDate:      result.joinDate,
    };
    const fakeFiles = result.files.map((name) => ({ name }));
    const res = await check(fakeForm, fakeFiles);
    res.id = result.id;  // keep same id
    setResult(res);
    updateHistoryItem(result.id, res);
    showToast('Result regenerated.');
  }, [result, check, setResult, updateHistoryItem, showToast]);

  return (
    <main className={styles.main}>
      <PageHeader
        title="Driver Document"
        italic="Verification"
        subtitle="Upload license, RC, and Aadhaar — AI checks completeness and flags issues instantly."
      />

      <DriverForm onSubmit={handleSubmit} loading={loading} />

      {result && (
        <div id="result-panel">
          <ResultPanel
            result={result}
            onRatingChange={handleRating}
            onRegenerate={handleRegenerate}
          />
        </div>
      )}
    </main>
  );
}
