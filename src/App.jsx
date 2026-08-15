import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LayoutDashboard, Users, FileText, Megaphone, GraduationCap,
  Plus, Trash2, X, Loader2, LogOut, Check, Clock, Copy,
  Wallet, TrendingUp, AlertTriangle, BookOpen, FileSpreadsheet, Smartphone, TrendingDown, Receipt, Shield, ClipboardList, ArrowDownWideNarrow, MessageSquare, Menu, CalendarCheck,
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

const ROLE_LABELS = { fondateur: "Fondateur / Directeur", comptable: "Comptable", enseignant: "Enseignant", parent: "Parent", personnel: "Personnel (autre)" };
const SCHOOL_MONTHS = ["Octobre", "Novembre", "Décembre", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin"];
const TERM_MONTHS = { "Trimestre 1": ["Octobre", "Novembre", "Décembre"], "Trimestre 2": ["Janvier", "Février", "Mars"], "Trimestre 3": ["Avril", "Mai", "Juin"] };
const monthToTerm = (m) => Object.entries(TERM_MONTHS).find(([, months]) => months.includes(m))?.[0] || "Trimestre 1";
const LEVELS_PRIMAIRE = ["Maternelle", "Élémentaire"];
const LEVELS_SECONDAIRE = ["Collège", "Lycée"];
const getLevels = (levelType) => (levelType === "secondaire" ? LEVELS_SECONDAIRE : LEVELS_PRIMAIRE);
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
function computeAnnualGrades(allGrades, className) {
  const relevant = allGrades.filter((g) => g.class_name === className && ["Trimestre 1", "Trimestre 2", "Trimestre 3"].includes(g.term));
  const map = {};
  relevant.forEach((g) => {
    if (g.score === null || g.score === undefined) return;
    const key = g.student_id + "|" + g.subject;
    map[key] = (map[key] || 0) + Number(g.score);
  });
  return Object.entries(map).map(([key, score]) => {
    const [student_id, subject] = key.split("|");
    return { id: `annual-${key}`, student_id, subject, score, class_name: className, term: "Annuel" };
  });
}
const inputStyle = { fontFamily: "'Inter', sans-serif", border: `1px solid ${COLORS.line}`, background: "#fff", color: COLORS.ink };

// ================= AUTH + ONBOARDING =================
function AuthScreen() {
  const [mode, setMode] = useState("signin"); // signin | signup | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setMessage(""); setLoading(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage("Compte créé ! Connecte-toi pour finir la configuration.");
    } else if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) setError(error.message);
      else setMessage("Un email avec un lien de réinitialisation a été envoyé si ce compte existe.");
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
          {mode !== "forgot" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>Mot de passe</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2.5 pr-16 rounded-lg outline-none" style={inputStyle} />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium" style={{ color: COLORS.primary }}>
                  {showPassword ? "Masquer" : "Afficher"}
                </button>
              </div>
            </div>
          )}
          {mode === "signin" && (
            <button type="button" onClick={() => { setMode("forgot"); setError(""); setMessage(""); }} className="text-xs font-medium" style={{ color: COLORS.primary }}>
              Mot de passe oublié ?
            </button>
          )}
          {error && <div className="text-sm" style={{ color: COLORS.negative }}>{error}</div>}
          {message && <div className="text-sm" style={{ color: COLORS.positive }}>{message}</div>}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2" style={{ background: COLORS.ink, color: "#fff" }}>
            {loading && <Loader2 className="animate-spin" size={16} />}
            {mode === "signin" ? "Se connecter" : mode === "signup" ? "Créer mon compte" : "Envoyer le lien"}
          </button>
        </form>
        {mode === "forgot" ? (
          <button onClick={() => { setMode("signin"); setError(""); setMessage(""); }} className="w-full text-center text-sm mt-4" style={{ color: COLORS.inkSoft }}>← Retour à la connexion</button>
        ) : (
          <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setMessage(""); }} className="w-full text-center text-sm mt-4" style={{ color: COLORS.inkSoft }}>
            {mode === "signin" ? "Pas encore de compte ? En créer un" : "Déjà un compte ? Se connecter"}
          </button>
        )}
      </div>
    </div>
  );
}

