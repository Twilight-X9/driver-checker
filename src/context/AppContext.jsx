import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [page, setPage] = useState('checker');           // 'checker' | 'history' | 'admin'

  const MOCK_HISTORY = [
    { id: "1001", driverName: "Rajesh Sharma", licenseNum: "DL-14202301234", phone: "9876543210", vehicleNum: "MH-12-AB-1234", aadhaarNum: "1234 5678 9012", rating: 4, status: "PASS", errCount: 0, warnCount: 0, okCount: 3, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), flags: [{ type: 'ok', label: 'License Verified' }, { type: 'ok', label: 'RC Verified' }, { type: 'ok', label: 'Aadhaar Verified' }], files: [] },
    { id: "1002", driverName: "Amit Patel", licenseNum: "GJ-01202100987", phone: "8765432109", vehicleNum: "GJ-01-XY-5678", aadhaarNum: "2345 6789 0123", rating: 3, status: "REVIEW", errCount: 0, warnCount: 1, okCount: 2, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), flags: [{ type: 'ok', label: 'License Verified' }, { type: 'warn', label: 'Expiry Unclear', detail: 'Glare on date' }, { type: 'ok', label: 'RC Verified' }], files: [] },
    { id: "1003", driverName: "Priya Nair", licenseNum: "KL-07202000543", phone: "7654321098", vehicleNum: "KL-07-CD-9012", aadhaarNum: "3456 7890 1234", rating: 5, status: "PASS", errCount: 0, warnCount: 0, okCount: 3, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), flags: [{ type: 'ok', label: 'License Verified' }, { type: 'ok', label: 'RC Verified' }, { type: 'ok', label: 'Aadhaar Verified' }], files: [] },
    { id: "1004", driverName: "Vikram Singh", licenseNum: "PB-02201800111", phone: "6543210987", vehicleNum: "PB-02-EF-3456", aadhaarNum: "4567 8901 2345", rating: 1, status: "FAIL", errCount: 1, warnCount: 0, okCount: 2, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), flags: [{ type: 'err', label: 'License EXPIRED', detail: 'Expired on 01/01/2023' }, { type: 'ok', label: 'RC Verified' }], files: [] },
    { id: "1005", driverName: "Ananya Rao", licenseNum: "KA-01202200222", phone: "5432109876", vehicleNum: "KA-01-GH-7890", aadhaarNum: "5678 9012 3456", rating: 5, status: "PASS", errCount: 0, warnCount: 0, okCount: 3, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), flags: [{ type: 'ok', label: 'License Verified' }, { type: 'ok', label: 'RC Verified' }, { type: 'ok', label: 'Aadhaar Verified' }], files: [] },
    { id: "1006", driverName: "Mohammed Ali", licenseNum: "UP-32201900333", phone: "4321098765", vehicleNum: "UP-32-IJ-1234", aadhaarNum: "6789 0123 4567", rating: 2, status: "FAIL", errCount: 1, warnCount: 0, okCount: 1, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(), flags: [{ type: 'ok', label: 'License Verified' }, { type: 'err', label: 'RC Mismatch', detail: 'Vehicle number not found in RC document.' }], files: [] },
    { id: "1007", driverName: "Sunita Reddy", licenseNum: "TS-09202300444", phone: "3210987654", vehicleNum: "TS-09-KL-5678", aadhaarNum: "7890 1234 5678", rating: 4, status: "PASS", errCount: 0, warnCount: 0, okCount: 3, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), flags: [{ type: 'ok', label: 'License Verified' }, { type: 'ok', label: 'RC Verified' }, { type: 'ok', label: 'Aadhaar Verified' }], files: [] }
  ];

  const [history, setHistory] = useState(MOCK_HISTORY);
  const [toast, setToast] = useState(null);
  const [toastTimer, setToastTimer] = useState(null);

  // Consider this email the admin for demonstration purposes
  const adminEmail = 'admin@manivtha.com';
  const isAdmin = user?.email === adminEmail;

  const navigate = useCallback((name) => setPage(name), []);


  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user?.email === adminEmail) {
        setPage('admin');
      }
      setAuthLoading(false);
    };
    
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user?.email === adminEmail) {
        setPage('admin');
      }
    });

    return () => subscription.unsubscribe();
  }, []);


  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signup = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  const googleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setPage('checker'); // reset page on logout
  };

  const adminLogin = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user?.email !== adminEmail) {
      await supabase.auth.signOut();
      throw new Error('Not authorized as admin. Please use the regular login.');
    }
    setPage('admin');
    return data;
  };


  useEffect(() => {
    if (!user) return; // Only fetch if logged in

    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error("Supabase fetch error:", error);
      } else {
        if (data && data.length > 0) {
          setHistory(data);
        }
      }
    };

    fetchHistory();
  }, [user]);

  const addToHistory = useCallback(async (entry) => {
    setHistory(prev => [entry, ...prev]); // Optimistic update
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('timestamp', { ascending: false });

    if (!error) setHistory(data);
  }, []);

  const updateHistoryItem = useCallback(async (id, patch) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update(patch)
        .eq('id', id);

      if (error) throw error;

      const { data } = await supabase.from('reports').select('*').order('timestamp', { ascending: false });
      setHistory(data);
    } catch (error) {
      console.error("Error updating report rating:", error);
    }
  }, []);

  const deleteHistoryItem = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const { data } = await supabase.from('reports').select('*').order('timestamp', { ascending: false });
      setHistory(data);
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    if (toastTimer) clearTimeout(toastTimer);
    const t = setTimeout(() => setToast(null), 2600);
    setToastTimer(t);
  }, [toastTimer]);

  return (
    <AppContext.Provider value={{
      user, isAdmin, authLoading, login, signup, googleSignIn, logout, adminLogin,
      page, navigate,
      history, addToHistory, updateHistoryItem, deleteHistoryItem,
      toast, showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
