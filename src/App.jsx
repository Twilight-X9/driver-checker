import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Toast from './components/Toast';
import CheckerPage from './components/CheckerPage';
import HistoryPageLayout from './components/HistoryPageLayout';
import AuthPage from './components/AuthPage';
import AdminCRMPage from './components/AdminCRMPage';
import './styles/globals.css';

function MainApp() {
  const { user, authLoading, page } = useApp();

  if (authLoading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return (
      <>
        <AuthPage />
        <Toast />
      </>
    );
  }

  if (page === 'admin') {
    return (
      <>
        <AdminCRMPage />
        <Toast />
      </>
    );
  }

  return (
    <>
      <Header />
      {page === 'checker' && <CheckerPage />}
      {page === 'history' && <HistoryPageLayout />}
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
