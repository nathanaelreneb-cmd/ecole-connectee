import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LayoutDashboard, Users, FileText, Megaphone, GraduationCap,
  Plus, Trash2, X, Loader2, LogOut, Check, Clock, Copy,
  Wallet, TrendingUp, AlertTriangle, BookOpen, FileSpreadsheet, Smartphone,
} from "lucide-react";
import { supabase } from "./lib/supabase";

// ---------- Design tokens ----------
const COLORS = {
  paper: "#F7F4EE",
  ink: "#20304A",
  inkSoft: "#57677D",
  line: "#DCD6C8",
  primary: "#C15F3C",
  primarySoft: "#F4E3D9",
  positive: "#2F7D5B",
  positiveSoft: "#E3F0E9",
  negative: "#B23B32",
  negativeSoft: "#F6E1DE",
  card: "#FFFFFF",
};

const ROLE_LABELS = { fondateur: "Fondateur / Directeur", comptable: "Comptable", enseignant: "Enseignant", parent: "Parent" };
const LEVELS = ["Maternelle", "Élémentaire", "Collège", "Lycée"];
const ORANGE_MONEY_NUMBER = "+224 610185122";
const PRICING_TIERS = [
  { name: "Essentiel", price: 150000, limit: 50, desc: "Jusqu'à 50 élèves" },
  { name: "Standard", price: 250000, limit: 150, desc: "Jusqu'à 150 élèves" },
  { name: "Illimité", price: 400000, limit: 999999, desc: "Élèves illimités" },
];
const CURRENCIES = [
  { code: "GNF", symbol: "FG", decimals: 0 },
  { code: "XOF", symbol: "FCFA", decimals: 0 },
  { code: "EUR", symbol: "€", decimals: 2 },
  { code: "USD", symbol: "$", decimals: 2 },
];
const fmt = (n, code = "GNF") => {
  const c = CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
  return `${new Intl.NumberFormat("fr-FR", { minimumFractionDigits: c.decimals, maximumFractionDigits: c.decimals }).format(n || 0)} ${c.symbol}`;
};
const genCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const inputStyle = { fontFamily: "'Inter', sans-serif", border: `1px solid ${COLORS.line}`, background: "#fff", color: COLORS.ink };

// ================= AUTH + ONBOARDING =================
function AuthScreen() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setMessage(""); setLoading(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage("Compte créé ! Connecte-toi pour finir la configuration.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-5" style={{ background: COLORS.paper }}>
      <div className="w-full max-w-sm rounded-2xl p-8" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: COLORS.primary }}><GraduationCap size={18} color="#fff" /></div>
          <div className="text-lg font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>École Connectée</div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>Mot de passe</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
          </div>
          {error && <div className="text-sm" style={{ color: COLORS.negative }}>{error}</div>}
          {message && <div className="text-sm" style={{ color: COLORS.positive }}>{message}</div>}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2" style={{ background: COLORS.ink, color: "#fff" }}>
            {loading && <Loader2 className="animate-spin" size={16} />}
            {mode === "signin" ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>
        <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setMessage(""); }} className="w-full text-center text-sm mt-4" style={{ color: COLORS.inkSoft }}>
          {mode === "signin" ? "Pas encore de compte ? En créer un" : "Déjà un compte ? Se connecter"}
        </button>
      </div>
    </div>
  );
}

