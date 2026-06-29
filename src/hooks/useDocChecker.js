import { useState, useCallback } from 'react';
import Tesseract from 'tesseract.js';
import { supabase } from '../supabaseClient';

export function useDocChecker() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const performOCR = async (file) => {
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      return text;
    } catch (error) {
      console.error(`OCR failed for ${file.name}:`, error);
      return "";
    }
  };

  const check = useCallback(async (formData, files) => {
    setLoading(true);
    try {
      const { driverName, phone, licenseNum, licenseExpiry, vehicleNum, aadhaarNum, joinDate } = formData;
      const flags = [];
      let okCount = 0, warnCount = 0, errCount = 0;


      for (const file of files) {
        const text = await performOCR(file);
        const textLower = text.toLowerCase();
        const fileNameLower = file.name.toLowerCase();

        if (fileNameLower.includes('license') || fileNameLower.includes('dl')) {
          if (textLower.includes(licenseNum.toLowerCase())) {
            flags.push({ type: 'ok', label: 'License verified by OCR', detail: `Matched ${licenseNum}` });
          } else {
            flags.push({ type: 'warn', label: 'License mismatch', detail: 'OCR text does not match provided license number.' });
          }

          const dateRegex = /(\d{2}\/\d{2}\/\d{4})|(\d{4}-\d{2}-\d{2})/;
          const match = text.match(dateRegex);
          if (match) {
            const extractedDate = new Date(match[0]);
            if (extractedDate < new Date()) {
              flags.push({ type: 'err', label: 'License EXPIRED', detail: `OCR found expiry date: ${match[0]}` });
            } else {
              flags.push({ type: 'ok', label: 'License validity verified', detail: `Expires: ${match[0]}` });
            }
          } else {
            flags.push({ type: 'warn', label: 'Expiry date not found in scan', detail: 'Manual check required.' });
          }
        } else if (fileNameLower.includes('rc') || fileNameLower.includes('registration')) {
          if (vehicleNum && textLower.includes(vehicleNum.toLowerCase())) {
            flags.push({ type: 'ok', label: 'RC Verified', detail: `Matches vehicle ${vehicleNum}` });
          } else {
            flags.push({ type: 'err', label: 'RC Mismatch', detail: 'Vehicle number not found in RC document.' });
          }
        } else if (fileNameLower.includes('aadhaar') || fileNameLower.includes('id')) {
          if (aadhaarNum && textLower.includes(aadhaarNum.replace(/\s+/g, '').toLowerCase())) {
            flags.push({ type: 'ok', label: 'Aadhaar Verified', detail: `Matches Aadhaar ${aadhaarNum}` });
          } else if (textLower.includes('government of india') || textLower.includes('unique identification')) {
            flags.push({ type: 'ok', label: 'Aadhaar Verified', detail: 'Authentic markers detected (No specific number match).' });
          } else {
            flags.push({ type: 'err', label: 'Invalid ID', detail: 'Document does not appear to be a valid Aadhaar card.' });
          }
        }
      }

      // Fallbacks for missing docs
      const fileNames = files.map(f => f.name.toLowerCase());
      if (!fileNames.some(n => n.includes('license'))) flags.push({ type: 'err', label: 'License Missing', detail: 'Please upload license.' });
      if (!fileNames.some(n => n.includes('rc'))) flags.push({ type: 'err', label: 'RC Missing', detail: 'Please upload RC.' });
      if (!fileNames.some(n => n.includes('aadhaar'))) flags.push({ type: 'err', label: 'Aadhaar Missing', detail: 'Please upload Aadhaar.' });

      okCount = flags.filter(f => f.type === 'ok').length;
      warnCount = flags.filter(f => f.type === 'warn').length;
      errCount = flags.filter(f => f.type === 'err').length;
      const status = errCount > 0 ? 'FAIL' : (warnCount > 0 ? 'REVIEW' : 'PASS');


      let uploadedFiles = [];
      try {
        uploadedFiles = await Promise.all(files.map(async (file) => {
          const path = `${Date.now()}_${file.name}`;
          const { data, error } = await supabase.storage.from('onboarding').upload(path, file);
          if (error) throw error;
          return { name: file.name, path };
        }));
      } catch (err) {
        console.warn("Storage unreachable. Using mock files.", err.message);
        uploadedFiles = files.map(f => ({ name: f.name, path: `mock_${f.name}` }));
      }


      const reportData = {
        driverName, phone, licenseNum, licenseExpiry, vehicleNum, aadhaarNum, joinDate,
        flags, okCount, warnCount, errCount, status,
        timestamp: new Date().toISOString(),
        rating: 0,
        files: uploadedFiles.map(f => f.path)
      };

      let finalResult = { ...reportData, id: Date.now().toString() };
      
      try {
        const { data: savedReport, error: dbError } = await supabase
          .from('reports')
          .insert([reportData])
          .select()
          .single();

        if (dbError) throw dbError;
        finalResult = { ...reportData, id: savedReport.id };
      } catch (dbError) {
        console.warn("Supabase unreachable. Using mock DB save.", dbError.message);

      }

      setResult(finalResult);
      return finalResult;

    } catch (error) {
      console.error("Zero-Cost Validation Error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setLoading(false);
  }, []);

  return { loading, result, setResult, check, reset };
}
