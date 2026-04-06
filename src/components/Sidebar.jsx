import React from "react";
import { BookOpen, Plus, Trash2, User, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { classNames } from "../utils/helpers";
import { useTheme } from "../context/ThemeContext";

export default function Sidebar({
  isOpen,
  user,
  activeSection,
  onSetSection,
  onClassSelect,
  onNewChat,
  chatHistory,
  onLoadChat,
  selectedClass,
  currentChatId,
  onDeleteChat,
  showDeleteConfirm,
  setShowDeleteConfirm,
}) {
  const { isDark } = useTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, x: "-100%" }}
          animate={{ width: "280px", x: 0 }}
          exit={{ width: 0, x: "-100%" }}
          transition={{ duration: 0.3 }}
          className={classNames(
            // 2. On mobile: fixed drawer overlaying content (z-50 sits above the z-40 backdrop)
            //    On desktop (md+): static flex item, no longer fixed/absolute
            "fixed inset-y-0 left-0 z-50",
            "md:relative md:inset-y-auto md:left-auto md:z-auto",
            // Shared layout
            "flex flex-col h-full border-r overflow-hidden transition-colors duration-300",
            isDark
              ? "bg-gray-900 border-gray-800 text-gray-100"
              : "bg-gray-50 border-gray-200 text-gray-800"
          )}
        >
          {/* ── Logo Header ── */}
          <div
            className={classNames(
              "flex items-center justify-center p-4 mb-2 border-b transition-colors duration-300",
              isDark ? "border-gray-800" : "border-gray-200"
            )}
          >
            <BookOpen
              className={classNames(
                "h-6 w-6 mr-2 transition-colors duration-300",
                isDark ? "text-blue-400" : "text-blue-600"
              )}
            />
            <h1 className="font-bold text-lg">അക്ഷരലോകം</h1>
          </div>

          {/* ── New Chat Button ── */}
          <div className="px-3 mb-3">
            <button
              onClick={onNewChat}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-2 font-medium shadow-lg transition-colors duration-300"
            >
              <Plus className="h-5 w-5" />
              <span>New Chat</span>
            </button>
          </div>

          {/* ── Chat / Study Pill Toggle ── */}
          <div
            className={classNames(
              "flex p-1 rounded-lg mb-3 mx-3 transition-colors duration-300",
              isDark ? "bg-gray-800" : "bg-gray-100"
            )}
          >
            <button
              onClick={() => onSetSection("chat")}
              className={classNames(
                "flex-1 py-2 text-sm font-semibold rounded-md transition-colors duration-200",
                activeSection === "chat"
                  ? isDark
                    ? "bg-gray-900 text-blue-400 shadow-sm"
                    : "bg-white text-blue-600 shadow-sm"
                  : isDark
                  ? "text-gray-400 hover:text-blue-400"
                  : "text-gray-600 hover:text-blue-600"
              )}
            >
              Chat
            </button>
            <button
              onClick={() => onSetSection("study")}
              className={classNames(
                "flex-1 py-2 text-sm font-semibold rounded-md transition-colors duration-200",
                activeSection === "study"
                  ? isDark
                    ? "bg-gray-900 text-blue-400 shadow-sm"
                    : "bg-white text-blue-600 shadow-sm"
                  : isDark
                  ? "text-gray-400 hover:text-blue-400"
                  : "text-gray-600 hover:text-blue-600"
              )}
            >
              Study
            </button>
          </div>

          {/* ── Scrollable Content ── */}
          <div className="flex-1 overflow-y-auto px-3">

            {/* Chat History */}
            {activeSection === "chat" && (
              <div>
                <p
                  className={classNames(
                    "text-xs font-semibold uppercase px-2 mb-2 transition-colors duration-300",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}
                >
                  Recent Chats
                </p>
                <div className="space-y-1">
                  {chatHistory.map((c) => (
                    <div key={c.id} className="relative group">
                      <button
                        onClick={() => onLoadChat(c.id)}
                        className={classNames(
                          "w-full text-left p-3 pr-10 rounded-lg truncate text-sm transition-colors duration-200",
                          c.id === currentChatId
                            ? isDark
                              ? "bg-blue-900 text-blue-200"
                              : "bg-blue-100 text-blue-700"
                            : isDark
                            ? "text-gray-300 hover:bg-gray-800"
                            : "text-gray-700 hover:bg-blue-50"
                        )}
                      >
                        <span className="truncate">{c.title}</span>
                      </button>

                      {/* Delete trigger */}
                      <button
                        onClick={() => setShowDeleteConfirm(c.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 hover:bg-red-100 rounded transition-opacity duration-150"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>

                      {/* Delete confirm popover */}
                      {showDeleteConfirm === c.id && (
                        <div
                          className={classNames(
                            "absolute right-0 top-0 border rounded-lg shadow-lg p-2 z-50 transition-colors duration-300",
                            isDark
                              ? "bg-gray-800 border-gray-700"
                              : "bg-white border-gray-200"
                          )}
                        >
                          <p className="text-xs mb-2">Delete this chat?</p>
                          <div className="flex gap-1">
                            <button
                              onClick={() => onDeleteChat(c.id)}
                              className="text-xs px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-150"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className={classNames(
                                "text-xs px-2 py-1 rounded transition-colors duration-150",
                                isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"
                              )}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Class Grid */}
            {activeSection === "study" && (
              <div>
                <p
                  className={classNames(
                    "text-xs font-semibold uppercase px-2 mb-2 transition-colors duration-300",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}
                >
                  Classes
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => onClassSelect(num)}
                      className={classNames(
                        "text-center p-3 rounded-lg border-2 font-semibold flex flex-col items-center transition-colors duration-200",
                        selectedClass === num
                          ? "bg-blue-600 text-white border-blue-600"
                          : isDark
                          ? "bg-gray-800 text-gray-300 border-gray-700 hover:border-blue-500 hover:text-blue-400"
                          : "bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600"
                      )}
                    >
                      <GraduationCap className="h-5 w-5 mb-1" />
                      <span className="text-xs">Class {num}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── User Profile Footer ── */}
          <div
            className={classNames(
              "mt-auto border-t p-3 flex items-center space-x-3 transition-colors duration-300",
              isDark ? "border-gray-800" : "border-gray-200"
            )}
          >
            <div
              className={classNames(
                "h-9 w-9 rounded-full flex items-center justify-center transition-colors duration-300",
                isDark ? "bg-gray-700" : "bg-gray-200"
              )}
            >
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate text-sm">{user.name}</p>
              <p
                className={classNames(
                  "text-xs capitalize transition-colors duration-300",
                  isDark ? "text-gray-400" : "text-gray-500"
                )}
              >
                {user.type}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}