function OnboardingScreen({ userId, onDone, onBack }) {
  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [levelType, setLevelType] = useState("primaire");
  const [schoolCode, setSchoolCode] = useState("");
  const [className, setClassName] = useState("");
  const [fonction, setFonction] = useState("");
  const [subject, setSubject] = useState("");
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
        const { data, error } = await supabase.from("schools").insert({ name: schoolName.trim(), code: genCode(), level_type: levelType }).select().single();
        if (error) throw error;
        schoolId = data.id;
      } else {
        if (!schoolCode.trim()) { setError("Entre le code de l'école reçu du fondateur."); setLoading(false); return; }
        const { data, error } = await supabase.from("schools").select("id").eq("code", schoolCode.trim().toUpperCase()).maybeSingle();
        if (error || !data) { setError("Code d'école introuvable. Vérifie-le auprès du fondateur."); setLoading(false); return; }
        schoolId = data.id;
      }
      const { error: profileError } = await supabase.from("profiles").insert({ user_id: userId, school_id: schoolId, role, full_name: fullName.trim(), phone: phone.trim() || null, class_name: role === "enseignant" ? className.trim() || null : null, fonction: role === "personnel" ? fonction.trim() || null : null });
      if (profileError) throw profileError;
      if (role === "enseignant" && subject.trim() && className.trim()) {
        await supabase.from("teacher_assignments").insert({ school_id: schoolId, teacher_id: userId, subject: subject.trim(), class_name: className.trim() });
      }
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
        <button onClick={onBack} className="text-xs font-medium mb-4 flex items-center gap-1" style={{ color: COLORS.inkSoft }}>← Retour</button>
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

          {role === "enseignant" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>Ta classe</label>
                <input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Ex: CM2, 6ème A..." className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
                <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>Utilise exactement le même nom que le comptable pour cette classe.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>Ta matière (secondaire uniquement)</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex: Mathématiques" className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
                <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>Laisse vide si tu es enseignant polyvalent (primaire). Tu pourras ajouter d'autres matières/classes plus tard.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>Ton numéro de téléphone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: 622 00 00 00" className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
                <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>Visible par les parents de ta classe, pour qu'ils puissent te joindre.</p>
              </div>
            </div>
          )}

          {role === "personnel" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>Ta fonction</label>
              <input value={fonction} onChange={(e) => setFonction(e.target.value)} placeholder="Ex: Gardien, Cuisinier, Surveillant..." className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
              <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>Tu apparaîtras automatiquement dans le tableau de paie du comptable.</p>
            </div>
          )}

          {role === "comptable" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>Ton numéro de téléphone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: 622 00 00 00" className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
              <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>Visible par les parents dans "Payer sans se déplacer", pour qu'ils puissent te contacter directement.</p>
            </div>
          )}

          {role === "fondateur" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>Type d'établissement</label>
                <div className="grid grid-cols-2 gap-2">
                  {[["primaire", "Maternelle + Élémentaire (primaire)"], ["secondaire", "Secondaire"]].map(([val, label]) => (
                    <button key={val} onClick={() => setLevelType(val)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-left" style={{ background: levelType === val ? COLORS.ink : "#fff", color: levelType === val ? "#fff" : COLORS.inkSoft, border: `1px solid ${levelType === val ? COLORS.ink : COLORS.line}` }}>{label}</button>
                  ))}
                </div>
                <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>Deux structures distinctes sont gérées séparément — crée un second compte fondateur si tu gères aussi l'autre niveau.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>Nom de ton école</label>
                <input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="Ex: Groupe Scolaire Étoile" className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
                <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>Un code unique sera généré pour que ton équipe et les parents rejoignent ton école.</p>
              </div>
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
    const { data } = await supabase.from("profiles").select("*, schools(name, code, currency, current_year, level_type, subscribed, trial_started_at)").eq("user_id", userId).maybeSingle();
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
  if (!profile) return <OnboardingScreen userId={session.user.id} onDone={() => loadProfile(session.user.id)} onBack={() => supabase.auth.signOut()} />;
  return <MainApp profile={profile} refreshProfile={() => loadProfile(session.user.id)} />;
}

function MainApp({ profile, refreshProfile }) {
  const currency = profile.schools?.currency || "GNF";
  const role = profile.role;
  const schoolId = profile.school_id;
  const currentYear = profile.schools?.current_year || "2025-2026";
  const [viewYear, setViewYear] = useState(currentYear);
  const isArchiveView = viewYear !== currentYear;
  const levelType = profile.schools?.level_type || "primaire";
  const levels = getLevels(levelType);
  const trialDaysLeft = useMemo(() => {
    const start = profile.schools?.trial_started_at ? new Date(profile.schools.trial_started_at) : new Date();
    const elapsedMs = Date.now() - start.getTime();
    const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(7 - elapsedDays));
  }, [profile.schools?.trial_started_at]);
  const [tab, setTab] = useState(role === "comptable" ? "students" : role === "enseignant" ? "lessons" : role === "personnel" ? "mysalary" : "dashboard");
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [homework, setHomework] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [parents, setParents] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [releases, setReleases] = useState([]);
  const [staffProfiles, setStaffProfiles] = useState([]);
  const [staffPayments, setStaffPayments] = useState([]);
  const [remarks, setRemarks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [classHeadTeachers, setClassHeadTeachers] = useState([]);
  const [subjectsSecondaire, setSubjectsSecondaire] = useState([]);
  const [gradesSecondaire, setGradesSecondaire] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [linkingStudent, setLinkingStudent] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const loadAll = useCallback(async () => {
    const [s, p, l, h, a, par, exp, gr, rel, staff, sp, rem, att, ta, cht, subj, grs] = await Promise.all([
      supabase.from("students").select("*").order("full_name"),
      supabase.from("payments").select("*").order("date", { ascending: false }),
      supabase.from("lessons").select("*").order("created_at", { ascending: false }),
      supabase.from("homework_status").select("*"),
      supabase.from("announcements").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("user_id, full_name, phone, active").eq("role", "parent"),
      supabase.from("expenses").select("*").order("date", { ascending: false }),
      supabase.from("grades").select("*"),
      supabase.from("grade_releases").select("*"),
      supabase.from("profiles").select("user_id, full_name, role, class_name, fonction, phone, active").neq("role", "parent"),
      supabase.from("staff_payments").select("*"),
      supabase.from("remarks").select("*").order("created_at", { ascending: false }),
      supabase.from("attendance").select("*"),
      supabase.from("teacher_assignments").select("*"),
      supabase.from("class_head_teachers").select("*"),
      supabase.from("subjects_secondaire").select("*"),
      supabase.from("grades_secondaire").select("*"),
    ]);
    if (s.data) setStudents(s.data);
    if (p.data) setPayments(p.data);
    if (l.data) setLessons(l.data);
    if (h.data) setHomework(h.data);
    if (a.data) setAnnouncements(a.data);
    if (par.data) setParents(par.data);
    if (exp.data) setExpenses(exp.data);
    if (gr.data) setGrades(gr.data);
    if (rel.data) setReleases(rel.data);
    if (staff.data) setStaffProfiles(staff.data);
    if (sp.data) setStaffPayments(sp.data);
    if (rem.data) setRemarks(rem.data);
    if (att.data) setAttendance(att.data);
    if (ta.data) setTeacherAssignments(ta.data);
    if (cht.data) setClassHeadTeachers(cht.data);
    if (subj.data) setSubjectsSecondaire(subj.data);
    if (grs.data) setGradesSecondaire(grs.data);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const availableYears = useMemo(() => {
    const years = new Set([currentYear]);
    students.forEach((s) => s.school_year && years.add(s.school_year));
    payments.forEach((p) => p.school_year && years.add(p.school_year));
    expenses.forEach((e) => e.school_year && years.add(e.school_year));
    return [...years].sort().reverse();
  }, [students, payments, expenses, currentYear]);

  const yearStudents = useMemo(() => students.filter((s) => s.school_year === viewYear), [students, viewYear]);
  const yearStudentIds = useMemo(() => new Set(yearStudents.map((s) => s.id)), [yearStudents]);
  const yearPayments = useMemo(() => payments.filter((p) => p.school_year === viewYear), [payments, viewYear]);
  const yearExpenses = useMemo(() => expenses.filter((e) => e.school_year === viewYear), [expenses, viewYear]);
  const yearGrades = useMemo(() => grades.filter((g) => g.school_year === viewYear), [grades, viewYear]);
  const yearGradesSecondaire = useMemo(() => gradesSecondaire.filter((g) => g.school_year === viewYear), [gradesSecondaire, viewYear]);
  const yearReleases = useMemo(() => releases.filter((r) => r.school_year === viewYear), [releases, viewYear]);
  const yearAttendance = useMemo(() => attendance.filter((a) => a.school_year === viewYear), [attendance, viewYear]);
  const yearLessons = useMemo(() => lessons.filter((l) => l.school_year === viewYear), [lessons, viewYear]);
  const yearStaffPayments = useMemo(() => staffPayments.filter((sp) => sp.school_year === viewYear), [staffPayments, viewYear]);

  const paidByStudent = useMemo(() => {
    const map = {};
    yearPayments.forEach((p) => { map[p.student_id] = (map[p.student_id] || 0) + Number(p.amount); });
    return map;
  }, [yearPayments]);

  const [parentViewYear, setParentViewYear] = useState(currentYear);
  const parentAvailableYears = useMemo(() => {
    const years = new Set([currentYear]);
    students.forEach((s) => { if (s.parent_id === profile.user_id && s.school_year) years.add(s.school_year); });
    return [...years].sort().reverse();
  }, [students, profile.user_id, currentYear]);
  const myChildren = useMemo(() => students.filter((s) => s.parent_id === profile.user_id && s.school_year === parentViewYear), [students, profile.user_id, parentViewYear]);

  const stats = useMemo(() => {
    const totalDue = yearStudents.reduce((s, st) => s + Number(st.total_due), 0);
    const totalPaid = yearPayments.reduce((s, p) => s + Number(p.amount), 0);
    const totalExpenses = yearExpenses.reduce((s, e) => s + Number(e.amount), 0);
    const paidByStudentMap = {};
    yearPayments.forEach((p) => { paidByStudentMap[p.student_id] = (paidByStudentMap[p.student_id] || 0) + Number(p.amount); });
    const nbCompletePaid = yearStudents.filter((st) => (paidByStudentMap[st.id] || 0) >= Number(st.total_due) && Number(st.total_due) > 0).length;
    return { nbEleves: yearStudents.length, totalDue, totalPaid, reste: totalDue - totalPaid, nbDevoirs: yearLessons.length, totalExpenses, solde: totalPaid - totalExpenses, nbCompletePaid };
  }, [yearStudents, yearPayments, yearExpenses, yearLessons]);

  const addStudent = async (s) => {
    const { data, error } = await supabase.from("students").insert({ ...s, school_id: schoolId, school_year: currentYear }).select();
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
  const addPayment = async (pay) => { const { data } = await supabase.from("payments").insert({ ...pay, school_id: schoolId, school_year: currentYear }).select(); if (data) setPayments((p) => [data[0], ...p]); };
  const addLesson = async (l) => { const { data } = await supabase.from("lessons").insert({ ...l, school_id: schoolId, teacher_id: profile.user_id, school_year: currentYear }).select(); if (data) setLessons((p) => [data[0], ...p]); };
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
    const { data, error } = await supabase.from("expenses").insert({ ...e, school_id: schoolId, created_by: profile.user_id, school_year: currentYear }).select();
    if (data) setExpenses((p) => [data[0], ...p]);
    return error;
  };
  const deleteExpense = async (id) => { await supabase.from("expenses").delete().eq("id", id); setExpenses((p) => p.filter((e) => e.id !== id)); };
  const validateExpense = async (id) => {
    const { data, error } = await supabase.from("expenses").update({ validated: true }).eq("id", id).select();
    if (data) setExpenses((prev) => prev.map((e) => (e.id === id ? data[0] : e)));
    return error;
  };

  const saveGrade = async (studentId, subject, score, term) => {
    const { data, error } = await supabase
      .from("grades")
      .upsert({ school_id: schoolId, student_id: studentId, subject, score, term, school_year: currentYear, class_name: students.find((s) => s.id === studentId)?.class_name || "" }, { onConflict: "student_id,subject,term,school_year" })
      .select();
    if (data) {
      setGrades((prev) => {
        const existing = prev.find((g) => g.student_id === studentId && g.subject === subject && g.term === term && g.school_year === currentYear);
        if (existing) return prev.map((g) => (g.id === existing.id ? data[0] : g));
        return [...prev, data[0]];
      });
    }
    return error;
  };
  const toggleRelease = async (classNameArg, term, publishedValue) => {
    const { data } = await supabase
      .from("grade_releases")
      .upsert({ school_id: schoolId, class_name: classNameArg, term, published: publishedValue, school_year: currentYear }, { onConflict: "school_id,class_name,term,school_year" })
      .select();
    if (data) {
      setReleases((prev) => {
        const existing = prev.find((r) => r.class_name === classNameArg && r.term === term && r.school_year === currentYear);
        if (existing) return prev.map((r) => (r.id === existing.id ? data[0] : r));
        return [...prev, data[0]];
      });
    }
  };

  const saveStaffPayment = async (staffUserId, month, field, value) => {
    const existing = staffPayments.find((sp) => sp.user_id === staffUserId && sp.month === month && sp.school_year === currentYear);
    const payload = {
      school_id: schoolId,
      user_id: staffUserId,
      month,
      school_year: currentYear,
      solde: field === "solde" ? value : existing?.solde || 0,
      paye: field === "paye" ? value : existing?.paye || 0,
    };
    const { data, error } = await supabase.from("staff_payments").upsert(payload, { onConflict: "user_id,month,school_year" }).select();
    if (data) {
      setStaffPayments((prev) => {
        const idx = prev.findIndex((sp) => sp.user_id === staffUserId && sp.month === month && sp.school_year === currentYear);
        if (idx >= 0) return prev.map((sp, i) => (i === idx ? data[0] : sp));
        return [...prev, data[0]];
      });
    }
    return error;
  };

  const approveStaffPayment = async (id) => {
    const { data, error } = await supabase.from("staff_payments").update({ approved: true, approved_at: new Date().toISOString() }).eq("id", id).select();
    if (data) setStaffPayments((prev) => prev.map((sp) => (sp.id === id ? data[0] : sp)));
    return error;
  };

  const updateMyProfile = async (fullNameVal, phoneVal) => {
    const { error } = await supabase.rpc("update_my_contact_info", { p_full_name: fullNameVal, p_phone: phoneVal });
    if (!error) await refreshProfile();
    return error;
  };

  const toggleStaffActive = async (userId, activeValue) => {
    const { data, error } = await supabase.from("profiles").update({ active: activeValue }).eq("user_id", userId).select();
    if (data) setStaffProfiles((prev) => prev.map((sp) => (sp.user_id === userId ? { ...sp, active: activeValue } : sp)));
    return error;
  };

  const addTeacherAssignment = async (subj, classNameArg) => {
    const { data, error } = await supabase.from("teacher_assignments").insert({ school_id: schoolId, teacher_id: profile.user_id, subject: subj, class_name: classNameArg }).select();
    if (data) setTeacherAssignments((prev) => [...prev, data[0]]);
    return error;
  };
  const deleteTeacherAssignment = async (id) => {
    await supabase.from("teacher_assignments").delete().eq("id", id);
    setTeacherAssignments((prev) => prev.filter((t) => t.id !== id));
  };

  const setClassHeadTeacher = async (classNameArg, teacherId) => {
    const { data, error } = await supabase.from("class_head_teachers").upsert({ school_id: schoolId, class_name: classNameArg, teacher_id: teacherId }, { onConflict: "school_id,class_name" }).select();
    if (data) setClassHeadTeachers((prev) => {
      const existing = prev.find((c) => c.class_name === classNameArg);
      if (existing) return prev.map((c) => (c.id === existing.id ? data[0] : c));
      return [...prev, data[0]];
    });
    return error;
  };

  const setSubjectCoefficient = async (classNameArg, subj, coefficient) => {
    const { data, error } = await supabase.from("subjects_secondaire").upsert({ school_id: schoolId, class_name: classNameArg, subject: subj, coefficient }, { onConflict: "school_id,class_name,subject" }).select();
    if (data) setSubjectsSecondaire((prev) => {
      const existing = prev.find((s) => s.class_name === classNameArg && s.subject === subj);
      if (existing) return prev.map((s) => (s.id === existing.id ? data[0] : s));
      return [...prev, data[0]];
    });
    return error;
  };

  const saveGradeSecondaire = async (studentId, subj, classNameArg, month, field, value) => {
    const term = monthToTerm(month);
    const existing = gradesSecondaire.find((g) => g.student_id === studentId && g.subject === subj && g.month === month && g.school_year === currentYear);
    const payload = {
      school_id: schoolId, student_id: studentId, teacher_id: profile.user_id, subject: subj, class_name: classNameArg, month, term, school_year: currentYear,
      ecrit: field === "ecrit" ? value : existing?.ecrit ?? null,
      oral: field === "oral" ? value : existing?.oral ?? null,
    };
    const { data, error } = await supabase.from("grades_secondaire").upsert(payload, { onConflict: "student_id,subject,month,school_year" }).select();
    if (data) setGradesSecondaire((prev) => {
      const idx = prev.findIndex((g) => g.student_id === studentId && g.subject === subj && g.month === month && g.school_year === currentYear);
      if (idx >= 0) return prev.map((g, i) => (i === idx ? data[0] : g));
      return [...prev, data[0]];
    });
    return error;
  };

  const addRemark = async (message) => {
    const { data, error } = await supabase.from("remarks").insert({ school_id: schoolId, parent_id: profile.user_id, message }).select();
    if (data) setRemarks((prev) => [data[0], ...prev]);
    return error;
  };
  const deleteRemark = async (id) => {
    await supabase.from("remarks").delete().eq("id", id);
    setRemarks((prev) => prev.filter((r) => r.id !== id));
  };

  const startNewYear = async (newYear) => {
    const { error } = await supabase.from("schools").update({ current_year: newYear }).eq("id", schoolId);
    if (!error) {
      await supabase.from("profiles").update({ active: false }).eq("school_id", schoolId).neq("role", "fondateur");
      await refreshProfile();
      await loadAll();
      setViewYear(newYear);
    }
    return error;
  };

  const setAttendanceStatus = async (studentId, classNameArg, date, session, present) => {
    const { data, error } = await supabase
      .from("attendance")
      .upsert({ school_id: schoolId, student_id: studentId, class_name: classNameArg, date, session, present, recorded_by: profile.user_id, school_year: currentYear }, { onConflict: "student_id,date,session,school_year" })
      .select();
    if (data) {
      setAttendance((prev) => {
        const existing = prev.find((a) => a.student_id === studentId && a.date === date && a.session === session && a.school_year === currentYear);
        if (existing) return prev.map((a) => (a.id === existing.id ? data[0] : a));
        return [...prev, data[0]];
      });
    }
    return error;
  };

  const isSecondaire = levelType === "secondaire";
  const NAV = {
    fondateur: [["dashboard", "Tableau de bord", LayoutDashboard], ["students", "Élèves", Users], ["announcements", "Annonces", Megaphone], ["attendance", "Présences", CalendarCheck], ["grades", "Notes", ClipboardList], ...(isSecondaire ? [["classteachers", "Professeurs principaux", Shield]] : []), ["lessons", "Devoirs", BookOpen], ["expenses", "Dépenses", Receipt], ["staff", "Personnel", Wallet], ["parentsmanagement", "Parents", Users], ["mysalary", "Mon salaire", Receipt], ["remarks", "Remarques parents", MessageSquare]],
    comptable: [["students", "Élèves & Paiements", Users], ["dashboard", "Statistiques", LayoutDashboard], ["expenses", "Dépenses", Receipt], ["staff", "Personnel", Wallet], ["mysalary", "Mon salaire", Receipt]],
    enseignant: [["lessons", "Devoirs", BookOpen], ["grades", "Notes", ClipboardList], ...(isSecondaire ? [["myassignments", "Mes matières", ClipboardList]] : []), ["attendance", "Présences", CalendarCheck], ["students", "Élèves", Users], ["mysalary", "Mon salaire", Receipt]],
    parent: [["dashboard", "Mes enfants", GraduationCap], ["lessons", "Devoirs", BookOpen], ["announcements", "Annonces", Megaphone], ["remarks", "Mes remarques", MessageSquare], ["pay", "Payer sans se déplacer", Smartphone]],
    personnel: [["mysalary", "Mon salaire", Receipt], ["announcements", "Annonces", Megaphone]],
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
        <button onClick={() => setShowProfileModal(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left" style={{ color: COLORS.inkSoft }}>
          <Users size={18} /> <span className="text-sm font-medium">Mon profil</span>
        </button>
        <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left" style={{ color: COLORS.inkSoft }}>
          <LogOut size={18} /> <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </aside>

      <button
        onClick={() => setShowMoreMenu(true)}
        className="md:hidden fixed top-4 right-4 z-40 w-10 h-10 rounded-full flex items-center justify-center shadow-md"
        style={{ background: COLORS.ink }}
      >
        <Menu size={20} color="#fff" />
      </button>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around py-2 border-t" style={{ background: COLORS.card, borderColor: COLORS.line }}>
        {NAV_FULL.slice(0, 3).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)} className="p-2 rounded-lg" style={{ color: tab === key ? COLORS.ink : COLORS.inkSoft }}><Icon size={20} /></button>
        ))}
      </div>

      {showMoreMenu && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end" style={{ background: "rgba(32,48,74,0.45)" }} onClick={() => setShowMoreMenu(false)}>
          <div className="w-full rounded-t-2xl overflow-hidden" style={{ background: COLORS.card, maxHeight: "80vh" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: COLORS.line }}>
              <h3 className="text-lg font-bold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Menu</h3>
              <button onClick={() => setShowMoreMenu(false)} style={{ color: COLORS.inkSoft }}><X size={20} /></button>
            </div>
            <div className="overflow-y-auto py-2" style={{ maxHeight: "60vh" }}>
              {NAV_FULL.slice(3).map(([key, label, Icon]) => (
                <button
                  key={key}
                  onClick={() => { setTab(key); setShowMoreMenu(false); }}
                  className="w-full flex items-center gap-3 px-5 py-3.5"
                  style={{ background: tab === key ? COLORS.paper : "transparent" }}
                >
                  <Icon size={20} style={{ color: tab === key ? COLORS.ink : COLORS.inkSoft }} />
                  <span className="text-[15px] font-medium" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{label}</span>
                </button>
              ))}
            </div>
            <button onClick={() => { setShowProfileModal(true); setShowMoreMenu(false); }} className="w-full flex items-center gap-3 px-5 py-4 border-t" style={{ borderColor: COLORS.line, color: COLORS.ink }}>
              <Users size={20} /> <span className="text-[15px] font-medium">Mon profil</span>
            </button>
            <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center gap-3 px-5 py-4 border-t" style={{ borderColor: COLORS.line, color: COLORS.negative }}>
              <LogOut size={20} /> <span className="text-[15px] font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 p-5 md:p-10 pb-20 md:pb-10 max-w-5xl mx-auto w-full">
        {role === "parent" && profile.active === false && (
          <SelfReactivateBanner onSuccess={async () => { await refreshProfile(); await loadAll(); }} />
        )}
        {tab === "dashboard" && role === "parent" && (() => {
          const parentPayments = payments.filter((p) => p.school_year === parentViewYear);
          const parentGrades = grades.filter((g) => g.school_year === parentViewYear);
          const parentReleases = releases.filter((r) => r.school_year === parentViewYear);
          const parentAttendance = attendance.filter((a) => a.school_year === parentViewYear);
          const parentPaidByStudent = {};
          parentPayments.forEach((p) => { parentPaidByStudent[p.student_id] = (parentPaidByStudent[p.student_id] || 0) + Number(p.amount); });
          return (
            <ParentChildrenView
              children={myChildren}
              paidByStudent={parentPaidByStudent}
              currency={currency}
              payments={parentPayments}
              onRelink={relinkSelf}
              grades={[...parentGrades, ...[...new Set(students.map((s) => s.class_name))].flatMap((cn) => computeAnnualGrades(parentGrades, cn))].filter((g) =>
                parentReleases.some((r) => r.class_name === g.class_name && r.term === g.term && r.published)
              )}
              attendance={parentAttendance}
              staffProfiles={staffProfiles}
              viewYear={parentViewYear}
              setViewYear={setParentViewYear}
              availableYears={parentAvailableYears}
              currentYear={currentYear}
            />
          );
        })()}
        {tab === "dashboard" && role !== "parent" && (
          <DashboardView
            stats={stats}
            currency={currency}
            schoolCode={profile.schools?.code}
            role={role}
            availableYears={availableYears}
            viewYear={viewYear}
            setViewYear={setViewYear}
            currentYear={currentYear}
            onStartNewYear={startNewYear}
            isArchiveView={isArchiveView}
          />
        )}
        {tab === "students" && (role === "comptable" || role === "fondateur") && (
          <StudentsView students={yearStudents} paidByStudent={paidByStudent} currency={currency} readOnly={role === "fondateur" || isArchiveView} parents={parents} subscribed={profile.schools?.subscribed} trialDaysLeft={trialDaysLeft} levels={levels} onAdd={() => setModal("student")} onDelete={deleteStudent} onPay={() => setModal("payment")} onLink={(s) => setLinkingStudent(s)} />
        )}
        {tab === "students" && role === "enseignant" && <StudentsReadOnlyView students={role === "enseignant" ? yearStudents.filter((s) => s.class_name === profile.class_name) : yearStudents} />}
        {tab === "lessons" && (role === "enseignant" || role === "fondateur") && (
          <LessonsTeacherView
            lessons={role === "enseignant" ? yearLessons.filter((l) => l.class_name === profile.class_name) : yearLessons}
            students={role === "enseignant" ? yearStudents.filter((s) => s.class_name === profile.class_name) : yearStudents}
            homework={homework}
            readOnly={role === "fondateur"}
            lockedClass={role === "enseignant" ? profile.class_name : null}
            onAdd={() => setModal("lesson")} onDelete={deleteLesson} onToggle={toggleHomework}
          />
        )}
        {tab === "lessons" && role === "parent" && <LessonsParentView lessons={yearLessons} children={myChildren} homework={homework} onToggle={toggleHomework} />}
        {tab === "expenses" && (role === "comptable" || role === "fondateur") && (
          <ExpensesView expenses={yearExpenses} currency={currency} readOnly={role !== "comptable" || isArchiveView} onAdd={() => setModal("expense")} onDelete={deleteExpense} onValidate={validateExpense} />
        )}
        {tab === "grades" && !isSecondaire && (role === "enseignant" || role === "fondateur") && (
          <GradesView students={yearStudents} grades={yearGrades} releases={yearReleases} readOnly={role === "fondateur"} lockedClass={role === "enseignant" ? profile.class_name : null} passThreshold={isSecondaire ? 10 : 5} onSave={saveGrade} onToggleRelease={toggleRelease} />
        )}
        {tab === "grades" && isSecondaire && (role === "enseignant" || role === "fondateur") && (
          <GradesSecondaireView
            students={yearStudents}
            gradesSecondaire={yearGradesSecondaire}
            releases={yearReleases}
            allAssignments={teacherAssignments}
            myUserId={profile.user_id}
            classHeadTeachers={classHeadTeachers}
            subjectsSecondaire={subjectsSecondaire}
            currency={currency}
            readOnly={role === "fondateur"}
            isHeadTeacherOf={classHeadTeachers.filter((c) => c.teacher_id === profile.user_id).map((c) => c.class_name)}
            onSave={saveGradeSecondaire}
            onSetCoefficient={setSubjectCoefficient}
            onToggleRelease={toggleRelease}
          />
        )}
        {tab === "myassignments" && role === "enseignant" && (
          <MyAssignmentsView assignments={teacherAssignments.filter((t) => t.teacher_id === profile.user_id)} onAdd={addTeacherAssignment} onDelete={deleteTeacherAssignment} />
        )}
        {tab === "classteachers" && role === "fondateur" && (
          <ClassTeachersView students={yearStudents} teacherAssignments={teacherAssignments} classHeadTeachers={classHeadTeachers} staffProfiles={staffProfiles} onSet={setClassHeadTeacher} />
        )}
        {tab === "announcements" && (
          <AnnouncementsView announcements={announcements} canWrite={role === "fondateur"} onAdd={() => setModal("announcement")} onDelete={deleteAnnouncement} />
        )}
        {tab === "staff" && (role === "comptable" || role === "fondateur") && (
          <StaffPaymentsView staffProfiles={staffProfiles} staffPayments={yearStaffPayments} currency={currency} readOnly={role === "fondateur"} canDeactivate={role === "fondateur"} onSave={saveStaffPayment} onToggleActive={toggleStaffActive} />
        )}
        {tab === "mysalary" && role !== "parent" && (
          <MySalaryView myPayments={yearStaffPayments.filter((sp) => sp.user_id === profile.user_id)} currency={currency} onApprove={approveStaffPayment} />
        )}
        {tab === "remarks" && role === "parent" && (
          <ParentRemarksView remarks={remarks.filter((r) => r.parent_id === profile.user_id)} onAdd={addRemark} />
        )}
        {tab === "remarks" && role === "fondateur" && (
          <FondateurRemarksView remarks={remarks} parents={parents} onDelete={deleteRemark} />
        )}
        {tab === "parentsmanagement" && role === "fondateur" && (
          <ParentsManagementView parents={parents} students={students} onToggleActive={toggleStaffActive} />
        )}
        {tab === "pay" && role === "parent" && (
          <ParentPayView comptable={staffProfiles.find((sp) => sp.role === "comptable")} currency={currency} />
        )}
        {tab === "attendance" && (role === "enseignant" || role === "fondateur") && (
          <AttendanceView
            students={role === "enseignant" ? yearStudents.filter((s) => s.class_name === profile.class_name) : yearStudents}
            attendance={yearAttendance}
            readOnly={role === "fondateur"}
            lockedClass={role === "enseignant" ? profile.class_name : null}
            onSave={setAttendanceStatus}
          />
        )}
        {tab === "admin" && profile.is_admin && <AdminView />}
      </main>

      {modal === "student" && <StudentModal levels={levels} onClose={() => setModal(null)} onSave={addStudent} />}
      {modal === "payment" && <PaymentModal students={yearStudents} currency={currency} onClose={() => setModal(null)} onSave={addPayment} />}
      {modal === "lesson" && <LessonModal lockedClass={role === "enseignant" ? profile.class_name : null} onClose={() => setModal(null)} onSave={addLesson} />}
      {showProfileModal && <MyProfileModal profile={profile} onClose={() => setShowProfileModal(false)} onSave={updateMyProfile} />}
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
function DashboardView({ stats, currency, schoolCode, role, availableYears, viewYear, setViewYear, currentYear, onStartNewYear, isArchiveView }) {
  const [copied, setCopied] = useState(false);
  const [showNewYear, setShowNewYear] = useState(false);
  const [newYearInput, setNewYearInput] = useState("");
  const [starting, setStarting] = useState(false);
  const copyCode = () => {
    navigator.clipboard?.writeText(schoolCode || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const confirmNewYear = async () => {
    if (!newYearInput.trim()) return;
    setStarting(true);
    await onStartNewYear(newYearInput.trim());
    setStarting(false);
    setShowNewYear(false);
    setNewYearInput("");
  };
  return (
    <div>
      <h1 className="text-3xl mb-1 font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Tableau de bord</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>Vue d'ensemble de votre école.</p>

      {role === "fondateur" && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <select value={viewYear} onChange={(e) => setViewYear(e.target.value)} className="px-3 py-2 rounded-lg outline-none text-sm font-medium" style={inputStyle}>
            {availableYears.map((y) => <option key={y} value={y}>{y}{y === currentYear ? " (active)" : " (archive)"}</option>)}
          </select>
          <button onClick={() => setShowNewYear(true)} className="text-xs font-medium px-3 py-2 rounded-lg" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>
            + Nouvelle année scolaire
          </button>
        </div>
      )}
      {isArchiveView && (
        <div className="rounded-xl px-4 py-3 mb-5 text-sm" style={{ background: COLORS.goldSoft || COLORS.primarySoft, color: COLORS.primary }}>
          📁 Tu consultes une archive ({viewYear}) — lecture seule, aucune modification possible.
        </div>
      )}

      {showNewYear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(32,48,74,0.45)" }} onClick={() => setShowNewYear(false)}>
          <div className="w-full max-w-sm rounded-xl p-6" style={{ background: COLORS.card }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Démarrer une nouvelle année</h3>
            <p className="text-sm mb-4" style={{ color: COLORS.inkSoft }}>
              L'année {currentYear} sera archivée en lecture seule (consultable, non modifiable). <b>Tous les comptes (comptable, enseignants, parents) seront automatiquement désactivés</b> — tu pourras réactiver un par un ceux qui continuent cette année, depuis "Personnel" et "Parents".
            </p>
            <FieldLabel>Nom de la nouvelle année</FieldLabel>
            <input value={newYearInput} onChange={(e) => setNewYearInput(e.target.value)} placeholder="Ex: 2026-2027" className="w-full px-3 py-2.5 rounded-lg outline-none mb-4" style={inputStyle} />
            <button onClick={confirmNewYear} disabled={starting} className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2" style={{ background: COLORS.primary, color: "#fff" }}>
              {starting && <Loader2 className="animate-spin" size={16} />} Démarrer {newYearInput || "cette année"}
            </button>
          </div>
        </div>
      )}

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
        <StatCard icon={Check} label="Scolarité complète" value={`${stats.nbCompletePaid}/${stats.nbEleves}`} color={COLORS.positive} bg={COLORS.positiveSoft} />
        <StatCard icon={TrendingUp} label="Total collecté" value={fmt(stats.totalPaid, currency)} color={COLORS.positive} bg={COLORS.positiveSoft} />
        <StatCard icon={TrendingDown} label="Total dépenses" value={fmt(stats.totalExpenses, currency)} color={COLORS.negative} bg={COLORS.negativeSoft} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <StatCard icon={AlertTriangle} label="Reste à payer (élèves)" value={fmt(stats.reste, currency)} color={COLORS.primary} bg={COLORS.primarySoft} />
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
function StudentsView({ students, paidByStudent, currency, readOnly, parents, subscribed, trialDaysLeft, levels, onAdd, onDelete, onPay, onLink }) {
  const [selectedClass, setSelectedClass] = useState(null); // { level, className } | null
  const [search, setSearch] = useState("");

  const grouped = useMemo(() => {
    const byLevel = {};
    levels.forEach((lvl) => (byLevel[lvl] = {}));
    students.forEach((s) => {
      const lvl = levels.includes(s.level) ? s.level : levels[0];
      if (!byLevel[lvl][s.class_name]) byLevel[lvl][s.class_name] = [];
      byLevel[lvl][s.class_name].push(s);
    });
    return byLevel;
  }, [students, levels]);

  const parentName = (id) => parents.find((p) => p.user_id === id)?.full_name;
  const parentPhone = (id) => parents.find((p) => p.user_id === id)?.phone;

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
                  <td className="px-4 py-3 font-medium" style={{ color: s.gender === "Fille" ? COLORS.negative : COLORS.ink }}>
                    {s.full_name}
                    <div className="text-xs font-normal mt-0.5" style={{ color: s.parent_id ? COLORS.positive : COLORS.primary }}>
                      {s.parent_id ? (
                        <>
                          Parent: {parentName(s.parent_id) || "lié"}
                          {parentPhone(s.parent_id) && (
                            <a href={`tel:${parentPhone(s.parent_id)}`} onClick={(e) => e.stopPropagation()} className="ml-1.5 underline" style={{ color: COLORS.primary }}>
                              {parentPhone(s.parent_id)}
                            </a>
                          )}
                        </>
                      ) : "Aucun parent lié"}
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
        <div className="rounded-xl px-4 py-3 mb-4 text-sm flex items-center justify-between flex-wrap gap-2" style={{ background: trialDaysLeft > 0 ? COLORS.primarySoft : COLORS.negativeSoft, color: trialDaysLeft > 0 ? COLORS.primary : COLORS.negative }}>
          <span>{trialDaysLeft > 0 ? <>Essai gratuit : <b>{trialDaysLeft} jour{trialDaysLeft > 1 ? "s" : ""}</b> restant{trialDaysLeft > 1 ? "s" : ""}</> : <b>Essai gratuit terminé — abonnement requis</b>}</span>
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
          {levels.filter((lvl) => Object.keys(grouped[lvl]).length > 0).map((lvl) => (
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
              <div className="font-semibold" style={{ color: s.gender === "Fille" ? COLORS.negative : COLORS.ink }}>{s.full_name}</div>
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
              <div className="text-xs mb-3" style={{ color: COLORS.inkSoft }}>
                {s.subscribed ? "Abonnement actif" : `Essai gratuit — débuté le ${new Date(s.trial_started_at).toLocaleDateString("fr-FR")}`}
              </div>
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
// ---------- Professeurs principaux (fondateur, secondaire) ----------
// ---------- Notes du secondaire (écrit/oral, mensuel, classement pondéré) ----------
function GradesSecondaireView({ students, gradesSecondaire, releases, allAssignments, myUserId, classHeadTeachers, subjectsSecondaire, currency, readOnly, isHeadTeacherOf, onSave, onSetCoefficient, onToggleRelease }) {
  const [view, setView] = useState("saisie"); // saisie | bulletin
  const [saving, setSaving] = useState(null);
  const [togglingRelease, setTogglingRelease] = useState(false);
  const [coefInput, setCoefInput] = useState("");

  // Classes accessibles : les siennes (si enseignant), + celles où on est prof principal, + tout si readOnly (fondateur)
  const visibleAssignments = readOnly
    ? allAssignments
    : allAssignments.filter((a) => a.teacher_id === myUserId || isHeadTeacherOf.includes(a.class_name));

  const classNames = useMemo(() => [...new Set(visibleAssignments.map((a) => a.class_name))].sort(), [visibleAssignments]);
  const [className, setClassName] = useState(classNames[0] || "");
  const subjectsForClass = useMemo(() => [...new Set(visibleAssignments.filter((a) => a.class_name === className).map((a) => a.subject))].sort(), [visibleAssignments, className]);
  const [subject, setSubject] = useState(subjectsForClass[0] || "");
  const [month, setMonth] = useState(SCHOOL_MONTHS[0]);
  const [term, setTerm] = useState("Trimestre 1");

  const canEdit = !readOnly && allAssignments.some((a) => a.teacher_id === myUserId && a.subject === subject && a.class_name === className);
  const isHeadHere = isHeadTeacherOf.includes(className);
  const classStudents = students.filter((s) => s.class_name === className);

  const coefficient = subjectsSecondaire.find((s) => s.class_name === className && s.subject === subject)?.coefficient || 1;

  const getGrade = (studentId, subj, m) => gradesSecondaire.find((g) => g.student_id === studentId && g.subject === subj && g.month === m);

  const handleScoreChange = async (studentId, field, value) => {
    setSaving(`${studentId}-${field}`);
    const v = value === "" ? null : parseFloat(value);
    await onSave(studentId, subject, className, month, field, v);
    setSaving(null);
  };

  const saveCoef = async () => {
    const v = parseFloat(coefInput);
    if (isNaN(v)) return;
    await onSetCoefficient(className, subject, v);
    setCoefInput("");
  };

  // Moyenne trimestrielle d'un élève dans une matière = moyenne des moyennes mensuelles (écrit+oral) des mois du trimestre
  const subjectTermAverage = (studentId, subj, trm) => {
    const months = TERM_MONTHS[trm];
    const monthlyAverages = months.map((m) => {
      const g = getGrade(studentId, subj, m);
      if (!g || (g.ecrit === null && g.oral === null)) return null;
      const vals = [g.ecrit, g.oral].filter((v) => v !== null && v !== undefined);
      return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    }).filter((v) => v !== null);
    return monthlyAverages.length > 0 ? monthlyAverages.reduce((a, b) => a + b, 0) / monthlyAverages.length : null;
  };

  // ---------- Vue "Saisie" : une matière à la fois ----------
  const renderSaisie = () => {
    const monthAvg = (studentId) => {
      const g = getGrade(studentId, subject, month);
      if (!g) return null;
      const vals = [g.ecrit, g.oral].filter((v) => v !== null && v !== undefined);
      return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    };
    const trimAvg = (studentId) => subjectTermAverage(studentId, subject, monthToTerm(month));

    return (
      <>
        {canEdit && (
          <div className="rounded-xl px-4 py-3 mb-5 flex items-center justify-between flex-wrap gap-3" style={{ background: COLORS.primarySoft }}>
            <span className="text-sm font-semibold" style={{ color: COLORS.primary }}>Coefficient de {subject} : {coefficient}</span>
            <div className="flex gap-2">
              <input type="number" value={coefInput} onChange={(e) => setCoefInput(e.target.value)} placeholder="Nouveau coef." className="w-24 px-2 py-1.5 rounded-lg text-sm outline-none" style={inputStyle} />
              <button onClick={saveCoef} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: COLORS.primary, color: "#fff" }}>Régler</button>
            </div>
          </div>
        )}
        {classStudents.length === 0 ? (
          <EmptyState text="Aucun élève dans cette classe." />
        ) : (
          <div className="rounded-2xl overflow-x-auto" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: COLORS.paper }}>
                  <th className="text-left px-4 py-3 font-semibold whitespace-nowrap" style={{ color: COLORS.inkSoft }}>Élève</th>
                  <th className="text-center px-3 py-3 font-semibold" style={{ color: COLORS.inkSoft }}>Écrit</th>
                  <th className="text-center px-3 py-3 font-semibold" style={{ color: COLORS.inkSoft }}>Oral</th>
                  <th className="text-center px-3 py-3 font-semibold" style={{ color: COLORS.ink }}>Moy. mois</th>
                  <th className="text-center px-3 py-3 font-semibold" style={{ color: COLORS.primary }}>Moy. trimestre</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((s, i) => {
                  const g = getGrade(s.id, subject, month);
                  return (
                    <tr key={s.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${COLORS.line}` }}>
                      <td className="px-4 py-2.5 font-medium whitespace-nowrap" style={{ color: s.gender === "Fille" ? COLORS.negative : COLORS.ink }}>{s.full_name}</td>
                      <td className="px-2 py-2 text-center">
                        {canEdit ? (
                          <input type="number" defaultValue={g?.ecrit ?? ""} onBlur={(e) => handleScoreChange(s.id, "ecrit", e.target.value)} className="w-16 px-2 py-1.5 rounded-lg text-center outline-none text-sm" style={{ ...inputStyle, opacity: saving === `${s.id}-ecrit` ? 0.5 : 1 }} />
                        ) : (
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{g?.ecrit ?? "—"}</span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-center">
                        {canEdit ? (
                          <input type="number" defaultValue={g?.oral ?? ""} onBlur={(e) => handleScoreChange(s.id, "oral", e.target.value)} className="w-16 px-2 py-1.5 rounded-lg text-center outline-none text-sm" style={{ ...inputStyle, opacity: saving === `${s.id}-oral` ? 0.5 : 1 }} />
                        ) : (
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{g?.oral ?? "—"}</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{monthAvg(s.id) !== null ? monthAvg(s.id).toFixed(2) : "—"}</td>
                      <td className="px-3 py-2.5 text-center font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.primary }}>{trimAvg(s.id) !== null ? trimAvg(s.id).toFixed(2) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </>
    );
  };

  // ---------- Vue "Bulletin / Classement" : toutes les matières, prof principal ou fondateur ----------
  const renderBulletin = () => {
    const allSubjects = [...new Set(allAssignments.filter((a) => a.class_name === className).map((a) => a.subject))].sort();
    const rows = classStudents.map((s) => {
      const subjectAvgs = allSubjects.map((subj) => ({ subject: subj, avg: subjectTermAverage(s.id, subj, term), coef: subjectsSecondaire.find((cs) => cs.class_name === className && cs.subject === subj)?.coefficient || 1 }));
      const withData = subjectAvgs.filter((sa) => sa.avg !== null);
      const totalCoef = withData.reduce((sum, sa) => sum + sa.coef, 0);
      const weighted = totalCoef > 0 ? withData.reduce((sum, sa) => sum + sa.avg * sa.coef, 0) / totalCoef : null;
      return { student: s, subjectAvgs, moyenneGenerale: weighted };
    }).sort((a, b) => (b.moyenneGenerale ?? -Infinity) - (a.moyenneGenerale ?? -Infinity));

    const release = releases.find((r) => r.class_name === className && r.term === term);
    const published = release?.published || false;

    const togglePublish = async () => {
      setTogglingRelease(true);
      await onToggleRelease(className, term, !published);
      setTogglingRelease(false);
    };

    return (
      <>
        <div className="mb-5">
          <FieldLabel>Trimestre</FieldLabel>
          <select value={term} onChange={(e) => setTerm(e.target.value)} className="w-full sm:w-48 px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
            {Object.keys(TERM_MONTHS).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {isHeadHere && (
          <div className="rounded-xl px-4 py-3 mb-5 flex items-center justify-between flex-wrap gap-3" style={{ background: published ? COLORS.positiveSoft : COLORS.primarySoft }}>
            <div>
              <div className="text-sm font-semibold" style={{ color: published ? COLORS.positive : COLORS.primary }}>
                {published ? "✓ Classement validé et publié aux parents" : "Classement non publié"}
              </div>
              <div className="text-xs mt-0.5" style={{ color: COLORS.inkSoft }}>{className} · {term}</div>
            </div>
            <button onClick={togglePublish} disabled={togglingRelease} className="text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5" style={{ background: published ? COLORS.negative : COLORS.positive, color: "#fff" }}>
              {togglingRelease && <Loader2 className="animate-spin" size={12} />}
              {published ? "Retirer" : "Valider et publier"}
            </button>
          </div>
        )}

        {classStudents.length === 0 || allSubjects.length === 0 ? (
          <EmptyState text="Pas encore de notes pour cette classe." />
        ) : (
          <div className="rounded-2xl overflow-x-auto" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: COLORS.paper }}>
                  <th className="text-left px-3 py-3 font-semibold" style={{ color: COLORS.inkSoft }}>Rang</th>
                  <th className="text-left px-4 py-3 font-semibold whitespace-nowrap" style={{ color: COLORS.inkSoft }}>Élève</th>
                  {allSubjects.map((subj) => (
                    <th key={subj} className="text-center px-3 py-3 font-semibold whitespace-nowrap" style={{ color: COLORS.inkSoft }}>{subj}</th>
                  ))}
                  <th className="text-center px-3 py-3 font-semibold" style={{ color: COLORS.primary }}>Moyenne générale</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.student.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${COLORS.line}` }}>
                    <td className="px-3 py-2.5 font-bold" style={{ color: COLORS.primary, fontFamily: "'IBM Plex Mono', monospace" }}>{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium whitespace-nowrap" style={{ color: row.student.gender === "Fille" ? COLORS.negative : COLORS.ink }}>{row.student.full_name}</td>
                    {row.subjectAvgs.map((sa) => (
                      <td key={sa.subject} className="px-3 py-2.5 text-center" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{sa.avg !== null ? sa.avg.toFixed(2) : "—"}</td>
                    ))}
                    <td className="px-3 py-2.5 text-center font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.primary }}>{row.moyenneGenerale !== null ? row.moyenneGenerale.toFixed(2) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Notes</h1>
        {(isHeadTeacherOf.length > 0 || readOnly) && (
          <div className="flex gap-2">
            <button onClick={() => setView("saisie")} className="text-xs font-medium px-3 py-2 rounded-lg" style={{ background: view === "saisie" ? COLORS.ink : "#fff", color: view === "saisie" ? "#fff" : COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>Saisir</button>
            <button onClick={() => setView("bulletin")} className="text-xs font-medium px-3 py-2 rounded-lg" style={{ background: view === "bulletin" ? COLORS.ink : "#fff", color: view === "bulletin" ? "#fff" : COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>Bulletin & classement</button>
          </div>
        )}
      </div>
      <p className="mb-5" style={{ color: COLORS.inkSoft }}>{view === "saisie" ? "Saisis les notes écrites et orales, mois par mois." : "Classement pondéré de la classe, matière par matière."}</p>

      <div className="flex flex-wrap gap-4 mb-5">
        <div>
          <FieldLabel>Classe</FieldLabel>
          <select value={className} onChange={(e) => { setClassName(e.target.value); setSubject(""); }} className="w-full sm:w-56 px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
            {classNames.length === 0 ? <option>Aucune classe</option> : classNames.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {view === "saisie" && (
          <>
            <div>
              <FieldLabel>Matière</FieldLabel>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full sm:w-48 px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
                {subjectsForClass.length === 0 ? <option>—</option> : subjectsForClass.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>Mois</FieldLabel>
              <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full sm:w-40 px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
                {SCHOOL_MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </>
        )}
      </div>

      {classNames.length === 0 ? (
        <EmptyState text={readOnly ? "Aucune matière enregistrée pour l'instant." : "Ajoute d'abord une matière dans l'onglet \"Mes matières\"."} />
      ) : view === "saisie" ? renderSaisie() : renderBulletin()}
    </div>
  );
}

function ClassTeachersView({ students, teacherAssignments, classHeadTeachers, staffProfiles, onSet }) {
  const [saving, setSaving] = useState(null);
  const classNames = useMemo(() => [...new Set(students.map((s) => s.class_name))].sort(), [students]);

  const teachersForClass = (className) => {
    const ids = [...new Set(teacherAssignments.filter((t) => t.class_name === className).map((t) => t.teacher_id))];
    return ids.map((id) => staffProfiles.find((sp) => sp.user_id === id)).filter(Boolean);
  };

  const handleChange = async (className, teacherId) => {
    setSaving(className);
    await onSet(className, teacherId);
    setSaving(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Professeurs principaux</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>Un professeur principal par classe — il voit toutes les matières et valide le classement.</p>

      {classNames.length === 0 ? (
        <EmptyState text="Aucune classe pour l'instant." />
      ) : (
        <div className="space-y-3">
          {classNames.map((cn) => {
            const teachers = teachersForClass(cn);
            const current = classHeadTeachers.find((c) => c.class_name === cn)?.teacher_id || "";
            return (
              <div key={cn} className="rounded-2xl p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                <div className="font-semibold mb-2" style={{ color: COLORS.ink }}>{cn}</div>
                {teachers.length === 0 ? (
                  <p className="text-xs" style={{ color: COLORS.inkSoft }}>Aucun enseignant n'a encore de matière dans cette classe.</p>
                ) : (
                  <select
                    value={current}
                    onChange={(e) => handleChange(cn, e.target.value)}
                    disabled={saving === cn}
                    className="w-full px-3 py-2.5 rounded-lg outline-none text-sm"
                    style={inputStyle}
                  >
                    <option value="">— Aucun désigné —</option>
                    {teachers.map((t) => <option key={t.user_id} value={t.user_id}>{t.full_name}</option>)}
                  </select>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Mes matières (enseignant du secondaire) ----------
function MyAssignmentsView({ assignments, onAdd, onDelete }) {
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  const submit = async () => {
    if (!subject.trim() || !className.trim()) return;
    setAdding(true);
    setError("");
    const err = await onAdd(subject.trim(), className.trim());
    if (err) setError("Erreur : " + err.message);
    else { setSubject(""); setClassName(""); }
    setAdding(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Mes matières</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>Chaque matière que tu enseignes, pour chaque classe.</p>

      <div className="rounded-2xl p-5 mb-6" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div><FieldLabel>Matière</FieldLabel><input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex: Mathématiques" className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
          <div><FieldLabel>Classe</FieldLabel><input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Ex: 6ème A" className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        </div>
        {error && <div className="text-sm mb-3" style={{ color: COLORS.negative }}>{error}</div>}
        <button onClick={submit} disabled={adding} className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2" style={{ background: COLORS.primary, color: "#fff" }}>
          {adding && <Loader2 className="animate-spin" size={16} />} Ajouter cette matière
        </button>
      </div>

      {assignments.length === 0 ? (
        <EmptyState text="Aucune matière ajoutée pour l'instant." />
      ) : (
        <div className="space-y-2">
          {assignments.map((a) => (
            <div key={a.id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div>
                <span className="font-medium" style={{ color: COLORS.ink }}>{a.subject}</span>
                <span className="text-sm ml-2" style={{ color: COLORS.inkSoft }}>{a.class_name}</span>
              </div>
              <button onClick={() => onDelete(a.id)} style={{ color: COLORS.inkSoft }}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GradesView({ students, grades, releases, readOnly, lockedClass, passThreshold, onSave, onToggleRelease }) {
  const PASS_THRESHOLD = passThreshold ?? 10;
  const classNames = useMemo(() => [...new Set(students.map((s) => s.class_name))].sort(), [students]);
  const [className, setClassName] = useState(lockedClass || classNames[0] || "");
  const [term, setTerm] = useState("Trimestre 1");
  const [newSubject, setNewSubject] = useState("");
  const [ranked, setRanked] = useState(false);
  const [saving, setSaving] = useState(null);
  const [togglingRelease, setTogglingRelease] = useState(false);

  const isAnnual = term === "Annuel";
  const classStudents = useMemo(() => students.filter((s) => s.class_name === className), [students, className]);

  const trimesterGrades = useMemo(
    () => grades.filter((g) => g.class_name === className && ["Trimestre 1", "Trimestre 2", "Trimestre 3"].includes(g.term)),
    [grades, className]
  );
  const annualGrades = useMemo(() => {
    const map = {};
    trimesterGrades.forEach((g) => {
      if (g.score === null || g.score === undefined) return;
      const key = g.student_id + "|" + g.subject;
      map[key] = (map[key] || 0) + Number(g.score);
    });
    return Object.entries(map).map(([key, score]) => {
      const [student_id, subject] = key.split("|");
      return { student_id, subject, score, class_name: className, term: "Annuel" };
    });
  }, [trimesterGrades, className]);

  const classGrades = isAnnual ? annualGrades : grades.filter((g) => g.class_name === className && g.term === term);
  const subjects = useMemo(() => [...new Set(classGrades.map((g) => g.subject))].sort(), [classGrades]);
  const release = releases.find((r) => r.class_name === className && r.term === term);
  const published = release?.published || false;
  const cellsReadOnly = readOnly || isAnnual;

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
    onSave(classStudents[0]?.id, newSubject.trim(), null, term);
  };

  const handleChange = async (studentId, subject, value) => {
    setSaving(`${studentId}-${subject}`);
    const score = value === "" ? null : parseFloat(value);
    await onSave(studentId, subject, score, term);
    setSaving(null);
  };

  const togglePublish = async () => {
    setTogglingRelease(true);
    await onToggleRelease(className, term, !published);
    setTogglingRelease(false);
  };

  const summaryStats = useMemo(() => {
    const byGender = (predicate) => {
      const garcons = classStudents.filter((s) => s.gender === "Garçon" && predicate(s)).length;
      const filles = classStudents.filter((s) => s.gender === "Fille" && predicate(s)).length;
      const total = classStudents.filter(predicate).length;
      return { garcons, filles, total };
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
      const withScoreAny = classStudents.filter((s) => getScore(s.id, subj) !== null && getScore(s.id, subj) !== undefined);
      const passing = (gender) => withScore(gender).filter((s) => getScore(s.id, subj) >= PASS_THRESHOLD);
      const passingAny = withScoreAny.filter((s) => getScore(s.id, subj) >= PASS_THRESHOLD);
      const g = withScore("Garçon").length, f = withScore("Fille").length, total = withScoreAny.length;
      const pg = passing("Garçon").length, pf = passing("Fille").length, pt = passingAny.length;
      const pct = (part, tot) => (tot > 0 ? ((part / tot) * 100).toFixed(1) : "—");
      return { subject: subj, g, f, total, pg, pf, pt, pctG: pct(pg, g), pctF: pct(pf, f), pctT: pct(pt, total) };
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
    a.download = `notes_${className}_${term}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Notes</h1>
        <div className="flex gap-2 flex-wrap">
          <button onClick={exportExcel} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-sm" style={{ background: "#fff", color: COLORS.ink, border: `1px solid ${COLORS.line}` }}>
            <FileSpreadsheet size={16} /> Exporter (Excel)
          </button>
          <button
            onClick={() => setRanked((r) => !r)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-sm"
            style={{ background: ranked ? COLORS.primary : COLORS.ink, color: "#fff" }}
          >
            <ArrowDownWideNarrow size={16} /> {ranked ? "Classement actif" : "Classer"}
          </button>
        </div>
      </div>
      <p className="mb-5" style={{ color: COLORS.inkSoft }}>Saisis les notes par matière — total et moyenne calculés automatiquement.</p>

      <div className="flex flex-wrap gap-4 mb-5">
        <div>
          <FieldLabel>Classe</FieldLabel>
          {lockedClass ? (
            <div className="px-3 py-2.5 rounded-lg text-sm font-medium" style={{ ...inputStyle, opacity: 0.7 }}>{lockedClass}</div>
          ) : (
            <select value={className} onChange={(e) => { setClassName(e.target.value); setRanked(false); }} className="w-full sm:w-56 px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
              {classNames.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>
        <div>
          <FieldLabel>Période</FieldLabel>
          <select value={term} onChange={(e) => { setTerm(e.target.value); setRanked(false); }} className="w-full sm:w-48 px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
            {["Trimestre 1", "Trimestre 2", "Trimestre 3", "Annuel"].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      {isAnnual && (
        <div className="rounded-xl px-4 py-3 mb-5 text-sm" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>
          Classement annuel : somme automatique des 3 trimestres par matière. Non modifiable ici — corrige les notes dans le trimestre concerné si besoin.
        </div>
      )}

      {!readOnly && (
        <div className="rounded-xl px-4 py-3 mb-5 flex items-center justify-between flex-wrap gap-3" style={{ background: published ? COLORS.positiveSoft : COLORS.primarySoft }}>
          <div>
            <div className="text-sm font-semibold" style={{ color: published ? COLORS.positive : COLORS.primary }}>
              {published ? "✓ Résultats publiés aux parents" : "Résultats non publiés — les parents ne voient rien"}
            </div>
            <div className="text-xs mt-0.5" style={{ color: COLORS.inkSoft }}>{className} · {term}</div>
          </div>
          <button onClick={togglePublish} disabled={togglingRelease} className="text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5" style={{ background: published ? COLORS.negative : COLORS.positive, color: "#fff" }}>
            {togglingRelease && <Loader2 className="animate-spin" size={12} />}
            {published ? "Retirer / Masquer" : "Publier aux parents"}
          </button>
        </div>
      )}

      {!cellsReadOnly && (
        <div className="flex gap-2 mb-5">
          <input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Ajouter une matière (ex: Mathématiques)" className="flex-1 px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
          <button onClick={addSubject} className="px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-1.5" style={{ background: COLORS.primary, color: "#fff" }}><Plus size={16} /> Matière</button>
        </div>
      )}

      {classStudents.length === 0 ? (
        <EmptyState text="Aucun élève dans cette classe." />
      ) : subjects.length === 0 ? (
        <EmptyState text="Aucune matière ajoutée pour ce trimestre." />
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
                  <td className="px-4 py-2.5 font-medium whitespace-nowrap" style={{ color: row.student.gender === "Fille" ? COLORS.negative : COLORS.ink }}>{row.student.full_name}</td>
                  {subjects.map((subj) => {
                    const key = `${row.student.id}-${subj}`;
                    const val = getScore(row.student.id, subj);
                    return (
                      <td key={subj} className="px-2 py-2 text-center">
                        {cellsReadOnly ? (
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
          <h2 className="text-xl font-bold mt-8 mb-3" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Tableau statistique — {className} · {term}</h2>
          <div className="rounded-2xl overflow-x-auto mb-8" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: COLORS.paper }}>
                  <th className="text-left px-4 py-2.5 font-semibold" style={{ color: COLORS.inkSoft }}></th>
                  <th className="text-center px-3 py-2.5 font-semibold" style={{ color: COLORS.inkSoft }}>Inscrits</th>
                  <th className="text-center px-3 py-2.5 font-semibold" style={{ color: COLORS.positive }}>Admis</th>
                  <th className="text-center px-3 py-2.5 font-semibold" style={{ color: COLORS.positive }}>% Admis</th>
                  <th className="text-center px-3 py-2.5 font-semibold" style={{ color: COLORS.negative }}>Échoués</th>
                  <th className="text-center px-3 py-2.5 font-semibold" style={{ color: COLORS.negative }}>% Échoués</th>
                </tr>
              </thead>
              <tbody style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                <tr style={{ borderTop: `1px solid ${COLORS.line}` }}>
                  <td className="px-4 py-2 font-sans font-medium" style={{ color: COLORS.ink }}>Garçons</td>
                  <td className="text-center px-3 py-2">{summaryStats.inscrits.garcons}</td>
                  <td className="text-center px-3 py-2" style={{ color: COLORS.positive }}>{summaryStats.admis.garcons}</td>
                  <td className="text-center px-3 py-2" style={{ color: COLORS.positive }}>{summaryStats.admisPctG}%</td>
                  <td className="text-center px-3 py-2" style={{ color: COLORS.negative }}>{summaryStats.echoues.garcons}</td>
                  <td className="text-center px-3 py-2" style={{ color: COLORS.negative }}>{summaryStats.echouePctG}%</td>
                </tr>
                <tr style={{ borderTop: `1px solid ${COLORS.line}` }}>
                  <td className="px-4 py-2 font-sans font-medium" style={{ color: COLORS.ink }}>Filles</td>
                  <td className="text-center px-3 py-2">{summaryStats.inscrits.filles}</td>
                  <td className="text-center px-3 py-2" style={{ color: COLORS.positive }}>{summaryStats.admis.filles}</td>
                  <td className="text-center px-3 py-2" style={{ color: COLORS.positive }}>{summaryStats.admisPctF}%</td>
                  <td className="text-center px-3 py-2" style={{ color: COLORS.negative }}>{summaryStats.echoues.filles}</td>
                  <td className="text-center px-3 py-2" style={{ color: COLORS.negative }}>{summaryStats.echouePctF}%</td>
                </tr>
                <tr style={{ borderTop: `2px solid ${COLORS.line}`, background: COLORS.paper }}>
                  <td className="px-4 py-2 font-sans font-bold" style={{ color: COLORS.ink }}>Total</td>
                  <td className="text-center px-3 py-2 font-bold">{summaryStats.inscrits.total}</td>
                  <td className="text-center px-3 py-2 font-bold" style={{ color: COLORS.positive }}>{summaryStats.admis.total}</td>
                  <td className="text-center px-3 py-2 font-bold" style={{ color: COLORS.positive }}>{summaryStats.admisPctT}%</td>
                  <td className="text-center px-3 py-2 font-bold" style={{ color: COLORS.negative }}>{summaryStats.echoues.total}</td>
                  <td className="text-center px-3 py-2 font-bold" style={{ color: COLORS.negative }}>{summaryStats.echouePctT}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Résultats par matière (% ayant la moyenne)</h2>
          <div className="rounded-2xl overflow-x-auto" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: COLORS.paper }}>
                  <th className="text-left px-4 py-2.5 font-semibold" style={{ color: COLORS.inkSoft }}></th>
                  {subjectStats.map((s) => (
                    <th key={s.subject} className="text-center px-3 py-2.5 font-semibold whitespace-nowrap" style={{ color: COLORS.inkSoft }}>{s.subject}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                <tr style={{ borderTop: `1px solid ${COLORS.line}` }}>
                  <td className="px-4 py-2.5 font-sans font-medium" style={{ color: COLORS.ink }}>Garçons</td>
                  {subjectStats.map((s) => (
                    <td key={s.subject} className="text-center px-3 py-2.5 font-bold text-base" style={{ color: COLORS.primary }}>{s.pctG}%</td>
                  ))}
                </tr>
                <tr style={{ borderTop: `1px solid ${COLORS.line}` }}>
                  <td className="px-4 py-2.5 font-sans font-medium" style={{ color: COLORS.ink }}>Filles</td>
                  {subjectStats.map((s) => (
                    <td key={s.subject} className="text-center px-3 py-2.5 font-bold text-base" style={{ color: COLORS.primary }}>{s.pctF}%</td>
                  ))}
                </tr>
                <tr style={{ borderTop: `2px solid ${COLORS.line}`, background: COLORS.paper }}>
                  <td className="px-4 py-2.5 font-sans font-bold" style={{ color: COLORS.ink }}>Total</td>
                  {subjectStats.map((s) => (
                    <td key={s.subject} className="text-center px-3 py-2.5 font-bold text-base" style={{ color: COLORS.primary }}>{s.pctT}%</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ---------- Personnel & Paie (comptable / fondateur) ----------
function StaffPaymentsView({ staffProfiles, staffPayments, currency, readOnly, canDeactivate, onSave, onToggleActive }) {
  const [month, setMonth] = useState(SCHOOL_MONTHS[0]);
  const [saving, setSaving] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const fonctionLabel = (p) => {
    if (p.role === "fondateur") return "Fondateur / Directeur";
    if (p.role === "comptable") return "Comptable";
    if (p.role === "enseignant") return `Enseignant${p.class_name ? " · " + p.class_name : ""}`;
    return p.fonction || "Personnel";
  };

  const getPayment = (userId) => staffPayments.find((sp) => sp.user_id === userId && sp.month === month);

  const handleChange = async (userId, field, value) => {
    setSaving(`${userId}-${field}`);
    await onSave(userId, month, field, value === "" ? 0 : parseFloat(value));
    setSaving(null);
  };

  const handleToggleActive = async (userId, current) => {
    setTogglingId(userId);
    await onToggleActive(userId, !current);
    setTogglingId(null);
  };

  const totals = staffProfiles.reduce(
    (acc, p) => {
      const pay = getPayment(p.user_id);
      acc.solde += Number(pay?.solde || 0);
      acc.paye += Number(pay?.paye || 0);
      return acc;
    },
    { solde: 0, paye: 0 }
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Personnel</h1>
      </div>
      <p className="mb-5" style={{ color: COLORS.inkSoft }}>Salaires du mois pour tout le personnel de l'école.</p>

      <div className="mb-5">
        <FieldLabel>Mois</FieldLabel>
        <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full sm:w-56 px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
          {SCHOOL_MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {staffProfiles.length === 0 ? (
        <EmptyState text="Aucun membre du personnel enregistré pour l'instant." />
      ) : (
        <div className="rounded-2xl overflow-x-auto" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: COLORS.paper }}>
                <th className="text-left px-4 py-3 font-semibold whitespace-nowrap" style={{ color: COLORS.inkSoft }}>Nom</th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap" style={{ color: COLORS.inkSoft }}>Fonction</th>
                <th className="text-center px-3 py-3 font-semibold whitespace-nowrap" style={{ color: COLORS.inkSoft }}>Solde du mois</th>
                <th className="text-center px-3 py-3 font-semibold whitespace-nowrap" style={{ color: COLORS.inkSoft }}>Payé</th>
                <th className="text-center px-3 py-3 font-semibold whitespace-nowrap" style={{ color: COLORS.ink }}>Reste</th>
                <th className="text-center px-3 py-3 font-semibold whitespace-nowrap" style={{ color: COLORS.ink }}>Statut</th>
                {canDeactivate && <th className="text-center px-3 py-3 font-semibold whitespace-nowrap" style={{ color: COLORS.ink }}>Compte</th>}
              </tr>
            </thead>
            <tbody>
              {staffProfiles.map((p, i) => {
                const pay = getPayment(p.user_id);
                const solde = Number(pay?.solde || 0);
                const paye = Number(pay?.paye || 0);
                const reste = solde - paye;
                const locked = pay?.approved || readOnly;
                const isActive = p.active !== false;
                return (
                  <tr key={p.user_id} style={{ borderTop: i === 0 ? "none" : `1px solid ${COLORS.line}`, opacity: isActive ? 1 : 0.5 }}>
                    <td className="px-4 py-2.5 font-medium whitespace-nowrap" style={{ color: COLORS.ink }}>{p.full_name}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: COLORS.inkSoft }}>{fonctionLabel(p)}</td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="number"
                        defaultValue={solde || ""}
                        disabled={locked}
                        onBlur={(e) => handleChange(p.user_id, "solde", e.target.value)}
                        className="w-24 px-2 py-1.5 rounded-lg text-center outline-none text-sm"
                        style={{ ...inputStyle, opacity: locked ? 0.6 : 1 }}
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="number"
                        defaultValue={paye || ""}
                        disabled={locked}
                        onBlur={(e) => handleChange(p.user_id, "paye", e.target.value)}
                        className="w-24 px-2 py-1.5 rounded-lg text-center outline-none text-sm"
                        style={{ ...inputStyle, opacity: locked ? 0.6 : 1 }}
                      />
                    </td>
                    <td className="px-3 py-2.5 text-center font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: reste > 0 ? COLORS.negative : COLORS.positive }}>{fmt(reste, currency)}</td>
                    <td className="px-3 py-2.5 text-center">
                      {pay?.approved ? (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: COLORS.positiveSoft, color: COLORS.positive }}>✓ Approuvé</span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>En attente</span>
                      )}
                    </td>
                    {canDeactivate && (
                      <td className="px-3 py-2.5 text-center">
                        <button
                          onClick={() => handleToggleActive(p.user_id, isActive)}
                          disabled={togglingId === p.user_id}
                          className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 mx-auto"
                          style={{ background: isActive ? COLORS.negativeSoft : COLORS.positiveSoft, color: isActive ? COLORS.negative : COLORS.positive }}
                        >
                          {togglingId === p.user_id && <Loader2 className="animate-spin" size={11} />}
                          {isActive ? "Désactiver" : "Réactiver"}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
              <tr style={{ borderTop: `2px solid ${COLORS.line}`, background: COLORS.paper }}>
                <td className="px-4 py-2.5 font-bold" style={{ color: COLORS.ink }} colSpan={2}>Total</td>
                <td className="px-3 py-2.5 text-center font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{fmt(totals.solde, currency)}</td>
                <td className="px-3 py-2.5 text-center font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{fmt(totals.paye, currency)}</td>
                <td className="px-3 py-2.5 text-center font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: totals.solde - totals.paye > 0 ? COLORS.negative : COLORS.positive }}>{fmt(totals.solde - totals.paye, currency)}</td>
                <td></td>
                {canDeactivate && <td></td>}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------- Mon salaire (tous les membres du personnel) ----------
function MySalaryView({ myPayments, currency, onApprove }) {
  const [approving, setApproving] = useState(null);
  const sorted = [...myPayments].sort((a, b) => SCHOOL_MONTHS.indexOf(a.month) - SCHOOL_MONTHS.indexOf(b.month));

  const handleApprove = async (id) => {
    setApproving(id);
    await onApprove(id);
    setApproving(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Mon salaire</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>Approuve chaque mois une fois le paiement reçu — définitif, comme une signature.</p>

      {sorted.length === 0 ? (
        <div className="rounded-2xl p-10" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <EmptyState text="Aucun salaire enregistré pour l'instant. Le comptable n'a pas encore rempli ton mois." />
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((p) => {
            const reste = Number(p.solde) - Number(p.paye);
            return (
              <div key={p.id} className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="font-semibold" style={{ color: COLORS.ink }}>{p.month}</div>
                  {p.approved ? (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: COLORS.positiveSoft, color: COLORS.positive }}><Check size={12} /> Approuvé</span>
                  ) : (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>En attente d'approbation</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: COLORS.inkSoft }}>Solde du mois</div>
                    <div className="font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{fmt(p.solde, currency)}</div>
                  </div>
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: COLORS.inkSoft }}>Payé</div>
                    <div className="font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.positive }}>{fmt(p.paye, currency)}</div>
                  </div>
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: COLORS.inkSoft }}>Reste</div>
                    <div className="font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: reste > 0 ? COLORS.negative : COLORS.positive }}>{fmt(reste, currency)}</div>
                  </div>
                </div>
                {!p.approved && (
                  <button
                    onClick={() => handleApprove(p.id)}
                    disabled={approving === p.id}
                    className="w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                    style={{ background: COLORS.positive, color: "#fff" }}
                  >
                    {approving === p.id && <Loader2 className="animate-spin" size={14} />}
                    Approuver la réception — définitif
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ExpensesView({ expenses, currency, readOnly, onAdd, onDelete, onValidate }) {
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
                <div className="text-xs flex items-center gap-1.5" style={{ color: COLORS.inkSoft }}>
                  {e.category} · {new Date(e.date).toLocaleDateString("fr-FR")}
                  {e.validated && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: COLORS.positiveSoft, color: COLORS.positive }}>Validé</span>}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.negative }}>−{fmt(e.amount, currency)}</div>
                {e.category === "Crédits" && !e.validated && !readOnly && (
                  <button onClick={() => onValidate(e.id)} className="text-xs font-medium px-2.5 py-1.5 rounded-full" style={{ background: COLORS.positiveSoft, color: COLORS.positive }}>Valider</button>
                )}
                {!e.validated && <button onClick={() => onDelete(e.id)} style={{ color: COLORS.inkSoft }}><Trash2 size={16} /></button>}
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
                          <span style={{ color: s.gender === "Fille" ? COLORS.negative : COLORS.ink }}>{s.full_name}</span>
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
function AttendanceSummary({ student, attendance }) {
  const records = attendance.filter((a) => a.student_id === student.id);
  if (records.length === 0) return null;
  const absences = records.filter((a) => !a.present).sort((a, b) => new Date(b.date) - new Date(a.date));
  const total = records.length;
  const presentCount = total - absences.length;
  const regularityPct = total > 0 ? ((presentCount / total) * 100).toFixed(0) : 100;

  return (
    <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${COLORS.line}` }}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.inkSoft }}>Présence</div>
        <span className="text-xs font-bold" style={{ color: regularityPct >= 90 ? COLORS.positive : COLORS.negative, fontFamily: "'IBM Plex Mono', monospace" }}>{regularityPct}% de régularité</span>
      </div>
      {absences.length === 0 ? (
        <div className="text-xs px-2.5 py-2 rounded-lg" style={{ background: COLORS.positiveSoft, color: COLORS.positive }}>Aucune absence enregistrée.</div>
      ) : (
        <div className="space-y-1.5">
          {absences.slice(0, 5).map((a) => (
            <div key={a.id} className="flex items-center justify-between text-xs px-2.5 py-2 rounded-lg" style={{ background: COLORS.negativeSoft }}>
              <span style={{ color: COLORS.negative }}>Absent — {a.session}</span>
              <span className="font-semibold" style={{ color: COLORS.negative }}>{new Date(a.date).toLocaleDateString("fr-FR")}</span>
            </div>
          ))}
          {absences.length > 5 && <div className="text-xs text-center" style={{ color: COLORS.inkSoft }}>+ {absences.length - 5} autre(s) absence(s)</div>}
        </div>
      )}
    </div>
  );
}

function ChildGradesBlock({ student, grades }) {
  const availableTerms = useMemo(
    () => ["Trimestre 1", "Trimestre 2", "Trimestre 3", "Annuel"].filter((t) => grades.some((g) => g.class_name === student.class_name && g.term === t)),
    [grades, student.class_name]
  );
  const [term, setTerm] = useState(availableTerms[availableTerms.length - 1] || "");

  if (availableTerms.length === 0) return null;
  const activeTerm = availableTerms.includes(term) ? term : availableTerms[availableTerms.length - 1];

  const classTermGrades = grades.filter((g) => g.class_name === student.class_name && g.term === activeTerm && g.score !== null && g.score !== undefined);
  const byStudent = {};
  classTermGrades.forEach((g) => { (byStudent[g.student_id] = byStudent[g.student_id] || []).push(g); });
  const moyennes = Object.entries(byStudent).map(([sid, gs]) => ({ sid, moyenne: gs.reduce((s, g) => s + Number(g.score), 0) / gs.length }));
  moyennes.sort((a, b) => b.moyenne - a.moyenne);
  const rang = moyennes.findIndex((m) => m.sid === student.id) + 1;
  const totalClasse = moyennes.length;

  const childGrades = byStudent[student.id] || [];
  const avg = childGrades.length > 0 ? childGrades.reduce((s, g) => s + Number(g.score), 0) / childGrades.length : null;

  return (
    <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${COLORS.line}` }}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.inkSoft }}>Bulletin</div>
        <select value={activeTerm} onChange={(e) => setTerm(e.target.value)} className="text-xs px-2.5 py-1.5 rounded-lg outline-none" style={inputStyle}>
          {availableTerms.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold" style={{ color: COLORS.primary, fontFamily: "'IBM Plex Mono', monospace" }}>Moyenne: {avg !== null ? avg.toFixed(2) : "—"}</span>
        {rang > 0 && <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: COLORS.positiveSoft, color: COLORS.positive }}>{rang}{rang === 1 ? "er" : "e"} / {totalClasse}</span>}
      </div>
      <div className="space-y-1.5">
        {childGrades.map((g) => (
          <div key={g.subject} className="flex items-center justify-between text-xs px-2.5 py-2 rounded-lg" style={{ background: COLORS.paper }}>
            <span style={{ color: COLORS.inkSoft }}>{g.subject}</span>
            <span className="font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{g.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Réactivation automatique (parent, nouvelle année) ----------
function SelfReactivateBanner({ onSuccess }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    setError("");
    const { data, error: rpcError } = await supabase.rpc("self_reactivate_by_phone", { p_phone: phone.trim() });
    if (rpcError) setError("Erreur : " + rpcError.message);
    else if (data === true) await onSuccess();
    else setError("Aucun élève trouvé avec ce numéro pour l'année en cours. Contacte l'école pour vérifier.");
    setLoading(false);
  };

  return (
    <div className="rounded-2xl p-5 mb-6" style={{ background: COLORS.primarySoft, border: `1px solid ${COLORS.primary}33` }}>
      <div className="font-semibold mb-1" style={{ color: COLORS.primary }}>Ton compte est en pause pour cette année scolaire</div>
      <p className="text-sm mb-3" style={{ color: COLORS.inkSoft }}>
        Tu peux toujours consulter les années précédentes. Pour retrouver un accès complet cette année, confirme le numéro de téléphone enregistré pour ton enfant.
      </p>
      <div className="flex gap-2 flex-wrap">
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: 622 00 00 00" className="flex-1 min-w-[160px] px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
        <button onClick={submit} disabled={loading} className="px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2" style={{ background: COLORS.primary, color: "#fff" }}>
          {loading && <Loader2 className="animate-spin" size={14} />} Réactiver mon compte
        </button>
      </div>
      {error && <div className="text-sm mt-2" style={{ color: COLORS.negative }}>{error}</div>}
    </div>
  );
}

function ParentChildrenView({ children, paidByStudent, currency, payments, onRelink, grades, attendance, staffProfiles, viewYear, setViewYear, availableYears, currentYear }) {
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
      <p className="mb-3" style={{ color: COLORS.inkSoft }}>Suivi scolaire et financier.</p>
      {availableYears && availableYears.length > 1 && (
        <div className="mb-4">
          <FieldLabel>Année scolaire</FieldLabel>
          <select value={viewYear} onChange={(e) => setViewYear(e.target.value)} className="w-full sm:w-56 px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle}>
            {availableYears.map((y) => <option key={y} value={y}>{y}{y === currentYear ? " (année en cours)" : " (archive)"}</option>)}
          </select>
        </div>
      )}
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
            const teacher = staffProfiles.find((sp) => sp.role === "enseignant" && sp.class_name === c.class_name);
            return (
              <div key={c.id} className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                <div className="font-bold text-lg mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{c.full_name}</div>
                <div className="text-sm mb-3" style={{ color: COLORS.inkSoft }}>{c.class_name}</div>
                <div className="flex justify-between text-sm"><span style={{ color: COLORS.inkSoft }}>Payé</span><span style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.positive }}>{fmt(paid, currency)}</span></div>
                <div className="flex justify-between text-sm mt-1"><span style={{ color: COLORS.inkSoft }}>Reste</span><span style={{ fontFamily: "'IBM Plex Mono', monospace", color: reste > 0 ? COLORS.negative : COLORS.positive }}>{fmt(reste, currency)}</span></div>

                <ChildGradesBlock student={c} grades={grades} />
                <AttendanceSummary student={c} attendance={attendance} />

                {childPayments.length > 0 && (
                  <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${COLORS.line}` }}>
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                      <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.inkSoft }}>Reçus de paiement</div>
                      {teacher && (
                        <div className="text-xs" style={{ color: COLORS.inkSoft }}>
                          Enseignant: <span style={{ color: COLORS.ink }}>{teacher.full_name}</span>
                          {teacher.phone && (
                            <a href={`tel:${teacher.phone}`} className="ml-1 underline" style={{ color: COLORS.primary }}>{teacher.phone}</a>
                          )}
                        </div>
                      )}
                    </div>
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
// ---------- Remarques des parents ----------
// ---------- Payer sans se déplacer (parent) ----------
function ParentPayView({ comptable, currency }) {
  const [copied, setCopied] = useState(false);
  const copyNumber = () => {
    if (!comptable?.phone) return;
    navigator.clipboard?.writeText(comptable.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Payer sans se déplacer</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>Envoie la scolarité par mobile money, sans venir à l'école.</p>

      {!comptable || !comptable.phone ? (
        <div className="rounded-2xl p-10" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <EmptyState text="Le comptable de l'école n'a pas encore renseigné son numéro de téléphone. Contacte directement l'école." />
        </div>
      ) : (
        <div className="rounded-2xl p-5" style={{ background: COLORS.primarySoft }}>
          <div className="flex items-center gap-2 mb-3">
            <Smartphone size={18} style={{ color: COLORS.primary }} />
            <span className="font-semibold" style={{ color: COLORS.primary }}>Numéro du comptable — {comptable.full_name}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-lg mb-3" style={{ background: "#fff" }}>
            <span className="font-bold text-lg" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{comptable.phone}</span>
            <span className="text-xs font-medium flex items-center gap-1" style={{ color: COLORS.primary }} onClick={copyNumber}><Copy size={13} /> {copied ? "Copié !" : "Copier"}</span>
          </div>
          <a href={`tel:${comptable.phone}`} className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2" style={{ background: COLORS.ink, color: "#fff" }}>
            Appeler le comptable
          </a>
          <p className="text-xs mt-3" style={{ color: COLORS.inkSoft }}>
            Envoie le montant de la scolarité par Orange Money ou tout autre mobile money à ce numéro, puis contacte le comptable pour confirmer — il enregistrera le paiement dans le système, et tu recevras ton reçu directement dans l'espace "Mes enfants".
          </p>
        </div>
      )}
    </div>
  );
}

function ParentRemarksView({ remarks, onAdd }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!message.trim()) return;
    setSending(true);
    setError("");
    const err = await onAdd(message.trim());
    if (err) setError("Erreur : " + err.message);
    else setMessage("");
    setSending(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Mes remarques</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>Envoie une remarque ou suggestion directement au directeur/fondateur de l'école.</p>

      <div className="rounded-2xl p-5 mb-6" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <FieldLabel>Ta remarque</FieldLabel>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Écris ta remarque ou suggestion ici..." className="w-full px-3 py-2.5 rounded-lg outline-none mb-3" style={inputStyle} />
        {error && <div className="text-sm mb-3" style={{ color: COLORS.negative }}>{error}</div>}
        <button onClick={submit} disabled={sending} className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2" style={{ background: COLORS.primary, color: "#fff" }}>
          {sending && <Loader2 className="animate-spin" size={16} />}
          Envoyer au directeur
        </button>
      </div>

      {remarks.length > 0 && (
        <>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: COLORS.inkSoft }}>Mes remarques envoyées</h2>
          <div className="space-y-3">
            {remarks.map((r) => (
              <div key={r.id} className="rounded-2xl p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                <div className="text-xs mb-1.5" style={{ color: COLORS.inkSoft }}>{new Date(r.created_at).toLocaleDateString("fr-FR")}</div>
                <p className="text-sm" style={{ color: COLORS.ink }}>{r.message}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---------- Gestion des parents (fondateur — activer/désactiver) ----------
function ParentsManagementView({ parents, students, onToggleActive }) {
  const [togglingId, setTogglingId] = useState(null);

  const childrenOf = (parentId) => students.filter((s) => s.parent_id === parentId).map((s) => s.full_name);

  const handleToggle = async (userId, current) => {
    setTogglingId(userId);
    await onToggleActive(userId, !current);
    setTogglingId(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Parents</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>Active les parents dont l'enfant continue cette année — les autres restent bloqués sans être supprimés.</p>

      {parents.length === 0 ? (
        <EmptyState text="Aucun parent inscrit pour l'instant." />
      ) : (
        <div className="space-y-2">
          {parents.map((p) => {
            const isActive = p.active !== false;
            const kids = childrenOf(p.user_id);
            return (
              <div key={p.user_id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}`, opacity: isActive ? 1 : 0.6 }}>
                <div className="min-w-0">
                  <div className="font-medium" style={{ color: COLORS.ink }}>{p.full_name}</div>
                  <div className="text-xs" style={{ color: COLORS.inkSoft }}>{p.phone || "Téléphone non renseigné"}{kids.length > 0 && ` · ${kids.join(", ")}`}</div>
                </div>
                <button
                  onClick={() => handleToggle(p.user_id, isActive)}
                  disabled={togglingId === p.user_id}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 shrink-0"
                  style={{ background: isActive ? COLORS.negativeSoft : COLORS.positiveSoft, color: isActive ? COLORS.negative : COLORS.positive }}
                >
                  {togglingId === p.user_id && <Loader2 className="animate-spin" size={11} />}
                  {isActive ? "Désactiver" : "Réactiver"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FondateurRemarksView({ remarks, parents, onDelete }) {
  const parentInfo = (id) => parents.find((p) => p.user_id === id);

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Remarques des parents</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>Suggestions et remarques envoyées directement par les parents d'élèves.</p>

      {remarks.length === 0 ? (
        <div className="rounded-2xl p-10" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}><EmptyState text="Aucune remarque reçue pour l'instant." /></div>
      ) : (
        <div className="space-y-3">
          {remarks.map((r) => {
            const parent = parentInfo(r.parent_id);
            return (
              <div key={r.id} className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold" style={{ color: COLORS.ink }}>{parent?.full_name || "Parent"}</div>
                    <div className="text-xs" style={{ color: COLORS.inkSoft }}>
                      {parent?.phone || "Téléphone non renseigné"} · {new Date(r.created_at).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                  <button onClick={() => onDelete(r.id)} style={{ color: COLORS.inkSoft }}><Trash2 size={15} /></button>
                </div>
                <p className="text-sm" style={{ color: COLORS.ink }}>{r.message}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Registre de présence ----------
function AttendanceView({ students, attendance, readOnly, lockedClass, onSave }) {
  const classNames = useMemo(() => [...new Set(students.map((s) => s.class_name))].sort(), [students]);
  const [className, setClassName] = useState(lockedClass || classNames[0] || "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [session, setSession] = useState("Matin");
  const [saving, setSaving] = useState(null);

  const classStudents = students.filter((s) => s.class_name === className);
  const getStatus = (studentId) => attendance.find((a) => a.student_id === studentId && a.date === date && a.session === session);

  const toggle = async (studentId, present) => {
    setSaving(studentId);
    await onSave(studentId, className, date, session, present);
    setSaving(null);
  };

  const presentCount = classStudents.filter((s) => getStatus(s.id)?.present === true).length;
  const absentCount = classStudents.filter((s) => getStatus(s.id)?.present === false).length;

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Présences</h1>
      <p className="mb-5" style={{ color: COLORS.inkSoft }}>Contrôle du matin (8h00) et de l'après-midi (14h00) — visible par les parents.</p>

      <div className="flex flex-wrap gap-4 mb-5">
        <div>
          <FieldLabel>Classe</FieldLabel>
          {lockedClass ? (
            <div className="px-3 py-2.5 rounded-lg text-sm font-medium" style={{ ...inputStyle, opacity: 0.7 }}>{lockedClass}</div>
          ) : (
            <select value={className} onChange={(e) => setClassName(e.target.value)} className="w-full sm:w-56 px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
              {classNames.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>
        <div>
          <FieldLabel>Date</FieldLabel>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
        </div>
        <div>
          <FieldLabel>Contrôle</FieldLabel>
          <div className="flex gap-2">
            {[["Matin", "8h00"], ["Après-midi", "14h00"]].map(([s, time]) => (
              <button key={s} onClick={() => setSession(s)} className="px-3 py-2.5 rounded-lg text-sm font-medium" style={{ background: session === s ? COLORS.ink : "#fff", color: session === s ? "#fff" : COLORS.inkSoft, border: `1px solid ${session === s ? COLORS.ink : COLORS.line}` }}>
                {s} · {time}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-5">
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: COLORS.positiveSoft, color: COLORS.positive }}>{presentCount} présent{presentCount > 1 ? "s" : ""}</span>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: COLORS.negativeSoft, color: COLORS.negative }}>{absentCount} absent{absentCount > 1 ? "s" : ""}</span>
      </div>

      {classStudents.length === 0 ? (
        <EmptyState text="Aucun élève dans cette classe." />
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          {classStudents.map((s, i) => {
            const status = getStatus(s.id);
            return (
              <div key={s.id} className="flex items-center justify-between px-5 py-3" style={{ borderTop: i === 0 ? "none" : `1px solid ${COLORS.line}` }}>
                <span className="font-medium" style={{ color: s.gender === "Fille" ? COLORS.negative : COLORS.ink }}>{s.full_name}</span>
                {readOnly ? (
                  status ? (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: status.present ? COLORS.positiveSoft : COLORS.negativeSoft, color: status.present ? COLORS.positive : COLORS.negative }}>
                      {status.present ? "Présent" : "Absent"}
                    </span>
                  ) : <span className="text-xs" style={{ color: COLORS.inkSoft }}>—</span>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggle(s.id, true)}
                      disabled={saving === s.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: status?.present === true ? COLORS.positive : COLORS.positiveSoft, color: status?.present === true ? "#fff" : COLORS.positive }}
                    >
                      Présent
                    </button>
                    <button
                      onClick={() => toggle(s.id, false)}
                      disabled={saving === s.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: status?.present === false ? COLORS.negative : COLORS.negativeSoft, color: status?.present === false ? "#fff" : COLORS.negative }}
                    >
                      Absent
                    </button>
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
function StudentModal({ levels, onClose, onSave }) {
  const [fullName, setFullName] = useState("");
  const [level, setLevel] = useState(levels[0]);
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
            {levels.map((lvl) => (
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
    <Modal title="Essai gratuit terminé" onClose={onClose}>
      <div className="space-y-5">
        <p className="text-sm" style={{ color: COLORS.inkSoft }}>
          L'essai gratuit de 7 jours est terminé. Choisis une formule pour continuer :
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
// ---------- Mon profil (tous les rôles) ----------
function MyProfileModal({ profile, onClose, onSave }) {
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const submit = async () => {
    setSaving(true);
    setError("");
    const err = await onSave(fullName, phone);
    if (err) setError("Erreur : " + err.message);
    else { setSaved(true); setTimeout(onClose, 1200); }
    setSaving(false);
  };

  return (
    <Modal title="Mon profil" onClose={onClose}>
      <div className="space-y-4">
        <div><FieldLabel>Nom complet</FieldLabel><input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        <div>
          <FieldLabel>Téléphone</FieldLabel>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: 622 00 00 00" className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
          {(profile.role === "comptable" || profile.role === "enseignant") && (
            <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>Visible par les parents pour te contacter.</p>
          )}
        </div>
        {error && <div className="text-sm" style={{ color: COLORS.negative }}>{error}</div>}
        {saved && <div className="text-sm" style={{ color: COLORS.positive }}>✓ Enregistré !</div>}
        <button onClick={submit} disabled={saving} className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2" style={{ background: COLORS.ink, color: "#fff" }}>
          {saving && <Loader2 className="animate-spin" size={16} />} Enregistrer
        </button>
      </div>
    </Modal>
  );
}

function LessonModal({ lockedClass, onClose, onSave }) {
  const [mode, setMode] = useState("texte"); // texte | photo
  const [className, setClassName] = useState(lockedClass || "");
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
        <div><FieldLabel>Classe</FieldLabel><input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Ex: CM2" disabled={!!lockedClass} className="w-full px-3 py-2.5 rounded-lg outline-none" style={{ ...inputStyle, opacity: lockedClass ? 0.7 : 1 }} /></div>
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
