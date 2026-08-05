import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LayoutDashboard, Users, FileText, Megaphone, GraduationCap,
  Plus, Trash2, X, Loader2, LogOut, Check, Clock, Copy,
  Wallet, TrendingUp, AlertTriangle, BookOpen, FileSpreadsheet, Smartphone, TrendingDown, Receipt, Shield, ClipboardList, ArrowDownWideNarrow,
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
const EXPENSE_CATEGORIES = ["Salaires", "Factures", "Fournitures", "Crédits", "Autres"];
const PASS_THRESHOLD = 10; // moyenne sur 20 pour être admis
const ORANGE_MONEY_NUMBER = "+224 610185122";
const PRICING_TIERS = [
  { name: "Essentiel", price: 150000, limit: 50, desc: "Jusqu'à 50 élèves / mois" },
  { name: "Standard", price: 250000, limit: 150, desc: "Jusqu'à 150 élèves / mois" },
  { name: "Annuel Illimité", price: 500000, limit: 999999, desc: "Élèves illimités, valable 1 année scolaire", yearly: true },
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
      if (role === "parent" && phone.trim()) {
        await supabase.rpc("link_parent_by_phone", { p_phone: phone.trim() });
      }
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
  const [expenses, setExpenses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [linkingStudent, setLinkingStudent] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const loadAll = useCallback(async () => {
    const [s, p, l, h, a, par, exp, gr] = await Promise.all([
      supabase.from("students").select("*").order("full_name"),
      supabase.from("payments").select("*").order("date", { ascending: false }),
      supabase.from("lessons").select("*").order("created_at", { ascending: false }),
      supabase.from("homework_status").select("*"),
      supabase.from("announcements").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("user_id, full_name, phone").eq("role", "parent"),
      supabase.from("expenses").select("*").order("date", { ascending: false }),
      supabase.from("grades").select("*"),
    ]);
    if (s.data) setStudents(s.data);
    if (p.data) setPayments(p.data);
    if (l.data) setLessons(l.data);
    if (h.data) setHomework(h.data);
    if (a.data) setAnnouncements(a.data);
    if (par.data) setParents(par.data);
    if (exp.data) setExpenses(exp.data);
    if (gr.data) setGrades(gr.data);
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
    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
    return { nbEleves: students.length, totalDue, totalPaid, reste: totalDue - totalPaid, nbDevoirs: lessons.length, totalExpenses, solde: totalPaid - totalExpenses };
  }, [students, payments, lessons, expenses]);

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
  const relinkSelf = async () => {
    const phone = profile.phone;
    if (!phone) return 0;
    const { data: count } = await supabase.rpc("link_parent_by_phone", { p_phone: phone });
    if (count > 0) {
      const { data: s } = await supabase.from("students").select("*").order("full_name");
      if (s) setStudents(s);
    }
    return count || 0;
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
  const addExpense = async (e) => {
    const { data, error } = await supabase.from("expenses").insert({ ...e, school_id: schoolId, created_by: profile.user_id }).select();
    if (data) setExpenses((p) => [data[0], ...p]);
    return error;
  };
  const deleteExpense = async (id) => { await supabase.from("expenses").delete().eq("id", id); setExpenses((p) => p.filter((e) => e.id !== id)); };
  const saveGrade = async (studentId, subject, score) => {
    const { data, error } = await supabase
      .from("grades")
      .upsert({ school_id: schoolId, student_id: studentId, subject, score, class_name: students.find((s) => s.id === studentId)?.class_name || "" }, { onConflict: "student_id,subject" })
      .select();
    if (data) {
      setGrades((prev) => {
        const existing = prev.find((g) => g.student_id === studentId && g.subject === subject);
        if (existing) return prev.map((g) => (g.id === existing.id ? data[0] : g));
        return [...prev, data[0]];
      });
    }
    return error;
  };

  const NAV = {
    fondateur: [["dashboard", "Tableau de bord", LayoutDashboard], ["announcements", "Annonces", Megaphone], ["students", "Élèves", Users], ["expenses", "Dépenses", Receipt], ["lessons", "Devoirs", BookOpen], ["grades", "Notes", ClipboardList]],
    comptable: [["students", "Élèves & Paiements", Users], ["expenses", "Dépenses", Receipt], ["dashboard", "Statistiques", LayoutDashboard]],
    enseignant: [["lessons", "Devoirs", BookOpen], ["grades", "Notes", ClipboardList], ["students", "Élèves", Users]],
    parent: [["dashboard", "Mes enfants", GraduationCap], ["lessons", "Devoirs", BookOpen], ["announcements", "Annonces", Megaphone]],
  }[role];
  const NAV_FULL = profile.is_admin ? [...NAV, ["admin", "Administration", Shield]] : NAV;

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
          {NAV_FULL.map(([key, label, Icon]) => (
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
        {NAV_FULL.map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)} className="p-2 rounded-lg" style={{ color: tab === key ? COLORS.ink : COLORS.inkSoft }}><Icon size={20} /></button>
        ))}
        <button onClick={() => supabase.auth.signOut()} className="p-2 rounded-lg" style={{ color: COLORS.inkSoft }}><LogOut size={20} /></button>
      </div>

      <main className="flex-1 p-5 md:p-10 pb-20 md:pb-10 max-w-5xl mx-auto w-full">
        {tab === "dashboard" && role === "parent" && <ParentChildrenView children={myChildren} paidByStudent={paidByStudent} currency={currency} payments={payments} onRelink={relinkSelf} grades={grades} />}
        {tab === "dashboard" && role !== "parent" && <DashboardView stats={stats} currency={currency} schoolCode={profile.schools?.code} role={role} />}
        {tab === "students" && (role === "comptable" || role === "fondateur") && (
          <StudentsView students={students} paidByStudent={paidByStudent} currency={currency} readOnly={role === "fondateur"} parents={parents} subscribed={profile.schools?.subscribed} studentLimit={profile.schools?.student_limit || 10} onAdd={() => setModal("student")} onDelete={deleteStudent} onPay={() => setModal("payment")} onLink={(s) => setLinkingStudent(s)} />
        )}
        {tab === "students" && role === "enseignant" && <StudentsReadOnlyView students={students} />}
        {tab === "lessons" && (role === "enseignant" || role === "fondateur") && (
          <LessonsTeacherView lessons={lessons} students={students} homework={homework} readOnly={role === "fondateur"} onAdd={() => setModal("lesson")} onDelete={deleteLesson} onToggle={toggleHomework} />
        )}
        {tab === "lessons" && role === "parent" && <LessonsParentView lessons={lessons} children={myChildren} homework={homework} onToggle={toggleHomework} />}
        {tab === "expenses" && (role === "comptable" || role === "fondateur") && (
          <ExpensesView expenses={expenses} currency={currency} readOnly={role !== "comptable"} onAdd={() => setModal("expense")} onDelete={deleteExpense} />
        )}
        {tab === "grades" && (role === "enseignant" || role === "fondateur") && (
          <GradesView students={students} grades={grades} readOnly={role === "fondateur"} onSave={saveGrade} />
        )}
        {tab === "announcements" && (
          <AnnouncementsView announcements={announcements} canWrite={role === "fondateur"} onAdd={() => setModal("announcement")} onDelete={deleteAnnouncement} />
        )}
        {tab === "admin" && profile.is_admin && <AdminView />}
      </main>

      {modal === "student" && <StudentModal onClose={() => setModal(null)} onSave={addStudent} />}
      {modal === "payment" && <PaymentModal students={students} currency={currency} onClose={() => setModal(null)} onSave={addPayment} />}
      {modal === "lesson" && <LessonModal onClose={() => setModal(null)} onSave={addLesson} />}
      {modal === "announcement" && <AnnouncementModal onClose={() => setModal(null)} onSave={addAnnouncement} />}
      {linkingStudent && (
        <LinkParentModal
          student={linkingStudent}
          parents={parents}
          onClose={() => setLinkingStudent(null)}
          onSave={async (parentId) => { await linkParent(linkingStudent.id, parentId); setLinkingStudent(null); }}
        />
      )}
      {modal === "expense" && <ExpenseModal onClose={() => setModal(null)} onSave={addExpense} />}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}

// ---------- Shared UI ----------
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(32,48,74,0.45)" }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" style={{ background: COLORS.card }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: COLORS.line }}>
          <h3 className="text-lg font-bold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{title}</h3>
          <button onClick={onClose} style={{ color: COLORS.inkSoft }}><X size={20} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
