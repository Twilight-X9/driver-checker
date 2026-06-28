import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [page, setPage] = useState('checker');           // 'checker' | 'history'
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState(null);
  const [toastTimer, setToastTimer] = useState(null);

  const navigate = useCallback((name) => setPage(name), []);


  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setAuthLoading(false);
    };
    
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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
        setHistory(data);
      }
    };

    fetchHistory();
  }, [user]);

  const addToHistory = useCallback(async (entry) => {
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
      user, authLoading, login, signup, googleSignIn, logout,
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
