export const S = {
  shell: { minHeight: "100vh", background: "#09090b", display: "flex", justifyContent: "center", fontFamily: "'IBM Plex Sans', sans-serif" },
  app: { width: "100%", maxWidth: 430, minHeight: "100vh", background: "#0f0f11", display: "flex", flexDirection: "column" },

  authScreen: { width: "100%", maxWidth: 430, minHeight: "100vh", background: "#0f0f11", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, gap: 20 },
  authLogo: { fontSize: "2.8rem", fontWeight: 700, letterSpacing: "0.2em", color: "#f1f5f9" },
  authTagline: { fontSize: "1rem", letterSpacing: "0.15em", color: "#94a3b8" },
  tagline: { display: "block", fontSize: "0.75rem", letterSpacing: "0.15em", color: "#94a3b8", marginTop: 3 },
  authBtn: { background: "#1e293b", border: "1px solid #475569", borderRadius: 10, padding: "14px 28px", color: "#f1f5f9", fontSize: "1rem", fontFamily: "inherit", letterSpacing: "0.05em", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, marginTop: 12 },
  authLoading: { fontSize: "0.9rem", color: "#94a3b8", letterSpacing: "0.05em", display: "flex", alignItems: "center" },
  authError: { fontSize: "0.85rem", color: "#fca5a5", background: "#1c0505", border: "1px solid #991b1b", borderRadius: 8, padding: "12px 16px", maxWidth: 320, textAlign: "center" },
  authNote: { fontSize: "0.8rem", color: "#64748b", textAlign: "center", maxWidth: 280, lineHeight: 1.8, marginTop: 8 },

  header: { padding: "18px 20px 10px", borderBottom: "1px solid #1e1e24", display: "flex", justifyContent: "space-between", alignItems: "center" },
  logo: { fontSize: "1.3rem", fontWeight: 700, letterSpacing: "0.15em", color: "#f1f5f9" },
  headerSub: { fontSize: "0.85rem", color: "#94a3b8", letterSpacing: "0.05em" },
  avatar: { width: 28, height: 28, borderRadius: "50%", border: "1px solid #1e1e28" },

  content: { flex: 1, overflowY: "auto", paddingBottom: 80 },
  screen: { padding: "16px 16px 8px" },
  sectionTitle: { fontSize: "0.8rem", letterSpacing: "0.15em", color: "#94a3b8", marginBottom: 10, marginTop: 8, fontWeight: 600 },

  card: { background: "#16161a", border: "1px solid #252530", borderRadius: 12, padding: "16px 18px", marginBottom: 12 },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  cardLabel: { fontSize: "0.9rem", letterSpacing: "0.1em", color: "#cbd5e1", fontWeight: 700 },
  cardLabelRight: { fontSize: "0.85rem", letterSpacing: "0.05em", color: "#94a3b8" },
  cardSub: { fontSize: "0.9rem", color: "#94a3b8", marginTop: 6 },

  bigNum: { fontSize: "2rem", fontWeight: 700, color: "#e2e8f0", lineHeight: 1.1, marginBottom: 4 },
  bigNumDim: { fontSize: "2rem", fontWeight: 700, color: "#2d2d35", lineHeight: 1.1, marginBottom: 10, textAlign: "center" },

  pill: { fontSize: "0.75rem", letterSpacing: "0.08em", padding: "3px 9px", borderRadius: 999, border: "1px solid", fontWeight: 600 },
  pillGreen: { color: "#4ade80", borderColor: "#166534", background: "#052e16" },
  pillAmber: { color: "#fbbf24", borderColor: "#92400e", background: "#1c1200" },
  pillDim: { color: "#94a3b8", borderColor: "#334155", background: "transparent" },

  fastTimeRow: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, fontSize: "0.9rem", color: "#94a3b8", marginBottom: 8 },
  fastTimeInput: { background: "transparent", border: "none", borderBottom: "1px solid #475569", color: "#f1f5f9", fontSize: "0.9rem", fontFamily: "inherit", padding: "2px 4px", cursor: "pointer", outline: "none", width: 90 },
  fastDateTimeInput: { width: 185 },

  waterBtns: { display: "flex", gap: 8, marginTop: 12 },
  waterBtn: { flex: 1, background: "#0d1b2a", border: "1px solid #1e3a5f", borderRadius: 8, padding: "10px 0", color: "#38bdf8", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  progressTrack: { width: "100%", background: "#1e1e28", borderRadius: 99, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 99, transition: "width 0.4s ease" },

  macroRow: { display: "flex", gap: 8, marginTop: 12 },
  macroPill: { flex: 1, border: "1px solid", borderRadius: 8, padding: "8px 10px", background: "#0f0f13" },
  macroLabel: { fontSize: "0.75rem", fontWeight: 700, display: "block" },
  macroVal: { fontSize: "1.1rem", fontWeight: 700, color: "#f1f5f9", display: "block" },
  macroGoal: { fontSize: "0.8rem", color: "#94a3b8" },

  splitRow: { display: "flex", alignItems: "center", gap: 16 },
  dividerV: { width: 1, height: 40, background: "#1e1e28" },

  inputGroup: { marginBottom: 14, flex: 1 },
  inputLabel: { fontSize: "0.8rem", letterSpacing: "0.1em", color: "#94a3b8", display: "block", marginBottom: 6, fontWeight: 600 },
  input: { width: "100%", background: "#0d0d10", border: "1px solid #252530", borderRadius: 8, padding: "12px 14px", color: "#f1f5f9", fontSize: "1rem", fontFamily: "inherit", boxSizing: "border-box", outline: "none" },
  twoCol: { display: "flex", gap: 10 },

  btn: { width: "100%", background: "#1d4ed8", border: "none", borderRadius: 8, padding: "14px", color: "#fff", fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.08em", cursor: "pointer", marginTop: 4, fontFamily: "inherit" },
  btnSuccess: { background: "#15803d" },
  btnDanger: { background: "#991b1b" },

  listItem: { background: "#16161a", border: "1px solid #252530", borderRadius: 10, padding: "12px 16px", marginBottom: 8 },
  listMain: { fontSize: "1rem", color: "#f1f5f9", fontWeight: 600, display: "flex", alignItems: "center" },
  listSub: { fontSize: "0.85rem", color: "#94a3b8", marginTop: 3 },

  statRow: { display: "flex", gap: 8, marginBottom: 12 },
  statGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 },
  statCard: { flex: 1, background: "#16161a", border: "1px solid #252530", borderRadius: 10, padding: "12px 8px", textAlign: "center" },
  statVal: { fontSize: "1.3rem", fontWeight: 700, color: "#f1f5f9" },
  statLabel: { fontSize: "0.7rem", letterSpacing: "0.08em", color: "#94a3b8", marginTop: 4 },

  chartWrap: { display: "flex", gap: 6, alignItems: "flex-end", height: 90, marginTop: 12 },
  chartCol: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  chartBarWrap: { flex: 1, width: "100%", position: "relative", display: "flex", alignItems: "flex-end" },
  chartBar: { width: "100%", borderRadius: "4px 4px 0 0", minHeight: 2, transition: "height 0.4s ease" },
  chartGoalLine: { position: "absolute", left: 0, right: 0, height: 1, background: "#334155", zIndex: 1 },
  chartDay: { fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600 },
  chartVal: { fontSize: "0.65rem", fontWeight: 700 },

  toggleBtn: { background: "none", border: "1px solid #334155", borderRadius: 6, padding: "3px 10px", color: "#94a3b8", fontSize: "0.7rem", letterSpacing: "0.08em", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },

  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 200, display: "flex", alignItems: "center", justifycontent: "center", padding: 20 },
  modal: { background: "#16161a", border: "1px solid #252530", borderRadius: 14, padding: "24px 20px", width: "100%", maxWidth: 390, maxHeight: "90vh", overflowY: "auto" },
  modalTitle: { fontSize: "0.85rem", letterSpacing: "0.12em", color: "#94a3b8", fontWeight: 700, marginBottom: 16 },

  nav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#0f0f11", borderTop: "1px solid #252530", display: "flex", padding: "10px 0 14px", zIndex: 100 },
  navBtn: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: "4px 0", opacity: 0.4 },
  navBtnActive: { opacity: 1 },
  navIcon: { fontSize: "1.4rem", lineHeight: 1 },
  navLabel: { fontSize: "0.7rem", letterSpacing: "0.05em", color: "#cbd5e1", fontFamily: "inherit", fontWeight: 600 },

  // New premium styles for Workouts
  routineCard: { background: "#16161a", border: "1px solid #252530", borderRadius: 12, padding: "16px 18px", marginBottom: 12, display: "flex", flexDirection: "column", gap: 10 },
  muscleBadge: { fontSize: "0.7rem", letterSpacing: "0.05em", padding: "3px 8px", borderRadius: 6, border: "1px solid #2d2d3d", color: "#94a3b8", marginRight: 4, marginBottom: 4, display: "inline-block", fontWeight: 600, background: "#1a1a22" },
  muscleBadgeActive: { color: "#38bdf8", borderColor: "#0c4a6e", background: "#07598533" },
  exerciseCard: { background: "#131317", border: "1px solid #252530", borderRadius: 10, padding: "12px 14px", marginBottom: 10 },
  exerciseHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  exerciseName: { fontSize: "0.95rem", fontWeight: 700, color: "#f1f5f9" },
  exerciseTarget: { fontSize: "0.8rem", color: "#38bdf8", fontWeight: 600 },
  exerciseDesc: { fontSize: "0.8rem", color: "#64748b", lineHeight: 1.4, margin: "6px 0 10px" },
  setHeader: { display: "grid", gridTemplateColumns: "0.6fr 1.5fr 1.5fr 1fr", gap: 8, fontSize: "0.7rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", paddingBottom: 6, marginBottom: 6, borderBottom: "1px solid #1e1e24", textAlign: "center" },
  setRow: { display: "grid", gridTemplateColumns: "0.6fr 1.5fr 1.5fr 1fr", gap: 8, alignItems: "center", marginBottom: 6, textAlign: "center" },
  setIndex: { fontSize: "0.85rem", color: "#64748b", fontWeight: 700 },
  setInput: { width: "100%", background: "#09090b", border: "1px solid #252530", borderRadius: 6, padding: "6px 8px", color: "#f1f5f9", fontSize: "0.85rem", textAlign: "center", outline: "none", fontFamily: "inherit" },
  setCheckCircle: { margin: "0 auto", width: 22, height: 22, borderRadius: "50%", border: "2px solid #475569", display: "flex", alignItems: "center", justifycontent: "center", cursor: "pointer", transition: "all 0.2s" },
  setCheckCircleActive: { borderColor: "#10b981", background: "#10b981" },
  checkMark: { color: "#09090b", fontSize: "0.75rem", fontWeight: 900 },
  volumeDisplay: { fontSize: "0.8rem", color: "#10b981", fontWeight: 700, letterSpacing: "0.05em" },

  // Rest Timer overlay
  timerOverlay: { position: "fixed", inset: 0, background: "rgba(9, 9, 11, 0.95)", zIndex: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 },
  timerCircle: { width: 170, height: 170, borderRadius: "50%", border: "4px solid #f59e0b", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: 20, position: "relative" },
  timerVal: { fontSize: "3.2rem", fontWeight: 700, color: "#f1f5f9", letterSpacing: "0.02em" },
  timerSub: { fontSize: "0.8rem", color: "#f59e0b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" },
  timerExercise: { fontSize: "1.1rem", fontWeight: 700, color: "#cbd5e1", textAlign: "center", marginBottom: 6 },
  timerNext: { fontSize: "0.85rem", color: "#64748b", textAlign: "center", marginBottom: 24 },
  timerBtnRow: { display: "flex", gap: 10 },
  timerBtn: { background: "#1e293b", border: "1px solid #475569", borderRadius: 8, padding: "10px 18px", color: "#cbd5e1", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  timerBtnSkip: { background: "#991b1b", border: "none", color: "#fff" },

  workoutSumCard: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#0d1b15", border: "1px solid #064e3b", borderRadius: 8, color: "#4ade80", fontSize: "0.8rem", fontWeight: 600, marginBottom: 12 }
};

export const css = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&display=swap');
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body { margin: 0; background: #09090b; }
  input:focus { border-color: #475569 !important; }
  input::placeholder { color: #475569; }
  input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
  .card-tap:active { opacity: 0.85; transform: scale(0.99); }
  ::-webkit-scrollbar { width: 0; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;
