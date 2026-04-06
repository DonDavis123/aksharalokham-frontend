import React, { useState, useRef, useEffect } from "react";
import { BookOpen, ArrowLeft, Search, ArrowUpCircle, AlertTriangle, CheckCircle, FileText, Eye, Download, Trash2, Atom, FlaskConical, Leaf, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { classNames, backendUrl } from "../utils/helpers";
import { useTheme } from "../context/ThemeContext";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";

export const SubjectSelectionView = ({ classNum, onSelectSubject }) => {
  const { isDark } = useTheme();
  const subjectsByClass = {
    7:  { "Basic Science": Atom, "Social Science": Globe },
    8:  { "Physics": Atom, "Chemistry": FlaskConical, "Biology": Leaf, "Social Science": Globe },
    9:  { "Physics": Atom, "Chemistry": FlaskConical, "Biology": Leaf, "Social Science": Globe },
    10: { "Physics": Atom, "Chemistry": FlaskConical, "Biology": Leaf, "Social Science": Globe }
  };

  const subjects = subjectsByClass[classNum];

  return (
    <div className={classNames("h-full overflow-y-auto p-4 sm:p-8", isDark ? "bg-gray-900" : "bg-gray-50")}>
      <h2 className={classNames("text-2xl font-bold mb-6", isDark ? "text-gray-100" : "text-gray-800")}>Class {classNum} - Select Subject</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(subjects).map(([subject, Icon]) => (
          <motion.button key={subject} whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }} onClick={() => onSelectSubject(subject)} className={classNames("p-6 rounded-xl shadow-sm border text-left flex items-center space-x-4", isDark ? "bg-gray-900 border-gray-700" : "bg-gradient-to-br from-blue-50 to-purple-50 border-gray-200")}>
            <div className={classNames("p-3 rounded-lg shadow-sm", isDark ? "bg-gray-800" : "bg-white")}><Icon className="h-8 w-8 text-blue-500" /></div>
            <div>
              <h3 className={classNames("text-xl font-semibold", isDark ? "text-gray-100" : "text-gray-800")}>{subject}</h3>
              <p className="text-sm text-gray-500">View materials</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export const SubjectView = ({ user, classNum, subject, onGoBack }) => {
  const { isDark } = useTheme();
  const [materials, setMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadState, setUploadState] = useState({ status: 'idle', progress: 0, error: '', success: '' });
  const [viewingPdf, setViewingPdf] = useState(null);
  const fileInputRef = useRef(null);
  const [docToDelete, setDocToDelete] = useState(null);

  // FIX 3: Load materials from the Python backend instead of localStorage.
  // This means every user (mobile or desktop, teacher or student) sees the same data.
  const loadMaterials = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(
        `${backendUrl}/api/materials?classNum=${classNum}&subject=${encodeURIComponent(subject)}`,
        {
          headers: {
            'authorization': token,
            'ngrok-skip-browser-warning': 'true',
          }
        }
      );
      if (res.ok) {
        const data = await res.json();
        setMaterials(data);
      }
    } catch (err) {
      console.error("Failed to load materials:", err);
    }
  };

  // FIX 2 (mirrored from Dashboard): Use onAuthStateChanged so loadMaterials only
  // fires after Firebase auth is fully initialized. Fixes "refresh required" on first login.
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        loadMaterials();
      }
    });

    window.addEventListener('materialsUpdated', loadMaterials);

    return () => {
      unsubscribe();
      window.removeEventListener('materialsUpdated', loadMaterials);
    };
  }, [classNum, subject, user?.uid]);

  // Upload: send file to Python backend for processing, then re-fetch the list
  // from the backend so all users see the new material immediately.
  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadState({ status: 'uploading', progress: 0, error: '', success: '' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('classNum', classNum);
    formData.append('subject', subject);
    formData.append('title', file.name);
    formData.append('uploadedBy', user.name);

    let prog = 0;
    const progressInterval = setInterval(() => {
      prog += 15;
      if (prog > 90) prog = 90;
      setUploadState(s => ({ ...s, status: 'uploading', progress: prog }));
    }, 200);

    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`${backendUrl}/api/upload`, {
        method: 'POST',
        body: formData,
        headers: { 'authorization': token, 'ngrok-skip-browser-warning': 'true' }
      });
      if (!response.ok) throw new Error("Failed to upload to server");

      clearInterval(progressInterval);
      setUploadState(s => ({ ...s, progress: 100 }));

      setUploadState({ status: 'success', progress: 100, error: '', success: 'File saved!' });

      // Re-fetch from backend instead of writing to localStorage —
      // this makes the new material visible to all users instantly.
      window.dispatchEvent(new Event('materialsUpdated'));
    } catch (err) {
      clearInterval(progressInterval);
      setUploadState({ status: 'error', progress: 0, error: `Upload failed: ${err.message}`, success: '' });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setUploadState({ status: 'idle', progress: 0, error: '', success: '' }), 3000);
    }
  };

  // FIX 3: Delete via backend DELETE endpoint instead of mutating localStorage.
  const handleDelete = async () => {
    if (!docToDelete) return;
    try {
      const token = await auth.currentUser.getIdToken();
      await fetch(`${backendUrl}/api/materials/${docToDelete.id}`, {
        method: 'DELETE',
        headers: { 'authorization': token, 'ngrok-skip-browser-warning': 'true' }
      });
      setDocToDelete(null);
      // Re-fetch so the list reflects the deletion for all users.
      window.dispatchEvent(new Event('materialsUpdated'));
    } catch (err) {
      console.error("Failed to delete material:", err);
    }
  };

  const filteredMaterials = materials.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (viewingPdf) {
    // FIX: Prepend backendUrl for relative URLs so Firebase Hosting doesn't intercept them.
    const pdfUrl = viewingPdf.url.startsWith('http') ? viewingPdf.url : backendUrl + viewingPdf.url;
    return (
      <div className={classNames("h-full flex flex-col", isDark ? "bg-gray-900" : "bg-gray-50")}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <button onClick={() => setViewingPdf(null)} className="mr-3 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><ArrowLeft /></button>
            <h3 className="font-semibold truncate">{viewingPdf.title}</h3>
          </div>
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" title="Download">
            <Download className="h-5 w-5" />
          </a>
        </div>
        <iframe src={pdfUrl} className="w-full h-full" title={viewingPdf.title} />
      </div>
    );
  }

  return (
    <div className={classNames("h-full flex flex-col p-4 md:p-6", isDark ? "bg-gray-900" : "bg-gray-50")}>
      <div className="flex items-center mb-6">
        <button onClick={onGoBack} className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><ArrowLeft /></button>
        <h2 className="text-2xl font-bold">Class {classNum} - {subject}</h2>
      </div>

      <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className={classNames("absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5", isDark ? "text-gray-500" : "text-gray-400")} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search materials..."
            className={classNames(
              "w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
              isDark ? "bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500" : "border-gray-300 text-gray-800"
            )}
          />
        </div>

        {user?.type === 'teacher' && (
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadState.status === 'uploading'}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <ArrowUpCircle className="mr-2" /> Upload Document
              </button>
              {uploadState.status === 'success' && (
                <span className="flex items-center text-sm text-green-500 font-medium">
                  <CheckCircle className="h-4 w-4 mr-1" /> {uploadState.success}
                </span>
              )}
              {uploadState.status === 'error' && (
                <span className="flex items-center text-sm text-red-500 font-medium">
                  <AlertTriangle className="h-4 w-4 mr-1" /> {uploadState.error}
                </span>
              )}
            </div>

            {uploadState.status === 'uploading' && (
              <div className="w-full sm:max-w-xs">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Uploading…</span>
                  <span>{uploadState.progress}%</span>
                </div>
                <div className={classNames("w-full h-2 rounded-full overflow-hidden", isDark ? "bg-gray-700" : "bg-gray-200")}>
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadState.progress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            <input ref={fileInputRef} onChange={onFileChange} type="file" accept=".pdf" className="hidden" />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredMaterials.map(material => (
          <div key={material.id} className={classNames("p-4 rounded-lg border flex items-center justify-between mb-3", isDark ? "bg-gray-900 border-gray-700" : "bg-gray-50")}>
            <div className="flex items-center space-x-3 overflow-hidden">
              <FileText className="text-blue-500 flex-shrink-0" />
              <div className="truncate">
                <p className="font-medium truncate">{material.title}</p>
                <p className="text-xs text-gray-500">by {material.uploadedBy}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => setViewingPdf(material)} className="p-2 text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-full"><Eye /></button>
              {user?.uid === material.uploaderUid && (
                <button onClick={() => setDocToDelete(material)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full"><Trash2 /></button>
              )}
            </div>
          </div>
        ))}
        {filteredMaterials.length === 0 && materials.length > 0 && (
          <p className="text-center text-gray-500 mt-6">No materials match your search.</p>
        )}
      </div>

      <AnimatePresence>
        {docToDelete && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={classNames("rounded-lg p-6 shadow-xl max-w-sm w-full", isDark ? "bg-gray-800" : "bg-white")}>
              <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
              <div className="flex justify-end space-x-3">
                <button onClick={() => setDocToDelete(null)} className="px-4 py-2 bg-gray-200 text-black rounded-md">Cancel</button>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const StudyPlaceholder = ({ message }) => {
  const { isDark } = useTheme();
  return (
    <div className={classNames("h-full flex flex-col items-center justify-center text-center p-4", isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800")}>
      <BookOpen className="h-16 w-16 mb-4 text-gray-400" />
      <h2 className="text-2xl font-bold">Study Section</h2>
      <p className="text-gray-500 mt-2">{message}</p>
    </div>
  );
};