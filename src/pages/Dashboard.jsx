import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ChatInterface from "../components/ChatInterface";
import { SubjectSelectionView, SubjectView, StudyPlaceholder } from "../components/StudyComponents";
import { classNames, backendUrl } from "../utils/helpers";
import { useTheme } from "../context/ThemeContext";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard({ user }) {
  const { isDark, setIsDark } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [activeSection, setActiveSection] = useState('chat');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // --- AUTO CLOSE SIDEBAR ON MOBILE (only for actual navigation, not tab switching) ---
  const handleMobileClose = () => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  // --- FETCH CHAT HISTORY ---
  const loadChatsFromBackend = async () => {
    if (!user?.uid) return;
    try {
      // getIdToken() waits for a valid token — if currentUser isn't ready yet this will throw,
      // which is why we call this only from inside the onAuthStateChanged listener below.
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${backendUrl}/api/chat/history`, {
        headers: {
          'authorization': token,
          'ngrok-skip-browser-warning': 'true',
        }
      });
      if (res.ok) {
        const data = await res.json();
        setChatHistory(data);
      }
    } catch (err) {
      console.error("Failed to load chats from database:", err);
    }
  };

  // FIX 2: Use onAuthStateChanged so we only fetch AFTER Firebase auth is fully
  // initialized and auth.currentUser is guaranteed to be non-null with a valid token.
  // This eliminates the "refresh required after login" bug entirely.
  useEffect(() => {
    if (!user?.uid) return;

    // Wait for the Firebase auth state to settle before making the first fetch.
    // onAuthStateChanged fires synchronously with the current user when already
    // signed in, so this is instant — not a delayed retry.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        loadChatsFromBackend();
      }
    });

    window.addEventListener('chatUpdated', loadChatsFromBackend);

    return () => {
      unsubscribe();
      window.removeEventListener('chatUpdated', loadChatsFromBackend);
    };
  }, [user?.uid]);

  // --- SAVE CHAT ---
  const saveChatToBackend = async (chatId, chatData) => {
    try {
      const token = await auth.currentUser.getIdToken();
      await fetch(`${backendUrl}/api/chat/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': token,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ id: chatId, ...chatData })
      });
      window.dispatchEvent(new Event('chatUpdated'));
    } catch (err) {
      console.error("Save to DB failed", err);
    }
  };

  // --- DELETE CHAT ---
  const deleteChat = async (chatId) => {
    try {
      const token = await auth.currentUser.getIdToken();
      await fetch(`${backendUrl}/api/chat/${chatId}`, {
        method: 'DELETE',
        headers: { 'authorization': token, 'ngrok-skip-browser-warning': 'true' }
      });
      if (currentChatId === chatId) setCurrentChatId(null);
      setShowDeleteConfirm(null);
      loadChatsFromBackend();
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const handleClassSelect = (classNum) => { setActiveSection('study'); setSelectedClass(classNum); setSelectedSubject(null); handleMobileClose(); };
  const startNewChat    = () => { setCurrentChatId(null); setActiveSection('chat'); handleMobileClose(); };
  const loadChat        = (chatId) => { setCurrentChatId(chatId); setActiveSection('chat'); handleMobileClose(); };

  const renderMainContent = () => {
    if (activeSection === 'study') {
      if (selectedSubject) return <SubjectView user={user} classNum={selectedClass} subject={selectedSubject} onGoBack={() => setSelectedSubject(null)} />;
      if (selectedClass)   return <SubjectSelectionView classNum={selectedClass} onSelectSubject={setSelectedSubject} />;
      return <StudyPlaceholder message="Please select a class from the sidebar to begin." />;
    }
    return <ChatInterface currentChatId={currentChatId} setCurrentChatId={setCurrentChatId} user={user} chatHistory={chatHistory} saveChatToBackend={saveChatToBackend} />;
  };

  return (
    <div className={classNames("flex h-[100dvh] overflow-hidden", isDark ? "bg-gray-900 text-gray-100" : "bg-slate-50 text-gray-800")}>

      {/* MOBILE BACKDROP SCRIM */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* RESPONSIVE SIDEBAR WRAPPER */}
      <div className="fixed inset-y-0 left-0 z-50 md:relative md:z-auto">
        <Sidebar
          isOpen={isSidebarOpen} user={user} activeSection={activeSection}
          // FIX 1: onSetSection only switches the active tab. handleMobileClose() is
          // intentionally absent so the sidebar stays open after tapping Chat / Study,
          // giving the user time to then pick a specific chat or class.
          onSetSection={(sec) => setActiveSection(sec)}
          onClassSelect={handleClassSelect} onNewChat={startNewChat} chatHistory={chatHistory}
          onLoadChat={loadChat} selectedClass={selectedClass} currentChatId={currentChatId}
          onDeleteChat={deleteChat} showDeleteConfirm={showDeleteConfirm} setShowDeleteConfirm={setShowDeleteConfirm}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Header user={user} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isDark={isDark} setIsDark={setIsDark} />
        <main className={classNames("flex-1 overflow-hidden", isDark ? "bg-gray-800" : "bg-white")}>{renderMainContent()}</main>
      </div>
    </div>
  );
}