import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { BookOpen, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getLocalData, setLocalData, classNames } from "../utils/helpers";
import { useTheme } from "../context/ThemeContext";

// Vibrant multi-color palette — dark mode (bright neons) & light mode (punchy saturated)
const LETTER_PALETTES = {
  dark: [
    { r: 232, g: 121, b: 249 },  // fuchsia-400
    { r: 167, g: 139, b: 250 },  // violet-400
    { r: 96,  g: 165, b: 250 },  // blue-400
    { r: 52,  g: 211, b: 153 },  // emerald-400
    { r: 251, g: 191, b: 36  },  // amber-400
    { r: 251, g: 113, b: 133 },  // rose-400
    { r: 45,  g: 212, b: 191 },  // teal-400
    { r: 129, g: 140, b: 248 },  // indigo-400
  ],
  light: [
    { r: 217, g: 70,  b: 239 },  // fuchsia-500
    { r: 139, g: 92,  b: 246 },  // violet-500
    { r: 59,  g: 130, b: 246 },  // blue-500
    { r: 16,  g: 185, b: 129 },  // emerald-500
    { r: 245, g: 158, b: 11  },  // amber-500
    { r: 239, g: 68,  b: 68  },  // rose-500
    { r: 20,  g: 184, b: 166 },  // teal-500
    { r: 99,  g: 102, b: 241 },  // indigo-500
  ],
};