function FieldLabel({ children }) { return <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>{children}</label>; }
function EmptyState({ text }) { return <div className="py-10 text-center text-sm" style={{ color: COLORS.inkSoft }}>{text}</div>; }
function AddButton({ onClick, label }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-sm" style={{ background: COLORS.primary, color: "#fff" }}>
      <Plus size={16} /> {label}
    </button>
  );
}

// ---------- Dashboard (fondateur / comptable) ----------
function DashboardView({ stats, currency, schoolCode, role }) {
  const [copied, setCopied] = useState(false);
  const copyCode = () => {
    navigator.clipboard?.writeText(schoolCode || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div>
      <h1 className="text-3xl mb-1 font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Tableau de bord</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>Vue d'ensemble de votre école.</p>

      {role === "fondateur" && schoolCode && (
        <button onClick={copyCode} className="w-full flex items-center justify-between px-4 py-3 rounded-xl mb-6" style={{ background: COLORS.primarySoft }}>
          <div className="text-left">
            <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: COLORS.primary }}>Code de l'école — à partager</div>
            <div className="text-xl font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{schoolCode}</div>
          </div>
          <span className="text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ background: "#fff", color: COLORS.primary }}>
            <Copy size={13} /> {copied ? "Copié !" : "Copier"}
          </span>
        </button>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard icon={Users} label="Élèves inscrits" value={stats.nbEleves} color={COLORS.ink} bg={COLORS.line} />
        <StatCard icon={TrendingUp} label="Total collecté" value={fmt(stats.totalPaid, currency)} color={COLORS.positive} bg={COLORS.positiveSoft} />
        <StatCard icon={TrendingDown} label="Total dépenses" value={fmt(stats.totalExpenses, currency)} color={COLORS.negative} bg={COLORS.negativeSoft} />
        <StatCard icon={AlertTriangle} label="Reste à payer (élèves)" value={fmt(stats.reste, currency)} color={COLORS.primary} bg={COLORS.primarySoft} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={Wallet} label="Solde net (collecté − dépenses)" value={fmt(stats.solde, currency)} color={stats.solde >= 0 ? COLORS.positive : COLORS.negative} bg={stats.solde >= 0 ? COLORS.positiveSoft : COLORS.negativeSoft} />
        <StatCard icon={BookOpen} label="Devoirs publiés" value={stats.nbDevoirs} color={COLORS.primary} bg={COLORS.primarySoft} />
      </div>
    </div>
  );
}
function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: bg }}><Icon size={18} style={{ color }} /></div>
      <div className="text-xs uppercase tracking-wider mb-1" style={{ color: COLORS.inkSoft }}>{label}</div>
      <div className="text-xl font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{value}</div>
    </div>
  );
}