function OnboardingScreen({ userId, onDone }) {
  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    if (!role || !fullName.trim()) { setError("Remplis ton nom et choisis ton rôle."); return; }
    if (role === "parent" && !phone.trim()) { setError("Le numéro de téléphone est requis pour les parents."); return; }
    setLoading(true);
    try {
      let schoolId;
      if (role === "fondateur") {
        if (!schoolName.trim()) { setError("Donne un nom à ton école."); setLoading(false); return; }
        const { data, error } = await supabase.from("schools").insert({ name: schoolName.trim(), code: genCode() }).select().single();
        if (error) throw error;
        schoolId = data.id;
      } else {
        if (!schoolCode.trim()) { setError("Entre le code de l'école reçu du fondateur."); setLoading(false); return; }
        const { data, error } = await supabase.from("schools").select("id").eq("code", schoolCode.trim().toUpperCase()).maybeSingle();
        if (error || !data) { setError("Code d'école introuvable. Vérifie-le auprès du fondateur."); setLoading(false); return; }
        schoolId = data.id;
      }
      const { error: profileError } = await supabase.from("profiles").insert({ user_id: userId, school_id: schoolId, role, full_name: fullName.trim(), phone: phone.trim() || null });
      if (profileError) throw profileError;
      onDone();
    } catch (e) {
      setError(e.message || "Une erreur est survenue.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-5" style={{ background: COLORS.paper }}>
      <div className="w-full max-w-md rounded-2xl p-8" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <h2 className="text-xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Configure ton compte</h2>
        <p className="text-sm mb-6" style={{ color: COLORS.inkSoft }}>Dernière étape avant d'accéder à l'application.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>Ton nom complet</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>Ton rôle</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ROLE_LABELS).map(([key, label]) => (
                <button key={key} onClick={() => setRole(key)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-left" style={{ background: role === key ? COLORS.ink : "#fff", color: role === key ? "#fff" : COLORS.inkSoft, border: `1px solid ${role === key ? COLORS.ink : COLORS.line}` }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {role === "parent" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>Numéro de téléphone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: 622 00 00 00" className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
              <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>Utile pour que l'école puisse te contacter directement.</p>
            </div>
          )}

          {role === "fondateur" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>Nom de ton école</label>
              <input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="Ex: Groupe Scolaire Étoile" className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
              <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>Un code unique sera généré pour que ton équipe et les parents rejoignent ton école.</p>
            </div>
          )}
          {role && role !== "fondateur" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>Code de l'école</label>
              <input value={schoolCode} onChange={(e) => setSchoolCode(e.target.value.toUpperCase())} placeholder="Ex: A1B2C3" className="w-full px-3 py-2.5 rounded-lg outline-none uppercase" style={inputStyle} />
              <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>Demande ce code au fondateur/directeur de ton école.</p>
            </div>
          )}

          {error && <div className="text-sm" style={{ color: COLORS.negative }}>{error}</div>}

          <button onClick={submit} disabled={loading} className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2" style={{ background: COLORS.primary, color: "#fff" }}>
            {loading && <Loader2 className="animate-spin" size={16} />}
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
}

// ================= MAIN APP =================
export default function App() {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(undefined);

  const loadProfile = useCallback(async (userId) => {
    const { data } = await supabase.from("profiles").select("*, schools(name, code, currency)").eq("user_id", userId).maybeSingle();
    setProfile(data || null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) loadProfile(data.session.user.id);
      else setProfile(null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) loadProfile(s.user.id);
      else setProfile(null);
    });
    return () => listener.subscription.unsubscribe();
  }, [loadProfile]);

  if (session === undefined || (session && profile === undefined)) {
    return <div className="h-screen w-full flex items-center justify-center" style={{ background: COLORS.paper }}><Loader2 className="animate-spin" size={28} style={{ color: COLORS.ink }} /></div>;
  }
  if (!session) return <AuthScreen />;
  if (!profile) return <OnboardingScreen userId={session.user.id} onDone={() => loadProfile(session.user.id)} />;
  return <MainApp profile={profile} />;
}

