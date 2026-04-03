import { useNavigate } from "react-router-dom";
import {
  BookOpen, CheckSquare, Calendar, Brain,
  Target, Clock,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SALMON, BLUSH, TEAL, WHITE, INK, INK2, DARK } from "../utils/colors";

const useLoop = (delay = 2800) => {
  const [key, setKey] = useState(0);
  const inc = useCallback(() => setKey(p => p + 1), []);
  useEffect(() => {
    const id = setInterval(inc, delay);
    return () => clearInterval(id);
  }, [delay, inc]);
  return key;
};

const loopWords = [
  "academic workspace.",
  "study companion.",
  "exam planner.",
  "AI tutor.",
  "deadline tracker.",
  "semester sidekick.",
];

/* ─────────────────────────────────────────────
   SEMESTEROS  –  Structured-inspired landing
   Salmon full-bleed bg · huge lowercase type
   Browser mockup · floating sections
───────────────────────────────────────────── */

export default function LandingPage() {
  const nav = useNavigate();
  const loopKey = useLoop(2800);
  const currentWord = useMemo(() => loopWords[loopKey % loopWords.length], [loopKey]);
  const [navBg, setNavBg] = useState(SALMON);

  // one ref per section, paired with its background color
  const secHero     = useRef(null);
  const secShowcase = useRef(null);
  const secStats    = useRef(null);
  const secFeat1    = useRef(null);
  const secFeat2    = useRef(null);
  const secFeat3    = useRef(null);
  const secFaq      = useRef(null);
  const secCta      = useRef(null);
  const secFooter   = useRef(null);

  const sections = [
    { ref: secHero,     color: SALMON  },
    { ref: secShowcase, color: SALMON  },
    { ref: secStats,    color: BLUSH   },
    { ref: secFeat1,    color: SALMON  },
    { ref: secFeat2,    color: BLUSH   },
    { ref: secFeat3,    color: SALMON  },
    { ref: secFaq,      color: WHITE   },
    { ref: secCta,      color: SALMON  },
    { ref: secFooter,   color: WHITE   },
  ];

  useEffect(() => {
    const NAV_H = 64;
    const onScroll = () => {
      // last section whose top edge is at or above the nav bottom
      let current = sections[0].color;
      for (const { ref, color } of sections) {
        if (!ref.current) continue;
        const top = ref.current.getBoundingClientRect().top;
        if (top <= NAV_H) current = color;
      }
      setNavBg(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // run once on mount
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={s.root}>

      {/* ── NAV ── */}
      {(() => {
        const isLight = navBg === BLUSH || navBg === WHITE;
        const textColor = isLight ? INK2 : "rgba(255,255,255,0.9)";
        const nameColor = isLight ? INK : WHITE;
        return (
      <nav style={{ ...s.nav, background: navBg }}>
        <div style={s.navInner}>
          <div style={s.brand}>
            <div style={s.brandMark}><BookOpen size={15} color={WHITE} strokeWidth={2.2} /></div>
            <span style={{ ...s.brandName, color: nameColor }}>SemesterOS</span>
          </div>
          <div style={s.navLinks}>
            {["features","faq"].map(l => (
              <a key={l} href={`#${l}`} style={{ ...s.navLink, color: textColor }}>{l}</a>
            ))}
          </div>
          <button style={s.navCta} onClick={() => nav("/register")}>
            Start planning for free!
          </button>
        </div>
      </nav>
        );
      })()}

      {/* spacer for fixed nav */}
      <div style={{ height: 64 }} />

      {/* ── HERO ── */}
      <section ref={secHero} style={s.hero}>
        <p style={s.heroEye}>the student planner app</p>

        <h1 style={s.h1}>
          your all in one<br />
          <span style={s.h1LoopWrap}>
            <AnimatePresence mode="popLayout">
              <motion.strong
                key={loopKey}
                style={s.h1Bold}
                initial={{ opacity: 0, y: "40%", filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: "-40%", filter: "blur(6px)" }}
                transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {currentWord}
              </motion.strong>
            </AnimatePresence>
          </span>
        </h1>

        <p style={s.heroSub}>
          SemesterOS combines all your subjects, tasks and deadlines
          into one focused place — with AI built right in.
        </p>

        <button style={s.heroCta} onClick={() => nav("/register")}>
          Start planning for free!
        </button>
      </section>

      {/* ── WEB APP SHOWCASE ── */}
      <section ref={secShowcase} style={s.showcase}>
        {/* background bleeds through */}
        <div style={s.browserWrap}>
          <div style={s.browser}>
            {/* chrome bar */}
            <div style={s.browserBar}>
              <div style={s.trafficLights}>
                <div style={{ ...s.dot, background: "#ff5f57" }} />
                <div style={{ ...s.dot, background: "#ffbd2e" }} />
                <div style={{ ...s.dot, background: "#28c840" }} />
              </div>
              <div style={s.urlBar}>semesteros.app/home</div>
            </div>

            {/* app UI */}
            <div style={s.appUi}>
              {/* sidebar */}
              <div style={s.appSidebar}>
                <p style={s.appSidebarTitle}>SemesterOS</p>
                {appSidebarItems.map(item => (
                  <div key={item.label} style={{ ...s.appSidebarItem, ...(item.active ? s.appSidebarActive : {}) }}>
                    <item.icon size={14} color={item.active ? SALMON : "#a89ab4"} strokeWidth={1.8} />
                    <span style={{ fontSize: 13, color: item.active ? INK : "#a89ab4", fontWeight: item.active ? 600 : 400 }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* main content */}
              <div style={s.appMain}>
                <div style={s.appMainHead}>
                  <div>
                    <p style={s.appGreeting}>Good morning, Alex 👋</p>
                    <p style={s.appDate}>Monday · 30 March 2026</p>
                  </div>
                  <div style={s.appDueBadge}>3 due today</div>
                </div>

                <p style={s.appSection}>This week</p>

                {appTasks.map(t => (
                  <div key={t.title} style={s.appTask}>
                    <div style={{ ...s.appTaskColor, background: t.color }} />
                    <div style={s.appTaskInfo}>
                      <p style={s.appTaskTitle}>{t.title}</p>
                      <p style={s.appTaskSub}>{t.subject}</p>
                    </div>
                    <span style={{ ...s.appTaskBadge, background: t.bg, color: t.badgeColor }}>
                      {t.badge}
                    </span>
                  </div>
                ))}

                <div style={s.appAi}>
                  <Brain size={13} color={SALMON} />
                  <span style={s.appAiText}>AI Study Room — ask me anything about your subjects</span>
                </div>
              </div>

              {/* right panel — calendar strip */}
              <div style={s.appCalPanel}>
                <p style={s.appCalTitle}>March 2026</p>
                <div style={s.appCalGrid}>
                  {calDays.map(d => (
                    <div key={d.n} style={{ ...s.appCalDay, ...(d.today ? s.appCalToday : {}) }}>
                      <span style={s.appCalDayLabel}>{d.label}</span>
                      <span style={{ ...s.appCalDayNum, color: d.today ? WHITE : INK }}>{d.n}</span>
                    </div>
                  ))}
                </div>
                <p style={{ ...s.appSection, marginTop: 20 }}>Upcoming</p>
                {upcomingItems.map(u => (
                  <div key={u.title} style={s.appUpcoming}>
                    <div style={{ ...s.appUpcomingDot, background: u.color }} />
                    <div>
                      <p style={s.appUpcomingTitle}>{u.title}</p>
                      <p style={s.appUpcomingDate}>{u.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── light blush */}
      <section ref={secStats} style={{ ...s.band, background: BLUSH }} id="features">
        <p style={{ ...s.bandEye, color: INK2 }}>by the numbers</p>
        <h2 style={{ ...s.bandH2, color: INK }}>
          the student planner app<br />
          <strong style={{ color: SALMON }}>that everyone is using</strong>
        </h2>

        <div style={s.statsRow}>
          {stats.map(st => (
            <div key={st.label} style={s.statItem}>
              <span style={{ ...s.statNum, color: INK }}>{st.value}</span>
              <span style={{ ...s.statLabel, color: INK2 }}>{st.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURE 1 — Tasks ── salmon */}
      <section ref={secFeat1} style={{ ...s.featureSec, background: SALMON }}>
        <div style={s.featureInner}>
          <div style={s.featureText}>
            <h2 style={s.featureH2White}>
              split your semester<br />
              <strong>into tasks.</strong>
            </h2>
            <p style={s.featureSubWhite}>
              Every subject gets its own space. Break assignments into
              subtasks, set due dates, and track progress without
              juggling five different apps.
            </p>
          </div>
          <div style={s.featureVisual}>
            <div style={s.taskCard}>
              {featureTasks.map(t => (
                <div key={t.title} style={s.featureTask}>
                  <div style={{ ...s.featureTaskDot, background: t.color }} />
                  <div style={s.featureTaskBody}>
                    <p style={s.featureTaskTitle}>{t.title}</p>
                    <p style={s.featureTaskSub}>{t.sub}</p>
                  </div>
                  <span style={{ ...s.featureTaskPill, background: t.pillBg, color: t.pillColor }}>
                    {t.pill}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE 2 — Calendar ── blush */}
      <section ref={secFeat2} style={{ ...s.featureSec, background: BLUSH }}>
        <div style={{ ...s.featureInner, direction: "rtl" }}>
          <div style={{ ...s.featureText, direction: "ltr" }}>
            <h2 style={{ ...s.featureH2, color: INK }}>
              see your entire<br />
              <strong style={{ color: SALMON }}>semester at once.</strong>
            </h2>
            <p style={{ ...s.featureSub, color: INK2 }}>
              A visual calendar that pulls in every deadline, exam, and
              study session. Plan your week before the week plans you.
            </p>
          </div>
          <div style={{ ...s.featureVisual, direction: "ltr" }}>
            <div style={s.calCard}>
              <p style={s.calCardTitle}>April 2026</p>
              <div style={s.calCardGrid}>
                {calCardDays.map(d => (
                  <div key={d} style={{ ...s.calCardCell, ...(d === 14 ? s.calCardActive : d === 22 ? s.calCardExam : {}) }}>
                    {d}
                  </div>
                ))}
              </div>
              <div style={s.calLegend}>
                <span style={s.calLegendItem}><span style={{ ...s.calLegendDot, background: SALMON }} />Deadline</span>
                <span style={s.calLegendItem}><span style={{ ...s.calLegendDot, background: "#3d7080" }} />Exam</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE 3 — AI ── salmon */}
      <section ref={secFeat3} style={{ ...s.featureSec, background: SALMON }}>
        <div style={s.featureInner}>
          <div style={s.featureText}>
            <h2 style={s.featureH2White}>
              your personal tutor,<br />
              <strong>available 24/7.</strong>
            </h2>
            <p style={s.featureSubWhite}>
              Stuck the night before an exam? The AI study room
              generates explanations, quizzes and summaries tailored
              to your exact subjects — instantly.
            </p>
          </div>
          <div style={s.featureVisual}>
            <div style={s.aiCard}>
              <div style={s.aiCardHeader}>
                <Brain size={14} color={SALMON} />
                <span style={s.aiCardTitle}>AI Study Room</span>
                <span style={s.aiOnline} />
              </div>
              {aiMessages.map((m, i) => (
                <div key={i} style={{ ...s.aiMsg, ...(m.ai ? s.aiMsgAi : s.aiMsgUser) }}>
                  {m.ai && <span style={s.aiFrom}>AI</span>}
                  <p style={s.aiMsgText}>{m.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ── FAQ ── white */}
      <section ref={secFaq} style={s.faqSec} id="faq">
        <div style={s.faqWrap}>
          <p style={{ ...s.bandEye, color: INK2, textAlign: "left" }}>faq</p>
          <h2 style={{ ...s.bandH2, color: INK, textAlign: "left", marginBottom: 48 }}>
            frequently asked questions
          </h2>
          {faqs.map((f, i) => (
            <div key={i} style={s.faqItem}>
              <p style={s.faqQ}>{f.q}</p>
              <p style={s.faqA}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── salmon */}
      <section ref={secCta} style={{ ...s.band, background: SALMON, paddingTop: 100, paddingBottom: 100 }}>
        <h2 style={{ ...s.bandH2, color: WHITE, marginBottom: 16 }}>
          ready to own<br />
          <strong>your semester?</strong>
        </h2>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.75)", marginBottom: 36, margin: "0 auto 36px", maxWidth: 420, lineHeight: 1.6 }}>
          Free to get started. No credit card. No excuses.
        </p>
        <button
          style={{ ...s.heroCta, fontSize: 18, padding: "16px 44px" }}
          onClick={() => nav("/register")}
        >
          Start planning for free!
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer ref={secFooter} style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.brand}>
            <div style={{ ...s.brandMark, width: 26, height: 26 }}>
              <BookOpen size={13} color={WHITE} strokeWidth={2.2} />
            </div>
            <span style={{ ...s.brandName, fontSize: 14, color: INK }}>SemesterOS</span>
          </div>
          <div style={s.footerLinks}>
            {["Features","Reviews","FAQ","Login","Register"].map(l => (
              <button
                key={l}
                style={s.footerLink}
                onClick={() => l === "Login" ? nav("/login") : l === "Register" ? nav("/register") : null}
              >
                {l}
              </button>
            ))}
          </div>
          <p style={s.footerNote}>© 2026 SemesterOS · Built for students</p>
        </div>
      </footer>

    </div>
  );
}

/* ── DATA ── */

const appSidebarItems = [
  { icon: BookOpen,    label: "Subjects",  active: false },
  { icon: CheckSquare, label: "Tasks",     active: true  },
  { icon: Calendar,    label: "Calendar",  active: false },
  { icon: Brain,       label: "AI Room",   active: false },
  { icon: Target,      label: "Exams",     active: false },
  { icon: Clock,       label: "Planner",   active: false },
];

const appTasks = [
  { title: "Algorithms assignment", subject: "CS", color: "#f49585", badge: "Due today",  bg: "#fdecea", badgeColor: "#c0392b" },
  { title: "Read chapters 4–6",     subject: "Maths",   color: "#f59e0b", badge: "Tomorrow", bg: "#fef3e0", badgeColor: "#b45309" },
  { title: "Lab report draft",      subject: "Physics", color: "#3d7080", badge: "In 3 days",bg: "#eaf1fc", badgeColor: "#1a5fb4" },
];

const calDays = [
  { label: "M", n: 30, today: true  },
  { label: "T", n: 31, today: false },
  { label: "W", n: 1,  today: false },
  { label: "T", n: 2,  today: false },
  { label: "F", n: 3,  today: false },
  { label: "S", n: 4,  today: false },
  { label: "S", n: 5,  today: false },
];

const upcomingItems = [
  { title: "Algorithms assignment", date: "Today",   color: "#f49585" },
  { title: "Maths chapters 4–6",    date: "Tomorrow",color: "#f59e0b" },
  { title: "Physics lab report",    date: "Apr 2",   color: "#3d7080" },
];

const stats = [
  { value: "6+",   label: "core modules" },
  { value: "AI",   label: "study room built-in" },
  { value: "100%", label: "free to start" },
  { value: "∞",    label: "subjects & tasks" },
];

const featureTasks = [
  { title: "Algorithms assignment", sub: "Computer Science", color: "#f49585", pill: "Due today",  pillBg: "#fdecea", pillColor: "#c0392b" },
  { title: "Read chapters 4–6",     sub: "Mathematics",      color: "#f59e0b", pill: "Tomorrow",   pillBg: "#fef3e0", pillColor: "#b45309" },
  { title: "Write lab report",      sub: "Physics",          color: "#3d7080", pill: "Apr 2",       pillBg: "#eaf1fc", pillColor: "#1a5fb4" },
  { title: "Prepare presentation",  sub: "Economics",        color: "#7c3aed", pill: "Apr 5",       pillBg: "#f5f3ff", pillColor: "#7c3aed" },
];

const calCardDays = [
  1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,
];

const aiMessages = [
  { ai: false, text: "Explain recursion with a simple example" },
  { ai: true,  text: "Think of Russian nesting dolls — each doll contains a smaller copy. The smallest is the base case. That's recursion." },
  { ai: false, text: "Now quiz me on it" },
  { ai: true,  text: "What happens if a recursive function never reaches its base case?" },
];


const faqs = [
  { q: "Is SemesterOS free?", a: "Yes — all core features are free. No credit card required to get started." },
  { q: "What is the AI Study Room?", a: "A built-in AI assistant that understands your subjects. Ask it to explain concepts, generate quizzes, or summarise material — instantly." },
  { q: "Does it work on mobile?", a: "Yes. SemesterOS is fully responsive and works great on phones and tablets." },
  { q: "How is this different from Notion or Google Calendar?", a: "SemesterOS is built specifically for students. Subjects, tasks, subtasks, exams, and AI are all deeply connected — not a blank canvas you have to configure yourself." },
];

/* ── STYLES ── */

const s = {
  root: {
    flex: 1,
    width: "100%",
    background: SALMON,
    color: WHITE,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    overflowX: "hidden",
  },

  /* nav */
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 200,
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    transition: "background 0.4s ease",
  },
  navInner: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 40px",
    height: 64,
    display: "flex",
    alignItems: "center",
    gap: 32,
  },
  brand: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: 9,
    background: "rgba(255,255,255,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  brandName: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: 18,
    fontWeight: 400,
    color: WHITE,
    letterSpacing: "-0.01em",
  },
  navLinks: {
    display: "flex",
    gap: 4,
    marginLeft: "auto",
  },
  navLink: {
    fontSize: 14,
    fontWeight: 500,
    color: "rgba(255,255,255,0.85)",
    textDecoration: "none",
    padding: "6px 16px",
    borderRadius: 8,
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  navCta: {
    background: TEAL,
    color: WHITE,
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    padding: "10px 22px",
    borderRadius: 99,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    letterSpacing: "0.01em",
    boxShadow: "0 2px 12px rgba(61,112,128,0.35)",
  },

  /* hero */
  hero: {
    background: SALMON,
    textAlign: "center",
    padding: "100px 32px 80px",
  },
  heroEye: {
    fontSize: 14,
    fontWeight: 600,
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    margin: "0 0 24px",
  },
  h1: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: "clamp(48px, 8vw, 96px)",
    fontWeight: 300,
    lineHeight: 1.05,
    color: WHITE,
    margin: "0 0 20px",
    letterSpacing: "-0.03em",
  },
  h1Bold: {
    fontWeight: 700,
    display: "inline-block",
  },
  h1LoopWrap: {
    display: "inline-block",
    overflow: "hidden",
    verticalAlign: "bottom",
  },
  heroSub: {
    fontSize: 19,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 1.6,
    maxWidth: 500,
    margin: "0 auto 44px",
    fontWeight: 400,
  },
  heroCta: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: TEAL,
    color: WHITE,
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: 600,
    padding: "14px 36px",
    borderRadius: 99,
    boxShadow: "0 4px 20px rgba(61,112,128,0.4)",
    letterSpacing: "0.01em",
  },

  /* showcase — browser */
  showcase: {
    background: SALMON,
    padding: "0 40px 0",
  },
  browserWrap: {
    maxWidth: 1100,
    margin: "0 auto",
  },
  browser: {
    background: WHITE,
    borderRadius: "16px 16px 0 0",
    border: "1px solid rgba(255,255,255,0.3)",
    borderBottom: "none",
    boxShadow: "0 -8px 60px rgba(180,80,60,0.2)",
    overflow: "hidden",
  },
  browserBar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 20px",
    background: "#f9f7fa",
    borderBottom: "1px solid #ede9f0",
  },
  trafficLights: { display: "flex", gap: 6 },
  dot: { width: 12, height: 12, borderRadius: "50%" },
  urlBar: {
    flex: 1,
    background: "#fff",
    border: "1px solid #e8e4ec",
    borderRadius: 8,
    padding: "4px 16px",
    fontSize: 12,
    color: "#8a7e92",
    textAlign: "center",
    maxWidth: 280,
    margin: "0 auto",
  },
  appUi: {
    display: "flex",
    height: 380,
  },
  appSidebar: {
    width: 168,
    borderRight: "1px solid #f0ecf4",
    padding: "16px 10px",
    background: "#fdfcfe",
    display: "flex",
    flexDirection: "column",
    gap: 2,
    flexShrink: 0,
  },
  appSidebarTitle: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: 14,
    fontWeight: 400,
    color: "#4a3f52",
    padding: "0 8px 10px",
    borderBottom: "1px solid #f0ecf4",
    margin: "0 0 8px",
  },
  appSidebarItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 10px",
    borderRadius: 8,
    cursor: "default",
  },
  appSidebarActive: { background: "#fff0f3" },
  appMain: {
    flex: 1,
    padding: "20px 24px",
    overflowY: "auto",
    background: "#fff",
  },
  appMainHead: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  appGreeting: { fontSize: 15, fontWeight: 600, color: "#1a1523", margin: "0 0 2px" },
  appDate:     { fontSize: 12, color: "#8a7e92", margin: 0 },
  appDueBadge: {
    fontSize: 11,
    fontWeight: 600,
    background: "#fdecea",
    color: "#c0392b",
    padding: "4px 10px",
    borderRadius: 99,
  },
  appSection: {
    fontSize: 10,
    fontWeight: 700,
    color: "#c4bdc8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    margin: "0 0 10px",
  },
  appTask: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 0",
    borderBottom: "1px solid #f2eff4",
  },
  appTaskColor: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  appTaskInfo: { flex: 1, minWidth: 0 },
  appTaskTitle: { fontSize: 13, fontWeight: 500, color: "#1a1523", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  appTaskSub:   { fontSize: 11, color: "#8a7e92", margin: 0 },
  appTaskBadge: { fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, whiteSpace: "nowrap", flexShrink: 0 },
  appAi: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    padding: "10px 14px",
    background: "#fff0f3",
    border: "1px solid #ffd6de",
    borderRadius: 10,
  },
  appAiText: { fontSize: 12, color: SALMON, fontStyle: "italic" },
  appCalPanel: {
    width: 200,
    borderLeft: "1px solid #f0ecf4",
    padding: "16px 14px",
    background: "#fdfcfe",
    flexShrink: 0,
    overflowY: "auto",
  },
  appCalTitle: { fontSize: 13, fontWeight: 600, color: "#1a1523", margin: "0 0 12px" },
  appCalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 2,
    marginBottom: 16,
  },
  appCalDay: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 1,
    padding: "3px 2px",
    borderRadius: 6,
  },
  appCalToday: { background: SALMON },
  appCalDayLabel: { fontSize: 8, color: "#c4bdc8", fontWeight: 600, textTransform: "uppercase" },
  appCalDayNum: { fontSize: 11, fontWeight: 600, color: "#1a1523" },
  appUpcoming: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    padding: "8px 0",
    borderBottom: "1px solid #f0ecf4",
  },
  appUpcomingDot: { width: 8, height: 8, borderRadius: "50%", marginTop: 3, flexShrink: 0 },
  appUpcomingTitle: { fontSize: 12, fontWeight: 500, color: "#1a1523", margin: 0 },
  appUpcomingDate: { fontSize: 11, color: "#8a7e92", margin: 0 },

  /* bands (stats, testimonials) */
  band: {
    padding: "80px 40px",
    textAlign: "center",
  },
  bandEye: {
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    margin: "0 0 16px",
  },
  bandH2: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: "clamp(32px, 5vw, 60px)",
    fontWeight: 300,
    lineHeight: 1.1,
    margin: "0 0 48px",
    letterSpacing: "-0.025em",
  },
  statsRow: {
    display: "flex",
    justifyContent: "center",
    gap: "clamp(32px, 7vw, 100px)",
    flexWrap: "wrap",
  },
  statItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  statNum: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: "clamp(40px, 6vw, 68px)",
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: "-0.03em",
  },
  statLabel: { fontSize: 14, fontWeight: 500 },

  /* feature sections */
  featureSec: {
    padding: "80px 40px",
  },
  featureInner: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 80,
    alignItems: "center",
  },
  featureText: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    direction: "ltr",
  },
  featureH2White: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: "clamp(32px, 5vw, 58px)",
    fontWeight: 300,
    color: WHITE,
    margin: 0,
    lineHeight: 1.1,
    letterSpacing: "-0.025em",
  },
  featureSubWhite: {
    fontSize: 17,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 1.65,
    margin: 0,
    maxWidth: 400,
  },
  featureH2: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: "clamp(32px, 5vw, 58px)",
    fontWeight: 300,
    margin: 0,
    lineHeight: 1.1,
    letterSpacing: "-0.025em",
  },
  featureSub: {
    fontSize: 17,
    lineHeight: 1.65,
    margin: 0,
    maxWidth: 400,
  },
  featureVisual: { direction: "ltr" },

  /* task card */
  taskCard: {
    background: WHITE,
    borderRadius: 20,
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: 0,
    boxShadow: "0 8px 40px rgba(180,60,40,0.15)",
  },
  featureTask: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 0",
    borderBottom: "1px solid #f2eff4",
  },
  featureTaskDot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
  featureTaskBody: { flex: 1 },
  featureTaskTitle: { fontSize: 14, fontWeight: 500, color: "#1a1523", margin: 0 },
  featureTaskSub: { fontSize: 12, color: "#8a7e92", margin: 0 },
  featureTaskPill: { fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, whiteSpace: "nowrap" },

  /* calendar card */
  calCard: {
    background: WHITE,
    borderRadius: 20,
    padding: "24px",
    boxShadow: "0 8px 40px rgba(180,80,60,0.08)",
  },
  calCardTitle: { fontSize: 15, fontWeight: 600, color: INK, margin: "0 0 16px" },
  calCardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 4,
    marginBottom: 16,
  },
  calCardCell: {
    aspectRatio: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 500,
    color: INK,
    borderRadius: 8,
  },
  calCardActive: { background: SALMON, color: WHITE, fontWeight: 700 },
  calCardExam:   { background: TEAL,   color: WHITE, fontWeight: 700 },
  calLegend: { display: "flex", gap: 20 },
  calLegendItem: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: INK2 },
  calLegendDot: { width: 8, height: 8, borderRadius: "50%", display: "inline-block" },

  /* ai card */
  aiCard: {
    background: WHITE,
    borderRadius: 20,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    boxShadow: "0 8px 40px rgba(180,60,40,0.15)",
  },
  aiCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    paddingBottom: 12,
    borderBottom: "1px solid #f0ecf4",
  },
  aiCardTitle: { fontSize: 13, fontWeight: 600, color: INK },
  aiOnline: { width: 7, height: 7, borderRadius: "50%", background: "#34d399", marginLeft: "auto" },
  aiMsg: { padding: "10px 14px", borderRadius: 12, maxWidth: "85%" },
  aiMsgUser: { background: "#f9f7fa", border: "1px solid #f0ecf4", alignSelf: "flex-end", marginLeft: "auto" },
  aiMsgAi:   { background: "#fff0f3", border: "1px solid #ffd6de" },
  aiFrom: { fontSize: 9, fontWeight: 700, color: SALMON, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 4 },
  aiMsgText: { fontSize: 13, color: INK, lineHeight: 1.5, margin: 0 },


  /* faq */
  faqSec: {
    background: WHITE,
    padding: "80px 40px",
  },
  faqWrap: {
    maxWidth: 720,
    margin: "0 auto",
  },
  faqItem: {
    padding: "24px 0",
    borderBottom: "1px solid #f0ecf4",
  },
  faqQ: { fontSize: 17, fontWeight: 600, color: INK, margin: "0 0 8px" },
  faqA: { fontSize: 15, color: INK2, lineHeight: 1.65, margin: 0 },

  /* footer */
  footer: {
    background: WHITE,
    borderTop: "1px solid #f0ecf4",
    padding: "24px 40px",
  },
  footerInner: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
  },
  footerLinks: { display: "flex", gap: 4 },
  footerLink: {
    fontSize: 13,
    color: INK2,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px 10px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    textDecoration: "none",
  },
  footerNote: { fontSize: 12, color: "#c4bdc8", margin: 0 },
};
