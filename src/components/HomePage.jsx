import React, { useState, useEffect, useRef, useCallback } from "react";

/* ─── FONTS injected via <style> below ─── */

/* ════════════════════════════════════════
   DESIGN TOKENS
════════════════════════════════════════ */
const T = {
  // Jewel-tone Kerala Green palette
  teal0: "#003333",
  teal1: "#004d4d",
  teal2: "#006767",
  teal3: "#00918d",
  teal4: "#00bfb3",
  teal5: "#4de8d8",
  gold:  "#f0c060",
  goldLight: "#fde9a8",
  cream: "#f5f0e8",
  white: "#ffffff",
  glass: "rgba(255,255,255,0.07)",
  glassBorder: "rgba(255,255,255,0.13)",
  glassBorderHover: "rgba(0,191,179,0.45)",
  darkBg: "#020e0e",
  darkSurface: "#041414",
  textPrimary: "#e8f5f3",
  textSecondary: "#7eb8b0",
  textMuted: "#3d7a72",
};

/* ════════════════════════════════════════
   INTERSECTION OBSERVER HOOK
════════════════════════════════════════ */
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
}

/* ════════════════════════════════════════
   SCROLL PROGRESS BAR
════════════════════════════════════════ */
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setPct(total ? (el.scrollTop / total) * 100 : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 9999,
      background: "rgba(0,0,0,0.3)",
    }}>
      <div style={{
        height: "100%", width: `${pct}%`,
        background: `linear-gradient(90deg, ${T.teal3}, ${T.teal5}, ${T.gold})`,
        transition: "width 0.1s linear",
        boxShadow: `0 0 12px ${T.teal4}`,
      }} />
    </div>
  );
}