// ---------- Élèves & Paiements (comptable) ----------
function StudentsView({ students, paidByStudent, currency, readOnly, parents, subscribed, studentLimit, onAdd, onDelete, onPay, onLink }) {
  const [selectedClass, setSelectedClass] = useState(null); // { level, className } | null
  const [search, setSearch] = useState("");

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

  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.trim().toLowerCase();
    return students.filter((s) => s.full_name.toLowerCase().includes(q));
  }, [search, students]);

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

  const renderStudentTable = (classStudents, className) => {
    const classTotalDue = classStudents.reduce((s, st) => s + Number(st.total_due), 0);
    const classTotalPaid = classStudents.reduce((s, st) => s + (paidByStudent[st.id] || 0), 0);
    return (
      <div className="rounded-2xl overflow-x-auto" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
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
                    <div className="text-xs font-normal mt-0.5" style={{ color: s.parent_id ? COLORS.positive : COLORS.primary }}>
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
            <tr style={{ borderTop: `2px solid ${COLORS.line}`, background: COLORS.paper }}>
              <td className="px-4 py-2.5 font-bold text-xs uppercase tracking-wide" style={{ color: COLORS.ink }}>Total {className}</td>
              <td className="px-4 py-2.5 text-right font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.positive }}>{fmt(classTotalPaid, currency)}</td>
              <td className="px-4 py-2.5 text-right font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: classTotalDue - classTotalPaid > 0 ? COLORS.negative : COLORS.positive }}>{fmt(classTotalDue - classTotalPaid, currency)}</td>
              {!readOnly && <td></td>}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Élèves & Paiements</h1>
          <p style={{ color: COLORS.inkSoft }}>Clique sur une classe pour voir sa liste.</p>
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
        <div className="rounded-xl px-4 py-3 mb-4 text-sm flex items-center justify-between flex-wrap gap-2" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>
          <span>Essai gratuit : <b>{students.length}/{studentLimit}</b> élèves utilisés</span>
        </div>
      )}

      <div className="relative mb-5">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedClass(null); }}
          placeholder="Rechercher un élève par nom..."
          className="w-full px-4 py-3 rounded-xl outline-none text-sm"
          style={inputStyle}
        />
      </div>

      {students.length === 0 ? (
        <div className="rounded-2xl p-10" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}><EmptyState text="Aucun élève enregistré." /></div>
      ) : searchResults ? (
        searchResults.length === 0 ? (
          <EmptyState text={`Aucun élève trouvé pour "${search}".`} />
        ) : (
          renderStudentTable(searchResults, `Résultats pour "${search}"`)
        )
      ) : selectedClass ? (
        <div>
          <button onClick={() => setSelectedClass(null)} className="text-sm font-medium mb-4" style={{ color: COLORS.primary }}>← Retour aux classes</button>
          {renderStudentTable(grouped[selectedClass.level][selectedClass.className], `${selectedClass.className} · ${selectedClass.level}`)}
        </div>
      ) : (
        <div className="space-y-6">
          {LEVELS.filter((lvl) => Object.keys(grouped[lvl]).length > 0).map((lvl) => (
            <div key={lvl}>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: COLORS.primary, fontFamily: "'Manrope', sans-serif" }}>{lvl}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(grouped[lvl]).map(([className, classStudents]) => {
                  const dueSum = classStudents.reduce((s, st) => s + Number(st.total_due), 0);
                  const paidSum = classStudents.reduce((s, st) => s + (paidByStudent[st.id] || 0), 0);
                  const resteSum = dueSum - paidSum;
                  return (
                    <button
                      key={className}
                      onClick={() => setSelectedClass({ level: lvl, className })}
                      className="text-left rounded-2xl p-4"
                      style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}
                    >
                      <div className="font-bold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{className}</div>
                      <div className="text-xs mb-2" style={{ color: COLORS.inkSoft }}>{classStudents.length} élève{classStudents.length > 1 ? "s" : ""}</div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: COLORS.positive }}>{fmt(paidSum, currency)} payé</span>
                        <span style={{ color: resteSum > 0 ? COLORS.negative : COLORS.positive }}>{fmt(resteSum, currency)} reste</span>
                      </div>
                    </button>
                  );
                })}
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

