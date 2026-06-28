/**
 * Builds a plain-text report string from a result object.
 */
export function buildReportText(result) {
  const lines = [
    'AI Driver Onboarding Document Check',
    'Manivtha Tours & Travels',
    '=====================================',
    '',
    `Driver     : ${result.driverName}`,
    `Phone / ID : ${result.phone}`,
    `License No : ${result.licenseNum}`,
    `Expiry     : ${result.licenseExpiry}`,
    `Vehicle/RC : ${result.vehicleNum || 'Not provided'}`,
    `Joining    : ${result.joinDate   || 'Not provided'}`,
    `Files      : ${result.files.join(', ')}`,
    `Checked on : ${result.timestamp}`,
    '',
    'VALIDATION RESULTS',
    '------------------',
    ...result.flags.map(
      (f) => `[${f.type.toUpperCase().padEnd(4)}] ${f.label}\n         ${f.detail}`
    ),
    '',
    `SUMMARY : ${result.okCount} verified | ${result.warnCount} warnings | ${result.errCount} issues`,
    `Rating  : ${result.rating > 0 ? result.rating + '/5' : 'Not rated'}`,
  ];
  return lines.join('\n');
}

/**
 * Copies text to clipboard and returns a promise.
 */
export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text);
}

/**
 * Triggers a .txt file download in the browser.
 */
export function downloadTextFile(text, filename) {
  const blob = new Blob([text], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Formats bytes to a human-readable string.
 */
export function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  return Math.round(bytes / 1024) + ' KB';
}
