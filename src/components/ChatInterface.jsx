import React, { useState, useRef, useEffect } from "react";
import { BookOpen, BrainCircuit, CheckCircle, X, AlertTriangle, Paperclip, Send, Volume2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { classNames, backendUrl } from "../utils/helpers";
import { useTheme } from "../context/ThemeContext";
import { auth } from "../config/firebase";

const AutosizeTextarea = (props) => {
  const textareaRef = useRef(null);
  useEffect(() => { 
    if (textareaRef.current) { 
      textareaRef.current.style.height = 'auto'; 
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; 
    } 
  }, [props.value]);
  return <textarea ref={textareaRef} {...props} />;
};

export default function ChatInterface({ currentChatId, setCurrentChatId, user, chatHistory, saveChatToBackend }) {
  const { isDark } = useTheme();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [docId, setDocId] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null); 
  const [backendStatus, setBackendStatus] = useState({ status: 'idle', error: '' });
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false); 
  
  const [previewImage, setPreviewImage] = useState(null);

  const handleImagePreview = async (url) => {
    try {
      const res = await fetch(url, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setPreviewImage(objectUrl);
    } catch (err) {
      console.error("Failed to load image preview:", err);
    }
  };

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (currentChatId && user?.uid) {
      const chat = chatHistory.find(c => c.id === currentChatId);
      if (chat) {
        setMessages(chat.messages || []);
        setDocId(chat.docId || null);
        setUploadedFileName(chat.uploadedFileName || null);
        setUploadedFileUrl(chat.uploadedFileUrl || null); 
      }
    } else {
      setMessages([]); setDocId(null); setUploadedFileName(null); setUploadedFileUrl(null);
    }
    setBackendStatus({ status: 'idle', error: '' });
  }, [currentChatId, user?.uid, chatHistory]); 

  const renderTextWithLinks = (text) => {
    if (!text) return null;
    // Split on markdown links [text](url) OR bold **text** — capturing both delimiters
    const parts = text.split(/(\[.*?\]\(.*?\)|\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      // Markdown link: [label](url)
      const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        const fullUrl = linkMatch[2].startsWith('http') ? linkMatch[2] : backendUrl + linkMatch[2];
        return (
          <button 
            key={i} 
            onClick={() => handleImagePreview(fullUrl)}
            className="text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/40 p-1 rounded-full mx-0.5 inline-flex items-center justify-center align-middle transition-colors"
            title="Click to view source page"
          >
            <Paperclip className="h-3.5 w-3.5 inline-block" />
          </button>
        );
      }
      // Markdown bold: **text**
      const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
      if (boldMatch) {
        return <strong key={i} className="font-bold">{boldMatch[1]}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setBackendStatus({ status: 'uploading', error: '' });

    try {
      const chatId = currentChatId || `chat_${Date.now()}`;
      const formData = new FormData();
      formData.append('file', file);
      
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${backendUrl}/api/upload`, { 
        method: 'POST', 
        body: formData, 
        headers: { 
          'authorization': token,
          'ngrok-skip-browser-warning': 'true' // CRITICAL: Bypasses Ngrok HTML warning
        } 
      });
      if (!res.ok) throw new Error("Backend processing failed");
      const backendData = await res.json();
      
      const localFileUrl = `${backendUrl}/documents/${backendData.docId}/source.pdf`;
      const uploadMessage = { id: `ai_${Date.now()}`, sender: 'AI', text: `Document "${file.name}" is ready. You can now ask questions about it.` };
      
      setMessages(prev => [...prev, uploadMessage]);
      setDocId(backendData.docId); setUploadedFileName(file.name); setUploadedFileUrl(localFileUrl);
      
      if (!currentChatId) setCurrentChatId(chatId);
      
      saveChatToBackend(chatId, {
        title: file.name.length > 40 ? file.name.substring(0, 40) + '...' : file.name,
        messages: [...messages, uploadMessage],
        docId: backendData.docId, uploadedFileName: file.name, uploadedFileUrl: localFileUrl 
      });
      setBackendStatus({ status: 'idle', error: '' });
    } catch (err) {
      setBackendStatus({ status: 'error', error: `Upload Failed: ${err.message}` });
    } finally {
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  
  const removeDocument = () => {
    const removeMessage = { id: `ai_${Date.now()}`, sender: 'AI', text: 'Document removed. You can upload a new document or continue chatting.' };
    const newMessages = [...messages, removeMessage];
    setMessages(newMessages); setDocId(null); setUploadedFileName(null); setUploadedFileUrl(null);
    if (currentChatId) {
      const chatTitle = chatHistory.find(c => c.id === currentChatId)?.title || "New Chat";
      saveChatToBackend(currentChatId, {
        title: chatTitle,
        messages: newMessages,
        docId: null,
        uploadedFileName: null,
        uploadedFileUrl: null
      });
    }
  };
  
  const speakText = (text, messageId) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (speakingMessageId === messageId) { setSpeakingMessageId(null); return; }
      const cleanText = text.replace(/\[.*?\]\(.*?\)/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ml-IN'; utterance.rate = 0.9;
      utterance.onend = () => setSpeakingMessageId(null);
      setSpeakingMessageId(messageId);
      window.speechSynthesis.speak(utterance);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || backendStatus.status === 'uploading' || isGenerating) return;
    setBackendStatus({ status: 'idle', error: '' });
    setIsGenerating(true); 
    
    const userMessage = { sender: user.name, text: input, id: `msg_${Date.now()}` };
    const thinkingMessage = { sender: 'AI', text: "Thinking...", id: `thinking_${Date.now()}` };
    const isNewChat = !currentChatId;
    let chatId = currentChatId || `chat_${Date.now()}`;
    let chatTitle = isNewChat ? (input.length > 50 ? input.substring(0, 50) + '...' : input) : chatHistory.find(c => c.id === currentChatId)?.title;
    
    if (isNewChat) setCurrentChatId(chatId);
    
    const updatedMessages = [...messages, userMessage, thinkingMessage];
    setMessages(updatedMessages);
    setInput("");
    
    saveChatToBackend(chatId, { title: chatTitle, messages: [...messages, userMessage], docId, uploadedFileName, uploadedFileUrl });

    const historyToSend = messages.slice(-6).map(m => ({
      role: m.sender === 'AI' ? 'Aksharalokam AI' : 'Student',
      text: m.text
    }));

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${backendUrl}/api/ask`, { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json', 
          'authorization': token,
          'ngrok-skip-browser-warning': 'true' // CRITICAL: Bypasses Ngrok HTML warning
        }, 
        body: JSON.stringify({ docId, question: userMessage.text, history: historyToSend }) 
      });
      if(!res.ok) throw new Error((await res.json()).detail || "Error occurred.");
      const data = await res.json();
      
      const aiResponse = { sender: 'AI', text: data.answer, id: `ai_${Date.now()}` };
      const finalMessages = [...messages, userMessage, aiResponse];
      setMessages(finalMessages);
      saveChatToBackend(chatId, { title: chatTitle, messages: finalMessages, docId, uploadedFileName, uploadedFileUrl });
    } catch (err) {
      const errorMessage = { sender: 'AI', text: `Error: ${err.message}`, id: `error_${Date.now()}` };
      const finalMessages = [...messages, userMessage, errorMessage];
      setMessages(finalMessages);
      saveChatToBackend(chatId, { title: chatTitle, messages: finalMessages, docId, uploadedFileName, uploadedFileUrl });
    } finally {
      setIsGenerating(false); 
    }
  };

  return (
    <div className={classNames("flex flex-col h-full relative", isDark ? "bg-gray-900" : "bg-gray-50")}>
      
      <AnimatePresence>
        {previewImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4 backdrop-blur-sm"
          >
            <div className="w-full max-w-4xl flex justify-between items-center mb-4">
              <button onClick={() => setPreviewImage(null)} className="text-white hover:text-blue-400 flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full">
                <ArrowLeft className="h-5 w-5" /> Close Preview
              </button>
            </div>
            <motion.img 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} src={previewImage} alt="Source Page" 
              className="max-w-full max-h-[80vh] rounded-xl shadow-2xl object-contain border border-white/20"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto">
        {!messages.length ? (
          <div className="h-full flex flex-col items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <BookOpen className={classNames("h-16 w-16 mx-auto mb-4", isDark ? "text-blue-400" : "text-blue-600")} />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">അക്ഷരലോകം</h1>
              <p className={isDark ? "text-gray-400" : "text-gray-500"}>How can I help you today?</p>
            </motion.div>
          </div>
        ) : (
          <div className="p-3 md:p-6 space-y-4 max-w-6xl mx-auto">
            {messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={classNames("flex items-start gap-3", msg.sender === 'AI' ? 'justify-start' : 'justify-end')}>
                {msg.sender === 'AI' && <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"><BrainCircuit className="h-5 w-5 text-white" /></div>}
                <div className="relative group max-w-[85%] lg:max-w-3xl">
                  <div className={classNames("px-4 py-3 rounded-2xl whitespace-pre-wrap text-sm sm:text-base break-words", msg.sender === 'AI' ? (isDark ? 'bg-gray-700 text-gray-100' : 'text-gray-800') : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-sm')}>
                    
                    {msg.text === 'Thinking...' ? (
                      <div className="flex space-x-1.5 items-center h-6 px-2">
                        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-2.5 h-2.5 bg-blue-300 rounded-full" />
                        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} className="w-2.5 h-2.5 bg-blue-400 rounded-full" />
                        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                      </div>
                    ) : (
                      <p>{renderTextWithLinks(msg.text)}</p>
                    )}

                    {msg.sender === 'AI' && msg.text !== 'Thinking...' && (
                      <div className="flex justify-end mt-1.5">
                        <button
                          onClick={() => speakText(msg.text, msg.id)}
                          className={classNames("p-1.5 rounded-full transition-colors", isDark ? "hover:bg-gray-600" : "hover:bg-gray-200")}
                          title="Read aloud"
                        >
                          <Volume2 className={classNames("h-4 w-4", speakingMessageId === msg.id ? "text-blue-500" : "text-gray-400")} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className={classNames("border-t p-3 md:p-4", isDark ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200")}>
        <div className="max-w-6xl mx-auto">
          {uploadedFileName && backendStatus.status !== 'uploading' && (
            <div className="flex items-center justify-center mb-3">
              <div className={classNames("flex items-center gap-2 px-3 py-1.5 rounded-full", isDark ? "bg-green-900/30 text-green-400" : "bg-green-50 text-green-700")}>
                <CheckCircle className="h-4 w-4" /> <span>{uploadedFileName}</span>
                <button onClick={removeDocument}><X className="h-4 w-4" /></button>
              </div>
            </div>
          )}
          
          <div className={classNames("flex items-end space-x-2 p-2 sm:p-3 border-2 rounded-2xl focus-within:border-blue-500 relative", isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200")}>
            
            {(backendStatus.status === 'uploading' || isGenerating) && (
              <div className={classNames("absolute inset-0 z-10 flex items-center justify-center rounded-2xl backdrop-blur-[2px]", isDark ? "bg-gray-900/60" : "bg-white/60")}>
                <div className="flex items-center gap-2 text-blue-500 font-semibold text-sm">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  {backendStatus.status === 'uploading' ? 'Processing Document...' : 'Generating Answer...'}
                </div>
              </div>
            )}

            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf" className="hidden" />
            
            <button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={backendStatus.status === 'uploading' || isGenerating || docId} 
              className="p-2 rounded-lg text-gray-500 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            
            <AutosizeTextarea 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              disabled={backendStatus.status === 'uploading' || isGenerating}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} 
              placeholder={docId ? "Ask about the document..." : "Ask a general question..."} 
              className={classNames("flex-1 bg-transparent focus:outline-none resize-none max-h-32 disabled:opacity-50", isDark ? "text-gray-100 placeholder-gray-500" : "text-gray-800")} 
              rows={1} 
            />
            
            <button 
              onClick={sendMessage} 
              disabled={!input.trim() || backendStatus.status === 'uploading' || isGenerating} 
              className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}