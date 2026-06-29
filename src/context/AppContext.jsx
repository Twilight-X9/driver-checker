import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [page, setPage] = useState('checker');           // 'checker' | 'history' | 'admin'

  const MOCK_HISTORY = Array.from({ length: 45 }).map((_, i) => {
    // Distribute entries unevenly across the last 7 days so the chart bars vary in height
    const dayDistribution = [0,0,0,1,1,1,1,1,1,2,2,3,3,3,3,4,4,5,5,5,6,6,6,6,6,6,6,6]; 
    const daysAgo = dayDistribution[i % dayDistribution.length];
    const isFail = i % 8 === 0;
    const isWarn = i % 5 === 0 && !isFail;
    
    const names = [
      "Rajesh Sharma", "Amit Patel", "Priya Nair", "Vikram Singh", "Ananya Rao",
      "Mohammed Ali", "Sunita Reddy", "Rahul Verma", "Neha Gupta", "Kiran Desai",
      "Suresh Kumar", "Anita Das", "Ravi Chandra", "Deepa Mehra", "Karthik Iyer",
      "Pooja Joshi", "Arjun Prasad", "Kavya Menon", "Sanjay Tiwari", "Meera Krishnan",
      "Tariq Khan", "Divya Agarwal", "Ajay Prakash", "Sushma Pandey", "Manoj Singh",
      "Nandini Sen", "Harish Choudhary", "Ritu Jain", "Gaurav Joshi", "Aditi Sharma",
      "Vikas Khanna", "Shruti Iyer", "Varun Thakur", "Kriti Verma", "Farhan Shaikh",
      "Sneha Gupta", "Ayush Roy", "Bhumi Reddy", "Rajesh Yadav", "Tara Singh",
      "Siddharth Rao", "Kiran Agarwal", "Nawaz Shaikh", "Radhika Joshi", "Pankaj Sharma"
    ];

    return {
      id: (1000 + i).toString(),
      driverName: names[i],
      licenseNum: "DL-" + (14202300000 + i),
      phone: "98765432" + (10 + i),
      vehicleNum: "MH-12-AB-" + (1000 + i),
      aadhaarNum: "1234 5678 90" + (10 + i),
      rating: (i % 5) + 1,
      status: isFail ? "FAIL" : (isWarn ? "REVIEW" : "PASS"),
      errCount: isFail ? 1 : 0,
      warnCount: isWarn ? 1 : 0,
      okCount: isFail || isWarn ? 2 : 3,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * daysAgo - (i * 3600000)).toISOString(),
      flags: [],
      files: []
    };
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem('app_history_v2');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch(e) { }
    return MOCK_HISTORY;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('app_history_v2', JSON.stringify(history));
  }, [history]);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'app_history_v2' && e.newValue) {
        setHistory(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

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

    if (!error && data && data.length > 0) {
      setHistory(data);
    }
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