// ---------- Administration (réservé aux administrateurs de la plateforme) ----------
function AdminView() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from("schools").select("*").order("created_at", { ascending: false });
    if (data) setSchools(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleSubscription = async (school) => {
    setSavingId(school.id);
    const newSubscribed = !school.subscribed;
    const { data, error } = await supabase
      .from("schools")
      .update({ subscribed: newSubscribed, student_limit: newSubscribed ? 999999 : 10 })
      .eq("id", school.id)
      .select();
    if (data) setSchools((prev) => prev.map((s) => (s.id === school.id ? data[0] : s)));
    if (error) alert("Erreur : " + error.message);
    setSavingId(null);
  };

  const setTier = async (school, tier) => {
    setSavingId(school.id);
    const { data, error } = await supabase
      .from("schools")
      .update({ subscribed: true, student_limit: tier.limit })
      .eq("id", school.id)
      .select();
    if (data) setSchools((prev) => prev.map((s) => (s.id === school.id ? data[0] : s)));
    if (error) alert("Erreur : " + error.message);
    setSavingId(null);
  };

  if (loading) return <div className="py-10 flex justify-center"><Loader2 className="animate-spin" size={24} style={{ color: COLORS.ink }} /></div>;

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Administration</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>Gère les abonnements de toutes les écoles sur la plateforme.</p>

      {schools.length === 0 ? (
        <EmptyState text="Aucune école pour l'instant." />
      ) : (
        <div className="space-y-3">
          {schools.map((s) => (
            <div key={s.id} className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                <div>
                  <div className="font-bold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{s.name}</div>
                  <div className="text-xs" style={{ color: COLORS.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>Code: {s.code}</div>
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: s.subscribed ? COLORS.positiveSoft : COLORS.primarySoft, color: s.subscribed ? COLORS.positive : COLORS.primary }}
                >
                  {s.subscribed ? "Abonné" : "Essai gratuit"}
                </span>
              </div>
              <div className="text-xs mb-3" style={{ color: COLORS.inkSoft }}>Limite actuelle : {s.student_limit >= 999999 ? "Illimité" : s.student_limit} élèves</div>
              <div className="flex flex-wrap gap-2">
                {PRICING_TIERS.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setTier(s, t)}
                    disabled={savingId === s.id}
                    className="text-xs font-medium px-3 py-2 rounded-lg"
                    style={{ background: COLORS.paper, color: COLORS.ink, border: `1px solid ${COLORS.line}` }}
                  >
                    Activer "{t.name}" ({fmt(t.price, "GNF")})
                  </button>
                ))}
                <button
                  onClick={() => toggleSubscription(s)}
                  disabled={savingId === s.id}
                  className="text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5"
                  style={{ background: s.subscribed ? COLORS.negativeSoft : COLORS.positiveSoft, color: s.subscribed ? COLORS.negative : COLORS.positive }}
                >
                  {savingId === s.id && <Loader2 className="animate-spin" size={12} />}
                  {s.subscribed ? "Repasser en essai gratuit" : "Activer sans palier précis"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// ---------- Notes (enseignant) ----------
function GradesView({ students, grades, readOnly, onSave }) {
  const classNames = useMemo(() => [...new Set(students.map((s) => s.class_name))].sort(), [students]);
  const [className, setClassName] = useState(classNames[0] || "");
  const [newSubject, setNewSubject] = useState("");
  const [ranked, setRanked] = useState(false);
  const [saving, setSaving] = useState(null);

  const classStudents = useMemo(() => students.filter((s) => s.class_name === className), [students, className]);
  const classGrades = useMemo(() => grades.filter((g) => g.class_name === className), [grades, className]);
  const subjects = useMemo(() => [...new Set(classGrades.map((g) => g.subject))].sort(), [classGrades]);

  const getScore = (studentId, subject) => classGrades.find((g) => g.student_id === studentId && g.subject === subject)?.score;

  const rows = useMemo(() => {
    const computed = classStudents.map((s) => {
      const scores = subjects.map((subj) => getScore(s.id, subj)).filter((v) => v !== null && v !== undefined && v !== "");
      const total = scores.reduce((sum, v) => sum + Number(v), 0);
      const moyenne = scores.length > 0 ? total / scores.length : null;
      return { student: s, total, moyenne };
    });
    if (ranked) {
      return [...computed].sort((a, b) => (b.moyenne ?? -Infinity) - (a.moyenne ?? -Infinity));
    }
    return computed;
  }, [classStudents, subjects, classGrades, ranked]);

  const addSubject = () => {
    if (!newSubject.trim()) return;
    setNewSubject("");
    onSave(classStudents[0]?.id, newSubject.trim(), null);
  };

  const summaryStats = useMemo(() => {
    const byGender = (predicate) => {
      const garcons = classStudents.filter((s) => s.gender === "Garçon" && predicate(s)).length;
      const filles = classStudents.filter((s) => s.gender === "Fille" && predicate(s)).length;
      return { garcons, filles, total: garcons + filles };
    };
    const hasComposed = (s) => classGrades.some((g) => g.student_id === s.id && g.score !== null && g.score !== undefined);
    const moyenneOf = (s) => rows.find((r) => r.student.id === s.id)?.moyenne;
    const isAdmis = (s) => { const m = moyenneOf(s); return m !== null && m !== undefined && m >= PASS_THRESHOLD; };
    const isEchoue = (s) => { const m = moyenneOf(s); return m !== null && m !== undefined && m < PASS_THRESHOLD; };

    const inscrits = byGender(() => true);
    const composes = byGender(hasComposed);
    const admis = byGender(isAdmis);
    const echoues = byGender(isEchoue);
    const abandons = byGender((s) => s.status === "Abandonné");

    const avgOf = (gender) => {
      const vals = classStudents.filter((s) => s.gender === gender).map(moyenneOf).filter((v) => v !== null && v !== undefined);
      return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    };
    const pct = (part, total) => (total > 0 ? ((part / total) * 100).toFixed(1) : "—");

    return {
      inscrits, composes, admis, echoues, abandons,
      moyenneG: avgOf("Garçon"), moyenneF: avgOf("Fille"),
      admisPctG: pct(admis.garcons, composes.garcons), admisPctF: pct(admis.filles, composes.filles), admisPctT: pct(admis.total, composes.total),
      echouePctG: pct(echoues.garcons, composes.garcons), echouePctF: pct(echoues.filles, composes.filles), echouePctT: pct(echoues.total, composes.total),
    };
  }, [classStudents, classGrades, rows]);

  const subjectStats = useMemo(() => {
    return subjects.map((subj) => {
      const withScore = (gender) => classStudents.filter((s) => s.gender === gender && getScore(s.id, subj) !== null && getScore(s.id, subj) !== undefined);
      const passing = (gender) => withScore(gender).filter((s) => getScore(s.id, subj) >= PASS_THRESHOLD);
      const g = withScore("Garçon").length, f = withScore("Fille").length;
      const pg = passing("Garçon").length, pf = passing("Fille").length;
      const pct = (part, total) => (total > 0 ? ((part / total) * 100).toFixed(1) : "—");
      return { subject: subj, g, f, total: g + f, pg, pf, pt: pg + pf, pctG: pct(pg, g), pctF: pct(pf, f), pctT: pct(pg + pf, g + f) };
    });
  }, [subjects, classStudents, classGrades]);

  const exportExcel = () => {
    const rowsCsv = [["Élève", "Sexe", ...subjects, "Total", "Moyenne"]];
    rows.forEach((r) => {
      rowsCsv.push([r.student.full_name, r.student.gender || "—", ...subjects.map((s) => getScore(r.student.id, s) ?? ""), r.total.toFixed(1), r.moyenne !== null ? r.moyenne.toFixed(2) : ""]);
    });
    rowsCsv.push([]);
    rowsCsv.push(["Statistiques", "Garçons", "Filles", "Total"]);
    rowsCsv.push(["Inscrits", summaryStats.inscrits.garcons, summaryStats.inscrits.filles, summaryStats.inscrits.total]);
    rowsCsv.push(["Ont composé", summaryStats.composes.garcons, summaryStats.composes.filles, summaryStats.composes.total]);
    rowsCsv.push(["Moyenne", summaryStats.moyenneG?.toFixed(2) ?? "—", summaryStats.moyenneF?.toFixed(2) ?? "—", ""]);
    rowsCsv.push(["Admis", summaryStats.admis.garcons, summaryStats.admis.filles, summaryStats.admis.total]);
    rowsCsv.push(["% Admis", summaryStats.admisPctG, summaryStats.admisPctF, summaryStats.admisPctT]);
    rowsCsv.push(["Échoués", summaryStats.echoues.garcons, summaryStats.echoues.filles, summaryStats.echoues.total]);
    rowsCsv.push(["% Échoués", summaryStats.echouePctG, summaryStats.echouePctF, summaryStats.echouePctT]);
    rowsCsv.push(["Abandonnés", summaryStats.abandons.garcons, summaryStats.abandons.filles, summaryStats.abandons.total]);
    rowsCsv.push([]);
    rowsCsv.push(["Par matière", "Garçons ayant la moyenne", "Filles ayant la moyenne", "% Garçons", "% Filles", "% Total"]);
    subjectStats.forEach((s) => rowsCsv.push([s.subject, `${s.pg}/${s.g}`, `${s.pf}/${s.f}`, s.pctG, s.pctF, s.pctT]));

    const csv = rowsCsv.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notes_${className}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };


  const handleChange = async (studentId, subject, value) => {
    setSaving(`${studentId}-${subject}`);
    const score = value === "" ? null : parseFloat(value);
    await onSave(studentId, subject, score);
    setSaving(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Notes</h1>
        <div className="flex gap-2 flex-wrap">
          <button onClick={exportExcel} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-sm" style={{ background: "#fff", color: COLORS.ink, border: `1px solid ${COLORS.line}` }}>
            <FileSpreadsheet size={16} /> Exporter (Excel)
          </button>
          {!readOnly && (
            <button
              onClick={() => setRanked((r) => !r)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-sm"
              style={{ background: ranked ? COLORS.primary : COLORS.ink, color: "#fff" }}
            >
              <ArrowDownWideNarrow size={16} /> {ranked ? "Classement actif" : "Classer"}
            </button>
          )}
        </div>
      </div>
      <p className="mb-5" style={{ color: COLORS.inkSoft }}>Saisis les notes par matière — total et moyenne calculés automatiquement.</p>

      <div className="mb-5">
        <FieldLabel>Classe</FieldLabel>
        <select value={className} onChange={(e) => { setClassName(e.target.value); setRanked(false); }} className="w-full sm:w-64 px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
          {classNames.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {!readOnly && (
        <div className="flex gap-2 mb-5">
          <input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Ajouter une matière (ex: Mathématiques)" className="flex-1 px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
          <button onClick={addSubject} className="px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-1.5" style={{ background: COLORS.primary, color: "#fff" }}><Plus size={16} /> Matière</button>
        </div>
      )}

      {classStudents.length === 0 ? (
        <EmptyState text="Aucun élève dans cette classe." />
      ) : subjects.length === 0 ? (
        <EmptyState text="Aucune matière ajoutée pour l'instant." />
      ) : (
        <div className="rounded-2xl overflow-x-auto" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: COLORS.paper }}>
                {ranked && <th className="text-left px-3 py-3 font-semibold" style={{ color: COLORS.inkSoft }}>Rang</th>}
                <th className="text-left px-4 py-3 font-semibold whitespace-nowrap" style={{ color: COLORS.inkSoft }}>Élève</th>
                {subjects.map((subj) => (
                  <th key={subj} className="text-center px-3 py-3 font-semibold whitespace-nowrap" style={{ color: COLORS.inkSoft }}>{subj}</th>
                ))}
                <th className="text-center px-3 py-3 font-semibold" style={{ color: COLORS.ink }}>Total</th>
                <th className="text-center px-3 py-3 font-semibold" style={{ color: COLORS.ink }}>Moyenne</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.student.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${COLORS.line}` }}>
                  {ranked && <td className="px-3 py-2.5 font-bold" style={{ color: COLORS.primary, fontFamily: "'IBM Plex Mono', monospace" }}>{i + 1}</td>}
                  <td className="px-4 py-2.5 font-medium whitespace-nowrap" style={{ color: COLORS.ink }}>{row.student.full_name}</td>
                  {subjects.map((subj) => {
                    const key = `${row.student.id}-${subj}`;
                    const val = getScore(row.student.id, subj);
                    return (
                      <td key={subj} className="px-2 py-2 text-center">
                        {readOnly ? (
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{val ?? "—"}</span>
                        ) : (
                          <input
                            type="number"
                            defaultValue={val ?? ""}
                            onBlur={(e) => handleChange(row.student.id, subj, e.target.value)}
                            className="w-16 px-2 py-1.5 rounded-lg text-center outline-none text-sm"
                            style={{ ...inputStyle, opacity: saving === key ? 0.5 : 1 }}
                          />
                        )}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2.5 text-center font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{row.total.toFixed(1)}</td>
                  <td className="px-3 py-2.5 text-center font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.primary }}>{row.moyenne !== null ? row.moyenne.toFixed(2) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subjects.length > 0 && classStudents.length > 0 && (
        <>
          <h2 className="text-xl font-bold mt-8 mb-3" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Tableau statistique — {className}</h2>
          <div className="rounded-2xl overflow-x-auto mb-8" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: COLORS.paper }}>
                  <th className="text-left px-4 py-2.5 font-semibold" style={{ color: COLORS.inkSoft }}></th>
                  <th className="text-center px-3 py-2.5 font-semibold" style={{ color: COLORS.inkSoft }}>Garçons</th>
                  <th className="text-center px-3 py-2.5 font-semibold" style={{ color: COLORS.inkSoft }}>Filles</th>
                  <th className="text-center px-3 py-2.5 font-semibold" style={{ color: COLORS.ink }}>Total</th>
                </tr>
              </thead>
              <tbody style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                <tr style={{ borderTop: `1px solid ${COLORS.line}` }}>
                  <td className="px-4 py-2 font-sans font-medium" style={{ color: COLORS.ink }}>Inscrits</td>
                  <td className="text-center px-3 py-2">{summaryStats.inscrits.garcons}</td>
                  <td className="text-center px-3 py-2">{summaryStats.inscrits.filles}</td>
                  <td className="text-center px-3 py-2 font-bold">{summaryStats.inscrits.total}</td>
                </tr>
                <tr style={{ borderTop: `1px solid ${COLORS.line}` }}>
                  <td className="px-4 py-2 font-sans font-medium" style={{ color: COLORS.ink }}>Ont composé</td>
                  <td className="text-center px-3 py-2">{summaryStats.composes.garcons}</td>
                  <td className="text-center px-3 py-2">{summaryStats.composes.filles}</td>
                  <td className="text-center px-3 py-2 font-bold">{summaryStats.composes.total}</td>
                </tr>
                <tr style={{ borderTop: `1px solid ${COLORS.line}` }}>
                  <td className="px-4 py-2 font-sans font-medium" style={{ color: COLORS.ink }}>Moyenne</td>
                  <td className="text-center px-3 py-2">{summaryStats.moyenneG?.toFixed(2) ?? "—"}</td>
                  <td className="text-center px-3 py-2">{summaryStats.moyenneF?.toFixed(2) ?? "—"}</td>
                  <td className="text-center px-3 py-2"></td>
                </tr>
                <tr style={{ borderTop: `1px solid ${COLORS.line}` }}>
                  <td className="px-4 py-2 font-sans font-medium" style={{ color: COLORS.positive }}>Admis</td>
                  <td className="text-center px-3 py-2" style={{ color: COLORS.positive }}>{summaryStats.admis.garcons}</td>
                  <td className="text-center px-3 py-2" style={{ color: COLORS.positive }}>{summaryStats.admis.filles}</td>
                  <td className="text-center px-3 py-2 font-bold" style={{ color: COLORS.positive }}>{summaryStats.admis.total}</td>
                </tr>
                <tr style={{ borderTop: `1px solid ${COLORS.line}` }}>
                  <td className="px-4 py-2 font-sans font-medium" style={{ color: COLORS.positive }}>% Admis</td>
                  <td className="text-center px-3 py-2" style={{ color: COLORS.positive }}>{summaryStats.admisPctG}%</td>
                  <td className="text-center px-3 py-2" style={{ color: COLORS.positive }}>{summaryStats.admisPctF}%</td>
                  <td className="text-center px-3 py-2 font-bold" style={{ color: COLORS.positive }}>{summaryStats.admisPctT}%</td>
                </tr>
                <tr style={{ borderTop: `1px solid ${COLORS.line}` }}>
                  <td className="px-4 py-2 font-sans font-medium" style={{ color: COLORS.negative }}>Échoués</td>
                  <td className="text-center px-3 py-2" style={{ color: COLORS.negative }}>{summaryStats.echoues.garcons}</td>
                  <td className="text-center px-3 py-2" style={{ color: COLORS.negative }}>{summaryStats.echoues.filles}</td>
                  <td className="text-center px-3 py-2 font-bold" style={{ color: COLORS.negative }}>{summaryStats.echoues.total}</td>
                </tr>
                <tr style={{ borderTop: `1px solid ${COLORS.line}` }}>
                  <td className="px-4 py-2 font-sans font-medium" style={{ color: COLORS.negative }}>% Échoués</td>
                  <td className="text-center px-3 py-2" style={{ color: COLORS.negative }}>{summaryStats.echouePctG}%</td>
                  <td className="text-center px-3 py-2" style={{ color: COLORS.negative }}>{summaryStats.echouePctF}%</td>
                  <td className="text-center px-3 py-2 font-bold" style={{ color: COLORS.negative }}>{summaryStats.echouePctT}%</td>
                </tr>
                <tr style={{ borderTop: `1px solid ${COLORS.line}` }}>
                  <td className="px-4 py-2 font-sans font-medium" style={{ color: COLORS.inkSoft }}>Abandonnés</td>
                  <td className="text-center px-3 py-2">{summaryStats.abandons.garcons}</td>
                  <td className="text-center px-3 py-2">{summaryStats.abandons.filles}</td>
                  <td className="text-center px-3 py-2 font-bold">{summaryStats.abandons.total}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Résultats par matière</h2>
          <div className="rounded-2xl overflow-x-auto" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: COLORS.paper }}>
                  <th className="text-left px-4 py-2.5 font-semibold" style={{ color: COLORS.inkSoft }}>Matière</th>
                  <th className="text-center px-3 py-2.5 font-semibold" style={{ color: COLORS.inkSoft }}>Garçons ≥ {PASS_THRESHOLD}</th>
                  <th className="text-center px-3 py-2.5 font-semibold" style={{ color: COLORS.inkSoft }}>Filles ≥ {PASS_THRESHOLD}</th>
                  <th className="text-center px-3 py-2.5 font-semibold" style={{ color: COLORS.ink }}>% Garçons</th>
                  <th className="text-center px-3 py-2.5 font-semibold" style={{ color: COLORS.ink }}>% Filles</th>
                  <th className="text-center px-3 py-2.5 font-semibold" style={{ color: COLORS.ink }}>% Total</th>
                </tr>
              </thead>
              <tbody style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                {subjectStats.map((s, i) => (
                  <tr key={s.subject} style={{ borderTop: i === 0 ? "none" : `1px solid ${COLORS.line}` }}>
                    <td className="px-4 py-2 font-sans font-medium" style={{ color: COLORS.ink }}>{s.subject}</td>
                    <td className="text-center px-3 py-2">{s.pg}/{s.g}</td>
                    <td className="text-center px-3 py-2">{s.pf}/{s.f}</td>
                    <td className="text-center px-3 py-2 font-bold" style={{ color: COLORS.primary }}>{s.pctG}%</td>
                    <td className="text-center px-3 py-2 font-bold" style={{ color: COLORS.primary }}>{s.pctF}%</td>
                    <td className="text-center px-3 py-2 font-bold" style={{ color: COLORS.primary }}>{s.pctT}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function ExpensesView({ expenses, currency, readOnly, onAdd, onDelete }) {
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const byCategory = useMemo(() => {
    const map = {};
    expenses.forEach((e) => { map[e.category] = (map[e.category] || 0) + Number(e.amount); });
    return map;
  }, [expenses]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Dépenses</h1>
          <p style={{ color: COLORS.inkSoft }}>Salaires, factures, fournitures et autres sorties d'argent.</p>
        </div>
        {!readOnly && <AddButton onClick={onAdd} label="Ajouter" />}
      </div>

      <div className="rounded-2xl p-5 mb-5" style={{ background: COLORS.ink }}>
        <div className="text-xs uppercase tracking-widest mb-1" style={{ color: "#fff", opacity: 0.6 }}>Total des dépenses</div>
        <div className="text-3xl font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#fff" }}>{fmt(total, currency)}</div>
        {Object.keys(byCategory).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {Object.entries(byCategory).map(([cat, amt]) => (
              <span key={cat} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}>{cat}: {fmt(amt, currency)}</span>
            ))}
          </div>
        )}
      </div>

      {expenses.length === 0 ? (
        <div className="rounded-2xl p-10" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}><EmptyState text="Aucune dépense enregistrée." /></div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          {expenses.map((e, i) => (
            <div key={e.id} className="flex items-center justify-between px-5 py-4" style={{ borderTop: i === 0 ? "none" : `1px solid ${COLORS.line}` }}>
              <div className="min-w-0">
                <div className="font-medium truncate" style={{ color: COLORS.ink }}>{e.description || e.category}</div>
                <div className="text-xs" style={{ color: COLORS.inkSoft }}>{e.category} · {new Date(e.date).toLocaleDateString("fr-FR")}</div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.negative }}>−{fmt(e.amount, currency)}</div>
                <button onClick={() => onDelete(e.id)} style={{ color: COLORS.inkSoft }}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


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
function ParentChildrenView({ children, paidByStudent, currency, payments, onRelink, grades }) {
  const [relinking, setRelinking] = useState(false);
  const [message, setMessage] = useState("");

  const relink = async () => {
    setRelinking(true);
    setMessage("");
    const count = await onRelink();
    setMessage(count > 0 ? `${count} enfant(s) lié(s) !` : "Aucun nouvel enfant trouvé avec ton numéro.");
    setRelinking(false);
  };

  return (
    <div>
      <div className="flex items-start justify-between flex-wrap gap-3 mb-1">
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Mes enfants</h1>
        <button onClick={relink} disabled={relinking} className="text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>
          {relinking && <Loader2 className="animate-spin" size={12} />} Rechercher mes enfants
        </button>
      </div>
      <p className="mb-2" style={{ color: COLORS.inkSoft }}>Suivi scolaire et financier.</p>
      {message && <p className="text-sm mb-4" style={{ color: COLORS.positive }}>{message}</p>}
      {children.length === 0 ? (
        <div className="rounded-2xl p-10" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <EmptyState text="Aucun enfant lié à votre compte pour l'instant. Demandez au comptable ou au fondateur de l'école de vous associer à votre enfant." />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {children.map((c) => {
            const paid = paidByStudent[c.id] || 0;
            const reste = Number(c.total_due) - paid;
            const childPayments = payments.filter((p) => p.student_id === c.id).sort((a, b) => new Date(b.date) - new Date(a.date));
            return (
              <div key={c.id} className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                <div className="font-bold text-lg mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{c.full_name}</div>
                <div className="text-sm mb-3" style={{ color: COLORS.inkSoft }}>{c.class_name}</div>
                <div className="flex justify-between text-sm"><span style={{ color: COLORS.inkSoft }}>Payé</span><span style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.positive }}>{fmt(paid, currency)}</span></div>
                <div className="flex justify-between text-sm mt-1"><span style={{ color: COLORS.inkSoft }}>Reste</span><span style={{ fontFamily: "'IBM Plex Mono', monospace", color: reste > 0 ? COLORS.negative : COLORS.positive }}>{fmt(reste, currency)}</span></div>

                {(() => {
                  const childGrades = grades.filter((g) => g.student_id === c.id && g.score !== null && g.score !== undefined);
                  if (childGrades.length === 0) return null;
                  const avg = childGrades.reduce((s, g) => s + Number(g.score), 0) / childGrades.length;
                  return (
                    <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${COLORS.line}` }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.inkSoft }}>Notes</div>
                        <span className="text-xs font-bold" style={{ color: COLORS.primary, fontFamily: "'IBM Plex Mono', monospace" }}>Moyenne: {avg.toFixed(2)}</span>
                      </div>
                      <div className="space-y-1.5">
                        {childGrades.map((g) => (
                          <div key={g.id} className="flex items-center justify-between text-xs px-2.5 py-2 rounded-lg" style={{ background: COLORS.paper }}>
                            <span style={{ color: COLORS.inkSoft }}>{g.subject}</span>
                            <span className="font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{g.score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {childPayments.length > 0 && (
                  <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${COLORS.line}` }}>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.inkSoft }}>Reçus de paiement</div>
                    <div className="space-y-1.5">
                      {childPayments.map((p) => (
                        <div key={p.id} className="flex items-center justify-between text-xs px-2.5 py-2 rounded-lg" style={{ background: COLORS.paper }}>
                          <span style={{ color: COLORS.inkSoft }}>
                            <Check size={12} style={{ display: "inline", marginRight: 4, color: COLORS.positive }} />
                            {new Date(p.date).toLocaleDateString("fr-FR")}
                          </span>
                          <span className="font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.positive }}>{fmt(p.amount, currency)}</span>
                        </div>
                      ))}
                    </div>
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
  const [parentPhone, setParentPhone] = useState("");
  const [gender, setGender] = useState("Garçon");
  const submit = async () => { if (!fullName.trim() || !className.trim()) return; await onSave({ full_name: fullName.trim(), level, class_name: className.trim(), total_due: parseFloat(totalDue) || 0, parent_phone: parentPhone.trim() || null, gender }); onClose(); };
  return (
    <Modal title="Nouvel élève" onClose={onClose}>
      <div className="space-y-4">
        <div><FieldLabel>Nom complet</FieldLabel><input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        <div>
          <FieldLabel>Sexe</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            {["Garçon", "Fille"].map((g) => (
              <button key={g} onClick={() => setGender(g)} className="px-3 py-2 rounded-lg text-sm font-medium" style={{ background: gender === g ? COLORS.ink : "#fff", color: gender === g ? "#fff" : COLORS.inkSoft, border: `1px solid ${gender === g ? COLORS.ink : COLORS.line}` }}>{g}</button>
            ))}
          </div>
        </div>
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
        <div>
          <FieldLabel>Téléphone du parent (optionnel)</FieldLabel>
          <input type="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="Ex: 622 00 00 00" className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
          <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>Dès que ce parent créera son compte avec ce numéro, il sera lié automatiquement à cet élève.</p>
        </div>
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
                <div className="text-xs" style={{ color: COLORS.inkSoft }}>{t.yearly ? "/ an" : "/ mois"}</div>
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
            Envoie le montant de la formule choisie à ce numéro, puis contacte l'équipe pour activer ton abonnement.
          </p>
          <button onClick={copyNumber} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: "#fff" }}>
            <span className="font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{ORANGE_MONEY_NUMBER}</span>
            <span className="text-xs font-medium flex items-center gap-1" style={{ color: COLORS.primary }}><Copy size={13} /> {copied ? "Copié !" : "Copier"}</span>
          </button>
        </div>
        <button onClick={onClose} className="w-full py-3 rounded-lg font-semibold" style={{ background: COLORS.ink, color: "#fff" }}>Fermer</button>
      </div>
    </Modal>
  );
}

function ExpenseModal({ onClose, onSave }) {
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!amount || isNaN(parseFloat(amount))) { setError("Renseigne un montant valide."); return; }
    const err = await onSave({ category, description: description.trim(), amount: parseFloat(amount), date });
    if (err) { setError("Erreur : " + err.message); return; }
    onClose();
  };

  return (
    <Modal title="Nouvelle dépense" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <FieldLabel>Catégorie</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            {EXPENSE_CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)} className="px-3 py-2 rounded-lg text-sm font-medium" style={{ background: category === c ? COLORS.ink : "#fff", color: category === c ? "#fff" : COLORS.inkSoft, border: `1px solid ${category === c ? COLORS.ink : COLORS.line}` }}>{c}</button>
            ))}
          </div>
        </div>
        <div><FieldLabel>Description</FieldLabel><input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Salaire M. Diallo — juillet" className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        <div><FieldLabel>Montant</FieldLabel><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        <div><FieldLabel>Date</FieldLabel><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        {error && <div className="text-sm" style={{ color: COLORS.negative }}>{error}</div>}
        <button onClick={submit} className="w-full py-3 rounded-lg font-semibold mt-2" style={{ background: COLORS.ink, color: "#fff" }}>Enregistrer</button>
      </div>
    </Modal>
  );
}

function LinkParentModal({ student, parents, onClose, onSave }) {
  const [parentId, setParentId] = useState(student.parent_id || "");
  return (
    <Modal title={`Lier un parent à ${student.full_name}`} onClose={onClose}>
      <div className="space-y-4">
        {parents.length === 0 ? (
          <p className="text-sm" style={{ color: COLORS.inkSoft }}>Aucun parent n'a encore créé de compte pour cette école. Ils doivent d'abord s'inscrire avec le code de l'école.</p>
        ) : (
          <div>
            <FieldLabel>Choisir le parent</FieldLabel>
            <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
              <option value="">— Aucun —</option>
              {parents.map((p) => <option key={p.user_id} value={p.user_id}>{p.full_name}{p.phone ? ` · ${p.phone}` : ""}</option>)}
            </select>
          </div>
        )}
        <button onClick={() => onSave(parentId)} className="w-full py-3 rounded-lg font-semibold mt-2" style={{ background: COLORS.ink, color: "#fff" }}>Enregistrer la liaison</button>
      </div>
    </Modal>
  );
}
function PaymentModal({ students, currency, onClose, onSave }) {
  const classNames = useMemo(() => [...new Set(students.map((s) => s.class_name))].sort(), [students]);
  const [className, setClassName] = useState(classNames[0] || "");
  const studentsInClass = useMemo(() => students.filter((s) => s.class_name === className), [students, className]);
  const [studentId, setStudentId] = useState(studentsInClass[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const onClassChange = (c) => {
    setClassName(c);
    const first = students.find((s) => s.class_name === c);
    setStudentId(first?.id || "");
  };

  const submit = async () => { if (!studentId || !amount) return; await onSave({ student_id: studentId, amount: parseFloat(amount), date }); onClose(); };
  return (
    <Modal title="Enregistrer un paiement" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <FieldLabel>1. Choisir la classe</FieldLabel>
          <select value={className} onChange={(e) => onClassChange(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
            {classNames.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <FieldLabel>2. Choisir l'élève ({studentsInClass.length})</FieldLabel>
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
            {studentsInClass.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </select>
        </div>
        <div><FieldLabel>Montant ({currency})</FieldLabel><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        <div><FieldLabel>Date</FieldLabel><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        <button onClick={submit} className="w-full py-3 rounded-lg font-semibold mt-2" style={{ background: COLORS.ink, color: "#fff" }}>Enregistrer</button>
      </div>
    </Modal>
  );
}
function LessonModal({ onClose, onSave }) {
  const [mode, setMode] = useState("texte"); // texte | photo
  const [className, setClassName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!className.trim() || !title.trim()) { setError("Renseigne au moins la classe et un titre."); return; }
    let attachment_url = null;
    let attachment_name = null;
    if (mode === "photo" && file) {
      setUploading(true);
      const path = `${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("homework-attachments").upload(path, file);
      setUploading(false);
      if (upErr) { setError("Échec de l'envoi du fichier: " + upErr.message); return; }
      const { data } = supabase.storage.from("homework-attachments").getPublicUrl(path);
      attachment_url = data.publicUrl;
      attachment_name = file.name;
    }
    await onSave({ class_name: className.trim(), title: title.trim(), description, due_date: dueDate || null, attachment_url, attachment_name });
    onClose();
  };

  return (
    <Modal title="Publier un devoir" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex gap-2">
          {[["texte", "Écrire le devoir"], ["photo", "Envoyer une photo/fichier"]].map(([key, label]) => (
            <button key={key} onClick={() => setMode(key)} className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ background: mode === key ? COLORS.ink : "#fff", color: mode === key ? "#fff" : COLORS.inkSoft, border: `1px solid ${mode === key ? COLORS.ink : COLORS.line}` }}>
              {label}
            </button>
          ))}
        </div>
        <div><FieldLabel>Classe</FieldLabel><input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Ex: CM2" className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        <div><FieldLabel>Titre</FieldLabel><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Exercices de conjugaison p.24" className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        {mode === "texte" ? (
          <div><FieldLabel>Description du devoir</FieldLabel><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        ) : (
          <div>
            <FieldLabel>Photo ou fichier depuis ton téléphone</FieldLabel>
            <input type="file" accept="image/*,.pdf" capture="environment" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
            <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>Prends une photo du sujet ou choisis une image/PDF dans ta galerie.</p>
          </div>
        )}
        <div><FieldLabel>À faire pour le (optionnel)</FieldLabel><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        {error && <div className="text-sm" style={{ color: COLORS.negative }}>{error}</div>}
        <button onClick={submit} disabled={uploading} className="w-full py-3 rounded-lg font-semibold mt-2 flex items-center justify-center gap-2" style={{ background: COLORS.ink, color: "#fff" }}>
          {uploading && <Loader2 className="animate-spin" size={16} />}
          Publier
        </button>
      </div>
    </Modal>
  );
}
function AnnouncementModal({ onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const submit = async () => { if (!title.trim() || !message.trim()) return; await onSave({ title: title.trim(), message: message.trim() }); onClose(); };
  return (
    <Modal title="Nouvelle annonce" onClose={onClose}>
      <div className="space-y-4">
        <div><FieldLabel>Titre</FieldLabel><input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        <div><FieldLabel>Message</FieldLabel><textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        <button onClick={submit} className="w-full py-3 rounded-lg font-semibold mt-2" style={{ background: COLORS.primary, color: "#fff" }}>Publier aux parents</button>
      </div>
    </Modal>
  );
}