function MainApp({ profile }) {
  const currency = profile.schools?.currency || "GNF";
  const role = profile.role;
  const schoolId = profile.school_id;
  const [tab, setTab] = useState(role === "comptable" ? "students" : role === "enseignant" ? "lessons" : "dashboard");
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [homework, setHomework] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [linkingStudent, setLinkingStudent] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const loadAll = useCallback(async () => {
    const [s, p, l, h, a, par] = await Promise.all([
      supabase.from("students").select("*").order("full_name"),
      supabase.from("payments").select("*").order("date", { ascending: false }),
      supabase.from("lessons").select("*").order("created_at", { ascending: false }),
      supabase.from("homework_status").select("*"),
      supabase.from("announcements").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("user_id, full_name, phone").eq("role", "parent"),
    ]);
    if (s.data) setStudents(s.data);
    if (p.data) setPayments(p.data);
    if (l.data) setLessons(l.data);
    if (h.data) setHomework(h.data);
    if (a.data) setAnnouncements(a.data);
    if (par.data) setParents(par.data);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const paidByStudent = useMemo(() => {
    const map = {};
    payments.forEach((p) => { map[p.student_id] = (map[p.student_id] || 0) + Number(p.amount); });
    return map;
  }, [payments]);

  const myChildren = useMemo(() => students.filter((s) => s.parent_id === profile.user_id), [students, profile.user_id]);

  const stats = useMemo(() => {
    const totalDue = students.reduce((s, st) => s + Number(st.total_due), 0);
    const totalPaid = payments.reduce((s, p) => s + Number(p.amount), 0);
    return { nbEleves: students.length, totalDue, totalPaid, reste: totalDue - totalPaid, nbDevoirs: lessons.length };
  }, [students, payments, lessons]);

  const addStudent = async (s) => {
    const { data, error } = await supabase.from("students").insert({ ...s, school_id: schoolId }).select();
    if (error) {
      if (error.message?.includes("LIMITE_ESSAI_ATTEINTE")) { setShowUpgrade(true); return "limit"; }
      return "error";
    }
    if (data) setStudents((p) => [...p, data[0]]);
    return "ok";
  };
  const deleteStudent = async (id) => { await supabase.from("students").delete().eq("id", id); setStudents((p) => p.filter((s) => s.id !== id)); };
  const linkParent = async (studentId, parentId) => {
    const { data } = await supabase.from("students").update({ parent_id: parentId || null }).eq("id", studentId).select();
    if (data) setStudents((prev) => prev.map((s) => (s.id === studentId ? data[0] : s)));
  };
  const addPayment = async (pay) => { const { data } = await supabase.from("payments").insert({ ...pay, school_id: schoolId }).select(); if (data) setPayments((p) => [data[0], ...p]); };
  const addLesson = async (l) => { const { data } = await supabase.from("lessons").insert({ ...l, school_id: schoolId, teacher_id: profile.user_id }).select(); if (data) setLessons((p) => [data[0], ...p]); };
  const deleteLesson = async (id) => { await supabase.from("lessons").delete().eq("id", id); setLessons((p) => p.filter((l) => l.id !== id)); };
  const toggleHomework = async (lessonId, studentId) => {
    const existing = homework.find((h) => h.lesson_id === lessonId && h.student_id === studentId);
    if (existing) {
      const { data } = await supabase.from("homework_status").update({ done: !existing.done, done_at: !existing.done ? new Date().toISOString() : null }).eq("id", existing.id).select();
      if (data) setHomework((p) => p.map((h) => (h.id === existing.id ? data[0] : h)));
    } else {
      const { data } = await supabase.from("homework_status").insert({ school_id: schoolId, lesson_id: lessonId, student_id: studentId, done: true, done_at: new Date().toISOString() }).select();
      if (data) setHomework((p) => [...p, data[0]]);
    }
  };
  const addAnnouncement = async (a) => { const { data } = await supabase.from("announcements").insert({ ...a, school_id: schoolId, author_id: profile.user_id }).select(); if (data) setAnnouncements((p) => [data[0], ...p]); };
  const deleteAnnouncement = async (id) => { await supabase.from("announcements").delete().eq("id", id); setAnnouncements((p) => p.filter((a) => a.id !== id)); };

  const NAV = {
    fondateur: [["dashboard", "Tableau de bord", LayoutDashboard], ["announcements", "Annonces", Megaphone], ["students", "Élèves", Users], ["lessons", "Devoirs", BookOpen]],
    comptable: [["students", "Élèves & Paiements", Users], ["dashboard", "Statistiques", LayoutDashboard]],
    enseignant: [["lessons", "Devoirs", BookOpen], ["students", "Élèves", Users]],
    parent: [["dashboard", "Mes enfants", GraduationCap], ["lessons", "Devoirs", BookOpen], ["announcements", "Annonces", Megaphone]],
  }[role];

  if (loading) return <div className="h-screen w-full flex items-center justify-center" style={{ background: COLORS.paper }}><Loader2 className="animate-spin" size={28} style={{ color: COLORS.ink }} /></div>;

  return (
    <div className="min-h-screen w-full flex" style={{ background: COLORS.paper, fontFamily: "'Inter', sans-serif" }}>
      <aside className="hidden md:flex flex-col w-64 shrink-0 p-5 border-r" style={{ borderColor: COLORS.line }}>
        <div className="flex items-center gap-2.5 px-2 mb-1">
          <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: COLORS.primary }}><GraduationCap size={18} color="#fff" /></div>
          <div>
            <div className="text-base leading-tight font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{profile.schools?.name}</div>
            <div className="text-[11px] tracking-wide" style={{ color: COLORS.inkSoft }}>{ROLE_LABELS[role]}</div>
          </div>
        </div>
        {role === "fondateur" && (
          <button onClick={() => { navigator.clipboard?.writeText(profile.schools?.code || ""); }} className="mx-2 mb-6 mt-3 flex items-center justify-between px-3 py-2 rounded-lg text-xs" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>
            <span>Code école: <b style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{profile.schools?.code}</b></span>
            <Copy size={13} />
          </button>
        )}
        <nav className="space-y-1 flex-1 mt-4">
          {NAV.map(([key, label, Icon]) => (
            <button key={key} onClick={() => setTab(key)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left" style={{ background: tab === key ? COLORS.ink : "transparent", color: tab === key ? "#fff" : COLORS.inkSoft }}>
              <Icon size={18} /> <span className="text-[15px] font-medium" style={{ fontFamily: "'Manrope', sans-serif" }}>{label}</span>
            </button>
          ))}
        </nav>
        <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left" style={{ color: COLORS.inkSoft }}>
          <LogOut size={18} /> <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </aside>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around py-2 border-t" style={{ background: COLORS.card, borderColor: COLORS.line }}>
        {NAV.map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)} className="p-2 rounded-lg" style={{ color: tab === key ? COLORS.ink : COLORS.inkSoft }}><Icon size={20} /></button>
        ))}
        <button onClick={() => supabase.auth.signOut()// ---------- Élèves & Paiements (comptable) ----------
function StudentsView({ students, paidByStudent, currency, readOnly, parents, subscribed, studentLimit, onAdd, onDelete, onPay, onLink }) {
  const grouped = useMemo(() => {
    const byLevel = {};
    LEVELS.forEach((lvl) => (byLevel[lvl] = {}));
    students.forEach((s) => {
      const lvl = LEVELS.includes(s.level) ? s.level : "Élémentaire";
      if (!byLevel[lvl][s.class_name]) byLevel[lvl][s.class_name] = [];
      byLevel[lvl][s.class_name].push(s);
    });
    return byLevel;
  }, [students]);

  const parentName = (id) => parents.find((p) => p.user_id === id)?.full_name;

  const exportCsv = () => {
    const rows = [["Niveau", "Classe", "Élève", "Parent lié", "Total dû", "Payé", "Reste"]];
    students.forEach((s) => {
      const paid = paidByStudent[s.id] || 0;
      rows.push([s.level, s.class_name, s.full_name, parentName(s.parent_id) || "—", s.total_due, paid, Number(s.total_due) - paid]);
    });
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eleves_paiements_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Élèves & Paiements</h1>
          <p style={{ color: COLORS.inkSoft }}>Registre par niveau et par classe.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={exportCsv} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-sm" style={{ background: "#fff", color: COLORS.ink, border: `1px solid ${COLORS.line}` }}>
            <FileSpreadsheet size={16} /> Exporter (Excel)
          </button>
          {!readOnly && (
            <>
              <AddButton onClick={onAdd} label="Élève" />
              <button onClick={onPay} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-sm" style={{ background: COLORS.ink, color: "#fff" }}><Plus size={16} /> Paiement</button>
            </>
          )}
        </div>
      </div>

      {!subscribed && (
        <div className="rounded-xl px-4 py-3 mb-5 text-sm flex items-center justify-between flex-wrap gap-2" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>
          <span>Essai gratuit : <b>{students.length}/{studentLimit}</b> élèves utilisés</span>
        </div>
      )}

      {students.length === 0 ? (
        <div className="rounded-2xl p-10" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}><EmptyState text="Aucun élève enregistré." /></div>
      ) : (
        <div className="space-y-6">
          {LEVELS.filter((lvl) => Object.keys(grouped[lvl]).length > 0).map((lvl) => (
            <div key={lvl}>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: COLORS.primary, fontFamily: "'Manrope', sans-serif" }}>{lvl}</h2>
              <div className="space-y-4">
                {Object.entries(grouped[lvl]).map(([className, classStudents]) => (
                  <div key={className} className="rounded-2xl overflow-x-auto" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                    <div className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ background: COLORS.paper, color: COLORS.inkSoft }}>{className}</div>
                    <table className="w-full text-sm">
                      <tbody>
                        {classStudents.map((s, i) => {
                          const paid = paidByStudent[s.id] || 0;
                          const reste = Number(s.total_due) - paid;
                          return (
                            <tr key={s.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${COLORS.line}` }}>
                              <td className="px-4 py-3 font-medium" style={{ color: COLORS.ink }}>
                                {s.full_name}
                                <div className="text-xs font-normal mt-0.5" style={{ color: s.parent_id ? COLORS.positive : COLORS.gold || COLORS.primary }}>
                                  {s.parent_id ? `Parent: ${parentName(s.parent_id) || "lié"}` : "Aucun parent lié"}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.positive }}>{fmt(paid, currency)}</td>
                              <td className="px-4 py-3 text-right font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: reste > 0 ? COLORS.negative : COLORS.positive }}>{fmt(reste, currency)}</td>
                              {!readOnly && (
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                  <button onClick={() => onLink(s)} className="text-xs font-medium px-2 py-1 rounded-full mr-2" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>Lier parent</button>
                                  <button onClick={() => onDelete(s.id)} style={{ color: COLORS.inkSoft }}><Trash2 size={15} /></button>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function StudentsReadOnlyView({ students }) {
  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Élèves</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>Liste des élèves par classe.</p>
      {students.length === 0 ? <EmptyState text="Aucun élève enregistré." /> : (
        <div className="grid sm:grid-cols-2 gap-3">
          {students.map((s) => (
            <div key={s.id} className="rounded-xl p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div className="font-semibold" style={{ color: COLORS.ink }}>{s.full_name}</div>
              <div className="text-sm" style={{ color: COLORS.inkSoft }}>{s.class_name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Devoirs (enseignant) ----------
function LessonsTeacherView({ lessons, students, homework, readOnly, onAdd, onDelete, onToggle }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Devoirs</h1>
          <p style={{ color: COLORS.inkSoft }}>Publiez des leçons/devoirs et suivez qui les a faits.</p>
        </div>
        {!readOnly && <AddButton onClick={onAdd} label="Publier" />}
      </div>
      {lessons.length === 0 ? (
        <div className="rounded-2xl p-10" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}><EmptyState text="Aucun devoir publié pour l'instant." /></div>
      ) : (
        <div className="space-y-3">
          {lessons.map((l) => {
            const classStudents = students.filter((s) => s.class_name === l.class_name);
            const doneCount = classStudents.filter((s) => homework.find((h) => h.lesson_id === l.id && h.student_id === s.id && h.done)).length;
            return (
              <div key={l.id} className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <div className="font-semibold" style={{ color: COLORS.ink }}>{l.title}</div>
                    <div className="text-xs" style={{ color: COLORS.inkSoft }}>{l.class_name}{l.due_date && ` · Pour le ${new Date(l.due_date).toLocaleDateString("fr-FR")}`}</div>
                  </div>
                  {!readOnly && <button onClick={() => onDelete(l.id)} style={{ color: COLORS.inkSoft }}><Trash2 size={15} /></button>}
                </div>
                {l.description && <p className="text-sm mt-2 mb-3" style={{ color: COLORS.inkSoft }}>{l.description}</p>}
                {l.attachment_url && (
                  <a href={l.attachment_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg mb-3" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>
                    <FileText size={13} /> {l.attachment_name || "Voir le fichier"}
                  </a>
                )}
                <button onClick={() => setExpanded(expanded === l.id ? null : l.id)} className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: COLORS.positiveSoft, color: COLORS.positive }}>
                  {doneCount}/{classStudents.length} élèves ont terminé
                </button>
                {expanded === l.id && (
                  <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: `1px solid ${COLORS.line}` }}>
                    {classStudents.map((s) => {
                      const done = homework.find((h) => h.lesson_id === l.id && h.student_id === s.id)?.done;
                      return (
                        <div key={s.id} className="flex items-center justify-between text-sm">
                          <span style={{ color: COLORS.ink }}>{s.full_name}</span>
                          {done ? <Check size={15} style={{ color: COLORS.positive }} /> : <Clock size={15} style={{ color: COLORS.inkSoft }} />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Devoirs (parent) ----------
function LessonsParentView({ lessons, children, homework, onToggle }) {
  const childClasses = new Set(children.map((c) => c.class_name));
  const relevant = lessons.filter((l) => childClasses.has(l.class_name));
  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Devoirs</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>Devoirs de vos enfants — cochez une fois terminés.</p>
      {relevant.length === 0 ? <EmptyState text="Aucun devoir pour le moment." /> : (
        <div className="space-y-3">
          {relevant.map((l) => (
            <div key={l.id} className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div className="font-semibold mb-1" style={{ color: COLORS.ink }}>{l.title}</div>
              <div className="text-xs mb-2" style={{ color: COLORS.inkSoft }}>{l.class_name}{l.due_date && ` · Pour le ${new Date(l.due_date).toLocaleDateString("fr-FR")}`}</div>
              {l.description && <p className="text-sm mb-3" style={{ color: COLORS.inkSoft }}>{l.description}</p>}
              {l.attachment_url && (
                <a href={l.attachment_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg mb-3" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>
                  <FileText size={13} /> {l.attachment_name || "Voir le fichier"}
                </a>
              )}
              {children.filter((c) => c.class_name === l.class_name).map((c) => {
                const done = homework.find((h) => h.lesson_id === l.id && h.student_id === c.id)?.done;
                return (
                  <button key={c.id} onClick={() => onToggle(l.id, c.id)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm mt-1" style={{ background: done ? COLORS.positiveSoft : COLORS.paper, color: done ? COLORS.positive : COLORS.inkSoft }}>
                    <span>{c.full_name}</span>
                    <span className="flex items-center gap-1.5 font-medium">{done ? <><Check size={14} /> Fait</> : "Marquer comme fait"}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Mes enfants (parent dashboard) ----------
function ParentChildrenView({ children, paidByStudent, currency }) {
  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Mes enfants</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>Suivi scolaire et financier.</p>
      {children.length === 0 ? (
        <div className="rounded-2xl p-10" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <EmptyState text="Aucun enfant lié à votre compte pour l'instant. Demandez au comptable ou au fondateur de l'école de vous associer à votre enfant." />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {children.map((c) => {
            const paid = paidByStudent[c.id] || 0;
            const reste = Number(c.total_due) - paid;
            return (
              <div key={c.id} className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                <div className="font-bold text-lg mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{c.full_name}</div>
                <div className="text-sm mb-3" style={{ color: COLORS.inkSoft }}>{c.class_name}</div>
                <div className="flex justify-between text-sm"><span style={{ color: COLORS.inkSoft }}>Payé</span><span style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.positive }}>{fmt(paid, currency)}</span></div>
                <div className="flex justify-between text-sm mt-1"><span style={{ color: COLORS.inkSoft }}>Reste</span><span style={{ fontFamily: "'IBM Plex Mono', monospace", color: reste > 0 ? COLORS.negative : COLORS.positive }}>{fmt(reste, currency)}</span></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Annonces ----------
function AnnouncementsView({ announcements, canWrite, onAdd, onDelete }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Annonces</h1>
          <p style={{ color: COLORS.inkSoft }}>Communications de la direction.</p>
        </div>
        {canWrite && <AddButton onClick={onAdd} label="Publier" />}
      </div>
      {announcements.length === 0 ? (
        <div className="rounded-2xl p-10" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}><EmptyState text="Aucune annonce pour l'instant." /></div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold" style={{ color: COLORS.ink }}>{a.title}</div>
                  <div className="text-xs mb-2" style={{ color: COLORS.inkSoft }}>{new Date(a.created_at).toLocaleDateString("fr-FR")}</div>
                </div>
                {canWrite && <button onClick={() => onDelete(a.id)} style={{ color: COLORS.inkSoft }}><Trash2 size={15} /></button>}
              </div>
              <p className="text-sm" style={{ color: COLORS.inkSoft }}>{a.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Modals ----------
function StudentModal({ onClose, onSave }) {
  const [fullName, setFullName] = useState("");
  const [level, setLevel] = useState(LEVELS[1]);
  const [className, setClassName] = useState("");
  const [totalDue, setTotalDue] = useState("");
  const submit = async () => { if (!fullName.trim() || !className.trim()) return; await onSave({ full_name: fullName.trim(), level, class_name: className.trim(), total_due: parseFloat(totalDue) || 0 }); onClose(); };
  return (
    <Modal title="Nouvel élève" onClose={onClose}>
      <div className="space-y-4">
        <div><FieldLabel>Nom complet</FieldLabel><input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        <div>
          <FieldLabel>Niveau</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            {LEVELS.map((lvl) => (
              <button key={lvl} onClick={() => setLevel(lvl)} className="px-3 py-2 rounded-lg text-sm font-medium" style={{ background: level === lvl ? COLORS.ink : "#fff", color: level === lvl ? "#fff" : COLORS.inkSoft, border: `1px solid ${level === lvl ? COLORS.ink : COLORS.line}` }}>{lvl}</button>
            ))}
          </div>
        </div>
        <div><FieldLabel>Classe</FieldLabel><input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Ex: CM2, 6ème A..." className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        <div><FieldLabel>Montant total dû (année)</FieldLabel><input type="number" value={totalDue} onChange={(e) => setTotalDue(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        <button onClick={submit} className="w-full py-3 rounded-lg font-semibold mt-2" style={{ background: COLORS.ink, color: "#fff" }}>Ajouter l'élève</button>
      </div>
    </Modal>
  );
}

function UpgradeModal({ onClose }) {
  const [copied, setCopied] = useState(false);
  const copyNumber = () => {
    navigator.clipboard?.writeText(ORANGE_MONEY_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Modal title="Limite de l'essai gratuit atteinte" onClose={onClose}>
      <div className="space-y-5">
        <p className="text-sm" style={{ color: COLORS.inkSoft }}>
          L'essai gratuit permet d'enregistrer jusqu'à 10 élèves. Choisis une formule pour continuer :
        </p>
        <div className="space-y-2.5">
          {PRICING_TIERS.map((t) => (
            <div key={t.name} className="rounded-xl p-4 flex items-center justify-between" style={{ border: `1px solid ${COLORS.line}` }}>
              <div>
                <div className="font-semibold" style={{ color: COLORS.ink }}>{t.name}</div>
                <div className="text-xs" style={{ color: COLORS.inkSoft }}>{t.desc}</div>
              </div>
              <div className="text-right">
                <div className="font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.primary }}>{fmt(t.price, "GNF")}</div>
                <div className="text-xs" style={{ color: COLORS.inkSoft }}>/ mois</div>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4" style={{ background: COLORS.primarySoft }}>
          <div className="flex items-center gap-2 mb-2">
            <Smartphone size={16} style={{ color: COLORS.primary }} />
            <span className="text-sm font-semibold" style={{ color: COLORS.primary }}>Paiement par Orange Money</span>
          </div>
          <p className="text-xs mb-3" style={{ color: COLORS.inkSoft }}>
            Envoie le montant de la formule choisie à ce numéro, puis contacte l'é
