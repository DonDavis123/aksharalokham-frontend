import React, { useState, useEffect, useRef } from "react";
import { Menu, Sun, Moon, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { classNames } from "../utils/helpers";
import { auth } from "../config/firebase";
import { signOut as firebaseSignOut } from "firebase/auth";

export default function Header({ user, onToggleSidebar, isDark, setIsDark }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={classNames(
        "flex-shrink-0 flex items-center justify-between p-3 h-16 border-b transition-colors duration-300",
        isDark ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200"
      )}
    >
      {/* ── Sidebar Toggle ── */}
      <button
        onClick={onToggleSidebar}
        className={classNames(
          "p-2 rounded-lg transition-colors duration-300",
          isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
        )}
      >
        <Menu
          className={classNames(
            "h-5 w-5 transition-colors duration-300",
            isDark ? "text-gray-300" : "text-gray-600"
          )}
        />
      </button>

      <div className="flex items-center space-x-3">

        {/* ── Theme Toggle with rotating Sun / Moon swap ── */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsDark(!isDark)}
          aria-label="Toggle theme"
          className={classNames(
            "relative p-2 rounded-lg w-9 h-9 flex items-center justify-center overflow-hidden transition-colors duration-300",
            isDark ? "bg-gray-800" : "bg-gray-100"
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.span
                key="sun"
                initial={{ rotate: -90, opacity: 0, scale: 0.4 }}
                animate={{ rotate: 0,   opacity: 1, scale: 1   }}
                exit={{    rotate:  90, opacity: 0, scale: 0.4 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
                style={{ position: "absolute", display: "flex" }}
              >
                <Sun className="h-5 w-5 text-yellow-400" />
              </motion.span>
            ) : (
              <motion.span
                key="moon"
                initial={{ rotate:  90, opacity: 0, scale: 0.4 }}
                animate={{ rotate: 0,   opacity: 1, scale: 1   }}
                exit={{    rotate: -90, opacity: 0, scale: 0.4 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
                style={{ position: "absolute", display: "flex" }}
              >
                <Moon className="h-5 w-5 text-gray-600" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* ── User Avatar & Dropdown ── */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="h-9 w-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-300 text-white font-semibold text-sm"
          >
            {user.name.charAt(0).toUpperCase()}
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0,   scale: 1    }}
                exit={{    opacity: 0, y: -10, scale: 0.97 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className={classNames(
                  "absolute right-0 mt-2 w-56 rounded-xl shadow-xl border z-50 overflow-hidden transition-colors duration-300",
                  isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                )}
              >
                <div
                  className={classNames(
                    "px-4 py-3 border-b transition-colors duration-300",
                    isDark ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"
                  )}
                >
                  <p
                    className={classNames(
                      "font-semibold truncate transition-colors duration-300",
                      isDark ? "text-gray-100" : "text-gray-800"
                    )}
                  >
                    {user.name}
                  </p>
                  <p
                    className={classNames(
                      "text-xs transition-colors duration-300",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}
                  >
                    {user.email}
                  </p>
                </div>

                <button
                  onClick={() => firebaseSignOut(auth)}
                  className={classNames(
                    "w-full text-left px-4 py-3 text-sm font-semibold flex items-center space-x-2 transition-colors duration-300",
                    isDark ? "text-red-400 hover:bg-red-900/20" : "text-red-600 hover:bg-red-50"
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}