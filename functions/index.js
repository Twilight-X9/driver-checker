const functions = require('firebase-functions');
const admin = require('firebase-admin');
const vision = require('@google-cloud/vision');
const { format, isAfter, isBefore, parseISO } = require('date-fns');

admin.initializeApp();
const db = admin.firestore();
const visionClient = new vision.ImageAnnotatorClient();

/**
 * AI Validation Pipeline for Driver Onboarding
 */
exports.validateDriver = functions.https.onCall(async (data, context) => {
  const { formData, files } = data;
  const { driverName, phone, licenseNum, licenseExpiry, vehicleNum, joinDate } = formData;

  const flags = [];
  let okCount = 0, warnCount = 0, errCount = 0;

  try {
    // 1. Create Driver Record
    const driverRef = await db.collection('drivers').add({
      name: driverName,
      phone,
      vehicleNum,
      joinDate,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    const driverId = driverRef.id;

    // 2. Document OCR & Validation
    for (const file of files) {
      const [result] = await visionClient.textDetection(file.url);
      const fullText = result.fullTextAnnotation ? result.fullTextAnnotation.text : "";
      const textLower = fullText.toLowerCase();

      // --- LICENSE VALIDATION ---
      if (file.name.toLowerCase().includes('license') || file.name.toLowerCase().includes('dl')) {
        // Check for license number match
        if (textLower.includes(licenseNum.toLowerCase())) {
          flags.push({ type: 'ok', label: 'License number verified via OCR', detail: `Matches input: ${licenseNum}` });
        } else {
          flags.push({ type: 'warn', label: 'License number mismatch', detail: 'OCR could not verify the provided license number.' });
        }

        // Check for Expiry Date in text
        const dateRegex = /(\d{2}\/\d{2}\/\d{4})|(\d{4}-\d{2}-\d{2})/;
        const match = fullText.match(dateRegex);
        if (match) {
          const extractedDate = new Date(match[0]);
          const today = new Date();
          if (isBefore(extractedDate, today)) {
            flags.push({ type: 'err', label: 'License EXPIRED', detail: `OCR detected expiry on ${match[0]}.` });
          } else {
            flags.push({ type: 'ok', label: 'License validity verified', detail: `Expires on ${match[0]}.` });
          }
        } else {
          flags.push({ type: 'warn', label: 'Expiry date not found in image', detail: 'Manual review required.' });
        }
      }

      // --- RC VALIDATION ---
      else if (file.name.toLowerCase().includes('rc') || file.name.toLowerCase().includes('registration')) {
        if (vehicleNum && textLower.includes(vehicleNum.toLowerCase())) {
          flags.push({ type: 'ok', label: 'Vehicle RC verified', detail: `Matches vehicle: ${vehicleNum}` });
        } else {
          flags.push({ type: 'err', label: 'RC mismatch or not found', detail: 'The uploaded RC does not match the provided vehicle number.' });
        }
      }

      // --- AADHAAR VALIDATION ---
      else if (file.name.toLowerCase().includes('aadhaar') || file.name.toLowerCase().includes('id')) {
        if (textLower.includes('government of india') || textLower.includes('unique identification')) {
          flags.push({ type: 'ok', label: 'Aadhaar verified', detail: 'Authentic government identity markers found.' });
        } else {
          flags.push({ type: 'err', label: 'Invalid Identity Document', detail: 'Uploaded file does not look like a valid Aadhaar card.' });
        }
      }
    }

    // Fallback for missing documents
    const uploadedTypes = files.map(f => f.name.toLowerCase());
    if (!uploadedTypes.some(n => n.includes('license'))) flags.push({ type: 'err', label: 'License missing', detail: 'No license file uploaded.' });
    if (!uploadedTypes.some(n => n.includes('rc'))) flags.push({ type: 'err', label: 'RC missing', detail: 'No registration certificate uploaded.' });
    if (!uploadedTypes.some(n => n.includes('aadhaar'))) flags.push({ type: 'err', label: 'Aadhaar missing', detail: 'No identity proof uploaded.' });

    // Calculate final counts
    okCount = flags.filter(f => f.type === 'ok').length;
    warnCount = flags.filter(f => f.type === 'warn').length;
    errCount = flags.filter(f => f.type === 'err').length;

    const status = errCount > 0 ? 'FAIL' : (warnCount > 0 ? 'REVIEW' : 'PASS');

    const report = {
      driverId,
      flags,
      okCount,
      warnCount,
      errCount,
      rating: 0,
      status,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    // Store report in Firestore
    await db.collection('reports').add(report);

    return {
      id: 'gen-id', // Firestore handles the real ID
      driverName,
      phone,
      licenseNum,
      licenseExpiry,
      vehicleNum,
      joinDate,
      files: files.map(f => f.name),
      ...report
    };

  } catch (error) {
    console.error("Cloud Function Error:", error);
    throw new functions.https.HttpsError('internal', 'Internal Server Error during AI Validation');
  }
});
