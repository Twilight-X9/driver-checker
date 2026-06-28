import React, { useState } from 'react';
import UploadZone from './UploadZone';
import ProgressSteps from './ProgressSteps';
import { useFileUpload } from '../hooks/useFileUpload';
import { useApp } from '../context/AppContext';
import styles from './DriverForm.module.css';

const INITIAL = {
  driverName: '',
  phone: '',
  licenseNum: '',
  licenseExpiry: '',
  vehicleNum: '',
  joinDate: '',
};

export default function DriverForm({ onSubmit, loading }) {
  const { showToast } = useApp();
  const [form, setForm] = useState(INITIAL);
  const uploadHook = useFileUpload(showToast);

  const completedSteps = [];
  const formFilled = form.driverName && form.phone && form.licenseNum && form.licenseExpiry;
  if (formFilled) completedSteps.push(1);
  if (uploadHook.files.length > 0) completedSteps.push(2);
  const currentStep = loading ? 3 : uploadHook.files.length > 0 ? 2 : 1;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.driverName.trim())    { showToast('Please enter the driver name.');        return false; }
    if (!form.phone.trim())         { showToast('Please enter phone or driver ID.');     return false; }
    if (!form.licenseNum.trim())    { showToast('Please enter the license number.');     return false; }
    if (!form.licenseExpiry)        { showToast('Please select the license expiry date.'); return false; }
    if (uploadHook.files.length === 0) { showToast('Please upload at least one document.'); return false; }
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(form, uploadHook.files);
  };

  return (
    <div className={styles.wrapper}>
      <ProgressSteps
        currentStep={currentStep}
        completedSteps={loading ? [1, 2, 3] : completedSteps}
      />

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
            <path d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Driver Information
        </h2>

        <div className={styles.grid}>

          <div className={styles.field}>
            <label htmlFor="driverName">
              Driver Name <span className={styles.req}>*</span>
            </label>
            <input
              id="driverName"
              name="driverName"
              type="text"
              placeholder="e.g. Ravi Kumar"
              value={form.driverName}
              onChange={handleChange}
              autoComplete="off"
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="phone">
              Phone / Driver ID <span className={styles.req}>*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="e.g. +91 98765 43210"
              value={form.phone}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="licenseNum">
              License Number <span className={styles.req}>*</span>
            </label>
            <input
              id="licenseNum"
              name="licenseNum"
              type="text"
              placeholder="e.g. TS0420190012345"
              value={form.licenseNum}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="licenseExpiry">
              License Expiry Date <span className={styles.req}>*</span>
            </label>
            <input
              id="licenseExpiry"
              name="licenseExpiry"
              type="date"
              value={form.licenseExpiry}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="vehicleNum">Vehicle / RC Number</label>
            <input
              id="vehicleNum"
              name="vehicleNum"
              type="text"
              placeholder="e.g. TS 09 EA 1234"
              value={form.vehicleNum}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="joinDate">Joining Date</label>
            <input
              id="joinDate"
              name="joinDate"
              type="date"
              value={form.joinDate}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* Upload zone — full width */}
          <div className={`${styles.field} ${styles.full}`}>
            <label>
              Upload Documents <span className={styles.req}>*</span>
            </label>
            <UploadZone uploadHook={uploadHook} />
          </div>

          {/* Submit — full width */}
          <div className={`${styles.field} ${styles.full}`}>
            <button
              className={`${styles.submitBtn} ${loading ? styles.loading : ''}`}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Analysing documents…
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  Check Documents with AI
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