/* ════════════════════════════════════════
   LANGUAGE TOGGLE PILL
════════════════════════════════════════ */
function LangToggle({ lang, setLang }) {
  return (
    <div style={{
      position: "fixed", bottom: "2rem", right: "2rem", zIndex: 500,
      background: "rgba(0,40,38,0.85)",
      backdropFilter: "blur(20px) saturate(1.8)",
      border: `1px solid ${T.glassBorder}`,
      borderRadius: 999, padding: "6px", display: "flex", gap: 4,
      boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,191,179,0.08)`,
    }} className="lang-toggle">
      {["ML", "EN"].map(l => (
        <button key={l} onClick={() => setLang(l)} style={{
          padding: "0.45rem 1.1rem", borderRadius: 999, border: "none",
          cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.06em",
          transition: "all 0.3s ease",
          background: lang === l
            ? `linear-gradient(135deg, ${T.teal3}, ${T.teal2})`
            : "transparent",
          color: lang === l ? T.white : T.textSecondary,
          boxShadow: lang === l ? `0 2px 12px ${T.teal3}55` : "none",
        }}>{l}</button>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════
   QUICK-ACCESS STICKY SIDEBAR
════════════════════════════════════════ */
function QuickSidebar() {
  const [active, setActive] = useState(0);
  const sections = ["hero", "stats", "features", "testimonials", "cta"];
  const icons = ["⬡", "◈", "◉", "◆", "★"];

  useEffect(() => {
    const fn = () => {
      sections.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) {
          const r = el.getBoundingClientRect();
          if (r.top <= window.innerHeight / 2 && r.bottom >= window.innerHeight / 2) setActive(i);
        }
      });
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{
      position: "fixed", left: "1.5rem", top: "50%", transform: "translateY(-50%)",
      zIndex: 400, display: "flex", flexDirection: "column", gap: 10,
    }} className="quick-sidebar">
      {sections.map((id, i) => (
        <button key={id} onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
          style={{
            width: 36, height: 36, borderRadius: 10,
            border: active === i ? `1px solid ${T.teal3}` : `1px solid rgba(255,255,255,0.08)`,
            background: active === i
              ? `linear-gradient(135deg, ${T.teal2}55, ${T.teal3}33)`
              : "rgba(0,20,18,0.6)",
            backdropFilter: "blur(12px)",
            color: active === i ? T.teal5 : T.textMuted,
            cursor: "pointer", fontSize: "0.7rem",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.3s ease",
            boxShadow: active === i ? `0 0 16px ${T.teal3}44` : "none",
          }}
        >{icons[i]}</button>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════
   GLASS CARD
════════════════════════════════════════ */
function GlassCard({ children, style = {}, hoverGlow = T.teal3, delay = 0 }) {
  const [ref, vis] = useInView();
  const [hov, setHov] = useState(false);
  return (
    <div ref={ref}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0) scale(1)" : "translateY(40px) scale(0.97)",
        transition: `opacity 0.75s ease ${delay}s, transform 0.75s ease ${delay}s`,
        background: hov
          ? "linear-gradient(135deg, rgba(0,145,141,0.12), rgba(0,191,179,0.06))"
          : "linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.02))",
        backdropFilter: "blur(24px) saturate(1.6)",
        border: `1px solid ${hov ? T.glassBorderHover : T.glassBorder}`,
        borderRadius: 24,
        boxShadow: hov
          ? `0 20px 60px rgba(0,0,0,0.45), 0 0 0 1px ${hoverGlow}22, inset 0 1px 0 rgba(255,255,255,0.12)`
          : "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
        transition: `all 0.4s ease, opacity 0.75s ease ${delay}s, transform 0.75s ease ${delay}s`,
        ...style,
      }}
    >{children}</div>
  );
}

/* ════════════════════════════════════════
   FEATURE ICON
════════════════════════════════════════ */
const FEATURE_ICONS = {
  brain: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:26,height:26}}>
      <path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96-.46 2.5 2.5 0 01-1.07-4.48A3 3 0 016.5 9.5a2.5 2.5 0 013-2.45A2.5 2.5 0 019.5 2zM14.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 004.96-.46 2.5 2.5 0 001.07-4.48A3 3 0 0017.5 9.5a2.5 2.5 0 00-3-2.45A2.5 2.5 0 0014.5 2z"/>
    </svg>
  ),
  book: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:26,height:26}}>
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  ),
  graduation: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:26,height:26}}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 4 3 6 3s6-1 6-3v-5"/>
    </svg>
  ),
  flask: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:26,height:26}}>
      <path d="M9 3h6m-6 0v6l-3.5 7A2 2 0 007.3 19h9.4a2 2 0 001.8-3l-3.5-7V3"/>
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:26,height:26}}>
      <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>
  ),
  doc: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:26,height:26}}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
};

/* ════════════════════════════════════════
   FEATURE CARD
════════════════════════════════════════ */
function FeatureCard({ iconKey, title, desc, accent, delay }) {
  const [hov, setHov] = useState(false);
  const [ref, vis] = useInView();
  return (
    <div ref={ref}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(50px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
        background: hov
          ? `linear-gradient(135deg, ${accent}14, rgba(0,0,0,0.2))`
          : "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
        backdropFilter: "blur(20px)",
        border: `1px solid ${hov ? accent + "55" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 20, padding: "1.75rem",
        boxShadow: hov ? `0 16px 48px ${accent}1a` : "0 4px 16px rgba(0,0,0,0.3)",
        transition: "all 0.4s ease",
        cursor: "default",
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: `linear-gradient(135deg, ${accent}28, ${accent}10)`,
        border: `1px solid ${accent}44`,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "1.25rem",
        color: accent,
        transform: hov ? "scale(1.08) rotate(-4deg)" : "scale(1)",
        transition: "transform 0.3s ease",
        boxShadow: hov ? `0 4px 20px ${accent}33` : "none",
      }}>
        {FEATURE_ICONS[iconKey]}
      </div>
      <h3 style={{ color: T.textPrimary, fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.6rem", letterSpacing: "-0.01em", fontFamily: "'Outfit', sans-serif" }}>{title}</h3>
      <p style={{ color: T.textSecondary, fontSize: "0.88rem", lineHeight: 1.7 }}>{desc}</p>
    </div>
  );
}

/* ════════════════════════════════════════
   ANIMATED COUNTER
════════════════════════════════════════ */
function Counter({ end, suffix = "+", label, delay }) {
  const [ref, vis] = useInView();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!vis) return;
    let cur = 0;
    const step = Math.max(1, Math.ceil(end / 60));
    const t = setInterval(() => {
      cur += step;
      if (cur >= end) { setN(end); clearInterval(t); }
      else setN(cur);
    }, 20);
    return () => clearInterval(t);
  }, [vis, end]);
  return (
    <div ref={ref} style={{
      textAlign: "center",
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(24px)",
      transition: `all 0.7s ease ${delay}s`,
    }}>
      <div style={{
        fontSize: "clamp(2.2rem, 5vw, 3.2rem)", fontWeight: 900, letterSpacing: "-0.04em",
        fontFamily: "'Outfit', sans-serif",
        background: `linear-gradient(135deg, ${T.teal4}, ${T.teal5}, ${T.gold})`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>
        {n.toLocaleString()}{suffix}
      </div>
      <div style={{ color: T.textMuted, fontSize: "0.8rem", fontWeight: 600, marginTop: "0.35rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
    </div>
  );
}

/* ════════════════════════════════════════
   TESTIMONIAL CARD
════════════════════════════════════════ */
function TestiCard({ name, grade, quote, avatar, delay }) {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(40px)",
      transition: `all 0.7s ease ${delay}s`,
      background: "linear-gradient(135deg, rgba(0,103,103,0.18), rgba(0,40,38,0.35))",
      backdropFilter: "blur(24px)",
      border: "1px solid rgba(0,191,179,0.15)",
      borderRadius: 20, padding: "1.75rem",
      boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
    }}>
      <div style={{ display: "flex", gap: 4, marginBottom: "1rem" }}>
        {[...Array(5)].map((_, i) => <span key={i} style={{ color: T.gold, fontSize: "0.9rem" }}>★</span>)}
      </div>
      <p style={{ color: T.textSecondary, fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "1.25rem", fontStyle: "italic" }}>"{quote}"</p>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: `linear-gradient(135deg, ${T.teal2}, ${T.teal4})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.1rem", fontWeight: 800, color: T.white,
          fontFamily: "'Outfit', sans-serif",
        }}>{avatar}</div>
        <div>
          <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: "0.9rem" }}>{name}</div>
          <div style={{ color: T.textMuted, fontSize: "0.78rem" }}>{grade}</div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   FLOATING ORBS / BACKGROUND
════════════════════════════════════════ */
function BgOrbs({ mouse }) {
  const px = (mouse.x / (window.innerWidth || 1) - 0.5);
  const py = (mouse.y / (window.innerHeight || 1) - 0.5);
  return (
    <>
      {/* Primary large orb */}
      <div style={{
        position: "absolute", borderRadius: "50%", pointerEvents: "none",
        width: 700, height: 700,
        background: `radial-gradient(circle, rgba(0,145,141,0.18) 0%, transparent 70%)`,
        top: "-10%", left: "-15%",
        transform: `translate(${px * 40}px, ${py * 30}px)`,
        transition: "transform 0.15s ease",
        filter: "blur(40px)",
      }} />
      {/* Secondary orb */}
      <div style={{
        position: "absolute", borderRadius: "50%", pointerEvents: "none",
        width: 500, height: 500,
        background: `radial-gradient(circle, rgba(0,191,179,0.12) 0%, transparent 70%)`,
        bottom: "5%", right: "-10%",
        transform: `translate(${-px * 30}px, ${-py * 20}px)`,
        transition: "transform 0.15s ease",
        filter: "blur(50px)",
      }} />
      {/* Gold accent */}
      <div style={{
        position: "absolute", borderRadius: "50%", pointerEvents: "none",
        width: 300, height: 300,
        background: `radial-gradient(circle, rgba(240,192,96,0.08) 0%, transparent 70%)`,
        top: "50%", right: "20%",
        filter: "blur(60px)",
      }} />
    </>
  );
}

/* ════════════════════════════════════════
   FLOATING EDU ICONS
════════════════════════════════════════ */
function FloatingIcons() {
  const items = [
    { emoji: "📚", top: "12%", left: "8%",  delay: 0 },
    { emoji: "✏️", top: "25%", right: "6%", delay: 0.8 },
    { emoji: "🎓", top: "60%", left: "5%",  delay: 1.5 },
    { emoji: "🔬", top: "70%", right: "8%", delay: 0.4 },
    { emoji: "🧮", top: "85%", left: "12%", delay: 1.1 },
    { emoji: "💡", top: "40%", right: "4%", delay: 2 },
  ];
  return (
    <>
      {items.map((item, i) => (
        <div key={i} style={{
          position: "absolute", fontSize: "2rem", pointerEvents: "none",
          top: item.top, left: item.left, right: item.right,
          animation: `floatIcon 6s ease-in-out ${item.delay}s infinite`,
          opacity: 0.25, zIndex: 1,
          filter: `drop-shadow(0 4px 16px ${T.teal3}88)`,
        }}>{item.emoji}</div>
      ))}
    </>
  );
}

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
export default function HomePage({ setCurrentPage }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [navSolid, setNavSolid] = useState(false);
  const [heroVis, setHeroVis] = useState(false);
  const [lang, setLang] = useState("ML");
  const [quoteIdx, setQuoteIdx] = useState(0);

  const COPY = {
    ML: {
      badge: "Kerala State Syllabus · Classes 1–12",
      quotes: [
        "അറിവിന്റെ ലോകത്തേക്ക് സ്വാഗതം",
        "വിദ്യയാണ് ഏറ്റവും വലിയ ധനം",
        "പഠനം ജീവിതത്തിന്റെ വെളിച്ചം",
      ],
      sub: "Kerala വിദ്യാർഥികൾക്കായുള്ള AI പഠന സഹായി. നിങ്ങളുടെ പാഠപുസ്തകങ്ങളുമായി സംവദിക്കൂ.",
      cta1: "സൗജന്യമായി ആരംഭിക്കൂ →",
      cta2: "ഇതിനകം വിദ്യാർഥിയോ? Sign in",
      featTitle: "Kerala വിദ്യാർഥികൾക്കായി",
      featSub: "നിങ്ങൾക്ക് ആവശ്യമുള്ളതെല്ലാം",
      statsLabel: "Students | Teachers | Classes | Subjects",
    },
    EN: {
      badge: "Kerala State Syllabus · Classes 1–12",
      quotes: [
        "Welcome to the World of Knowledge",
        "Education is the Greatest Wealth",
        "Learning is the Light of Life",
      ],
      sub: "The AI-powered study companion for Kerala students. Chat with your textbooks, get instant explanations, and learn smarter.",
      cta1: "Start Learning Free →",
      cta2: "Already a student? Sign in",
      featTitle: "Built for Kerala Students",
      featSub: "Everything you need",
      statsLabel: "Students | Teachers | Classes | Subjects",
    },
  };

  const c = COPY[lang];

  useEffect(() => {
    setTimeout(() => setHeroVis(true), 100);
    const qi = setInterval(() => setQuoteIdx(p => (p + 1) % 3), 4500);
    const onScroll = () => { setScrollY(window.scrollY); setNavSolid(window.scrollY > 50); };
    const onMouse = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse, { passive: true });
    return () => {
      clearInterval(qi);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  const features = [
    { iconKey: "brain",      title: lang === "ML" ? "AI ട്യൂട്ടറിംഗ്"            : "AI-Powered Tutoring",       desc: lang === "ML" ? "നിങ്ങളുടെ syllabus-ൽ എന്തും ചോദിക്കൂ, ഉടൻ accurate വിശദീകരണം."         : "Ask anything about your syllabus and get instant, accurate explanations tailored to your curriculum.",     accent: T.teal5     },
    { iconKey: "book",       title: lang === "ML" ? "Smart Study Materials"       : "Smart Study Materials",     desc: lang === "ML" ? "Textbooks, notes, documents ഒരിടത്ത് organized ആയി access ചെയ്യൂ." : "Upload and access textbooks, notes, and documents in one organized, searchable library.",               accent: T.gold      },
    { iconKey: "graduation", title: lang === "ML" ? "Class-Wise Learning"         : "Class-Wise Learning",       desc: lang === "ML" ? "Class, subject അനുസരിച്ച് Kerala syllabus-ന് aligned content."       : "Content organized by class and subject — exactly aligned with the Kerala state syllabus.",             accent: "#a78bfa"   },
    { iconKey: "flask",      title: lang === "ML" ? "Science & Beyond"            : "Science & Beyond",           desc: lang === "ML" ? "Physics, Chemistry, Biology-ൽ AI guided explanations."                 : "Deep-dive into Physics, Chemistry, Biology, and more with rich AI-guided explanations.",               accent: "#fb923c"   },
    { iconKey: "globe",      title: lang === "ML" ? "Malayalam Interface"         : "Malayalam Interface",       desc: lang === "ML" ? "മലയാളത്തിൽ പഠിക്കൂ. Aksharalokam നിങ്ങളുടെ ഭാഷ സംസാരിക്കുന്നു."    : "Study in your mother tongue. Aksharalokam speaks Malayalam so learning feels natural.",                 accent: "#f472b6"   },
    { iconKey: "doc",        title: lang === "ML" ? "Document Intelligence"       : "Document Intelligence",     desc: lang === "ML" ? "PDF upload ചെയ്ത് AI summarize, explain, quiz ചെയ്യട്ടെ."             : "Upload PDFs and let our AI summarize, explain, and quiz you on the content instantly.",                 accent: "#38bdf8"   },
  ];

  const testimonials = [
    { name: "Arya Menon",   grade: lang === "ML" ? "Class 10, Thrissur" : "Class 10, Thrissur", quote: lang === "ML" ? "SSLC exam-ന് prepare ചെയ്യാൻ ഇത് invaluable ആയിരുന്നു!" : "This was invaluable for preparing for my SSLC exam. The AI explains concepts so clearly.", avatar: "A" },
    { name: "Rohan Nair",   grade: lang === "ML" ? "Class 12, Kozhikode" : "Class 12, Kozhikode", quote: lang === "ML" ? "Malayalam-ൽ Physics മനസ്സിലാക്കാൻ ഇതിലും നല്ലൊരു tool ഇല്ല." : "No better tool to understand Physics in Malayalam. My grades improved significantly.", avatar: "R" },
    { name: "Parvathy K.",  grade: lang === "ML" ? "Class 8, Kottayam" : "Class 8, Kottayam",    quote: lang === "ML" ? "Documents upload ചെയ്ത് ഉടൻ quiz ലഭിക്കുന്നു. Amazing!" : "Uploading notes and instantly getting quizzes is amazing. My revision is so much faster now.", avatar: "P" },
  ];

  return (
    <div style={{
      background: T.darkBg,
      minHeight: "100vh",
      fontFamily: "'Outfit', sans-serif",
      color: T.textPrimary,
      overflowX: "hidden",
    }}>
      {/* ── GOOGLE FONTS + KEYFRAMES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Manjari:wght@400;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        html { scroll-behavior: smooth; }

        @keyframes floatIcon {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%  { transform: translateY(-14px) rotate(2deg); }
          66%  { transform: translateY(-7px) rotate(-1.5deg); }
        }
        @keyframes shimmerText {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.4); opacity: 0.6; }
        }
        @keyframes rotateOrb {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes slideInQuote {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .shimmer {
          background: linear-gradient(90deg,
            ${T.teal4} 0%,
            ${T.teal5} 25%,
            ${T.gold}  50%,
            ${T.teal5} 75%,
            ${T.teal4} 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerText 3.5s linear infinite;
        }

        .mal-font { font-family: 'Manjari', 'Outfit', sans-serif; }

        .btn-primary {
          background: linear-gradient(135deg, ${T.teal3}, ${T.teal2});
          color: ${T.white};
          border: none;
          border-radius: 12px;
          padding: 0.9rem 2.2rem;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px ${T.teal2}55;
        }
        .btn-primary::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, ${T.teal4}, ${T.teal3});
          opacity: 0;
          transition: opacity 0.3s;
        }
        .btn-primary:hover::before { opacity: 1; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px ${T.teal3}66; }
        .btn-primary span { position: relative; z-index: 1; }

        .btn-ghost {
          background: rgba(255,255,255,0.04);
          color: ${T.textSecondary};
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 0.9rem 1.8rem;
          font-size: 0.88rem;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          backdrop-filter: blur(8px);
          transition: all 0.3s ease;
        }
        .btn-ghost:hover { border-color: ${T.teal3}88; color: ${T.teal5}; background: rgba(0,145,141,0.08); }

        .nav-link {
          color: ${T.textMuted}; font-weight: 500; font-size: 0.88rem;
          text-decoration: none; cursor: pointer;
          transition: color 0.2s;
          padding: 0.25rem 0;
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute; bottom: -2px; left: 0; right: 0;
          height: 1px; background: ${T.teal4};
          transform: scaleX(0); transform-origin: center;
          transition: transform 0.3s ease;
        }
        .nav-link:hover { color: ${T.textPrimary}; }
        .nav-link:hover::after { transform: scaleX(1); }

        .grid-dots {
          background-image: radial-gradient(circle, rgba(0,191,179,0.06) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        section { scroll-snap-align: start; }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${T.darkBg}; }
        ::-webkit-scrollbar-thumb { background: ${T.teal2}; border-radius: 3px; }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .quick-sidebar { display: none !important; }
          .nav-inner { padding: 0.85rem 1.1rem !important; }
          .hero-section { padding: 7rem 1rem 4rem !important; }
          .stats-section { padding: 3.5rem 1rem !important; }
          .features-section { padding: 4rem 1rem !important; }
          .testimonials-section { padding: 4rem 1rem !important; }
          .cta-section { padding: 4rem 1rem !important; }
          .cta-inner { padding: 2.5rem 1.25rem !important; }
          .footer-inner { padding: 2rem 1rem !important; flex-direction: column !important; align-items: center !important; text-align: center !important; }
          .features-grid { grid-template-columns: minmax(0, 1fr) !important; }
          .testi-grid { grid-template-columns: minmax(0, 1fr) !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 1.5rem !important; }
          .btn-primary, .btn-ghost { font-size: 0.85rem !important; padding: 0.8rem 1.4rem !important; }
          .lang-toggle { bottom: 1rem !important; right: 1rem !important; }
        }
      `}</style>

      <ScrollProgress />
      <QuickSidebar />
      <LangToggle lang={lang} setLang={setLang} />

      {/* ══════════════ NAV ══════════════ */}
      <nav className="nav-inner" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "1rem 2.5rem",
        background: navSolid ? "rgba(2,14,14,0.92)" : "transparent",
        backdropFilter: navSolid ? "blur(24px) saturate(1.6)" : "none",
        borderBottom: navSolid ? `1px solid rgba(0,191,179,0.1)` : "none",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        transition: "all 0.4s ease",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: `linear-gradient(135deg, ${T.teal3}, ${T.teal2})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 16px ${T.teal3}55`,
            fontSize: "1.1rem",
          }}>📖</div>
          <span className="mal-font" style={{ fontSize: "1.3rem", fontWeight: 700, color: T.textPrimary, letterSpacing: "-0.01em" }}>
            അക്ഷരലോകം
          </span>
        </div>
        {/* Links */}
        <div className="nav-links-desktop" style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <span className="nav-link" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
            {lang === "ML" ? "Features" : "Features"}
          </span>
          <span className="nav-link" onClick={() => document.getElementById("stats")?.scrollIntoView({ behavior: "smooth" })}>
            {lang === "ML" ? "About" : "About"}
          </span>
          <span className="nav-link" onClick={() => document.getElementById("testimonials")?.scrollIntoView({ behavior: "smooth" })}>
            {lang === "ML" ? "Reviews" : "Reviews"}
          </span>
          <button className="btn-ghost" onClick={() => setCurrentPage?.("login")}>{lang === "ML" ? "Sign In" : "Sign In"}</button>
          <button className="btn-primary" onClick={() => setCurrentPage?.("signup")}>
            <span>{lang === "ML" ? "ആരംഭിക്കൂ" : "Get Started"}</span>
          </button>
        </div>
      </nav>

      {/* ══════════════ HERO ══════════════ */}
      <section id="hero" className="hero-section" style={{
        position: "relative", minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "8rem 2rem 6rem",
        overflow: "hidden",
      }} className="grid-dots">
        <BgOrbs mouse={mouse} />
        <FloatingIcons />

        {/* Ring decoration */}
        <div style={{
          position: "absolute", width: 600, height: 600,
          border: `1px solid rgba(0,191,179,0.07)`,
          borderRadius: "50%", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", width: 900, height: 900,
          border: `1px solid rgba(0,191,179,0.04)`,
          borderRadius: "50%", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 860, textAlign: "center", position: "relative", zIndex: 2 }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.6rem",
            background: "rgba(0,103,103,0.2)",
            border: `1px solid rgba(0,191,179,0.25)`,
            borderRadius: 999, padding: "0.45rem 1.2rem", marginBottom: "2rem",
            fontSize: "0.82rem", color: T.teal5, fontWeight: 600, letterSpacing: "0.04em",
            animation: heroVis ? "heroFadeIn 0.8s ease 0.1s both" : "none",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.teal4, animation: "pulseDot 2s ease infinite" }} />
            {c.badge}
          </div>

          {/* Animated Quote */}
          <div style={{ minHeight: "7rem", marginBottom: "0.5rem" }}>
            <h1
              key={quoteIdx + lang}
              className="mal-font"
              style={{
                fontSize: "clamp(2.4rem, 7vw, 4.5rem)", fontWeight: 700,
                lineHeight: 1.15, letterSpacing: "-0.02em",
                color: T.textPrimary,
                animation: "slideInQuote 0.6s ease both",
                textShadow: `0 2px 40px rgba(0,191,179,0.15)`,
              }}
            >
              {c.quotes[quoteIdx]}
            </h1>
          </div>

          {/* English translation */}
          <p key={quoteIdx + lang + "t"} style={{
            color: T.textMuted, fontSize: "1.05rem", marginBottom: "1.5rem",
            fontStyle: "italic", animation: "heroFadeIn 0.5s ease 0.2s both",
          }}>
            {lang === "ML" ? ["Welcome to the world of knowledge","Knowledge is the greatest wealth","Learning is the light of life"][quoteIdx] : ""}
          </p>

          <p style={{
            fontSize: "clamp(0.95rem, 2.5vw, 1.15rem)", color: T.textSecondary,
            maxWidth: 560, margin: "0 auto 3rem", lineHeight: 1.75,
            animation: heroVis ? "heroFadeIn 0.8s ease 0.5s both" : "none",
          }}>
            {c.sub}
          </p>

          {/* CTAs */}
          <div style={{
            display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap",
            animation: heroVis ? "heroFadeIn 0.8s ease 0.75s both" : "none",
          }}>
            <button className="btn-primary" onClick={() => setCurrentPage?.("signup")}
              style={{ fontSize: "1rem", padding: "1.1rem 2.8rem" }}>
              <span>{c.cta1}</span>
            </button>
            <button className="btn-ghost" onClick={() => setCurrentPage?.("login")}>
              {c.cta2}
            </button>
          </div>

          {/* Trusted by */}
          <div style={{
            marginTop: "3.5rem", display: "flex", alignItems: "center", justifyContent: "center",
            gap: "0.75rem", color: T.textMuted, fontSize: "0.82rem",
            animation: heroVis ? "heroFadeIn 0.8s ease 1s both" : "none",
          }}>
            <div style={{ display: "flex" }}>
              {["A","R","P","M","S"].map((l,i) => (
                <div key={i} style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${T.teal2}, ${T.teal3})`,
                  border: `2px solid ${T.darkBg}`,
                  marginLeft: i > 0 ? -8 : 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.65rem", fontWeight: 700, color: T.white,
                }}>{l}</div>
              ))}
            </div>
            <span>
              {lang === "ML" ? "5,000+ Kerala വിദ്യാർഥികൾ ഉപയോഗിക്കുന്നു" : "Trusted by 5,000+ Kerala students"}
            </span>
          </div>
        </div>
      </section>

      {/* ══════════════ STATS ══════════════ */}
      <section id="stats" className="stats-section" style={{
        padding: "5rem 2rem",
        borderTop: "1px solid rgba(0,191,179,0.08)",
        background: "linear-gradient(180deg, rgba(0,40,38,0.3) 0%, transparent 100%)",
      }}>
        <div className="stats-grid" style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "2.5rem" }}>
          <Counter end={5000} label={lang === "ML" ? "Students" : "Students"} delay={0} />
          <Counter end={120}  label={lang === "ML" ? "Teachers" : "Teachers"} delay={0.1} />
          <Counter end={12}   label={lang === "ML" ? "Classes"  : "Classes"}  delay={0.2} suffix="" />
          <Counter end={8}    label={lang === "ML" ? "Subjects" : "Subjects"} delay={0.3} suffix="" />
        </div>
      </section>

      {/* ══════════════ FEATURES ══════════════ */}
      <section id="features" className="features-section" style={{ padding: "7rem 2rem", position: "relative" }}>
        {/* Section heading */}
        {(() => {
          const [ref, vis] = [useRef(null), useState(false)]; return null; // inline hook workaround not allowed — use component
        })()}
        <FeatureSectionHeader lang={lang} c={c} />

        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ TESTIMONIALS ══════════════ */}
      <section id="testimonials" className="testimonials-section" style={{
        padding: "7rem 2rem",
        background: "linear-gradient(180deg, transparent 0%, rgba(0,40,38,0.25) 100%)",
      }}>
        <TestiSectionHeader lang={lang} />
        <div className="testi-grid" style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {testimonials.map((t, i) => <TestiCard key={t.name} {...t} delay={i * 0.1} />)}
        </div>
      </section>

      {/* ══════════════ CTA BANNER ══════════════ */}
      <section id="cta" className="cta-section" style={{ padding: "7rem 2rem" }}>
        <CtaBanner lang={lang} setCurrentPage={setCurrentPage} />
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="footer-inner" style={{
        padding: "2.5rem 2.5rem",
        borderTop: "1px solid rgba(0,191,179,0.08)",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={{ fontSize: "1.2rem" }}>📖</span>
          <span className="mal-font" style={{ color: T.textSecondary, fontSize: "0.9rem" }}>അക്ഷരലോകം</span>
        </div>
        <p style={{ color: T.textMuted, fontSize: "0.78rem" }}>
          © 2026 Aksharalokam · {lang === "ML" ? "Kerala-ൽ ❤️ ഉണ്ടാക്കിയത്" : "Made with ❤️ in Kerala"}
        </p>
      </footer>
    </div>
  );
}

/* ════════════════════════════════════════
   SUB-COMPONENTS (avoid inline hook issues)
════════════════════════════════════════ */
function FeatureSectionHeader({ lang, c }) {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} style={{
      textAlign: "center", marginBottom: "4rem",
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(30px)",
      transition: "all 0.7s ease",
      maxWidth: 1100, margin: "0 auto 4rem",
    }}>
      <p style={{ color: T.teal4, fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
        {c.featSub}
      </p>
      <h2 style={{ fontSize: "clamp(1.9rem, 5vw, 3rem)", fontWeight: 900, letterSpacing: "-0.03em", color: T.textPrimary, lineHeight: 1.15 }}>
        {lang === "ML"
          ? <><span className="mal-font">Kerala</span> <span className="shimmer">വിദ്യാർഥികൾക്കായി</span></>
          : <>Built for <span className="shimmer">Kerala Students</span></>
        }
      </h2>
    </div>
  );
}

function TestiSectionHeader({ lang }) {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} style={{
      textAlign: "center", marginBottom: "4rem",
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(30px)",
      transition: "all 0.7s ease",
    }}>
      <p style={{ color: T.teal4, fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
        {lang === "ML" ? "Student Reviews" : "Student Reviews"}
      </p>
      <h2 style={{ fontSize: "clamp(1.9rem, 5vw, 3rem)", fontWeight: 900, letterSpacing: "-0.03em", color: T.textPrimary, lineHeight: 1.15 }}>
        {lang === "ML"
          ? <><span className="shimmer">വിദ്യാർഥികൾ</span><span className="mal-font"> പറയുന്നത്</span></>
          : <>What <span className="shimmer">Students Say</span></>
        }
      </h2>
    </div>
  );
}

function CtaBanner({ lang, setCurrentPage }) {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} style={{
      maxWidth: 900, margin: "0 auto",
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(40px)",
      transition: "all 0.8s ease",
    }}>
      <div className="cta-inner" style={{
        background: `linear-gradient(135deg, rgba(0,103,103,0.35), rgba(0,67,67,0.5))`,
        backdropFilter: "blur(30px)",
        border: `1px solid rgba(0,191,179,0.2)`,
        borderRadius: 28,
        padding: "4rem 3rem",
        textAlign: "center",
        position: "relative", overflow: "hidden",
        boxShadow: `0 20px 80px rgba(0,103,103,0.25), inset 0 1px 0 rgba(255,255,255,0.08)`,
      }}>
        {/* bg decoration */}
        <div style={{
          position: "absolute", width: 400, height: 400, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(0,191,179,0.12) 0%, transparent 70%)`,
          top: "-30%", right: "-10%", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", width: 300, height: 300, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(240,192,96,0.06) 0%, transparent 70%)`,
          bottom: "-20%", left: "-5%", pointerEvents: "none",
        }} />

        <p style={{ color: T.teal4, fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "1rem" }}>
          {lang === "ML" ? "ഇന്ന് ആരംഭിക്കൂ" : "Get Started Today"}
        </p>
        <h2 className="mal-font" style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", fontWeight: 700, color: T.textPrimary, marginBottom: "1.25rem", lineHeight: 1.2, position: "relative" }}>
          {lang === "ML" ? "നിങ്ങളുടെ Kerala Syllabus AI Companion" : "Your Kerala Syllabus AI Companion"}
        </h2>
        <p style={{ color: T.textSecondary, fontSize: "1rem", maxWidth: 520, margin: "0 auto 2.5rem", lineHeight: 1.7, position: "relative" }}>
          {lang === "ML" ? "5000+ Kerala students ഇതിനകം ഉപയോഗിക്കുന്നു. ഇന്ന് Join ചെയ്യൂ, സൗജന്യമായി!" : "Join 5,000+ Kerala students already learning smarter. Free to start, no credit card needed."}
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
          <button className="btn-primary" onClick={() => setCurrentPage?.("signup")}
            style={{ fontSize: "1rem", padding: "1.1rem 3rem" }}>
            <span>{lang === "ML" ? "സൗജന്യമായി ആരംഭിക്കൂ →" : "Start Free →"}</span>
          </button>
          <button className="btn-ghost" onClick={() => setCurrentPage?.("login")}>
            {lang === "ML" ? "Sign In" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}