const FloatingLetters = ({ isDark }) => {
  const malayalamLetters = ['അ', 'ആ', 'ഇ', 'ഈ', 'ഉ', 'ഊ', 'എ', 'ഏ', 'ഐ', 'ക', 'ഖ', 'ഗ', 'ഘ', 'ച', 'ഛ', 'ജ', 'ഝ', 'ട', 'ഠ', 'ഡ', 'ത', 'ഥ', 'ദ', 'ധ', 'ന', 'പ', 'ഫ', 'ബ', 'ഭ', 'മ', 'യ', 'ര', 'ല', 'വ', 'ശ', 'ഷ', 'സ', 'ഹ', 'ള', 'ഴ', 'റ'];
  const [letters, setLetters] = useState([]);

  useEffect(() => {
    const generateLetter = () => {
      const letter = malayalamLetters[Math.floor(Math.random() * malayalamLetters.length)];
      const id = Date.now() + Math.random();
      const duration = 8 + Math.random() * 7;
      const startX = Math.random() * 100;
      const fontSize = 20 + Math.random() * 28;

      // Depth: 0 = far (blurry, dim), 1 = near (sharp, bright)
      const depth = Math.random();
      const blur = depth < 0.33 ? 3 + Math.random() * 2 : depth < 0.66 ? 1 + Math.random() * 1.5 : 0;

      // Boosted opacities — clearly visible across all tiers
      const peakOpacity = depth < 0.33
        ? 0.18 + depth * 0.15          // far: 0.18–0.23
        : depth < 0.66
        ? 0.35 + depth * 0.18          // mid: 0.35–0.47
        : 0.55 + depth * 0.28;         // near: 0.55–0.83

      // Pick a random color from the palette
      const paletteIndex = Math.floor(Math.random() * LETTER_PALETTES.dark.length);

      // Rotation keyframes — gentle drift and spin
      const r0 = (Math.random() - 0.5) * 18;
      const r1 = r0 + (Math.random() - 0.5) * 20;
      const r2 = r1 + (Math.random() - 0.5) * 16;
      const r3 = r2 * 0.4;

      setLetters(prev => [...prev, { id, letter, startX, fontSize, duration, depth, blur, peakOpacity, paletteIndex, r0, r1, r2, r3 }]);
      setTimeout(() => setLetters(prev => prev.filter(l => l.id !== id)), duration * 1000);
    };

    for (let i = 0; i < 18; i++) setTimeout(() => generateLetter(), i * 150);
    const interval = setInterval(generateLetter, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {letters.map(({ id, letter, startX, fontSize, duration, depth, blur, peakOpacity, paletteIndex, r0, r1, r2, r3 }) => {
        const palette = isDark ? LETTER_PALETTES.dark : LETTER_PALETTES.light;
        const { r, g, b } = palette[paletteIndex];

        const color = `rgba(${r}, ${g}, ${b}, ${peakOpacity})`;

        // Glowing text-shadow for near & mid letters — stronger in dark mode
        const glowStrength = isDark
          ? depth > 0.66 ? 0.65 : depth > 0.33 ? 0.38 : 0
          : depth > 0.66 ? 0.30 : depth > 0.33 ? 0.15 : 0;

        const textShadow = glowStrength > 0
          ? `0 0 12px 3px rgba(${r}, ${g}, ${b}, ${glowStrength}), 0 0 28px 8px rgba(${r}, ${g}, ${b}, ${glowStrength * 0.4})`
          : 'none';

        return (
          <motion.div
            key={id}
            initial={{ x: `${startX}vw`, y: '110vh', opacity: 0, rotate: r0 }}
            animate={{
              y: '-10vh',
              opacity: [0, peakOpacity * 0.5, peakOpacity, peakOpacity * 0.75, 0],
              rotate: [r0, r1, r2, r3],
            }}
            transition={{
              duration,
              ease: 'linear',
              opacity: { times: [0, 0.08, 0.2, 0.85, 1], duration },
              rotate: { duration, ease: 'easeInOut' },
            }}
            className="absolute font-bold select-none"
            style={{
              fontSize: `${fontSize}px`,
              color,
              filter: blur > 0 ? `blur(${blur}px)` : 'none',
              textShadow,
              willChange: 'transform, opacity',
            }}
          >
            {letter}
          </motion.div>
        );
      })}
    </div>
  );
};

export default function AuthForm({ isSignup, setCurrentPage }) {
  const { isDark, setIsDark } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("student");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const friendlyAuthMessage = (code) => {
    switch (code) {
      case 'auth/invalid-email': return 'The email address is not valid.';
      case 'auth/invalid-credential': return 'Invalid email or password.';
      case 'auth/email-already-in-use': return 'An account already exists with this email.';
      case 'auth/weak-password': return 'Password is too weak. Use at least 6 characters.';
      default: return 'Authentication failed. Please try again.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      if (isSignup) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const { uid } = cred.user;
        const name = email.split('@')[0];

        const usersDB = getLocalData('akshara_users', {});
        usersDB[uid] = { email, name, type: userType, createdAt: Date.now() };
        setLocalData('akshara_users', usersDB);

        // Broadcast instant update to the App component
        window.dispatchEvent(new Event('userProfileUpdated'));
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(friendlyAuthMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = classNames(
    "w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300",
    isDark
      ? "bg-gray-900/60 border-gray-600/70 text-gray-100 placeholder-gray-500 focus:bg-gray-900/80"
      : "bg-white/50 border-gray-200/80 text-gray-800 placeholder-gray-400 focus:bg-white/80"
  );

  return (
    <div className={classNames(
      "min-h-screen flex items-center justify-center px-4 relative overflow-hidden transition-colors duration-300",
      isDark ? "bg-gray-900" : "bg-gray-50"
    )}>
      <FloatingLetters isDark={isDark} />

      {/* ── Theme Toggle — fixed top-right ── */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsDark(!isDark)}
        aria-label="Toggle theme"
        className={classNames(
          "fixed top-6 right-6 z-50 p-2.5 rounded-xl w-10 h-10 flex items-center justify-center overflow-hidden shadow-lg transition-colors duration-300",
          isDark ? "bg-gray-800 border border-gray-700" : "bg-white/80 border border-gray-200 backdrop-blur-sm"
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

      {/* Ambient glow blobs for background depth */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={classNames(
          "absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full blur-3xl",
          isDark ? "bg-purple-800/30" : "bg-blue-300/35"
        )} />
        <div className={classNames(
          "absolute -bottom-40 -right-40 w-[480px] h-[480px] rounded-full blur-3xl",
          isDark ? "bg-blue-800/25" : "bg-indigo-300/30"
        )} />
        <div className={classNames(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-3xl",
          isDark ? "bg-violet-700/10" : "bg-sky-300/15"
        )} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 relative z-10"
      >
        {/* ── Logo & Title ── */}
        <div className="text-center">
          <motion.button
            onClick={() => setCurrentPage('home')}
            whileHover={{ scale: 1.05, rotate: 4 }}
            whileTap={{ scale: 0.95 }}
            className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/30"
          >
            <BookOpen className="h-10 w-10 text-white" />
          </motion.button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-2">
            അക്ഷരലോകം
          </h1>
          <h2 className={classNames(
            "text-xl font-medium transition-colors duration-300",
            isDark ? "text-gray-300" : "text-gray-600"
          )}>
            {isSignup ? "Create Your Account" : "Welcome Back"}
          </h2>
        </div>

        {/* ── Glass Form Card ── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={classNames(
            "rounded-2xl p-8 border shadow-2xl backdrop-blur-xl transition-colors duration-300",
            isDark
              ? "bg-gray-800/60 border-gray-700/50 shadow-black/50"
              : "bg-white/70 border-white/50 shadow-gray-200/80"
          )}
        >
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email */}
            <div>
              <label className={classNames(
                "block text-sm font-semibold mb-2 transition-colors duration-300",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div>
              <label className={classNames(
                "block text-sm font-semibold mb-2 transition-colors duration-300",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Role Selector */}
            {isSignup && (
              <div>
                <label className={classNames(
                  "block text-sm font-semibold mb-3 transition-colors duration-300",
                  isDark ? "text-gray-300" : "text-gray-700"
                )}>
                  I am a...
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['student', 'teacher'].map(type => (
                    <label key={type} className="cursor-pointer">
                      <input
                        type="radio"
                        value={type}
                        checked={userType === type}
                        onChange={(e) => setUserType(e.target.value)}
                        className="sr-only"
                      />
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className={classNames(
                          "text-center p-4 rounded-xl border-2 transition-all duration-200",
                          userType === type
                            ? isDark
                              ? "border-blue-500 bg-blue-900/40 text-blue-300 font-bold shadow-lg shadow-blue-500/20"
                              : "border-blue-500 bg-blue-50/80 text-blue-700 font-bold shadow-lg shadow-blue-400/20"
                            : isDark
                              ? "border-gray-600/60 bg-gray-900/30 text-gray-400 hover:border-gray-500 hover:text-gray-300"
                              : "border-gray-200/80 bg-white/40 text-gray-600 hover:border-blue-300 hover:text-gray-800"
                        )}
                      >
                        <div className="text-2xl mb-1">{type === 'student' ? '📚' : '👩‍🏫'}</div>
                        <div className="capitalize text-sm">{type}</div>
                      </motion.div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className={classNames(
                    "text-sm text-center p-3 rounded-lg border",
                    isDark
                      ? "text-red-400 bg-red-900/30 border-red-800/50"
                      : "text-red-600 bg-red-50/80 border-red-200/60"
                  )}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                isSignup ? 'Create Account' : 'Sign In'
              )}
            </motion.button>
          </form>

          {/* Switch page */}
          <p className={classNames(
            "text-center text-sm mt-6 transition-colors duration-300",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            {isSignup ? "Already have an account? " : "Don't have an account? "}
            <button
              onClick={() => setCurrentPage(isSignup ? 'login' : 'signup')}
              className="text-blue-500 hover:text-blue-400 font-semibold hover:underline transition-colors duration-200"
            >
              {isSignup ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}