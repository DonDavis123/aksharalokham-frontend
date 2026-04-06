import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import { getLocalData } from "./utils/helpers";
import { ThemeProvider } from "./context/ThemeContext";

import HomePage from "./components/HomePage";
import AuthForm from "./components/AuthForm";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [isAppLoading, setIsAppLoading] = useState(true);

  const fetchUserProfile = (firebaseUser) => {
    const usersDB = getLocalData('akshara_users', {});
    const profile = usersDB[firebaseUser.uid];
    if (profile) {
      setUser({ uid: firebaseUser.uid, email: firebaseUser.email, name: profile.name, type: profile.type });
    } else {
      setUser({ uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.email?.split('@')[0] || 'User', type: 'student' });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Wait 400ms to guarantee localStorage has saved the new Teacher profile during sign-up
        setTimeout(() => {
          fetchUserProfile(firebaseUser);
          setIsAppLoading(false);
        }, 400);
      } else {
        setUser(null);
        setIsAppLoading(false);
      }
    });

    const handleProfileUpdate = () => {
      if (auth.currentUser) fetchUserProfile(auth.currentUser);
    };
    window.addEventListener('userProfileUpdated', handleProfileUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, []);

  const renderPage = () => {
    if (user) {
      // ThemeProvider removed from here, it now wraps the whole app below
      return <Dashboard user={user} />;
    }
    switch (currentPage) {
      case 'home': return <HomePage setCurrentPage={setCurrentPage} />;
      case 'login': return <AuthForm isSignup={false} setCurrentPage={setCurrentPage} />;
      case 'signup': return <AuthForm isSignup={true} setCurrentPage={setCurrentPage} />;
      default: return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white font-sans text-gray-800 dark:bg-gray-900 dark:text-gray-100">
        {isAppLoading ? (
          <div className="flex items-center justify-center h-screen text-gray-600 dark:text-gray-400">
            Loading Application...
          </div>
        ) : (
          renderPage()
        )}
      </div>
    </ThemeProvider>
  );
}