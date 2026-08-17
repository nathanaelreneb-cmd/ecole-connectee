import React, { useState, useEffect, useMemo, useCallback, createContext, useContext } from "react";
import {
  LayoutDashboard, Users, FileText, Megaphone, GraduationCap,
  Plus, Trash2, X, Loader2, LogOut, Check, Clock, Copy,
  Wallet, TrendingUp, AlertTriangle, BookOpen, FileSpreadsheet, Smartphone, TrendingDown, Receipt, Shield, ClipboardList, ArrowDownWideNarrow, MessageSquare, Menu, CalendarCheck, Languages, Share2, Banknote, Contact, BookMarked, QrCode,
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
const TERM_MONTHS = { "Trimestre 1": ["Octobre", "Novembre", "Décembre"], "Trimestre 2": ["Février", "Mars", "Avril"] };
const COMPOSITION_MONTHS = { "Trimestre 1": "Janvier", "Trimestre 2": "Mai" };
const SECONDAIRE_GRADE_MONTHS = ["Octobre", "Novembre", "Décembre", "Janvier", "Février", "Mars", "Avril", "Mai"];
const isCompositionMonth = (m) => Object.values(COMPOSITION_MONTHS).includes(m);
const monthToTerm = (m) => {
  const fromCours = Object.entries(TERM_MONTHS).find(([, months]) => months.includes(m))?.[0];
  if (fromCours) return fromCours;
  return Object.entries(COMPOSITION_MONTHS).find(([, mo]) => mo === m)?.[0] || "Trimestre 1";
};
// ---------- Traductions (FR/EN) ----------
const TRANSLATIONS = {
  fr: {
    nav_dashboard: "Tableau de bord",
    nav_students: "Élèves",
    nav_students_payments: "Élèves & Paiements",
    nav_announcements: "Annonces",
    nav_attendance: "Présences",
    nav_grades: "Notes",
    nav_head_teachers: "Professeurs principaux",
    nav_lessons: "Devoirs",
    nav_expenses: "Dépenses",
    nav_staff: "Personnel",
    nav_parents: "Parents",
    nav_my_salary: "Mon salaire",
    nav_remarks: "Remarques parents",
    nav_my_remarks: "Mes remarques",
    nav_my_children: "Mes enfants",
    nav_my_assignments: "Mes matières",
    nav_pay_remotely: "Payer sans se déplacer",
    nav_stats: "Statistiques",
    nav_admin: "Administration",
    menu: "Menu",
    my_profile: "Mon profil",
    logout: "Déconnexion",
    login: "Se connecter",
    signup: "Créer mon compte",
    email: "Email",
    password: "Mot de passe",
    forgot_password: "Mot de passe oublié ?",
    no_account: "Pas encore de compte ? En créer un",
    has_account: "Déjà un compte ? Se connecter",
    back_to_login: "← Retour à la connexion",
    show: "Afficher",
    hide: "Masquer",
    send_link: "Envoyer le lien",
    onboarding_title: "Configure ton compte",
    onboarding_subtitle: "Dernière étape avant d'accéder à l'application.",
    back: "← Retour",
    your_full_name: "Ton nom complet",
    your_role: "Ton rôle",
    role_fondateur: "Fondateur / Directeur",
    role_comptable: "Comptable",
    role_enseignant: "Enseignant",
    role_parent: "Parent",
    role_personnel: "Personnel (autre)",
    your_class: "Ta classe",
    your_class_hint: "Utilise exactement le même nom que le comptable pour cette classe.",
    your_subject: "Ta matière (secondaire uniquement)",
    your_subject_hint: "Laisse vide si tu es enseignant polyvalent (primaire). Tu pourras ajouter d'autres matières/classes plus tard.",
    your_phone: "Ton numéro de téléphone",
    your_phone_hint_teacher: "Visible par les parents de ta classe, pour qu'ils puissent te joindre.",
    your_phone_hint_comptable: "Visible par les parents dans \"Payer sans se déplacer\", pour qu'ils puissent te contacter directement.",
    your_function: "Ta fonction",
    your_function_placeholder: "Ex: Gardien, Cuisinier, Surveillant...",
    your_function_hint: "Tu apparaîtras automatiquement dans le tableau de paie du comptable.",
    school_type: "Type d'établissement",
    school_type_primaire: "Maternelle + Élémentaire (primaire)",
    school_type_secondaire: "Secondaire",
    school_type_hint: "Deux structures distinctes sont gérées séparément — crée un second compte fondateur si tu gères aussi l'autre niveau.",
    school_name: "Nom de ton école",
    school_name_placeholder: "Ex: Groupe Scolaire Étoile",
    school_name_hint: "Un code unique sera généré pour que ton équipe et les parents rejoignent ton école.",
    school_code: "Code de l'école",
    parent_phone_label: "Ton numéro de téléphone",
    parent_phone_hint: "Utile pour que l'école puisse te contacter directement.",
    continue: "Continuer",
    dashboard_title: "Tableau de bord",
    dashboard_subtitle: "Vue d'ensemble de votre école.",
    active: "(active)",
    archive: "(archive)",
    new_school_year: "+ Nouvelle année scolaire",
    archive_banner: "Tu consultes une archive ({year}) — lecture seule, aucune modification possible.",
    start_new_year_title: "Démarrer une nouvelle année",
    start_new_year_body: "L'année {year} sera archivée en lecture seule (consultable, non modifiable). Tous les comptes (comptable, enseignants, parents) seront automatiquement désactivés — tu pourras réactiver un par un ceux qui continuent cette année, depuis \"Personnel\" et \"Parents\".",
    new_year_name_label: "Nom de la nouvelle année",
    start_year_button: "Démarrer",
    this_year: "cette année",
    school_code_share: "Code de l'école — à partager",
    copied: "Copié !",
    copy: "Copier",
    stat_students: "Élèves inscrits",
    stat_full_paid: "Scolarité complète",
    stat_total_collected: "Total collecté",
    stat_total_expenses: "Total dépenses",
    stat_remaining: "Reste à payer (élèves)",
    stat_net_balance: "Solde net (collecté − dépenses)",
    stat_homework: "Devoirs publiés",
    students_title: "Élèves & Paiements",
    students_subtitle: "Clique sur une classe pour voir sa liste.",
    export_excel: "Exporter (Excel)",
    student: "Élève",
    payment: "Paiement",
    search_student_placeholder: "Rechercher un élève par nom...",
    no_student_registered: "Aucun élève enregistré.",
    no_student_found: "Aucun élève trouvé pour",
    results_for: "Résultats pour",
    back_to_classes: "← Retour aux classes",
    parent_label: "Parent",
    linked: "lié",
    no_parent_linked: "Aucun parent lié",
    link_parent: "Lier parent",
    total: "Total",
    paid: "payé",
    remaining: "reste",
    student_count_suffix: "élève",
    students_count_suffix: "élèves",
    trial_days_left: "Essai gratuit :",
    days_remaining: "jour(s) restant(s)",
    trial_ended: "Essai gratuit terminé — abonnement requis",
    students_by_class: "Liste des élèves par classe.",
    lessons_title: "Devoirs",
    lessons_subtitle_teacher: "Publiez des leçons/devoirs et suivez qui les a faits.",
    lessons_subtitle_parent: "Devoirs de vos enfants — cochez une fois terminés.",
    publish: "Publier",
    no_lesson_published: "Aucun devoir publié pour l'instant.",
    no_lesson_yet: "Aucun devoir pour le moment.",
    for_date: "Pour le",
    view_file: "Voir le fichier",
    students_completed: "élèves ont terminé",
    done: "Fait",
    mark_as_done: "Marquer comme fait",
    grades_subtitle: "Saisis les notes par matière — total et moyenne calculés automatiquement.",
    class_label: "Classe",
    period_label: "Période",
    annual: "Annuel",
    annual_notice: "Classement annuel : somme automatique des 3 trimestres par matière. Non modifiable ici — corrige les notes dans le trimestre concerné si besoin.",
    published_to_parents: "✓ Résultats publiés aux parents",
    not_published: "Résultats non publiés — les parents ne voient rien",
    remove_hide: "Retirer / Masquer",
    publish_to_parents: "Publier aux parents",
    add_subject_placeholder: "Ajouter une matière (ex: Mathématiques)",
    subject_button: "Matière",
    no_student_in_class: "Aucun élève dans cette classe.",
    no_subject_added: "Aucune matière ajoutée pour ce trimestre.",
    rank: "Rang",
    subject_col: "Matière",
    average: "Moyenne",
    statistical_table: "Tableau statistique des résultats",
    enrolled: "Inscrits",
    admitted: "Admis",
    pct_admitted: "% Admis",
    failed: "Échoués",
    pct_failed: "% Échoués",
    boys: "Garçons",
    girls: "Filles",
    composed: "Ont composé",
    dropped_out: "Abandonnés",
    subject_results: "Résultats par matière (% ayant la moyenne)",
    sort_button: "Classer",
    sort_active: "Classement actif",
    attendance_title: "Présences",
    attendance_subtitle: "Contrôle du matin (8h00) et de l'après-midi (14h00) — visible par les parents.",
    date_label: "Date",
    control_label: "Contrôle",
    morning: "Matin",
    afternoon: "Après-midi",
    present_count: "présent",
    present_count_pl: "présents",
    absent_count: "absent",
    absent_count_pl: "absents",
    present: "Présent",
    absent: "Absent",
    attendance_summary: "Présence",
    regularity_pct: "% de régularité",
    no_absence: "Aucune absence enregistrée.",
    absent_dash: "Absent —",
    other_absences: "autre(s) absence(s)",
    coefficient_of: "Coefficient de",
    new_coef: "Nouveau coef.",
    set_button: "Régler",
    written: "Écrit",
    oral: "Oral",
    month_avg: "Moy. mois",
    term_avg: "Moy. trimestre",
    ranking_validated: "✓ Classement validé et publié aux parents",
    ranking_not_published: "Classement non publié",
    remove: "Retirer",
    validate_publish: "Valider et publier",
    no_grades_yet: "Pas encore de notes pour cette classe.",
    general_average: "Moyenne générale",
    enter_view: "Saisir",
    bulletin_view: "Bulletin & classement",
    grades_sec_subtitle_entry: "Saisis les notes écrites et orales, mois par mois.",
    grades_sec_subtitle_bulletin: "Classement pondéré de la classe, matière par matière.",
    subject_label: "Matière",
    month_label: "Mois",
    no_class: "Aucune classe",
    no_subject_yet: "Aucune matière enregistrée pour l'instant.",
    add_subject_first: "Ajoute d'abord une matière dans l'onglet \"Mes matières\".",
    head_teachers_title: "Professeurs principaux",
    head_teachers_subtitle: "Un professeur principal par classe — il voit toutes les matières et valide le classement.",
    no_class_yet: "Aucune classe pour l'instant.",
    no_teacher_in_class: "Aucun enseignant n'a encore de matière dans cette classe.",
    none_designated: "— Aucun désigné —",
    expenses_title: "Dépenses",
    expenses_subtitle: "Salaires, factures, fournitures et autres sorties d'argent.",
    add: "Ajouter",
    total_expenses: "Total des dépenses",
    no_expense: "Aucune dépense enregistrée.",
    validated: "Validé",
    validate: "Valider",
    new_expense: "Nouvelle dépense",
    category_label: "Catégorie",
    description_label: "Description",
    amount_label: "Montant",
    valid_amount: "Renseigne un montant valide.",
    save: "Enregistrer",
    cat_salaires: "Salaires",
    cat_factures: "Factures",
    cat_fournitures: "Fournitures",
    cat_credits: "Crédits",
    cat_autres: "Autres",
    role_fondateur_dir: "Fondateur / Directeur",
    fn_comptable: "Comptable",
    fn_enseignant: "Enseignant",
    fn_personnel: "Personnel",
    hide_hidden_profiles: "Masquer les profils cachés",
    show_hidden: "Afficher les masqués",
    staff_salary_subtitle: "Salaires du mois pour tout le personnel de l'école.",
    no_staff: "Aucun membre du personnel enregistré pour l'instant.",
    name: "Nom",
    function_col: "Fonction",
    month_balance: "Solde du mois",
    status_col: "Statut",
    account_col: "Compte",
    approved: "Approuvé",
    pending: "En attente",
    deactivate: "Désactiver",
    reactivate: "Réactiver",
    hide: "Masquer",
    unhide: "Démasquer",
    my_salary_title: "Mon salaire",
    my_salary_subtitle: "Approuve chaque mois une fois le paiement reçu — définitif, comme une signature.",
    no_salary_yet: "Aucun salaire enregistré pour l'instant. Le comptable n'a pas encore rempli ton mois.",
    pending_approval: "En attente d'approbation",
    approved_badge: "Validé",
    approve_button: "Approuver",
    approve_final: "Approuver la réception — définitif",
    my_remarks_title: "Mes remarques",
    my_remarks_subtitle: "Envoie une remarque ou suggestion directement au directeur/fondateur de l'école.",
    your_remark: "Ta remarque",
    remark_placeholder: "Écris ta remarque ou suggestion ici...",
    send_to_director: "Envoyer au directeur",
    my_sent_remarks: "Mes remarques envoyées",
    parents_title: "Parents",
    parents_subtitle: "Active les parents dont l'enfant continue cette année — les autres restent bloqués sans être supprimés.",
    no_parent: "Aucun parent inscrit pour l'instant.",
    phone_not_set: "Téléphone non renseigné",
    parent_remarks_title: "Remarques des parents",
    parent_remarks_subtitle: "Suggestions et remarques envoyées directement par les parents d'élèves.",
    no_remark_received: "Aucune remarque reçue pour l'instant.",
    parent_word: "Parent",
    account_deactivated_title: "Ton compte n'est pas encore actif",
    account_deactivated_staff_body: "Contacte le fondateur/directeur de l'école pour qu'il valide ou réactive ton accès depuis \"Personnel\".",
    account_deactivated_readonly: "En attendant, tu peux consulter les informations déjà en ligne, mais aucune modification n'est possible.",
    share_app: "Partager l'application",
    share_message: "Rejoins {school} sur École Connectée !\nCode de l'école : {code}\n\nTélécharge/accède ici :",
    link_copied: "Lien copié !",
    report_card: "Bulletin",
    average_short: "Moyenne",
    my_children_title: "Mes enfants",
    find_my_children: "Rechercher mes enfants",
    academic_financial_tracking: "Suivi scolaire et financier.",
    school_year_label: "Année scolaire",
    current_year_tag: "(année en cours)",
    archive_tag: "(archive)",
    children_linked: "enfant(s) lié(s) !",
    no_new_child_found: "Aucun nouvel enfant trouvé avec ton numéro.",
    no_child_linked: "Aucun enfant lié à votre compte pour l'instant. Demandez au comptable ou au fondateur de l'école de vous associer à votre enfant.",
    remaining_short: "Reste",
    payment_receipts: "Reçus de paiement",
    teacher_label: "Enseignant",
    account_paused_title: "Ton compte est en pause pour cette année scolaire",
    account_paused_body: "Tu peux toujours consulter les années précédentes. Pour retrouver un accès complet cette année, confirme le numéro de téléphone enregistré pour ton enfant.",
    reactivate_my_account: "Réactiver mon compte",
    no_student_found_phone: "Aucun élève trouvé avec ce numéro pour l'année en cours. Contacte l'école pour vérifier.",
    my_subjects_title: "Mes matières",
    my_subjects_subtitle: "Chaque matière que tu enseignes, pour chaque classe.",
    add_this_subject: "Ajouter cette matière",
    no_subject_added_yet: "Aucune matière ajoutée pour l'instant.",
    pay_remotely_title: "Payer sans se déplacer",
    pay_remotely_subtitle: "Envoie la scolarité par mobile money, sans venir à l'école.",
    accountant_no_phone: "Le comptable de l'école n'a pas encore renseigné son numéro de téléphone. Contacte directement l'école.",
    accountant_number: "Numéro du comptable —",
    call_accountant: "Appeler le comptable",
    pay_remotely_instructions: "Envoie le montant de la scolarité par Orange Money ou tout autre mobile money à ce numéro, puis contacte le comptable pour confirmer — il enregistrera le paiement dans le système, et tu recevras ton reçu directement dans l'espace \"Mes enfants\".",
    announcements_title: "Annonces",
    announcements_subtitle: "Communications de la direction.",
    no_announcement: "Aucune annonce pour l'instant.",
    admin_title: "Administration",
    admin_subtitle: "Gère les abonnements de toutes les écoles sur la plateforme.",
    no_school_yet: "Aucune école pour l'instant.",
    subscribed_tag: "Abonné",
    free_trial_tag: "Essai gratuit",
    active_subscription: "Abonnement actif",
    free_trial_started: "Essai gratuit — débuté le",
    activate_tier: "Activer",
    back_to_trial: "Repasser en essai gratuit",
    activate_no_tier: "Activer sans palier précis",
    new_student: "Nouvel élève",
    edit_student: "Modifier l'élève",
    session_8_10: "8h-10h",
    session_10_12: "10h-12h",
    session_12_14: "12h-14h",
    choose_your_class: "Choisis ta classe",
    no_class_assigned: "Aucune classe assignée — ajoute tes matières dans \"Mes matières\".",
    assign_subject_title: "Attribuer une matière à un enseignant",
    assign_subject_subtitle: "Ajoute directement une classe et une matière à l'un de tes enseignants, sans attendre qu'il le fasse lui-même.",
    choose_teacher: "Choisir l'enseignant",
    subject_placeholder2: "Ex: Mathématiques",
    class_placeholder2: "Ex: 9 année",
    current_assignments: "Attributions actuelles",
    no_assignment_yet: "Aucune attribution pour l'instant.",
    scan_button: "Scanner",
    qr_code_title: "Code QR de l'école",
    qr_code_hint: "Fais scanner ce code par la personne qui souhaite rejoindre l'école — elle sera dirigée directement vers l'inscription, avec le code déjà rempli.",
    subscribe_menu: "S'abonner",
    composition_month: "Mois de composition",
    composition_note: "Note de composition",
    course_avg: "Moy. cours",
    pending_credit: "En attente de validation",
    validate_credit_btn: "Valider ce crédit — définitif",
    annual_option: "Annuel",
    full_name_label: "Nom complet",
    gender_label: "Sexe",
    gender_boy: "Garçon",
    gender_girl: "Fille",
    level_label: "Niveau",
    total_due_label: "Montant total dû (année)",
    parent_phone_optional: "Téléphone du parent (optionnel)",
    parent_phone_hint2: "Dès que ce parent créera son compte avec ce numéro, il sera lié automatiquement à cet élève.",
    add_student_btn: "Ajouter l'élève",
    trial_ended_title: "Essai gratuit terminé",
    trial_ended_body: "L'essai gratuit de 7 jours est terminé. Choisis une formule pour continuer :",
    per_year: "/ an",
    per_month: "/ mois",
    orange_money_payment: "Paiement par Orange Money",
    orange_money_instructions: "Envoie le montant de la formule choisie à ce numéro, puis contacte l'équipe pour activer ton abonnement.",
    close: "Fermer",
    link_parent_title: "Lier un parent à",
    no_parent_yet: "Aucun parent n'a encore créé de compte pour cette école. Ils doivent d'abord s'inscrire avec le code de l'école.",
    choose_parent: "Choisir le parent",
    none_option: "— Aucun —",
    save_link: "Enregistrer la liaison",
    record_payment: "Enregistrer un paiement",
    step1_choose_class: "1. Choisir la classe",
    step2_choose_student: "2. Choisir l'élève",
    amount_currency: "Montant",
    visible_to_parents_contact: "Visible par les parents pour te contacter.",
    saved_confirm: "✓ Enregistré !",
    publish_homework_title: "Publier un devoir",
    write_homework: "Écrire le devoir",
    send_photo_file: "Envoyer une photo/fichier",
    homework_title_label: "Titre",
    homework_title_placeholder: "Ex: Exercices de conjugaison p.24",
    homework_description: "Description du devoir",
    photo_file_from_phone: "Photo ou fichier depuis ton téléphone",
    photo_file_hint: "Prends une photo du sujet ou choisis une image/PDF dans ta galerie.",
    due_optional: "À faire pour le (optionnel)",
    fill_class_title: "Renseigne au moins la classe et un titre.",
    upload_failed: "Échec de l'envoi du fichier:",
    new_announcement_title: "Nouvelle annonce",
    title_label: "Titre",
    message_label: "Message",
    publish_to_parents_btn: "Publier aux parents",
    success_saved: "Enregistré avec succès !",
    search_school_placeholder: "Rechercher une école par nom ou code...",
    schools_count: "école(s)",
    no_school_found: "Aucune école ne correspond à cette recherche.",
    select_school_hint: "Clique sur une école pour gérer son abonnement.",
    show_all_absences: "Voir toutes les absences",
    show_less: "Réduire",
  },
  en: {
    nav_dashboard: "Dashboard",
    nav_students: "Students",
    nav_students_payments: "Students & Payments",
    nav_announcements: "Announcements",
    nav_attendance: "Attendance",
    nav_grades: "Grades",
    nav_head_teachers: "Head Teachers",
    nav_lessons: "Homework",
    nav_expenses: "Expenses",
    nav_staff: "Staff",
    nav_parents: "Parents",
    nav_my_salary: "My Salary",
    nav_remarks: "Parent Remarks",
    nav_my_remarks: "My Remarks",
    nav_my_children: "My Children",
    nav_my_assignments: "My Subjects",
    nav_pay_remotely: "Pay Remotely",
    nav_stats: "Statistics",
    nav_admin: "Administration",
    menu: "Menu",
    my_profile: "My Profile",
    logout: "Log Out",
    login: "Log In",
    signup: "Create My Account",
    email: "Email",
    password: "Password",
    forgot_password: "Forgot password?",
    no_account: "No account yet? Create one",
    has_account: "Already have an account? Log in",
    back_to_login: "← Back to login",
    show: "Show",
    hide: "Hide",
    send_link: "Send link",
    onboarding_title: "Set up your account",
    onboarding_subtitle: "Last step before accessing the application.",
    back: "← Back",
    your_full_name: "Your full name",
    your_role: "Your role",
    role_fondateur: "Founder / Director",
    role_comptable: "Accountant",
    role_enseignant: "Teacher",
    role_parent: "Parent",
    role_personnel: "Staff (other)",
    your_class: "Your class",
    your_class_hint: "Use exactly the same name as the accountant for this class.",
    your_subject: "Your subject (secondary only)",
    your_subject_hint: "Leave blank if you're a generalist (primary) teacher. You can add other subjects/classes later.",
    your_phone: "Your phone number",
    your_phone_hint_teacher: "Visible to your class's parents so they can reach you.",
    your_phone_hint_comptable: "Visible to parents in \"Pay Remotely\", so they can contact you directly.",
    your_function: "Your role/function",
    your_function_placeholder: "E.g: Guard, Cook, Supervisor...",
    your_function_hint: "You'll automatically appear in the accountant's payroll table.",
    school_type: "School type",
    school_type_primaire: "Preschool + Elementary (primary)",
    school_type_secondaire: "Secondary",
    school_type_hint: "Two distinct structures are managed separately — create a second founder account if you also manage the other level.",
    school_name: "Your school's name",
    school_name_placeholder: "E.g: Star School Group",
    school_name_hint: "A unique code will be generated for your team and parents to join your school.",
    school_code: "School code",
    parent_phone_label: "Your phone number",
    parent_phone_hint: "Useful so the school can contact you directly.",
    continue: "Continue",
    dashboard_title: "Dashboard",
    dashboard_subtitle: "Overview of your school.",
    active: "(active)",
    archive: "(archive)",
    new_school_year: "+ New school year",
    archive_banner: "You're viewing an archive ({year}) — read-only, no changes possible.",
    start_new_year_title: "Start a new year",
    start_new_year_body: "Year {year} will be archived as read-only (viewable, not editable). All accounts (accountant, teachers, parents) will be automatically deactivated — you can reactivate one by one those continuing this year, from \"Staff\" and \"Parents\".",
    new_year_name_label: "New year's name",
    start_year_button: "Start",
    this_year: "this year",
    school_code_share: "School code — share it",
    copied: "Copied!",
    copy: "Copy",
    stat_students: "Enrolled students",
    stat_full_paid: "Fully paid",
    stat_total_collected: "Total collected",
    stat_total_expenses: "Total expenses",
    stat_remaining: "Remaining (students)",
    stat_net_balance: "Net balance (collected − expenses)",
    stat_homework: "Homework published",
    students_title: "Students & Payments",
    students_subtitle: "Tap a class to see its list.",
    export_excel: "Export (Excel)",
    student: "Student",
    payment: "Payment",
    search_student_placeholder: "Search a student by name...",
    no_student_registered: "No student registered.",
    no_student_found: "No student found for",
    results_for: "Results for",
    back_to_classes: "← Back to classes",
    parent_label: "Parent",
    linked: "linked",
    no_parent_linked: "No parent linked",
    link_parent: "Link parent",
    total: "Total",
    paid: "paid",
    remaining: "remaining",
    student_count_suffix: "student",
    students_count_suffix: "students",
    trial_days_left: "Free trial:",
    days_remaining: "day(s) left",
    trial_ended: "Free trial ended — subscription required",
    students_by_class: "Students list by class.",
    lessons_title: "Homework",
    lessons_subtitle_teacher: "Publish lessons/homework and track who's done them.",
    lessons_subtitle_parent: "Your children's homework — check off once done.",
    publish: "Publish",
    no_lesson_published: "No homework published yet.",
    no_lesson_yet: "No homework for now.",
    for_date: "Due",
    view_file: "View file",
    students_completed: "students done",
    done: "Done",
    mark_as_done: "Mark as done",
    grades_subtitle: "Enter grades by subject — total and average calculated automatically.",
    class_label: "Class",
    period_label: "Period",
    annual: "Annual",
    annual_notice: "Annual ranking: automatic sum of the 3 terms per subject. Not editable here — correct grades in the relevant term if needed.",
    published_to_parents: "✓ Results published to parents",
    not_published: "Results not published — parents see nothing",
    remove_hide: "Remove / Hide",
    publish_to_parents: "Publish to parents",
    add_subject_placeholder: "Add a subject (e.g: Mathematics)",
    subject_button: "Subject",
    no_student_in_class: "No student in this class.",
    no_subject_added: "No subject added for this term.",
    rank: "Rank",
    subject_col: "Subject",
    average: "Average",
    statistical_table: "Results statistics table",
    enrolled: "Enrolled",
    admitted: "Passed",
    pct_admitted: "% Passed",
    failed: "Failed",
    pct_failed: "% Failed",
    boys: "Boys",
    girls: "Girls",
    composed: "Sat exams",
    dropped_out: "Dropped out",
    subject_results: "Results by subject (% passing)",
    sort_button: "Sort",
    sort_active: "Sorted",
    attendance_title: "Attendance",
    attendance_subtitle: "Morning (8:00) and afternoon (2:00pm) check — visible to parents.",
    date_label: "Date",
    control_label: "Check",
    morning: "Morning",
    afternoon: "Afternoon",
    present_count: "present",
    present_count_pl: "present",
    absent_count: "absent",
    absent_count_pl: "absent",
    present: "Present",
    absent: "Absent",
    attendance_summary: "Attendance",
    regularity_pct: "% regularity",
    no_absence: "No absence recorded.",
    absent_dash: "Absent —",
    other_absences: "other absence(s)",
    coefficient_of: "Coefficient for",
    new_coef: "New coef.",
    set_button: "Set",
    written: "Written",
    oral: "Oral",
    month_avg: "Month avg.",
    term_avg: "Term avg.",
    ranking_validated: "✓ Ranking validated and published to parents",
    ranking_not_published: "Ranking not published",
    remove: "Remove",
    validate_publish: "Validate and publish",
    no_grades_yet: "No grades yet for this class.",
    general_average: "General average",
    enter_view: "Enter grades",
    bulletin_view: "Report card & ranking",
    grades_sec_subtitle_entry: "Enter written and oral grades, month by month.",
    grades_sec_subtitle_bulletin: "Weighted class ranking, subject by subject.",
    subject_label: "Subject",
    month_label: "Month",
    no_class: "No class",
    no_subject_yet: "No subject registered yet.",
    add_subject_first: "First add a subject in the \"My Subjects\" tab.",
    head_teachers_title: "Head Teachers",
    head_teachers_subtitle: "One head teacher per class — sees all subjects and validates the ranking.",
    no_class_yet: "No class yet.",
    no_teacher_in_class: "No teacher has a subject in this class yet.",
    none_designated: "— None designated —",
    expenses_title: "Expenses",
    expenses_subtitle: "Salaries, bills, supplies and other outgoing payments.",
    add: "Add",
    total_expenses: "Total expenses",
    no_expense: "No expense recorded.",
    validated: "Validated",
    validate: "Validate",
    new_expense: "New expense",
    category_label: "Category",
    description_label: "Description",
    amount_label: "Amount",
    valid_amount: "Enter a valid amount.",
    save: "Save",
    cat_salaires: "Salaries",
    cat_factures: "Bills",
    cat_fournitures: "Supplies",
    cat_credits: "Credits",
    cat_autres: "Other",
    role_fondateur_dir: "Founder / Director",
    fn_comptable: "Accountant",
    fn_enseignant: "Teacher",
    fn_personnel: "Staff",
    hide_hidden_profiles: "Hide hidden profiles",
    show_hidden: "Show hidden",
    staff_salary_subtitle: "Monthly salaries for all school staff.",
    no_staff: "No staff member registered yet.",
    name: "Name",
    function_col: "Role",
    month_balance: "Month balance",
    status_col: "Status",
    account_col: "Account",
    approved: "Approved",
    pending: "Pending",
    deactivate: "Deactivate",
    reactivate: "Reactivate",
    hide: "Hide",
    unhide: "Unhide",
    my_salary_title: "My Salary",
    my_salary_subtitle: "Approve each month once payment is received — final, like a signature.",
    no_salary_yet: "No salary recorded yet. The accountant hasn't filled in your month.",
    pending_approval: "Pending approval",
    approved_badge: "Approved",
    approve_button: "Approve",
    approve_final: "Approve receipt — final",
    my_remarks_title: "My Remarks",
    my_remarks_subtitle: "Send a remark or suggestion directly to the school's director/founder.",
    your_remark: "Your remark",
    remark_placeholder: "Write your remark or suggestion here...",
    send_to_director: "Send to director",
    my_sent_remarks: "My sent remarks",
    parents_title: "Parents",
    parents_subtitle: "Activate parents whose child continues this year — others stay blocked without being deleted.",
    no_parent: "No parent registered yet.",
    phone_not_set: "Phone not provided",
    parent_remarks_title: "Parent Remarks",
    parent_remarks_subtitle: "Suggestions and remarks sent directly by parents.",
    no_remark_received: "No remark received yet.",
    parent_word: "Parent",
    account_deactivated_title: "Your account isn't active yet",
    account_deactivated_staff_body: "Contact the school's founder/director so they can approve or reactivate your access from \"Staff\".",
    account_deactivated_readonly: "In the meantime, you can view existing information, but no changes are possible.",
    share_app: "Share the app",
    share_message: "Join {school} on École Connectée!\nSchool code: {code}\n\nAccess it here:",
    link_copied: "Link copied!",
    report_card: "Report card",
    average_short: "Average",
    my_children_title: "My Children",
    find_my_children: "Find my children",
    academic_financial_tracking: "Academic and financial tracking.",
    school_year_label: "School year",
    current_year_tag: "(current year)",
    archive_tag: "(archive)",
    children_linked: "child(ren) linked!",
    no_new_child_found: "No new child found with your number.",
    no_child_linked: "No child linked to your account yet. Ask the school's accountant or founder to link you to your child.",
    remaining_short: "Remaining",
    payment_receipts: "Payment receipts",
    teacher_label: "Teacher",
    account_paused_title: "Your account is paused for this school year",
    account_paused_body: "You can still view previous years. To regain full access this year, confirm the phone number registered for your child.",
    reactivate_my_account: "Reactivate my account",
    no_student_found_phone: "No student found with this number for the current year. Contact the school to check.",
    my_subjects_title: "My Subjects",
    my_subjects_subtitle: "Each subject you teach, for each class.",
    add_this_subject: "Add this subject",
    no_subject_added_yet: "No subject added yet.",
    pay_remotely_title: "Pay Remotely",
    pay_remotely_subtitle: "Send tuition via mobile money, without coming to school.",
    accountant_no_phone: "The school's accountant hasn't provided their phone number yet. Contact the school directly.",
    accountant_number: "Accountant's number —",
    call_accountant: "Call the accountant",
    pay_remotely_instructions: "Send the tuition amount via Orange Money or any other mobile money to this number, then contact the accountant to confirm — they'll record the payment in the system, and you'll get your receipt directly in \"My Children\".",
    announcements_title: "Announcements",
    announcements_subtitle: "Communications from the school administration.",
    no_announcement: "No announcement yet.",
    admin_title: "Administration",
    admin_subtitle: "Manage subscriptions for all schools on the platform.",
    no_school_yet: "No school yet.",
    subscribed_tag: "Subscribed",
    free_trial_tag: "Free trial",
    active_subscription: "Active subscription",
    free_trial_started: "Free trial — started on",
    activate_tier: "Activate",
    back_to_trial: "Switch back to free trial",
    activate_no_tier: "Activate without a specific tier",
    new_student: "New Student",
    edit_student: "Edit student",
    session_8_10: "8am-10am",
    session_10_12: "10am-12pm",
    session_12_14: "12pm-2pm",
    choose_your_class: "Choose your class",
    no_class_assigned: "No class assigned — add your subjects in \"My Subjects\".",
    assign_subject_title: "Assign a subject to a teacher",
    assign_subject_subtitle: "Directly add a class and subject to one of your teachers, without waiting for them to do it themselves.",
    choose_teacher: "Choose the teacher",
    subject_placeholder2: "E.g: Mathematics",
    class_placeholder2: "E.g: Grade 9",
    current_assignments: "Current assignments",
    no_assignment_yet: "No assignment yet.",
    scan_button: "Scan",
    qr_code_title: "School QR code",
    qr_code_hint: "Have the person who wants to join the school scan this code — they'll be taken straight to sign-up, with the code already filled in.",
    subscribe_menu: "Subscribe",
    composition_month: "Composition month",
    composition_note: "Composition grade",
    course_avg: "Course avg.",
    pending_credit: "Pending validation",
    validate_credit_btn: "Validate this credit — final",
    annual_option: "Annual",
    full_name_label: "Full name",
    gender_label: "Gender",
    gender_boy: "Boy",
    gender_girl: "Girl",
    level_label: "Level",
    total_due_label: "Total amount due (year)",
    parent_phone_optional: "Parent's phone (optional)",
    parent_phone_hint2: "As soon as this parent creates their account with this number, they'll be automatically linked to this student.",
    add_student_btn: "Add student",
    trial_ended_title: "Free trial ended",
    trial_ended_body: "The 7-day free trial has ended. Choose a plan to continue:",
    per_year: "/ year",
    per_month: "/ month",
    orange_money_payment: "Payment via Orange Money",
    orange_money_instructions: "Send the amount for the chosen plan to this number, then contact the team to activate your subscription.",
    close: "Close",
    link_parent_title: "Link a parent to",
    no_parent_yet: "No parent has created an account for this school yet. They must first sign up with the school code.",
    choose_parent: "Choose the parent",
    none_option: "— None —",
    save_link: "Save link",
    record_payment: "Record a payment",
    step1_choose_class: "1. Choose the class",
    step2_choose_student: "2. Choose the student",
    amount_currency: "Amount",
    visible_to_parents_contact: "Visible to parents so they can contact you.",
    saved_confirm: "✓ Saved!",
    publish_homework_title: "Publish homework",
    write_homework: "Write the homework",
    send_photo_file: "Send a photo/file",
    homework_title_label: "Title",
    homework_title_placeholder: "E.g: Conjugation exercises p.24",
    homework_description: "Homework description",
    photo_file_from_phone: "Photo or file from your phone",
    photo_file_hint: "Take a photo of the assignment or choose an image/PDF from your gallery.",
    due_optional: "Due date (optional)",
    fill_class_title: "Fill in at least the class and a title.",
    upload_failed: "File upload failed:",
    new_announcement_title: "New Announcement",
    title_label: "Title",
    message_label: "Message",
    publish_to_parents_btn: "Publish to parents",
    success_saved: "Successfully saved!",
    search_school_placeholder: "Search a school by name or code...",
    schools_count: "school(s)",
    no_school_found: "No school matches this search.",
    select_school_hint: "Tap a school to manage its subscription.",
    show_all_absences: "Show all absences",
    show_less: "Show less",
  },
};

const LanguageContext = createContext({ lang: "fr", setLang: () => {}, t: (k) => k });
const useLang = () => useContext(LanguageContext);
function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem("ec_lang") || "fr");
  const setLang = (l) => { setLangState(l); try { localStorage.setItem("ec_lang", l); } catch (e) {} };
  const t = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.fr[key] ?? key;
  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}
function LanguageToggle({ compact }) {
  const { lang, setLang } = useLang();
  return (
    <button
      onClick={() => setLang(lang === "fr" ? "en" : "fr")}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
      style={{ background: COLORS.paper, color: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}
      title="Français / English"
    >
      <Languages size={14} /> {!compact && (lang === "fr" ? "FR" : "EN")}
    </button>
  );
}


const LEVELS_PRIMAIRE = ["Maternelle", "Élémentaire"];
const LEVELS_SECONDAIRE = ["Collège", "Lycée"];
const CLASSES_MATERNELLE = ["Petite Section", "Grande Section"];
const CLASSES_ELEMENTAIRE = ["1ère année", "2ème année", "3ème année", "4ème année", "5ème année", "6ème année"];
const CLASSES_COLLEGE = ["7ème année", "8ème année", "9ème année", "10ème année"];
const CLASSES_LYCEE = ["11ème année SM", "11ème année SE", "11ème année SS", "12ème année SM", "12ème année SE", "12ème année SS", "Terminale SM", "Terminale SE", "Terminale SS"];
const CLASSES_SECONDAIRE_ALL = [...CLASSES_COLLEGE, ...CLASSES_LYCEE];
const SUBJECTS_LYCEE = ["Anglais", "Biologie", "Chimie", "ECM", "Économie", "Français", "Géographie", "Géologie", "Histoire", "Mathématiques", "Philosophie", "Physique"];
const SUBJECTS_COLLEGE = ["Anglais", "Biologie", "Chimie", "Dictée-Question", "ECM", "Économie", "Géographie", "Géologie", "Histoire", "Mathématiques", "Philosophie", "Physique", "Rédaction"];
const SUBJECTS_SECONDAIRE = SUBJECTS_LYCEE;
const getSubjectOptions = (className) => (CLASSES_COLLEGE.includes(className) ? SUBJECTS_COLLEGE : SUBJECTS_LYCEE);
const getClassOptions = (level) => {
  if (level === "Maternelle") return CLASSES_MATERNELLE;
  if (level === "Élémentaire") return CLASSES_ELEMENTAIRE;
  if (level === "Collège") return CLASSES_COLLEGE;
  if (level === "Lycée") return CLASSES_LYCEE;
  return [];
};
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
  const { t, lang } = useLang();
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
      else setMessage(lang === "en" ? "Account created! Log in to finish setup." : "Compte créé ! Connecte-toi pour finir la configuration.");
    } else if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) setError(error.message);
      else setMessage(lang === "en" ? "A reset link was sent if this account exists." : "Un email avec un lien de réinitialisation a été envoyé si ce compte existe.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-5" style={{ background: COLORS.paper }}>
      <div className="w-full max-w-sm rounded-2xl p-8" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: COLORS.primary }}><GraduationCap size={18} color="#fff" /></div>
            <div className="text-lg font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>École Connectée</div>
          </div>
          <LanguageToggle />
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>{t("email")}</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
          </div>
          {mode !== "forgot" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>{t("password")}</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2.5 pr-16 rounded-lg outline-none" style={inputStyle} />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium" style={{ color: COLORS.primary }}>
                  {showPassword ? t("hide") : t("show")}
                </button>
              </div>
            </div>
          )}
          {mode === "signin" && (
            <button type="button" onClick={() => { setMode("forgot"); setError(""); setMessage(""); }} className="text-xs font-medium" style={{ color: COLORS.primary }}>
              {t("forgot_password")}
            </button>
          )}
          {error && <div className="text-sm" style={{ color: COLORS.negative }}>{error}</div>}
          {message && <div className="text-sm" style={{ color: COLORS.positive }}>{message}</div>}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2" style={{ background: COLORS.ink, color: "#fff" }}>
            {loading && <Loader2 className="animate-spin" size={16} />}
            {mode === "signin" ? t("login") : mode === "signup" ? t("signup") : t("send_link")}
          </button>
        </form>
        {mode === "forgot" ? (
          <button onClick={() => { setMode("signin"); setError(""); setMessage(""); }} className="w-full text-center text-sm mt-4" style={{ color: COLORS.inkSoft }}>{t("back_to_login")}</button>
        ) : (
          <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setMessage(""); }} className="w-full text-center text-sm mt-4" style={{ color: COLORS.inkSoft }}>
            {mode === "signin" ? t("no_account") : t("has_account")}
          </button>
        )}
      </div>
    </div>
  );
}

function OnboardingScreen({ userId, onDone, onBack }) {
  const { t, lang } = useLang();
  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [levelType, setLevelType] = useState("primaire");
  const [schoolCode, setSchoolCode] = useState(() => {
    try {
      const fromLink = new URLSearchParams(window.location.search).get("code");
      return fromLink ? fromLink.toUpperCase() : "";
    } catch (e) { return ""; }
  });
  const [className, setClassName] = useState("");
  const [fonction, setFonction] = useState("");
  const [subject, setSubject] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resolvedLevelType, setResolvedLevelType] = useState(null);
  const [checkingCode, setCheckingCode] = useState(false);

  useEffect(() => {
    if (role === "fondateur" || schoolCode.trim().length < 4) { setResolvedLevelType(null); return; }
    let cancelled = false;
    setCheckingCode(true);
    supabase.from("schools").select("level_type").eq("code", schoolCode.trim().toUpperCase()).maybeSingle().then(({ data }) => {
      if (!cancelled) { setResolvedLevelType(data?.level_type || null); setCheckingCode(false); }
    });
    return () => { cancelled = true; };
  }, [schoolCode, role]);

  const teacherClassOptions = resolvedLevelType === "primaire" ? [...CLASSES_MATERNELLE, ...CLASSES_ELEMENTAIRE] : resolvedLevelType === "secondaire" ? CLASSES_SECONDAIRE_ALL : [];

  const ROLE_LABELS_LOCAL = {
    fondateur: t("role_fondateur"), comptable: t("role_comptable"), enseignant: t("role_enseignant"), parent: t("role_parent"), personnel: t("role_personnel"),
  };

  const submit = async () => {
    setError("");
    if (!role || !fullName.trim()) { setError(lang === "en" ? "Fill in your name and choose your role." : "Remplis ton nom et choisis ton rôle."); return; }
    if (role === "parent" && !phone.trim()) { setError(lang === "en" ? "Phone number is required for parents." : "Le numéro de téléphone est requis pour les parents."); return; }
    setLoading(true);
    try {
      let schoolId;
      if (role === "fondateur") {
        if (!schoolName.trim()) { setError(lang === "en" ? "Give your school a name." : "Donne un nom à ton école."); setLoading(false); return; }
        const { data, error } = await supabase.from("schools").insert({ name: schoolName.trim(), code: genCode(), level_type: levelType }).select().single();
        if (error) throw error;
        schoolId = data.id;
      } else {
        if (!schoolCode.trim()) { setError(lang === "en" ? "Enter the school code from the founder." : "Entre le code de l'école reçu du fondateur."); setLoading(false); return; }
        const { data, error } = await supabase.from("schools").select("id").eq("code", schoolCode.trim().toUpperCase()).maybeSingle();
        if (error || !data) { setError(lang === "en" ? "School code not found. Check it with the founder." : "Code d'école introuvable. Vérifie-le auprès du fondateur."); setLoading(false); return; }
        schoolId = data.id;
      }
      const { error: profileError } = await supabase.from("profiles").insert({ user_id: userId, school_id: schoolId, role, full_name: fullName.trim(), phone: phone.trim() || null, class_name: role === "enseignant" ? className.trim() || null : null, fonction: role === "personnel" ? fonction.trim() || null : null, active: role === "comptable" ? false : true });
      if (profileError) throw profileError;
      if (role === "enseignant" && subject.trim() && className.trim()) {
        await supabase.from("teacher_assignments").insert({ school_id: schoolId, teacher_id: userId, subject: subject.trim(), class_name: className.trim(), approved: false });
      }
      if (role === "parent" && phone.trim()) {
        await supabase.rpc("link_parent_by_phone", { p_phone: phone.trim() });
      }
      onDone();
    } catch (e) {
      setError(e.message || (lang === "en" ? "An error occurred." : "Une erreur est survenue."));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-5" style={{ background: COLORS.paper }}>
      <div className="w-full max-w-md rounded-2xl p-8" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="text-xs font-medium flex items-center gap-1" style={{ color: COLORS.inkSoft }}>{t("back")}</button>
          <LanguageToggle compact />
        </div>
        <h2 className="text-xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("onboarding_title")}</h2>
        <p className="text-sm mb-6" style={{ color: COLORS.inkSoft }}>{t("onboarding_subtitle")}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>{t("your_full_name")}</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>{t("your_role")}</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ROLE_LABELS_LOCAL).map(([key, label]) => (
                <button key={key} onClick={() => setRole(key)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-left" style={{ background: role === key ? COLORS.ink : "#fff", color: role === key ? "#fff" : COLORS.inkSoft, border: `1px solid ${role === key ? COLORS.ink : COLORS.line}` }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {role && role !== "fondateur" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>{t("school_code")}</label>
              <input value={schoolCode} onChange={(e) => setSchoolCode(e.target.value.toUpperCase())} placeholder="Ex: A1B2C3" className="w-full px-3 py-2.5 rounded-lg outline-none uppercase" style={inputStyle} />
              <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>{lang === "en" ? "Ask your school's founder/director for this code." : "Demande ce code au fondateur/directeur de ton école."}</p>
            </div>
          )}

          {role === "parent" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>{t("parent_phone_label")}</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: 622 00 00 00" className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
              <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>{t("parent_phone_hint")}</p>
            </div>
          )}

          {role === "enseignant" && (
            <div className="space-y-4">
              {!schoolCode.trim() || schoolCode.trim().length < 4 ? (
                <p className="text-sm" style={{ color: COLORS.inkSoft }}>{lang === "en" ? "Enter the school code above first to see your class." : "Renseigne d'abord le code de l'école ci-dessus pour voir ta classe."}</p>
              ) : checkingCode ? (
                <p className="text-sm flex items-center gap-2" style={{ color: COLORS.inkSoft }}><Loader2 className="animate-spin" size={14} /> {lang === "en" ? "Checking..." : "Vérification..."}</p>
              ) : !resolvedLevelType ? (
                <p className="text-sm" style={{ color: COLORS.negative }}>{lang === "en" ? "School code not found. Check it before continuing." : "Code d'école introuvable. Vérifie-le avant de continuer."}</p>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>{t("your_class")}</label>
                    <select value={className} onChange={(e) => setClassName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
                      <option value="">—</option>
                      {teacherClassOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>{t("your_class_hint")}</p>
                  </div>
                  {resolvedLevelType === "secondaire" && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>{t("your_subject")}</label>
                      <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
                        <option value="">—</option>
                        {getSubjectOptions(className).map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>{t("your_subject_hint")}</p>
                    </div>
                  )}
                </>
              )}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>{t("your_phone")}</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: 622 00 00 00" className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
                <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>{t("your_phone_hint_teacher")}</p>
              </div>
            </div>
          )}

          {role === "personnel" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>{t("your_function")}</label>
              <input value={fonction} onChange={(e) => setFonction(e.target.value)} placeholder={t("your_function_placeholder")} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
              <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>{t("your_function_hint")}</p>
            </div>
          )}

          {role === "comptable" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>{t("your_phone")}</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: 622 00 00 00" className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
              <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>{t("your_phone_hint_comptable")}</p>
            </div>
          )}

          {role === "fondateur" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>{t("school_type")}</label>
                <div className="grid grid-cols-2 gap-2">
                  {[["primaire", t("school_type_primaire")], ["secondaire", t("school_type_secondaire")]].map(([val, label]) => (
                    <button key={val} onClick={() => setLevelType(val)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-left" style={{ background: levelType === val ? COLORS.ink : "#fff", color: levelType === val ? "#fff" : COLORS.inkSoft, border: `1px solid ${levelType === val ? COLORS.ink : COLORS.line}` }}>{label}</button>
                  ))}
                </div>
                <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>{t("school_type_hint")}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.inkSoft }}>{t("school_name")}</label>
                <input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder={t("school_name_placeholder")} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
                <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>{t("school_name_hint")}</p>
              </div>
            </div>
          )}

          {error && <div className="text-sm" style={{ color: COLORS.negative }}>{error}</div>}

          <button onClick={submit} disabled={loading} className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2" style={{ background: COLORS.primary, color: "#fff" }}>
            {loading && <Loader2 className="animate-spin" size={16} />}
            {t("continue")}
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
  return (
    <LanguageProvider>
      {!session ? (
        <AuthScreen />
      ) : !profile ? (
        <OnboardingScreen userId={session.user.id} onDone={() => loadProfile(session.user.id)} onBack={() => supabase.auth.signOut()} />
      ) : (
        <MainApp profile={profile} refreshProfile={() => loadProfile(session.user.id)} />
      )}
    </LanguageProvider>
  );
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
  const [tab, setTab] = useState(role === "comptable" ? "students" : role === "enseignant" ? "grades" : role === "personnel" ? "mysalary" : "dashboard");
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
  const [toast, setToast] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const loadAll = useCallback(async () => {
    const [s, p, l, h, a, par, exp, gr, rel, staff, sp, rem, att, ta, cht, subj, grs] = await Promise.all([
      supabase.from("students").select("*").order("full_name"),
      supabase.from("payments").select("*").order("date", { ascending: false }),
      supabase.from("lessons").select("*").order("created_at", { ascending: false }),
      supabase.from("homework_status").select("*"),
      supabase.from("announcements").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("user_id, full_name, phone, active, hidden").eq("role", "parent"),
      supabase.from("expenses").select("*").order("date", { ascending: false }),
      supabase.from("grades").select("*"),
      supabase.from("grade_releases").select("*"),
      supabase.from("profiles").select("user_id, full_name, role, class_name, fonction, phone, active, hidden").neq("role", "parent"),
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
  const existingClassNames = useMemo(() => {
    const set = new Set();
    students.forEach((s) => s.class_name && set.add(s.class_name));
    teacherAssignments.forEach((a) => a.class_name && set.add(a.class_name));
    return [...set].sort();
  }, [students, teacherAssignments]);
  const existingSubjectNames = useMemo(() => [...new Set(teacherAssignments.map((a) => a.subject).filter(Boolean))].sort(), [teacherAssignments]);
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
    if (data && data.length > 0) setStudents((p) => [...p, data[0]]);
    notify(t("success_saved"));
    return "ok";
  };
  const deleteStudent = async (id) => { await supabase.from("students").delete().eq("id", id); setStudents((p) => p.filter((s) => s.id !== id)); };
  const updateStudent = async (id, s) => {
    const { data, error } = await supabase.from("students").update(s).eq("id", id).select();
    if (data) { setStudents((prev) => prev.map((st) => (st.id === id ? data[0] : st))); notify(t("success_saved")); }
    return error;
  };
  const linkParent = async (studentId, parentId) => {
    const { data } = await supabase.from("students").update({ parent_id: parentId || null }).eq("id", studentId).select();
    if (data) { setStudents((prev) => prev.map((s) => (s.id === studentId ? data[0] : s))); notify(t("success_saved")); }
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
  const addPayment = async (pay) => { const { data } = await supabase.from("payments").insert({ ...pay, school_id: schoolId, school_year: currentYear }).select(); if (data) { setPayments((p) => [data[0], ...p]); notify(t("success_saved")); } };
  const addLesson = async (l) => { const { data } = await supabase.from("lessons").insert({ ...l, school_id: schoolId, teacher_id: profile.user_id, school_year: currentYear }).select(); if (data) { setLessons((p) => [data[0], ...p]); notify(t("success_saved")); } };
  const deleteLesson = async (id) => { await supabase.from("lessons").delete().eq("id", id); setLessons((p) => p.filter((l) => l.id !== id)); };
  const toggleHomework = async (lessonId, studentId) => {
    const existing = homework.find((h) => h.lesson_id === lessonId && h.student_id === studentId);
    if (existing) {
      const { data } = await supabase.from("homework_status").update({ done: !existing.done, done_at: !existing.done ? new Date().toISOString() : null }).eq("id", existing.id).select();
      if (data && data.length > 0) setHomework((p) => p.map((h) => (h.id === existing.id ? data[0] : h)));
    } else {
      const { data } = await supabase.from("homework_status").insert({ school_id: schoolId, lesson_id: lessonId, student_id: studentId, done: true, done_at: new Date().toISOString() }).select();
      if (data && data.length > 0) setHomework((p) => [...p, data[0]]);
    }
  };
  const addAnnouncement = async (a) => { const { data } = await supabase.from("announcements").insert({ ...a, school_id: schoolId, author_id: profile.user_id }).select(); if (data) { setAnnouncements((p) => [data[0], ...p]); notify(t("success_saved")); } };
  const deleteAnnouncement = async (id) => { await supabase.from("announcements").delete().eq("id", id); setAnnouncements((p) => p.filter((a) => a.id !== id)); };
  const addExpense = async (e) => {
    const { data, error } = await supabase.from("expenses").insert({ ...e, school_id: schoolId, created_by: profile.user_id, school_year: currentYear }).select();
    if (data) { setExpenses((p) => [data[0], ...p]); notify(t("success_saved")); }
    return error;
  };
  const deleteExpense = async (id) => { await supabase.from("expenses").delete().eq("id", id); setExpenses((p) => p.filter((e) => e.id !== id)); };
  const validateExpense = async (id) => {
    const { error } = await supabase.rpc("validate_credit_expense", { p_expense_id: id });
    if (!error) {
      setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, validated: true } : e)));
      notify(t("success_saved"));
    }
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
    if (data && data.length > 0) setStaffPayments((prev) => prev.map((sp) => (sp.id === id ? data[0] : sp)));
    return error;
  };

  const updateMyProfile = async (fullNameVal, phoneVal) => {
    const { error } = await supabase.rpc("update_my_contact_info", { p_full_name: fullNameVal, p_phone: phoneVal });
    if (!error) await refreshProfile();
    return error;
  };

  const shareApp = async () => {
    const code = profile.schools?.code || "";
    const message = t("share_message")
      .replace("{school}", profile.schools?.name || "")
      .replace("{code}", code);
    const linkUrl = `${window.location.origin}/?code=${code}`;
    const shareData = { title: "École Connectée", text: message, url: linkUrl };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (e) {}
    } else {
      navigator.clipboard?.writeText(`${message} ${linkUrl}`);
      alert(t("link_copied"));
    }
  };

  const toggleStaffActive = async (userId, activeValue) => {
    const { data, error } = await supabase.from("profiles").update({ active: activeValue }).eq("user_id", userId).select();
    if (data && data.length > 0) setStaffProfiles((prev) => prev.map((sp) => (sp.user_id === userId ? { ...sp, active: activeValue } : sp)));
    return error;
  };

  const toggleProfileHidden = async (userId, hiddenValue) => {
    const { data, error } = await supabase.from("profiles").update({ hidden: hiddenValue }).eq("user_id", userId).select();
    if (data) {
      setStaffProfiles((prev) => prev.map((sp) => (sp.user_id === userId ? { ...sp, hidden: hiddenValue } : sp)));
      setParents((prev) => prev.map((p) => (p.user_id === userId ? { ...p, hidden: hiddenValue } : p)));
    }
    return error;
  };

  const addTeacherAssignment = async (subj, classNameArg) => {
    const { data, error } = await supabase.from("teacher_assignments").insert({ school_id: schoolId, teacher_id: profile.user_id, subject: subj, class_name: classNameArg, approved: false }).select();
    if (data && data.length > 0) setTeacherAssignments((prev) => [...prev, data[0]]);
    return error;
  };
  const assignTeacherFondateur = async (teacherId, subj, classNameArg) => {
    const { data, error } = await supabase.from("teacher_assignments").insert({ school_id: schoolId, teacher_id: teacherId, subject: subj, class_name: classNameArg, approved: true }).select();
    if (data) { setTeacherAssignments((prev) => [...prev, data[0]]); notify(t("success_saved")); }
    return error;
  };
  const approveTeacherAssignment = async (id) => {
    const { data, error } = await supabase.from("teacher_assignments").update({ approved: true }).eq("id", id).select();
    if (data && data.length > 0) { setTeacherAssignments((prev) => prev.map((a) => (a.id === id ? data[0] : a))); notify(t("success_saved")); }
    return error;
  };
  const deleteTeacherAssignment = async (id) => {
    await supabase.from("teacher_assignments").delete().eq("id", id);
    setTeacherAssignments((prev) => prev.filter((t) => t.id !== id));
  };

  const setClassHeadTeacher = async (classNameArg, teacherId) => {
    if (!teacherId) {
      const { error } = await supabase.from("class_head_teachers").delete().eq("school_id", schoolId).eq("class_name", classNameArg);
      if (!error) setClassHeadTeachers((prev) => prev.filter((c) => c.class_name !== classNameArg));
      return error;
    }
    const { data, error } = await supabase.from("class_head_teachers").upsert({ school_id: schoolId, class_name: classNameArg, teacher_id: teacherId }, { onConflict: "school_id,class_name" }).select();
    if (data && data.length > 0) setClassHeadTeachers((prev) => {
      const existing = prev.find((c) => c.class_name === classNameArg);
      if (existing) return prev.map((c) => (c.id === existing.id ? data[0] : c));
      return [...prev, data[0]];
    });
    return error;
  };

  const setSubjectCoefficient = async (classNameArg, subj, coefficient) => {
    const { data, error } = await supabase.from("subjects_secondaire").upsert({ school_id: schoolId, class_name: classNameArg, subject: subj, coefficient }, { onConflict: "school_id,class_name,subject" }).select();
    if (data && data.length > 0) setSubjectsSecondaire((prev) => {
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
    if (data && data.length > 0) setGradesSecondaire((prev) => {
      const idx = prev.findIndex((g) => g.student_id === studentId && g.subject === subj && g.month === month && g.school_year === currentYear);
      if (idx >= 0) return prev.map((g, i) => (i === idx ? data[0] : g));
      return [...prev, data[0]];
    });
    return error;
  };

  const addRemark = async (message) => {
    const { data, error } = await supabase.from("remarks").insert({ school_id: schoolId, parent_id: profile.user_id, message }).select();
    if (data && data.length > 0) setRemarks((prev) => [data[0], ...prev]);
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
  const { t } = useLang();
  const NAV = {
    fondateur: [["dashboard", t("nav_dashboard"), LayoutDashboard], ["students", t("nav_students"), Users], ["announcements", t("nav_announcements"), Megaphone], ["attendance", t("nav_attendance"), CalendarCheck], ["grades", t("nav_grades"), ClipboardList], ...(isSecondaire ? [["classteachers", t("nav_head_teachers"), Shield]] : []), ["lessons", t("nav_lessons"), BookOpen], ["expenses", t("nav_expenses"), Receipt], ["staff", t("nav_staff"), Wallet], ["parentsmanagement", t("nav_parents"), Contact], ["mysalary", t("nav_my_salary"), Banknote], ["remarks", t("nav_remarks"), MessageSquare]],
    comptable: [["students", t("nav_students_payments"), Users], ["dashboard", t("nav_stats"), LayoutDashboard], ["expenses", t("nav_expenses"), Receipt], ["staff", t("nav_staff"), Wallet], ["mysalary", t("nav_my_salary"), Banknote]],
    enseignant: isSecondaire
      ? [["grades", t("nav_grades"), ClipboardList], ["myassignments", t("nav_my_assignments"), BookMarked], ["attendance", t("nav_attendance"), CalendarCheck], ["lessons", t("nav_lessons"), BookOpen], ["students", t("nav_students"), Users], ["mysalary", t("nav_my_salary"), Banknote]]
      : [["grades", t("nav_grades"), ClipboardList], ["attendance", t("nav_attendance"), CalendarCheck], ["lessons", t("nav_lessons"), BookOpen], ["students", t("nav_students"), Users], ["mysalary", t("nav_my_salary"), Banknote]],
    parent: [["dashboard", t("nav_my_children"), GraduationCap], ["lessons", t("nav_lessons"), BookOpen], ["announcements", t("nav_announcements"), Megaphone], ["remarks", t("nav_my_remarks"), MessageSquare], ["pay", t("nav_pay_remotely"), Smartphone]],
    personnel: [["mysalary", t("nav_my_salary"), Banknote], ["announcements", t("nav_announcements"), Megaphone]],
  }[role];
  const NAV_FULL = profile.is_admin ? [...NAV, ["admin", t("nav_admin"), Shield]] : NAV;

  if (loading) return <div className="h-screen w-full flex items-center justify-center" style={{ background: COLORS.paper }}><Loader2 className="animate-spin" size={28} style={{ color: COLORS.ink }} /></div>;

  return (
    <div className="min-h-screen w-full flex" style={{ background: COLORS.paper, fontFamily: "'Inter', sans-serif" }}>
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-5 py-3 rounded-full shadow-lg" style={{ background: COLORS.ink }}>
          <Check size={16} style={{ color: "#4ADE80" }} />
          <span className="text-sm font-medium" style={{ color: "#fff" }}>{toast}</span>
        </div>
      )}
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
        <div className="px-4 py-2">
          <LanguageToggle />
        </div>
        <button onClick={() => setShowProfileModal(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left" style={{ color: COLORS.inkSoft }}>
          <Users size={18} /> <span className="text-sm font-medium">{t("my_profile")}</span>
        </button>
        <button onClick={shareApp} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left" style={{ color: COLORS.inkSoft }}>
          <Share2 size={18} /> <span className="text-sm font-medium">{t("share_app")}</span>
        </button>
        {role === "fondateur" && (
          <button onClick={() => setShowUpgrade(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left" style={{ color: COLORS.inkSoft }}>
            <Banknote size={18} /> <span className="text-sm font-medium">{t("subscribe_menu")}</span>
          </button>
        )}
        <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left" style={{ color: COLORS.inkSoft }}>
          <LogOut size={18} /> <span className="text-sm font-medium">{t("logout")}</span>
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
          <div className="w-full rounded-t-2xl flex flex-col" style={{ background: COLORS.card, maxHeight: "85vh" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: COLORS.line }}>
              <h3 className="text-lg font-bold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("menu")}</h3>
              <button onClick={() => setShowMoreMenu(false)} style={{ color: COLORS.inkSoft }}><X size={20} /></button>
            </div>
            <div className="overflow-y-auto flex-1 min-h-0 py-2">
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
              <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: COLORS.line }}>
                <span className="text-[15px] font-medium" style={{ color: COLORS.ink }}>Français / English</span>
                <LanguageToggle />
              </div>
              <button onClick={() => { setShowProfileModal(true); setShowMoreMenu(false); }} className="w-full flex items-center gap-3 px-5 py-4 border-t" style={{ borderColor: COLORS.line, color: COLORS.ink }}>
                <Users size={20} /> <span className="text-[15px] font-medium">{t("my_profile")}</span>
              </button>
              <button onClick={() => { shareApp(); setShowMoreMenu(false); }} className="w-full flex items-center gap-3 px-5 py-4 border-t" style={{ borderColor: COLORS.line, color: COLORS.ink }}>
                <Share2 size={20} /> <span className="text-[15px] font-medium">{t("share_app")}</span>
              </button>
              {role === "fondateur" && (
                <button onClick={() => { setShowUpgrade(true); setShowMoreMenu(false); }} className="w-full flex items-center gap-3 px-5 py-4 border-t" style={{ borderColor: COLORS.line, color: COLORS.ink }}>
                  <Banknote size={20} /> <span className="text-[15px] font-medium">{t("subscribe_menu")}</span>
                </button>
              )}
            </div>
            <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center gap-3 px-5 py-4 border-t shrink-0" style={{ borderColor: COLORS.line, color: COLORS.negative, background: COLORS.card }}>
              <LogOut size={20} /> <span className="text-[15px] font-medium">{t("logout")}</span>
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 p-5 md:p-10 pb-20 md:pb-10 max-w-5xl mx-auto w-full">
        {role === "parent" && profile.active === false && (
          <SelfReactivateBanner onSuccess={async () => { await refreshProfile(); await loadAll(); }} />
        )}
        {role !== "parent" && role !== "fondateur" && profile.active === false && (
          <div className="rounded-2xl p-5 mb-6" style={{ background: COLORS.negativeSoft, border: `1px solid ${COLORS.negative}33` }}>
            <div className="font-semibold mb-1" style={{ color: COLORS.negative }}>{t("account_deactivated_title")}</div>
            <p className="text-sm mb-1" style={{ color: COLORS.inkSoft }}>{t("account_deactivated_staff_body")}</p>
            <p className="text-sm" style={{ color: COLORS.inkSoft }}>{t("account_deactivated_readonly")}</p>
          </div>
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
            onShare={shareApp}
          />
        )}
        {tab === "students" && (role === "comptable" || role === "fondateur") && (
          <StudentsView students={yearStudents} paidByStudent={paidByStudent} currency={currency} readOnly={role === "fondateur" || isArchiveView} parents={parents} subscribed={profile.schools?.subscribed} trialDaysLeft={trialDaysLeft} levels={levels} onAdd={() => setModal("student")} onDelete={deleteStudent} onPay={() => setModal("payment")} onLink={(s) => setLinkingStudent(s)} onEdit={(s) => { setEditingStudent(s); setModal("student"); }} />
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
          <MyAssignmentsView assignments={teacherAssignments.filter((t) => t.teacher_id === profile.user_id)} existingClassNames={existingClassNames} existingSubjectNames={existingSubjectNames} onAdd={addTeacherAssignment} onDelete={deleteTeacherAssignment} />
        )}
        {tab === "classteachers" && role === "fondateur" && (
          <ClassTeachersView students={yearStudents} teacherAssignments={teacherAssignments} classHeadTeachers={classHeadTeachers} staffProfiles={staffProfiles} existingClassNames={existingClassNames} existingSubjectNames={existingSubjectNames} onSet={setClassHeadTeacher} onAssign={assignTeacherFondateur} onUnassign={deleteTeacherAssignment} onApprove={approveTeacherAssignment} />
        )}
        {tab === "announcements" && (
          <AnnouncementsView announcements={announcements} canWrite={role === "fondateur"} onAdd={() => setModal("announcement")} onDelete={deleteAnnouncement} />
        )}
        {tab === "staff" && (role === "comptable" || role === "fondateur") && (
          <StaffPaymentsView staffProfiles={staffProfiles} staffPayments={yearStaffPayments} currency={currency} readOnly={role === "fondateur"} canDeactivate={role === "fondateur"} onSave={saveStaffPayment} onToggleActive={toggleStaffActive} onToggleHidden={toggleProfileHidden} />
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
          <ParentsManagementView parents={parents} students={students} onToggleActive={toggleStaffActive} onToggleHidden={toggleProfileHidden} />
        )}
        {tab === "pay" && role === "parent" && (
          <ParentPayView comptable={staffProfiles.find((sp) => sp.role === "comptable" && !sp.hidden && sp.phone) || staffProfiles.find((sp) => sp.role === "comptable" && !sp.hidden) || staffProfiles.find((sp) => sp.role === "comptable")} currency={currency} />
        )}
        {tab === "attendance" && (role === "enseignant" || role === "fondateur") && (
          <AttendanceView
            students={yearStudents}
            attendance={yearAttendance}
            readOnly={role === "fondateur"}
            lockedClass={role === "enseignant" && !isSecondaire ? profile.class_name : null}
            myClasses={role === "enseignant" && isSecondaire ? [...new Set(teacherAssignments.filter((a) => a.teacher_id === profile.user_id).map((a) => a.class_name))] : null}
            isSecondaire={isSecondaire}
            onSave={setAttendanceStatus}
          />
        )}
        {tab === "admin" && profile.is_admin && <AdminView />}
      </main>

      {modal === "student" && <StudentModal levels={levels} student={editingStudent} existingClassNames={existingClassNames} onClose={() => { setModal(null); setEditingStudent(null); }} onSave={addStudent} onUpdate={updateStudent} />}
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
// ---------- Génération de vrais fichiers Excel (.xlsx) avec mise en forme ----------
async function exportStyledExcel({ filename, title, headers, rows, boldRows = [], nameColIndex = 1, alwaysRedCols = [] }) {
  if (!window.ExcelJS) { alert("Le générateur Excel n'a pas pu se charger. Vérifie ta connexion et réessaie."); return; }
  const workbook = new window.ExcelJS.Workbook();
  const sheet = workbook.addWorksheet((title || "Feuille1").slice(0, 31));

  const titleRow = sheet.addRow([title]);
  sheet.mergeCells(1, 1, 1, headers.length);
  titleRow.getCell(1).font = { bold: true, size: 14, color: { argb: "FF20304A" } };
  titleRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
  sheet.addRow([]);

  const headerRow = sheet.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF20304A" } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
  });

  rows.forEach((r, i) => {
    const row = sheet.addRow(r.cells);
    row.eachCell((cell) => {
      cell.border = { top: { style: "thin", color: { argb: "FFDCD6C8" } }, left: { style: "thin", color: { argb: "FFDCD6C8" } }, bottom: { style: "thin", color: { argb: "FFDCD6C8" } }, right: { style: "thin", color: { argb: "FFDCD6C8" } } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      if (boldRows.includes(i)) cell.font = { ...(cell.font || {}), bold: true };
      if (i % 2 === 1 && !boldRows.includes(i)) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF7F4EE" } };
    });
    // Seul le nom (fille) est en rouge — le reste (notes, montants...) reste noir
    if (r.isRed) row.getCell(nameColIndex).font = { ...(row.getCell(nameColIndex).font || {}), color: { argb: "FFB23B32" } };
    row.getCell(nameColIndex).alignment = { horizontal: "left", vertical: "middle" };
    // Colonnes toujours en rouge (ex: Moyenne générale), pour tous les élèves
    alwaysRedCols.forEach((colIdx) => {
      row.getCell(colIdx).font = { ...(row.getCell(colIdx).font || {}), bold: true, color: { argb: "FFB23B32" } };
    });
  });

  sheet.columns.forEach((col, i) => {
    col.width = i === (nameColIndex - 1) ? 24 : 14;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
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
function DashboardView({ stats, currency, schoolCode, role, availableYears, viewYear, setViewYear, currentYear, onStartNewYear, isArchiveView, onShare }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const [showNewYear, setShowNewYear] = useState(false);
  const [newYearInput, setNewYearInput] = useState("");
  const [starting, setStarting] = useState(false);
  const [showQR, setShowQR] = useState(false);
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
      <h1 className="text-3xl mb-1 font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("dashboard_title")}</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>{t("dashboard_subtitle")}</p>

      {role === "fondateur" && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <select value={viewYear} onChange={(e) => setViewYear(e.target.value)} className="px-3 py-2 rounded-lg outline-none text-sm font-medium" style={inputStyle}>
            {availableYears.map((y) => <option key={y} value={y}>{y} {y === currentYear ? t("active") : t("archive")}</option>)}
          </select>
          <button onClick={() => setShowNewYear(true)} className="text-xs font-medium px-3 py-2 rounded-lg" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>
            {t("new_school_year")}
          </button>
        </div>
      )}
      {isArchiveView && (
        <div className="rounded-xl px-4 py-3 mb-5 text-sm" style={{ background: COLORS.goldSoft || COLORS.primarySoft, color: COLORS.primary }}>
          📁 {t("archive_banner").replace("{year}", viewYear)}
        </div>
      )}

      {showNewYear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(32,48,74,0.45)" }} onClick={() => setShowNewYear(false)}>
          <div className="w-full max-w-sm rounded-xl p-6" style={{ background: COLORS.card }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("start_new_year_title")}</h3>
            <p className="text-sm mb-4" style={{ color: COLORS.inkSoft }}>
              {t("start_new_year_body").replace("{year}", currentYear)}
            </p>
            <FieldLabel>{t("new_year_name_label")}</FieldLabel>
            <input value={newYearInput} onChange={(e) => setNewYearInput(e.target.value)} placeholder="Ex: 2026-2027" className="w-full px-3 py-2.5 rounded-lg outline-none mb-4" style={inputStyle} />
            <button onClick={confirmNewYear} disabled={starting} className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2" style={{ background: COLORS.primary, color: "#fff" }}>
              {starting && <Loader2 className="animate-spin" size={16} />} {t("start_year_button")} {newYearInput || t("this_year")}
            </button>
          </div>
        </div>
      )}

      {role === "fondateur" && schoolCode && (
        <div className="rounded-xl mb-6 overflow-hidden" style={{ background: COLORS.primarySoft }}>
          <button onClick={copyCode} className="w-full flex items-center justify-between px-4 py-3">
            <div className="text-left">
              <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: COLORS.primary }}>{t("school_code_share")}</div>
              <div className="text-xl font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{schoolCode}</div>
            </div>
            <span className="text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ background: "#fff", color: COLORS.primary }}>
              <Copy size={13} /> {copied ? t("copied") : t("copy")}
            </span>
          </button>
          <div className="grid grid-cols-2" style={{ borderTop: `1px solid rgba(0,0,0,0.06)` }}>
            <button onClick={onShare} className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold" style={{ background: COLORS.primary, color: "#fff" }}>
              <Share2 size={15} /> {t("share_app")}
            </button>
            <button onClick={() => setShowQR(true)} className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold" style={{ background: COLORS.ink, color: "#fff" }}>
              <QrCode size={15} /> {t("scan_button")}
            </button>
          </div>
        </div>
      )}

      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(32,48,74,0.55)" }} onClick={() => setShowQR(false)}>
          <div className="w-full max-w-xs rounded-2xl p-6 text-center" style={{ background: COLORS.card }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("qr_code_title")}</h3>
            <p className="text-xs mb-4" style={{ color: COLORS.inkSoft }}>{t("qr_code_hint")}</p>
            <div className="rounded-xl p-3 mb-4 inline-block" style={{ background: "#fff", border: `1px solid ${COLORS.line}` }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(`${window.location.origin}/?code=${schoolCode}`)}`}
                alt="QR code"
                width={220}
                height={220}
              />
            </div>
            <div className="text-lg font-bold mb-4" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{schoolCode}</div>
            <button onClick={() => setShowQR(false)} className="w-full py-2.5 rounded-lg font-semibold text-sm" style={{ background: COLORS.paper, color: COLORS.ink }}>{t("close")}</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard icon={Users} label={t("stat_students")} value={stats.nbEleves} color={COLORS.ink} bg={COLORS.line} />
        <StatCard icon={Check} label={t("stat_full_paid")} value={`${stats.nbCompletePaid}/${stats.nbEleves}`} color={COLORS.positive} bg={COLORS.positiveSoft} />
        <StatCard icon={TrendingUp} label={t("stat_total_collected")} value={fmt(stats.totalPaid, currency)} color={COLORS.positive} bg={COLORS.positiveSoft} />
        <StatCard icon={TrendingDown} label={t("stat_total_expenses")} value={fmt(stats.totalExpenses, currency)} color={COLORS.negative} bg={COLORS.negativeSoft} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <StatCard icon={AlertTriangle} label={t("stat_remaining")} value={fmt(stats.reste, currency)} color={COLORS.primary} bg={COLORS.primarySoft} />
        <StatCard icon={Wallet} label={t("stat_net_balance")} value={fmt(stats.solde, currency)} color={stats.solde >= 0 ? COLORS.positive : COLORS.negative} bg={stats.solde >= 0 ? COLORS.positiveSoft : COLORS.negativeSoft} />
        <StatCard icon={BookOpen} label={t("stat_homework")} value={stats.nbDevoirs} color={COLORS.primary} bg={COLORS.primarySoft} />
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
function StudentsView({ students, paidByStudent, currency, readOnly, parents, subscribed, trialDaysLeft, levels, onAdd, onDelete, onPay, onLink, onEdit }) {
  const { t } = useLang();
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

  const exportCsv = async () => {
    const headers = ["Niveau", "Classe", "Élève", "Parent lié", "Total dû", "Payé", "Reste"];
    const rowsData = students.map((s) => {
      const paid = paidByStudent[s.id] || 0;
      return {
        cells: [s.level, s.class_name, s.full_name, parentName(s.parent_id) || "—", s.total_due, paid, Number(s.total_due) - paid],
        isRed: s.gender === "Fille",
      };
    });
    await exportStyledExcel({
      filename: `eleves_paiements_${new Date().toISOString().slice(0, 10)}.xlsx`,
      title: "Élèves & Paiements",
      headers,
      rows: rowsData,
      nameColIndex: 3,
    });
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
                          {t("parent_label")}: {parentName(s.parent_id) || t("linked")}
                          {parentPhone(s.parent_id) && (
                            <a href={`tel:${parentPhone(s.parent_id)}`} onClick={(e) => e.stopPropagation()} className="ml-1.5 underline" style={{ color: COLORS.primary }}>
                              {parentPhone(s.parent_id)}
                            </a>
                          )}
                        </>
                      ) : t("no_parent_linked")}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.positive }}>{fmt(paid, currency)}</td>
                  <td className="px-4 py-3 text-right font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: reste > 0 ? COLORS.negative : COLORS.positive }}>{fmt(reste, currency)}</td>
                  {!readOnly && (
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => onLink(s)} className="text-xs font-medium px-2 py-1 rounded-full mr-2" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>{t("link_parent")}</button>
                      <button onClick={() => onDelete(s.id)} style={{ color: COLORS.inkSoft }}><Trash2 size={15} /></button>
                    </td>
                  )}
                </tr>
              );
            })}
            <tr style={{ borderTop: `2px solid ${COLORS.line}`, background: COLORS.paper }}>
              <td className="px-4 py-2.5 font-bold text-xs uppercase tracking-wide" style={{ color: COLORS.ink }}>{t("total")} {className}</td>
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
          <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("students_title")}</h1>
          <p style={{ color: COLORS.inkSoft }}>{t("students_subtitle")}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={exportCsv} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-sm" style={{ background: "#fff", color: COLORS.ink, border: `1px solid ${COLORS.line}` }}>
            <FileSpreadsheet size={16} /> {t("export_excel")}
          </button>
          {!readOnly && (
            <>
              <AddButton onClick={onAdd} label={t("student")} />
              <button onClick={onPay} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-sm" style={{ background: COLORS.ink, color: "#fff" }}><Plus size={16} /> {t("payment")}</button>
            </>
          )}
        </div>
      </div>

      {!subscribed && (
        <div className="rounded-xl px-4 py-3 mb-4 text-sm flex items-center justify-between flex-wrap gap-2" style={{ background: trialDaysLeft > 0 ? COLORS.primarySoft : COLORS.negativeSoft, color: trialDaysLeft > 0 ? COLORS.primary : COLORS.negative }}>
          <span>{trialDaysLeft > 0 ? <>{t("trial_days_left")} <b>{trialDaysLeft} {t("days_remaining")}</b></> : <b>{t("trial_ended")}</b>}</span>
        </div>
      )}

      <div className="relative mb-5">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedClass(null); }}
          placeholder={t("search_student_placeholder")}
          className="w-full px-4 py-3 rounded-xl outline-none text-sm"
          style={inputStyle}
        />
      </div>

      {students.length === 0 ? (
        <div className="rounded-2xl p-10" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}><EmptyState text={t("no_student_registered")} /></div>
      ) : searchResults ? (
        searchResults.length === 0 ? (
          <EmptyState text={`${t("no_student_found")} "${search}".`} />
        ) : (
          renderStudentTable(searchResults, `${t("results_for")} "${search}"`)
        )
      ) : selectedClass ? (
        <div>
          <button onClick={() => setSelectedClass(null)} className="text-sm font-medium mb-4" style={{ color: COLORS.primary }}>{t("back_to_classes")}</button>
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
                      <div className="text-xs mb-2" style={{ color: COLORS.inkSoft }}>{classStudents.length} {classStudents.length > 1 ? t("students_count_suffix") : t("student_count_suffix")}</div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: COLORS.positive }}>{fmt(paidSum, currency)} {t("paid")}</span>
                        <span style={{ color: resteSum > 0 ? COLORS.negative : COLORS.positive }}>{fmt(resteSum, currency)} {t("remaining")}</span>
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
  const { t } = useLang();
  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("nav_students")}</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>{t("students_by_class")}</p>
      {students.length === 0 ? <EmptyState text={t("no_student_registered")} /> : (
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
  const { t, lang } = useLang();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from("schools").select("*").order("created_at", { ascending: false });
    if (data && data.length > 0) setSchools(data);
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
    if (data && data.length > 0) setSchools((prev) => prev.map((s) => (s.id === school.id ? data[0] : s)));
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
    if (data && data.length > 0) setSchools((prev) => prev.map((s) => (s.id === school.id ? data[0] : s)));
    if (error) alert("Erreur : " + error.message);
    setSavingId(null);
  };

  if (loading) return <div className="py-10 flex justify-center"><Loader2 className="animate-spin" size={24} style={{ color: COLORS.ink }} /></div>;

  const filtered = schools.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
  });

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("admin_title")}</h1>
      <p className="mb-1" style={{ color: COLORS.inkSoft }}>{t("admin_subtitle")}</p>
      <p className="text-xs mb-4" style={{ color: COLORS.inkSoft }}>{schools.length} {t("schools_count")} · {t("select_school_hint")}</p>

      <input
        value={search}
        onChange={(e) => { setSearch(e.target.value); setSelectedId(null); }}
        placeholder={t("search_school_placeholder")}
        className="w-full px-4 py-3 rounded-xl outline-none text-sm mb-4"
        style={inputStyle}
      />

      {schools.length === 0 ? (
        <EmptyState text={t("no_school_yet")} />
      ) : filtered.length === 0 ? (
        <EmptyState text={t("no_school_found")} />
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          {filtered.map((s, i) => {
            const isOpen = selectedId === s.id;
            return (
              <div key={s.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${COLORS.line}` }}>
                <button
                  onClick={() => setSelectedId(isOpen ? null : s.id)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                >
                  <div className="min-w-0">
                    <div className="font-semibold truncate" style={{ color: COLORS.ink }}>{s.name}</div>
                    <div className="text-xs" style={{ color: COLORS.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>{s.code}</div>
                  </div>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ml-2"
                    style={{ background: s.subscribed ? COLORS.positiveSoft : COLORS.primarySoft, color: s.subscribed ? COLORS.positive : COLORS.primary }}
                  >
                    {s.subscribed ? t("subscribed_tag") : t("free_trial_tag")}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4">
                    <div className="text-xs mb-3" style={{ color: COLORS.inkSoft }}>
                      {s.subscribed ? t("active_subscription") : `${t("free_trial_started")} ${new Date(s.trial_started_at).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}`}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {PRICING_TIERS.map((tier) => (
                        <button
                          key={tier.name}
                          onClick={() => setTier(s, tier)}
                          disabled={savingId === s.id}
                          className="text-xs font-medium px-3 py-2 rounded-lg"
                          style={{ background: COLORS.paper, color: COLORS.ink, border: `1px solid ${COLORS.line}` }}
                        >
                          {t("activate_tier")} "{tier.name}" ({fmt(tier.price, "GNF")})
                        </button>
                      ))}
                      <button
                        onClick={() => toggleSubscription(s)}
                        disabled={savingId === s.id}
                        className="text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5"
                        style={{ background: s.subscribed ? COLORS.negativeSoft : COLORS.positiveSoft, color: s.subscribed ? COLORS.negative : COLORS.positive }}
                      >
                        {savingId === s.id && <Loader2 className="animate-spin" size={12} />}
                        {s.subscribed ? t("back_to_trial") : t("activate_no_tier")}
                      </button>
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



// ---------- Notes (enseignant) ----------
// ---------- Professeurs principaux (fondateur, secondaire) ----------
// ---------- Notes du secondaire (écrit/oral, mensuel, classement pondéré) ----------
function GradesSecondaireView({ students, gradesSecondaire, releases, allAssignments, myUserId, classHeadTeachers, subjectsSecondaire, currency, readOnly, isHeadTeacherOf, onSave, onSetCoefficient, onToggleRelease }) {
  const { t } = useLang();
  const [view, setView] = useState("saisie"); // saisie | bulletin
  const [saving, setSaving] = useState(null);
  const [togglingRelease, setTogglingRelease] = useState(false);
  const [coefInput, setCoefInput] = useState("");

  // Classes accessibles : les siennes (approuvées, si enseignant), + celles où on est prof principal, + tout si readOnly (fondateur)
  const visibleAssignments = readOnly
    ? allAssignments
    : allAssignments.filter((a) => (a.teacher_id === myUserId && a.approved) || isHeadTeacherOf.includes(a.class_name));

  const classNames = useMemo(() => [...new Set(visibleAssignments.map((a) => a.class_name))].sort(), [visibleAssignments]);
  const [className, setClassName] = useState(classNames[0] || "");
  const myOwnAssignments = useMemo(() => allAssignments.filter((a) => a.teacher_id === myUserId && a.approved), [allAssignments, myUserId]);
  const subjectsForClass = useMemo(() => {
    const mine = [...new Set(myOwnAssignments.filter((a) => a.class_name === className).map((a) => a.subject))].sort();
    if (mine.length > 0 || !readOnly) return mine;
    return [...new Set(visibleAssignments.filter((a) => a.class_name === className).map((a) => a.subject))].sort();
  }, [myOwnAssignments, visibleAssignments, className, readOnly]);
  const [subject, setSubject] = useState(subjectsForClass[0] || "");
  useEffect(() => {
    if (!subjectsForClass.includes(subject)) setSubject(subjectsForClass[0] || "");
  }, [className, subjectsForClass]);
  useEffect(() => {
    if (classNames.length > 0 && !classNames.includes(className)) setClassName(classNames[0]);
  }, [classNames]);
  const [month, setMonth] = useState(SECONDAIRE_GRADE_MONTHS[0]);
  const [term, setTerm] = useState("Trimestre 1");

  const canEdit = !readOnly && allAssignments.some((a) => a.teacher_id === myUserId && a.approved && a.subject === subject && a.class_name === className);
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
    const coursMonths = TERM_MONTHS[trm] || [];
    const compMonth = COMPOSITION_MONTHS[trm];
    const monthlyAverages = coursMonths.map((m) => {
      const g = getGrade(studentId, subj, m);
      if (!g || (g.ecrit === null && g.oral === null)) return null;
      const vals = [g.ecrit, g.oral].filter((v) => v !== null && v !== undefined);
      return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    }).filter((v) => v !== null);
    const coursAvg = monthlyAverages.length > 0 ? monthlyAverages.reduce((a, b) => a + b, 0) / monthlyAverages.length : null;
    const compGrade = compMonth ? getGrade(studentId, subj, compMonth) : null;
    const compScore = compGrade?.ecrit ?? null;
    if (coursAvg === null && compScore === null) return null;
    if (coursAvg === null) return compScore;
    if (compScore === null) return coursAvg;
    return (coursAvg + compScore) / 2;
  };

  const subjectAnnualAverage = (studentId, subj) => {
    const t1 = subjectTermAverage(studentId, subj, "Trimestre 1");
    const t2 = subjectTermAverage(studentId, subj, "Trimestre 2");
    if (t1 === null && t2 === null) return null;
    if (t1 === null) return t2;
    if (t2 === null) return t1;
    return (t1 + t2) / 2;
  };
  const subjectAverageForTerm = (studentId, subj, trm) => (trm === "Annuel" ? subjectAnnualAverage(studentId, subj) : subjectTermAverage(studentId, subj, trm));

  // ---------- Vue "Saisie" : une matière à la fois ----------
  const renderSaisie = () => {
    const isComp = isCompositionMonth(month);
    const monthAvg = (studentId) => {
      const g = getGrade(studentId, subject, month);
      if (!g) return null;
      if (isComp) return g.ecrit ?? null;
      const vals = [g.ecrit, g.oral].filter((v) => v !== null && v !== undefined);
      return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    };
    const trimAvg = (studentId) => subjectTermAverage(studentId, subject, monthToTerm(month));

    const exportSaisieExcel = async () => {
      const headers = isComp
        ? [t("student"), t("composition_note"), t("term_avg")]
        : [t("student"), t("written"), t("oral"), t("month_avg"), t("term_avg")];
      const rowsData = classStudents.map((s) => {
        const g = getGrade(s.id, subject, month);
        const cells = isComp
          ? [s.full_name, g?.ecrit ?? "", trimAvg(s.id) !== null ? trimAvg(s.id).toFixed(2) : ""]
          : [s.full_name, g?.ecrit ?? "", g?.oral ?? "", monthAvg(s.id) !== null ? monthAvg(s.id).toFixed(2) : "", trimAvg(s.id) !== null ? trimAvg(s.id).toFixed(2) : ""];
        return { cells, isRed: s.gender === "Fille" };
      });
      await exportStyledExcel({
        filename: `notes_${className}_${subject}_${month}_${new Date().toISOString().slice(0, 10)}.xlsx`,
        title: `Notes — ${className} · ${subject} · ${month}`,
        headers,
        rows: rowsData,
        nameColIndex: 1,
        alwaysRedCols: [headers.length],
      });
    };

    return (
      <>
        <div className="flex justify-end mb-3">
          <button onClick={exportSaisieExcel} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-sm" style={{ background: "#fff", color: COLORS.ink, border: `1px solid ${COLORS.line}` }}>
            <FileSpreadsheet size={16} /> {t("export_excel")}
          </button>
        </div>
        {isComp && (
          <div className="rounded-xl px-4 py-3 mb-5 text-sm" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>
            {t("composition_month")} — {month}
          </div>
        )}
        {canEdit && (
          <div className="rounded-xl px-4 py-3 mb-5 flex items-center justify-between flex-wrap gap-3" style={{ background: COLORS.primarySoft }}>
            <span className="text-sm font-semibold" style={{ color: COLORS.primary }}>{t("coefficient_of")} {subject} : {coefficient}</span>
            <div className="flex gap-2">
              <input type="number" value={coefInput} onChange={(e) => setCoefInput(e.target.value)} placeholder={t("new_coef")} className="w-24 px-2 py-1.5 rounded-lg text-sm outline-none" style={inputStyle} />
              <button onClick={saveCoef} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: COLORS.primary, color: "#fff" }}>{t("set_button")}</button>
            </div>
          </div>
        )}
        {classStudents.length === 0 ? (
          <EmptyState text={t("no_student_in_class")} />
        ) : (
          <div className="rounded-2xl overflow-x-auto" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: COLORS.paper }}>
                  <th className="text-left px-4 py-3 font-semibold whitespace-nowrap sticky left-0 z-10" style={{ color: COLORS.inkSoft, background: COLORS.paper }}>{t("student")}</th>
                  {isComp ? (
                    <th className="text-center px-3 py-3 font-semibold" style={{ color: COLORS.inkSoft }}>{t("composition_note")}</th>
                  ) : (
                    <>
                      <th className="text-center px-3 py-3 font-semibold" style={{ color: COLORS.inkSoft }}>{t("written")}</th>
                      <th className="text-center px-3 py-3 font-semibold" style={{ color: COLORS.inkSoft }}>{t("oral")}</th>
                      <th className="text-center px-3 py-3 font-semibold" style={{ color: COLORS.ink }}>{t("month_avg")}</th>
                    </>
                  )}
                  <th className="text-center px-3 py-3 font-semibold" style={{ color: COLORS.primary }}>{t("term_avg")}</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((s, i) => {
                  const g = getGrade(s.id, subject, month);
                  return (
                    <tr key={s.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${COLORS.line}` }}>
                      <td className="px-4 py-2.5 font-medium whitespace-nowrap sticky left-0 z-10" style={{ color: s.gender === "Fille" ? COLORS.negative : COLORS.ink, background: COLORS.card }}>{s.full_name}</td>
                      {isComp ? (
                        <td className="px-2 py-2 text-center">
                          {canEdit ? (
                            <input key={`${subject}-${month}-comp`} type="number" defaultValue={g?.ecrit ?? ""} onBlur={(e) => handleScoreChange(s.id, "ecrit", e.target.value)} className="w-16 px-2 py-1.5 rounded-lg text-center outline-none text-sm" style={{ ...inputStyle, opacity: saving === `${s.id}-ecrit` ? 0.5 : 1 }} />
                          ) : (
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{g?.ecrit ?? "—"}</span>
                          )}
                        </td>
                      ) : (
                        <>
                          <td className="px-2 py-2 text-center">
                            {canEdit ? (
                              <input key={`${subject}-${month}-ecrit`} type="number" defaultValue={g?.ecrit ?? ""} onBlur={(e) => handleScoreChange(s.id, "ecrit", e.target.value)} className="w-16 px-2 py-1.5 rounded-lg text-center outline-none text-sm" style={{ ...inputStyle, opacity: saving === `${s.id}-ecrit` ? 0.5 : 1 }} />
                            ) : (
                              <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{g?.ecrit ?? "—"}</span>
                            )}
                          </td>
                          <td className="px-2 py-2 text-center">
                            {canEdit ? (
                              <input key={`${subject}-${month}-oral`} type="number" defaultValue={g?.oral ?? ""} onBlur={(e) => handleScoreChange(s.id, "oral", e.target.value)} className="w-16 px-2 py-1.5 rounded-lg text-center outline-none text-sm" style={{ ...inputStyle, opacity: saving === `${s.id}-oral` ? 0.5 : 1 }} />
                            ) : (
                              <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{g?.oral ?? "—"}</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-center font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{monthAvg(s.id) !== null ? monthAvg(s.id).toFixed(2) : "—"}</td>
                        </>
                      )}
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
      const subjectAvgs = allSubjects.map((subj) => ({ subject: subj, avg: subjectAverageForTerm(s.id, subj, term), coef: subjectsSecondaire.find((cs) => cs.class_name === className && cs.subject === subj)?.coefficient || 1 }));
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

    const exportBulletinExcel = async () => {
      const headers = [t("rank"), t("student"), ...allSubjects, t("general_average")];
      const rowsData = rows.map((row, i) => ({
        cells: [i + 1, row.student.full_name, ...row.subjectAvgs.map((sa) => (sa.avg !== null ? sa.avg.toFixed(2) : "")), row.moyenneGenerale !== null ? row.moyenneGenerale.toFixed(2) : ""],
        isRed: row.student.gender === "Fille",
      }));
      await exportStyledExcel({
        filename: `bulletin_${className}_${term}_${new Date().toISOString().slice(0, 10)}.xlsx`,
        title: `Bulletin & Classement — ${className} · ${term}`,
        headers,
        rows: rowsData,
        nameColIndex: 2,
        alwaysRedCols: [headers.length],
      });
    };

    return (
      <>
        <div className="flex justify-end mb-3">
          <button onClick={exportBulletinExcel} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-sm" style={{ background: "#fff", color: COLORS.ink, border: `1px solid ${COLORS.line}` }}>
            <FileSpreadsheet size={16} /> {t("export_excel")}
          </button>
        </div>
        <div className="mb-5">
          <FieldLabel>{t("period_label")}</FieldLabel>
          <select value={term} onChange={(e) => setTerm(e.target.value)} className="w-full sm:w-48 px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
            {Object.keys(TERM_MONTHS).map((tm) => <option key={tm} value={tm}>{tm}</option>)}
            <option value="Annuel">{t("annual_option")}</option>
          </select>
        </div>

        {isHeadHere && (
          <div className="rounded-xl px-4 py-3 mb-5 flex items-center justify-between flex-wrap gap-3" style={{ background: published ? COLORS.positiveSoft : COLORS.primarySoft }}>
            <div>
              <div className="text-sm font-semibold" style={{ color: published ? COLORS.positive : COLORS.primary }}>
                {published ? t("ranking_validated") : t("ranking_not_published")}
              </div>
              <div className="text-xs mt-0.5" style={{ color: COLORS.inkSoft }}>{className} · {term}</div>
            </div>
            <button onClick={togglePublish} disabled={togglingRelease} className="text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5" style={{ background: published ? COLORS.negative : COLORS.positive, color: "#fff" }}>
              {togglingRelease && <Loader2 className="animate-spin" size={12} />}
              {published ? t("remove") : t("validate_publish")}
            </button>
          </div>
        )}

        {classStudents.length === 0 || allSubjects.length === 0 ? (
          <EmptyState text={t("no_grades_yet")} />
        ) : (
          <div className="rounded-2xl overflow-x-auto" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: COLORS.paper }}>
                  <th className="text-left px-3 py-3 font-semibold" style={{ color: COLORS.inkSoft }}>{t("rank")}</th>
                  <th className="text-left px-4 py-3 font-semibold whitespace-nowrap sticky left-0 z-10" style={{ color: COLORS.inkSoft, background: COLORS.paper }}>{t("student")}</th>
                  {allSubjects.map((subj) => (
                    <th key={subj} className="text-center px-3 py-3 font-semibold whitespace-nowrap" style={{ color: COLORS.inkSoft }}>{subj}</th>
                  ))}
                  <th className="text-center px-3 py-3 font-semibold" style={{ color: COLORS.primary }}>{t("general_average")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.student.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${COLORS.line}` }}>
                    <td className="px-3 py-2.5 font-bold" style={{ color: COLORS.primary, fontFamily: "'IBM Plex Mono', monospace" }}>{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium whitespace-nowrap sticky left-0 z-10" style={{ color: row.student.gender === "Fille" ? COLORS.negative : COLORS.ink, background: COLORS.card }}>{row.student.full_name}</td>
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
      <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("nav_grades")}</h1>
      <p className="mb-3" style={{ color: COLORS.inkSoft }}>{view === "saisie" ? t("grades_sec_subtitle_entry") : t("grades_sec_subtitle_bulletin")}</p>
      <div className="flex gap-2 mb-5">
        <button onClick={() => setView("saisie")} className="text-xs font-medium px-3 py-2 rounded-lg" style={{ background: view === "saisie" ? COLORS.ink : "#fff", color: view === "saisie" ? "#fff" : COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>{t("enter_view")}</button>
        {(isHeadTeacherOf.length > 0 || readOnly) && (
          <button onClick={() => setView("bulletin")} className="text-xs font-medium px-3 py-2 rounded-lg" style={{ background: view === "bulletin" ? COLORS.ink : "#fff", color: view === "bulletin" ? "#fff" : COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>{t("bulletin_view")}</button>
        )}
      </div>

      <div className="flex flex-wrap gap-4 mb-5">
        <div>
          <FieldLabel>{t("class_label")}</FieldLabel>
          <select value={className} onChange={(e) => { setClassName(e.target.value); setSubject(""); }} className="w-full sm:w-56 px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
            {classNames.length === 0 ? <option>{t("no_class")}</option> : classNames.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {view === "saisie" && (
          <>
            <div>
              <FieldLabel>{t("subject_label")}</FieldLabel>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full sm:w-48 px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
                {subjectsForClass.length === 0 ? <option>—</option> : subjectsForClass.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>{t("month_label")}</FieldLabel>
              <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full sm:w-40 px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
                {SECONDAIRE_GRADE_MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </>
        )}
      </div>

      {classNames.length === 0 ? (
        <EmptyState text={readOnly ? t("no_subject_yet") : t("add_subject_first")} />
      ) : view === "saisie" ? renderSaisie() : renderBulletin()}
    </div>
  );
}

function ClassTeachersView({ students, teacherAssignments, classHeadTeachers, staffProfiles, existingClassNames, existingSubjectNames, onSet, onAssign, onUnassign, onApprove }) {
  const { t } = useLang();
  const [saving, setSaving] = useState(null);
  const classNames = useMemo(() => [...new Set(students.map((s) => s.class_name))].sort(), [students]);
  const allTeachers = staffProfiles.filter((sp) => sp.role === "enseignant");

  const [assignTeacherId, setAssignTeacherId] = useState(allTeachers[0]?.user_id || "");
  const [assignSubject, setAssignSubject] = useState("");
  const [assignClass, setAssignClass] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");

  const teachersForClass = (className) => {
    const ids = [...new Set(teacherAssignments.filter((t) => t.class_name === className).map((t) => t.teacher_id))];
    return ids.map((id) => staffProfiles.find((sp) => sp.user_id === id)).filter(Boolean);
  };

  const handleChange = async (className, teacherId) => {
    setSaving(className);
    await onSet(className, teacherId);
    setSaving(null);
  };

  const submitAssign = async () => {
    if (!assignTeacherId || !assignSubject.trim() || !assignClass.trim()) return;
    setAssigning(true);
    setAssignError("");
    const err = await onAssign(assignTeacherId, assignSubject.trim(), assignClass.trim());
    if (err) setAssignError("Erreur : " + err.message);
    else { setAssignSubject(""); setAssignClass(""); }
    setAssigning(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("head_teachers_title")}</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>{t("head_teachers_subtitle")}</p>

      {allTeachers.length > 0 && (
        <div className="rounded-2xl p-5 mb-8" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <h2 className="font-bold mb-1" style={{ color: COLORS.ink }}>{t("assign_subject_title")}</h2>
          <p className="text-xs mb-4" style={{ color: COLORS.inkSoft }}>{t("assign_subject_subtitle")}</p>
          <div className="space-y-3 mb-3">
            <div>
              <FieldLabel>{t("choose_teacher")}</FieldLabel>
              <select value={assignTeacherId} onChange={(e) => setAssignTeacherId(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle}>
                {allTeachers.map((tch) => <option key={tch.user_id} value={tch.user_id}>{tch.full_name}</option>)}
              </select>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <FieldLabel>{t("subject_label")}</FieldLabel>
                <select value={assignSubject} onChange={(e) => setAssignSubject(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle}>
                  <option value="">—</option>
                  {getSubjectOptions(assignClass).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <FieldLabel>{t("class_label")}</FieldLabel>
                <select value={assignClass} onChange={(e) => setAssignClass(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle}>
                  <option value="">—</option>
                  {CLASSES_SECONDAIRE_ALL.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
          {assignError && <div className="text-sm mb-3" style={{ color: COLORS.negative }}>{assignError}</div>}
          <button onClick={submitAssign} disabled={assigning} className="w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2" style={{ background: COLORS.primary, color: "#fff" }}>
            {assigning && <Loader2 className="animate-spin" size={14} />} {t("add_this_subject")}
          </button>

          {teacherAssignments.length > 0 && (
            <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${COLORS.line}` }}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.inkSoft }}>{t("current_assignments")}</div>
              <div className="space-y-1.5">
                {teacherAssignments.map((a) => {
                  const tch = staffProfiles.find((sp) => sp.user_id === a.teacher_id);
                  return (
                    <div key={a.id} className="flex items-center justify-between px-3 py-2 rounded-lg text-sm" style={{ background: COLORS.paper }}>
                      <span style={{ color: COLORS.ink }}>
                        {tch?.full_name || "—"} <span style={{ color: COLORS.inkSoft }}>· {a.subject} · {a.class_name}</span>
                        <span
                          className="text-xs font-semibold ml-2 px-2 py-0.5 rounded-full"
                          style={a.approved ? { background: COLORS.positiveSoft, color: COLORS.positive } : { background: COLORS.primarySoft, color: COLORS.primary }}
                        >
                          {a.approved ? t("approved_badge") : t("pending_approval")}
                        </span>
                      </span>
                      <div className="flex items-center gap-2">
                        {!a.approved && (
                          <button onClick={() => onApprove(a.id)} className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: COLORS.positive, color: "#fff" }}>
                            {t("approve_button")}
                          </button>
                        )}
                        <button onClick={() => onUnassign(a.id)} style={{ color: COLORS.inkSoft }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {classNames.length === 0 ? (
        <EmptyState text={t("no_class_yet")} />
      ) : (
        <div className="space-y-3">
          {classNames.map((cn) => {
            const teachers = teachersForClass(cn);
            const current = classHeadTeachers.find((c) => c.class_name === cn)?.teacher_id || "";
            return (
              <div key={cn} className="rounded-2xl p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                <div className="font-semibold mb-2" style={{ color: COLORS.ink }}>{cn}</div>
                {teachers.length === 0 ? (
                  <p className="text-xs" style={{ color: COLORS.inkSoft }}>{t("no_teacher_in_class")}</p>
                ) : (
                  <select
                    value={current}
                    onChange={(e) => handleChange(cn, e.target.value)}
                    disabled={saving === cn}
                    className="w-full px-3 py-2.5 rounded-lg outline-none text-sm"
                    style={inputStyle}
                  >
                    <option value="">{t("none_designated")}</option>
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
function MyAssignmentsView({ assignments, existingClassNames, existingSubjectNames, onAdd, onDelete }) {
  const { t } = useLang();
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
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("my_subjects_title")}</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>{t("my_subjects_subtitle")}</p>

      <div className="rounded-2xl p-5 mb-6" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <FieldLabel>{t("subject_label")}</FieldLabel>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
              <option value="">—</option>
              {getSubjectOptions(className).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel>{t("class_label")}</FieldLabel>
            <select value={className} onChange={(e) => setClassName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
              <option value="">—</option>
              {CLASSES_SECONDAIRE_ALL.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        {error && <div className="text-sm mb-3" style={{ color: COLORS.negative }}>{error}</div>}
        <button onClick={submit} disabled={adding} className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2" style={{ background: COLORS.primary, color: "#fff" }}>
          {adding && <Loader2 className="animate-spin" size={16} />} {t("add_this_subject")}
        </button>
      </div>

      {assignments.length === 0 ? (
        <EmptyState text={t("no_subject_added_yet")} />
      ) : (
        <div className="space-y-2">
          {assignments.map((a) => (
            <div key={a.id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div>
                <span className="font-medium" style={{ color: COLORS.ink }}>{a.subject}</span>
                <span className="text-sm ml-2" style={{ color: COLORS.inkSoft }}>{a.class_name}</span>
                <span
                  className="text-xs font-semibold ml-3 px-2 py-0.5 rounded-full"
                  style={a.approved ? { background: COLORS.positiveSoft, color: COLORS.positive } : { background: COLORS.primarySoft, color: COLORS.primary }}
                >
                  {a.approved ? t("approved_badge") : t("pending_approval")}
                </span>
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
  const { t } = useLang();
  const PASS_THRESHOLD = passThreshold ?? 10;
  const classNames = useMemo(() => [...new Set(students.map((s) => s.class_name))].sort(), [students]);
  const [className, setClassName] = useState(lockedClass || classNames[0] || "");
  const [term, setTerm] = useState("Trimestre 1");
  const [newSubject, setNewSubject] = useState("");
  const [ranked, setRankedState] = useState(false);
  useEffect(() => {
    try { setRankedState(localStorage.getItem(`ec_ranked_${className}_${term}`) === "1"); } catch (e) {}
  }, [className, term]);
  const setRanked = (fnOrVal) => {
    setRankedState((prev) => {
      const next = typeof fnOrVal === "function" ? fnOrVal(prev) : fnOrVal;
      try { localStorage.setItem(`ec_ranked_${className}_${term}`, next ? "1" : "0"); } catch (e) {}
      return next;
    });
  };
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

  const exportExcel = async () => {
    if (!window.ExcelJS) { alert("Le générateur Excel n'a pas pu se charger. Vérifie ta connexion et réessaie."); return; }
    const workbook = new window.ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Notes");
    const headerFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF20304A" } };
    const thinBorder = { top: { style: "thin", color: { argb: "FFDCD6C8" } }, left: { style: "thin", color: { argb: "FFDCD6C8" } }, bottom: { style: "thin", color: { argb: "FFDCD6C8" } }, right: { style: "thin", color: { argb: "FFDCD6C8" } } };
    const styleHeaderRow = (row) => row.eachCell((c) => { c.font = { bold: true, color: { argb: "FFFFFFFF" } }; c.fill = headerFill; c.alignment = { horizontal: "center", vertical: "middle", wrapText: true }; c.border = thinBorder; });
    const styleDataRow = (row) => row.eachCell((c) => { c.border = thinBorder; c.alignment = { horizontal: "center", vertical: "middle" }; });

    const titleRow = sheet.addRow([`Notes — ${className} · ${term}`]);
    sheet.mergeCells(titleRow.number, 1, titleRow.number, 4 + subjects.length);
    titleRow.getCell(1).font = { bold: true, size: 14, color: { argb: "FF20304A" } };
    titleRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    sheet.addRow([]);

    styleHeaderRow(sheet.addRow(["Élève", "Sexe", ...subjects, "Total", "Moyenne"]));
    const moyenneColIdx = 4 + subjects.length; // Élève, Sexe, ...subjects, Total, Moyenne
    rows.forEach((r) => {
      const row = sheet.addRow([r.student.full_name, r.student.gender || "—", ...subjects.map((s) => getScore(r.student.id, s) ?? ""), r.total.toFixed(1), r.moyenne !== null ? r.moyenne.toFixed(2) : ""]);
      styleDataRow(row);
      // Seul le nom des filles est en rouge — les notes restent en noir
      if (r.student.gender === "Fille") row.getCell(1).font = { color: { argb: "FFB23B32" } };
      row.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
      // La colonne Moyenne est toujours en rouge, pour tous les élèves
      row.getCell(moyenneColIdx).font = { bold: true, color: { argb: "FFB23B32" } };
    });

    sheet.addRow([]);
    const statsTitle = sheet.addRow(["Tableau statistique des résultats"]);
    sheet.mergeCells(statsTitle.number, 1, statsTitle.number, 7);
    statsTitle.getCell(1).font = { bold: true, size: 12, color: { argb: "FF20304A" } };
    statsTitle.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    styleHeaderRow(sheet.addRow(["", "Inscrits", "Ont composé", "Admis", "% Admis", "Échoués", "% Échoués"]));
    styleDataRow(sheet.addRow(["Garçons", summaryStats.inscrits.garcons, summaryStats.composes.garcons, summaryStats.admis.garcons, summaryStats.admisPctG, summaryStats.echoues.garcons, summaryStats.echouePctG]));
    const fillesStatsRow = sheet.addRow(["Filles", summaryStats.inscrits.filles, summaryStats.composes.filles, summaryStats.admis.filles, summaryStats.admisPctF, summaryStats.echoues.filles, summaryStats.echouePctF]);
    styleDataRow(fillesStatsRow);
    fillesStatsRow.eachCell((c) => { c.font = { color: { argb: "FFB23B32" } }; });
    const totalStatsRow = sheet.addRow(["Total", summaryStats.inscrits.total, summaryStats.composes.total, summaryStats.admis.total, summaryStats.admisPctT, summaryStats.echoues.total, summaryStats.echouePctT]);
    styleDataRow(totalStatsRow);
    totalStatsRow.eachCell((c) => { c.font = { ...(c.font || {}), bold: true }; });

    sheet.addRow([]);
    const subjTitle = sheet.addRow(["Résultats par matière"]);
    sheet.mergeCells(subjTitle.number, 1, subjTitle.number, 1 + subjects.length);
    subjTitle.getCell(1).font = { bold: true, size: 12, color: { argb: "FF20304A" } };
    subjTitle.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    styleHeaderRow(sheet.addRow(["", ...subjects]));
    styleDataRow(sheet.addRow(["Garçons", ...subjectStats.map((s) => `${s.pg}/${s.g} · ${s.pctG}%`)]));
    const fillesSubjRow = sheet.addRow(["Filles", ...subjectStats.map((s) => `${s.pf}/${s.f} · ${s.pctF}%`)]);
    styleDataRow(fillesSubjRow);
    fillesSubjRow.eachCell((c) => { c.font = { color: { argb: "FFB23B32" } }; });
    const totalSubjRow = sheet.addRow(["Total", ...subjectStats.map((s) => `${s.pt}/${s.total} · ${s.pctT}%`)]);
    styleDataRow(totalSubjRow);
    totalSubjRow.eachCell((c) => { c.font = { ...(c.font || {}), bold: true }; });

    sheet.columns.forEach((col, i) => { col.width = i === 0 ? 24 : 16; });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notes_${className}_${term}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("nav_grades")}</h1>
        <div className="flex gap-2 flex-wrap">
          <button onClick={exportExcel} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-sm" style={{ background: "#fff", color: COLORS.ink, border: `1px solid ${COLORS.line}` }}>
            <FileSpreadsheet size={16} /> {t("export_excel")}
          </button>
          <button
            onClick={() => setRanked((r) => !r)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-sm"
            style={{ background: ranked ? COLORS.primary : COLORS.ink, color: "#fff" }}
          >
            <ArrowDownWideNarrow size={16} /> {ranked ? t("sort_active") : t("sort_button")}
          </button>
        </div>
      </div>
      <p className="mb-5" style={{ color: COLORS.inkSoft }}>{t("grades_subtitle")}</p>

      <div className="flex flex-wrap gap-4 mb-5">
        <div>
          <FieldLabel>{t("class_label")}</FieldLabel>
          {lockedClass ? (
            <div className="px-3 py-2.5 rounded-lg text-sm font-medium" style={{ ...inputStyle, opacity: 0.7 }}>{lockedClass}</div>
          ) : (
            <select value={className} onChange={(e) => { setClassName(e.target.value); setRanked(false); }} className="w-full sm:w-56 px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
              {classNames.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>
        <div>
          <FieldLabel>{t("period_label")}</FieldLabel>
          <select value={term} onChange={(e) => { setTerm(e.target.value); setRanked(false); }} className="w-full sm:w-48 px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
            {["Trimestre 1", "Trimestre 2", "Trimestre 3", "Annuel"].map((tm) => <option key={tm} value={tm}>{tm === "Annuel" ? t("annual") : tm}</option>)}
          </select>
        </div>
      </div>
      {isAnnual && (
        <div className="rounded-xl px-4 py-3 mb-5 text-sm" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>
          {t("annual_notice")}
        </div>
      )}

      {!readOnly && (
        <div className="rounded-xl px-4 py-3 mb-5 flex items-center justify-between flex-wrap gap-3" style={{ background: published ? COLORS.positiveSoft : COLORS.primarySoft }}>
          <div>
            <div className="text-sm font-semibold" style={{ color: published ? COLORS.positive : COLORS.primary }}>
              {published ? t("published_to_parents") : t("not_published")}
            </div>
            <div className="text-xs mt-0.5" style={{ color: COLORS.inkSoft }}>{className} · {term}</div>
          </div>
          <button onClick={togglePublish} disabled={togglingRelease} className="text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5" style={{ background: published ? COLORS.negative : COLORS.positive, color: "#fff" }}>
            {togglingRelease && <Loader2 className="animate-spin" size={12} />}
            {published ? t("remove_hide") : t("publish_to_parents")}
          </button>
        </div>
      )}

      {!cellsReadOnly && (
        <div className="flex gap-2 mb-5">
          <input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder={t("add_subject_placeholder")} className="flex-1 px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
          <button onClick={addSubject} className="px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-1.5" style={{ background: COLORS.primary, color: "#fff" }}><Plus size={16} /> {t("subject_button")}</button>
        </div>
      )}

      {classStudents.length === 0 ? (
        <EmptyState text={t("no_student_in_class")} />
      ) : subjects.length === 0 ? (
        <EmptyState text={t("no_subject_added")} />
      ) : (
        <div className="rounded-2xl overflow-x-auto" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: COLORS.paper }}>
                {ranked && <th className="text-left px-3 py-3 font-semibold" style={{ color: COLORS.inkSoft }}>{t("rank")}</th>}
                <th className="text-left px-4 py-3 font-semibold whitespace-nowrap sticky left-0 z-10" style={{ color: COLORS.inkSoft, background: COLORS.paper }}>{t("student")}</th>
                {subjects.map((subj) => (
                  <th key={subj} className="text-center px-3 py-3 font-semibold whitespace-nowrap" style={{ color: COLORS.inkSoft }}>{subj}</th>
                ))}
                <th className="text-center px-3 py-3 font-semibold" style={{ color: COLORS.ink }}>{t("total")}</th>
                <th className="text-center px-3 py-3 font-semibold" style={{ color: COLORS.ink }}>{t("average")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.student.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${COLORS.line}` }}>
                  {ranked && <td className="px-3 py-2.5 font-bold" style={{ color: COLORS.primary, fontFamily: "'IBM Plex Mono', monospace" }}>{i + 1}</td>}
                  <td className="px-4 py-2.5 font-medium whitespace-nowrap sticky left-0 z-10" style={{ color: row.student.gender === "Fille" ? COLORS.negative : COLORS.ink, background: COLORS.card }}>{row.student.full_name}</td>
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
                  <td className="px-3 py-2.5 text-center font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.negative }}>{row.moyenne !== null ? row.moyenne.toFixed(2) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subjects.length > 0 && classStudents.length > 0 && (
        <>
          <h2 className="text-xl font-bold mt-8 mb-3" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("statistical_table")} — {className} · {term}</h2>
          <div className="rounded-2xl overflow-x-auto mb-8" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: COLORS.ink }}>
                  <th className="text-left px-4 py-2.5 font-semibold" style={{ color: "#fff" }}></th>
                  <th className="text-center px-3 py-2.5 font-semibold" style={{ color: "#fff" }}>{t("enrolled")}</th>
                  <th className="text-center px-3 py-2.5 font-semibold" style={{ color: "#fff" }}>{t("composed")}</th>
                  <th className="text-center px-3 py-2.5 font-semibold" style={{ color: "#8FE0B0" }}>{t("admitted")}</th>
                  <th className="text-center px-3 py-2.5 font-semibold" style={{ color: "#8FE0B0" }}>{t("pct_admitted")}</th>
                  <th className="text-center px-3 py-2.5 font-semibold" style={{ color: "#F0A79E" }}>{t("failed")}</th>
                  <th className="text-center px-3 py-2.5 font-semibold" style={{ color: "#F0A79E" }}>{t("pct_failed")}</th>
                </tr>
              </thead>
              <tbody style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                <tr style={{ borderTop: `1px solid ${COLORS.line}` }}>
                  <td className="px-4 py-2 font-sans font-medium" style={{ color: COLORS.ink }}>{t("boys")}</td>
                  <td className="text-center px-3 py-2">{summaryStats.inscrits.garcons}</td>
                  <td className="text-center px-3 py-2">{summaryStats.composes.garcons}</td>
                  <td className="text-center px-3 py-2" style={{ color: COLORS.positive }}>{summaryStats.admis.garcons}</td>
                  <td className="text-center px-3 py-2" style={{ color: COLORS.positive }}>{summaryStats.admisPctG}%</td>
                  <td className="text-center px-3 py-2" style={{ color: COLORS.negative }}>{summaryStats.echoues.garcons}</td>
                  <td className="text-center px-3 py-2" style={{ color: COLORS.negative }}>{summaryStats.echouePctG}%</td>
                </tr>
                <tr style={{ borderTop: `1px solid ${COLORS.line}`, background: COLORS.paper }}>
                  <td className="px-4 py-2 font-sans font-medium" style={{ color: "#B23B32" }}>{t("girls")}</td>
                  <td className="text-center px-3 py-2" style={{ color: "#B23B32" }}>{summaryStats.inscrits.filles}</td>
                  <td className="text-center px-3 py-2" style={{ color: "#B23B32" }}>{summaryStats.composes.filles}</td>
                  <td className="text-center px-3 py-2" style={{ color: COLORS.positive }}>{summaryStats.admis.filles}</td>
                  <td className="text-center px-3 py-2" style={{ color: COLORS.positive }}>{summaryStats.admisPctF}%</td>
                  <td className="text-center px-3 py-2" style={{ color: COLORS.negative }}>{summaryStats.echoues.filles}</td>
                  <td className="text-center px-3 py-2" style={{ color: COLORS.negative }}>{summaryStats.echouePctF}%</td>
                </tr>
                <tr style={{ borderTop: `2px solid ${COLORS.line}` }}>
                  <td className="px-4 py-2 font-sans font-bold" style={{ color: COLORS.ink }}>{t("total")}</td>
                  <td className="text-center px-3 py-2 font-bold">{summaryStats.inscrits.total}</td>
                  <td className="text-center px-3 py-2 font-bold">{summaryStats.composes.total}</td>
                  <td className="text-center px-3 py-2 font-bold" style={{ color: COLORS.positive }}>{summaryStats.admis.total}</td>
                  <td className="text-center px-3 py-2 font-bold" style={{ color: COLORS.positive }}>{summaryStats.admisPctT}%</td>
                  <td className="text-center px-3 py-2 font-bold" style={{ color: COLORS.negative }}>{summaryStats.echoues.total}</td>
                  <td className="text-center px-3 py-2 font-bold" style={{ color: COLORS.negative }}>{summaryStats.echouePctT}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("subject_results")}</h2>
          <div className="rounded-2xl overflow-x-auto" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: COLORS.ink }}>
                  <th className="text-left px-4 py-2.5 font-semibold" style={{ color: "#fff" }}></th>
                  {subjectStats.map((s) => (
                    <th key={s.subject} className="text-center px-3 py-2.5 font-semibold whitespace-nowrap" style={{ color: "#fff" }}>{s.subject}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                <tr style={{ borderTop: `1px solid ${COLORS.line}` }}>
                  <td className="px-4 py-2.5 font-sans font-medium" style={{ color: COLORS.ink }}>{t("boys")}</td>
                  {subjectStats.map((s) => (
                    <td key={s.subject} className="text-center px-3 py-2.5">
                      <div className="text-[10px] font-normal" style={{ color: COLORS.inkSoft }}>{s.pg}/{s.g}</div>
                      <div className="font-bold text-base" style={{ color: COLORS.primary }}>{s.pctG}%</div>
                    </td>
                  ))}
                </tr>
                <tr style={{ borderTop: `1px solid ${COLORS.line}`, background: COLORS.paper }}>
                  <td className="px-4 py-2.5 font-sans font-medium" style={{ color: "#B23B32" }}>{t("girls")}</td>
                  {subjectStats.map((s) => (
                    <td key={s.subject} className="text-center px-3 py-2.5" style={{ color: "#B23B32" }}>
                      <div className="text-[10px] font-normal">{s.pf}/{s.f}</div>
                      <div className="font-bold text-base">{s.pctF}%</div>
                    </td>
                  ))}
                </tr>
                <tr style={{ borderTop: `2px solid ${COLORS.line}` }}>
                  <td className="px-4 py-2.5 font-sans font-bold" style={{ color: COLORS.ink }}>{t("total")}</td>
                  {subjectStats.map((s) => (
                    <td key={s.subject} className="text-center px-3 py-2.5">
                      <div className="text-[10px] font-normal" style={{ color: COLORS.inkSoft }}>{s.pt}/{s.total}</div>
                      <div className="font-bold text-base" style={{ color: COLORS.primary }}>{s.pctT}%</div>
                    </td>
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
function StaffPaymentsView({ staffProfiles, staffPayments, currency, readOnly, canDeactivate, onSave, onToggleActive, onToggleHidden }) {
  const { t } = useLang();
  const [month, setMonth] = useState(SCHOOL_MONTHS[0]);
  const [saving, setSaving] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [showHidden, setShowHidden] = useState(false);

  const fonctionLabel = (p) => {
    if (p.role === "fondateur") return t("role_fondateur_dir");
    if (p.role === "comptable") return t("fn_comptable");
    if (p.role === "enseignant") return `${t("fn_enseignant")}${p.class_name ? " · " + p.class_name : ""}`;
    return p.fonction || t("fn_personnel");
  };

  const hiddenCount = staffProfiles.filter((p) => p.hidden).length;
  const visibleProfiles = showHidden ? staffProfiles : staffProfiles.filter((p) => !p.hidden);

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

  const handleToggleHidden = async (userId, current) => {
    setTogglingId(userId);
    await onToggleHidden(userId, !current);
    setTogglingId(null);
  };

  const totals = visibleProfiles.reduce(
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
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("nav_staff")}</h1>
        {canDeactivate && hiddenCount > 0 && (
          <button onClick={() => setShowHidden((v) => !v)} className="text-xs font-medium px-3 py-2 rounded-lg" style={{ background: COLORS.paper, color: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
            {showHidden ? t("hide_hidden_profiles") : `${t("show_hidden")} (${hiddenCount})`}
          </button>
        )}
      </div>
      <p className="mb-5" style={{ color: COLORS.inkSoft }}>{t("staff_salary_subtitle")}</p>

      <div className="mb-5">
        <FieldLabel>{t("month_label")}</FieldLabel>
        <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full sm:w-56 px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
          {SCHOOL_MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {visibleProfiles.length === 0 ? (
        <EmptyState text={t("no_staff")} />
      ) : (
        <div className="rounded-2xl overflow-x-auto" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: COLORS.paper }}>
                <th className="text-left px-4 py-3 font-semibold whitespace-nowrap" style={{ color: COLORS.inkSoft }}>{t("name")}</th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap" style={{ color: COLORS.inkSoft }}>{t("function_col")}</th>
                <th className="text-center px-3 py-3 font-semibold whitespace-nowrap" style={{ color: COLORS.inkSoft }}>{t("month_balance")}</th>
                <th className="text-center px-3 py-3 font-semibold whitespace-nowrap" style={{ color: COLORS.inkSoft }}>{t("paid")}</th>
                <th className="text-center px-3 py-3 font-semibold whitespace-nowrap" style={{ color: COLORS.ink }}>{t("remaining")}</th>
                <th className="text-center px-3 py-3 font-semibold whitespace-nowrap" style={{ color: COLORS.ink }}>{t("status_col")}</th>
                {canDeactivate && <th className="text-center px-3 py-3 font-semibold whitespace-nowrap" style={{ color: COLORS.ink }}>{t("account_col")}</th>}
              </tr>
            </thead>
            <tbody>
              {visibleProfiles.map((p, i) => {
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
                        <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: COLORS.positiveSoft, color: COLORS.positive }}>✓ {t("approved")}</span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>{t("pending")}</span>
                      )}
                    </td>
                    {canDeactivate && (
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleToggleActive(p.user_id, isActive)}
                            disabled={togglingId === p.user_id}
                            className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
                            style={{ background: isActive ? COLORS.negativeSoft : COLORS.positiveSoft, color: isActive ? COLORS.negative : COLORS.positive }}
                          >
                            {togglingId === p.user_id && <Loader2 className="animate-spin" size={11} />}
                            {isActive ? t("deactivate") : t("reactivate")}
                          </button>
                          <button
                            onClick={() => handleToggleHidden(p.user_id, !!p.hidden)}
                            disabled={togglingId === p.user_id}
                            className="text-xs font-medium px-2.5 py-1 rounded-full"
                            style={{ background: COLORS.paper, color: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}
                          >
                            {p.hidden ? t("unhide") : t("hide")}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              <tr style={{ borderTop: `2px solid ${COLORS.line}`, background: COLORS.paper }}>
                <td className="px-4 py-2.5 font-bold" style={{ color: COLORS.ink }} colSpan={2}>{t("total")}</td>
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
  const { t } = useLang();
  const [approving, setApproving] = useState(null);
  const sorted = [...myPayments].sort((a, b) => SCHOOL_MONTHS.indexOf(a.month) - SCHOOL_MONTHS.indexOf(b.month));

  const handleApprove = async (id) => {
    setApproving(id);
    await onApprove(id);
    setApproving(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("my_salary_title")}</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>{t("my_salary_subtitle")}</p>

      {sorted.length === 0 ? (
        <div className="rounded-2xl p-10" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <EmptyState text={t("no_salary_yet")} />
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
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: COLORS.positiveSoft, color: COLORS.positive }}><Check size={12} /> {t("approved")}</span>
                  ) : (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>{t("pending_approval")}</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: COLORS.inkSoft }}>{t("month_balance")}</div>
                    <div className="font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{fmt(p.solde, currency)}</div>
                  </div>
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: COLORS.inkSoft }}>{t("paid")}</div>
                    <div className="font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.positive }}>{fmt(p.paye, currency)}</div>
                  </div>
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: COLORS.inkSoft }}>{t("remaining")}</div>
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
                    {t("approve_final")}
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
  const { t, lang } = useLang();
  const categoryLabel = (cat) => {
    const map = { "Salaires": t("cat_salaires"), "Factures": t("cat_factures"), "Fournitures": t("cat_fournitures"), "Crédits": t("cat_credits"), "Autres": t("cat_autres") };
    return map[cat] || cat;
  };
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
          <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("expenses_title")}</h1>
          <p style={{ color: COLORS.inkSoft }}>{t("expenses_subtitle")}</p>
        </div>
        {!readOnly && <AddButton onClick={onAdd} label={t("add")} />}
      </div>

      <div className="rounded-2xl p-5 mb-5" style={{ background: COLORS.ink }}>
        <div className="text-xs uppercase tracking-widest mb-1" style={{ color: "#fff", opacity: 0.6 }}>{t("total_expenses")}</div>
        <div className="text-3xl font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#fff" }}>{fmt(total, currency)}</div>
        {Object.keys(byCategory).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {Object.entries(byCategory).map(([cat, amt]) => (
              <span key={cat} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}>{categoryLabel(cat)}: {fmt(amt, currency)}</span>
            ))}
          </div>
        )}
      </div>

      {expenses.length === 0 ? (
        <div className="rounded-2xl p-10" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}><EmptyState text={t("no_expense")} /></div>
      ) : (
        <>
          {expenses.filter((e) => e.category === "Crédits").length > 0 && (
            <div className="space-y-3 mb-5">
              {expenses.filter((e) => e.category === "Crédits").map((e) => (
                <div key={e.id} className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold" style={{ color: COLORS.ink }}>{e.description || categoryLabel(e.category)}</div>
                      <div className="text-xs" style={{ color: COLORS.inkSoft }}>{new Date(e.date).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}</div>
                    </div>
                    {e.validated ? (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0" style={{ background: COLORS.positiveSoft, color: COLORS.positive }}><Check size={12} /> {t("validated")}</span>
                    ) : (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full shrink-0" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>{t("pending_credit")}</span>
                    )}
                  </div>
                  <div className="font-bold text-lg mb-3" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.negative }}>−{fmt(e.amount, currency)}</div>
                  {!e.validated && !readOnly && (
                    <button onClick={() => onValidate(e.id)} className="w-full py-2.5 rounded-lg font-semibold text-sm" style={{ background: COLORS.positive, color: "#fff" }}>
                      {t("validate_credit_btn")}
                    </button>
                  )}
                  {!e.validated && (
                    <button onClick={() => onDelete(e.id)} className="text-xs font-medium mt-2 flex items-center gap-1" style={{ color: COLORS.inkSoft }}>
                      <Trash2 size={13} /> {lang === "en" ? "Delete" : "Supprimer"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          {expenses.filter((e) => e.category !== "Crédits").length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              {expenses.filter((e) => e.category !== "Crédits").map((e, i) => (
                <div key={e.id} className="flex items-center justify-between px-5 py-4" style={{ borderTop: i === 0 ? "none" : `1px solid ${COLORS.line}` }}>
                  <div className="min-w-0">
                    <div className="font-medium truncate" style={{ color: COLORS.ink }}>{e.description || categoryLabel(e.category)}</div>
                    <div className="text-xs flex items-center gap-1.5" style={{ color: COLORS.inkSoft }}>
                      {categoryLabel(e.category)} · {new Date(e.date).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.negative }}>−{fmt(e.amount, currency)}</div>
                    <button onClick={() => onDelete(e.id)} style={{ color: COLORS.inkSoft }}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}


function LessonsTeacherView({ lessons, students, homework, readOnly, onAdd, onDelete, onToggle }) {
  const { t, lang } = useLang();
  const [expanded, setExpanded] = useState(null);
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("lessons_title")}</h1>
          <p style={{ color: COLORS.inkSoft }}>{t("lessons_subtitle_teacher")}</p>
        </div>
        {!readOnly && <AddButton onClick={onAdd} label={t("publish")} />}
      </div>
      {lessons.length === 0 ? (
        <div className="rounded-2xl p-10" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}><EmptyState text={t("no_lesson_published")} /></div>
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
                    <div className="text-xs" style={{ color: COLORS.inkSoft }}>{l.class_name}{l.due_date && ` · ${t("for_date")} ${new Date(l.due_date).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}`}</div>
                  </div>
                  {!readOnly && <button onClick={() => onDelete(l.id)} style={{ color: COLORS.inkSoft }}><Trash2 size={15} /></button>}
                </div>
                {l.description && <p className="text-sm mt-2 mb-3" style={{ color: COLORS.inkSoft }}>{l.description}</p>}
                {l.attachment_url && (
                  <a href={l.attachment_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg mb-3" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>
                    <FileText size={13} /> {l.attachment_name || t("view_file")}
                  </a>
                )}
                <button onClick={() => setExpanded(expanded === l.id ? null : l.id)} className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: COLORS.positiveSoft, color: COLORS.positive }}>
                  {doneCount}/{classStudents.length} {t("students_completed")}
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
  const { t, lang } = useLang();
  const childClasses = new Set(children.map((c) => c.class_name));
  const relevant = lessons.filter((l) => childClasses.has(l.class_name));
  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("lessons_title")}</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>{t("lessons_subtitle_parent")}</p>
      {relevant.length === 0 ? <EmptyState text={t("no_lesson_yet")} /> : (
        <div className="space-y-3">
          {relevant.map((l) => (
            <div key={l.id} className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div className="font-semibold mb-1" style={{ color: COLORS.ink }}>{l.title}</div>
              <div className="text-xs mb-2" style={{ color: COLORS.inkSoft }}>{l.class_name}{l.due_date && ` · ${t("for_date")} ${new Date(l.due_date).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}`}</div>
              {l.description && <p className="text-sm mb-3" style={{ color: COLORS.inkSoft }}>{l.description}</p>}
              {l.attachment_url && (
                <a href={l.attachment_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg mb-3" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>
                  <FileText size={13} /> {l.attachment_name || t("view_file")}
                </a>
              )}
              {children.filter((c) => c.class_name === l.class_name).map((c) => {
                const done = homework.find((h) => h.lesson_id === l.id && h.student_id === c.id)?.done;
                return (
                  <button key={c.id} onClick={() => onToggle(l.id, c.id)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm mt-1" style={{ background: done ? COLORS.positiveSoft : COLORS.paper, color: done ? COLORS.positive : COLORS.inkSoft }}>
                    <span>{c.full_name}</span>
                    <span className="flex items-center gap-1.5 font-medium">{done ? <><Check size={14} /> {t("done")}</> : t("mark_as_done")}</span>
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
  const { t, lang } = useLang();
  const [showAll, setShowAll] = useState(false);
  const records = attendance.filter((a) => a.student_id === student.id);
  if (records.length === 0) return null;
  const absences = records.filter((a) => !a.present).sort((a, b) => new Date(b.date) - new Date(a.date));
  const total = records.length;
  const presentCount = total - absences.length;
  const regularityPct = total > 0 ? ((presentCount / total) * 100).toFixed(0) : 100;
  const visibleAbsences = showAll ? absences : absences.slice(0, 5);

  return (
    <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${COLORS.line}` }}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.inkSoft }}>{t("attendance_summary")}</div>
        <span className="text-xs font-bold" style={{ color: regularityPct >= 90 ? COLORS.positive : COLORS.negative, fontFamily: "'IBM Plex Mono', monospace" }}>{regularityPct}{t("regularity_pct")}</span>
      </div>
      {absences.length === 0 ? (
        <div className="text-xs px-2.5 py-2 rounded-lg" style={{ background: COLORS.positiveSoft, color: COLORS.positive }}>{t("no_absence")}</div>
      ) : (
        <div className="space-y-1.5">
          {visibleAbsences.map((a) => (
            <div key={a.id} className="flex items-center justify-between text-xs px-2.5 py-2 rounded-lg" style={{ background: COLORS.negativeSoft }}>
              <span style={{ color: COLORS.negative }}>{t("absent_dash")} {a.session}</span>
              <span className="font-semibold" style={{ color: COLORS.negative }}>{new Date(a.date).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}</span>
            </div>
          ))}
          {absences.length > 5 && (
            <button onClick={() => setShowAll((v) => !v)} className="text-xs font-medium w-full text-center py-1.5" style={{ color: COLORS.primary }}>
              {showAll ? t("show_less") : `${t("show_all_absences")} (${absences.length})`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ChildGradesBlock({ student, grades }) {
  const { t } = useLang();
  const availableTerms = useMemo(
    () => ["Trimestre 1", "Trimestre 2", "Trimestre 3", "Annuel"].filter((tm) => grades.some((g) => g.class_name === student.class_name && g.term === tm)),
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
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.inkSoft }}>{t("report_card")}</div>
        <select value={activeTerm} onChange={(e) => setTerm(e.target.value)} className="text-xs px-2.5 py-1.5 rounded-lg outline-none" style={inputStyle}>
          {availableTerms.map((tm) => <option key={tm} value={tm}>{tm}</option>)}
        </select>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold" style={{ color: COLORS.primary, fontFamily: "'IBM Plex Mono', monospace" }}>{t("average_short")}: {avg !== null ? avg.toFixed(2) : "—"}</span>
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
  const { t } = useLang();
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
    else setError(t("no_student_found_phone"));
    setLoading(false);
  };

  return (
    <div className="rounded-2xl p-5 mb-6" style={{ background: COLORS.primarySoft, border: `1px solid ${COLORS.primary}33` }}>
      <div className="font-semibold mb-1" style={{ color: COLORS.primary }}>{t("account_paused_title")}</div>
      <p className="text-sm mb-3" style={{ color: COLORS.inkSoft }}>
        {t("account_paused_body")}
      </p>
      <div className="flex gap-2 flex-wrap">
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: 622 00 00 00" className="flex-1 min-w-[160px] px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
        <button onClick={submit} disabled={loading} className="px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2" style={{ background: COLORS.primary, color: "#fff" }}>
          {loading && <Loader2 className="animate-spin" size={14} />} {t("reactivate_my_account")}
        </button>
      </div>
      {error && <div className="text-sm mt-2" style={{ color: COLORS.negative }}>{error}</div>}
    </div>
  );
}

function ParentChildrenView({ children, paidByStudent, currency, payments, onRelink, grades, attendance, staffProfiles, viewYear, setViewYear, availableYears, currentYear }) {
  const { t, lang } = useLang();
  const [relinking, setRelinking] = useState(false);
  const [message, setMessage] = useState("");

  const relink = async () => {
    setRelinking(true);
    setMessage("");
    const count = await onRelink();
    setMessage(count > 0 ? `${count} ${t("children_linked")}` : t("no_new_child_found"));
    setRelinking(false);
  };

  return (
    <div>
      <div className="flex items-start justify-between flex-wrap gap-3 mb-1">
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("my_children_title")}</h1>
        <button onClick={relink} disabled={relinking} className="text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>
          {relinking && <Loader2 className="animate-spin" size={12} />} {t("find_my_children")}
        </button>
      </div>
      <p className="mb-3" style={{ color: COLORS.inkSoft }}>{t("academic_financial_tracking")}</p>
      {availableYears && availableYears.length > 1 && (
        <div className="mb-4">
          <FieldLabel>{t("school_year_label")}</FieldLabel>
          <select value={viewYear} onChange={(e) => setViewYear(e.target.value)} className="w-full sm:w-56 px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle}>
            {availableYears.map((y) => <option key={y} value={y}>{y} {y === currentYear ? t("current_year_tag") : t("archive_tag")}</option>)}
          </select>
        </div>
      )}
      {message && <p className="text-sm mb-4" style={{ color: COLORS.positive }}>{message}</p>}
      {children.length === 0 ? (
        <div className="rounded-2xl p-10" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <EmptyState text={t("no_child_linked")} />
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
                <div className="flex justify-between text-sm"><span style={{ color: COLORS.inkSoft }}>{t("paid")}</span><span style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.positive }}>{fmt(paid, currency)}</span></div>
                <div className="flex justify-between text-sm mt-1"><span style={{ color: COLORS.inkSoft }}>{t("remaining_short")}</span><span style={{ fontFamily: "'IBM Plex Mono', monospace", color: reste > 0 ? COLORS.negative : COLORS.positive }}>{fmt(reste, currency)}</span></div>

                <ChildGradesBlock student={c} grades={grades} />
                <AttendanceSummary student={c} attendance={attendance} />

                {childPayments.length > 0 && (
                  <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${COLORS.line}` }}>
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                      <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.inkSoft }}>{t("payment_receipts")}</div>
                      {teacher && (
                        <div className="text-xs" style={{ color: COLORS.inkSoft }}>
                          {t("teacher_label")}: <span style={{ color: COLORS.ink }}>{teacher.full_name}</span>
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
                            {new Date(p.date).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}
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
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const copyNumber = () => {
    if (!comptable?.phone) return;
    navigator.clipboard?.writeText(comptable.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("pay_remotely_title")}</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>{t("pay_remotely_subtitle")}</p>

      {!comptable || !comptable.phone ? (
        <div className="rounded-2xl p-10" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <EmptyState text={t("accountant_no_phone")} />
        </div>
      ) : (
        <div className="rounded-2xl p-5" style={{ background: COLORS.primarySoft }}>
          <div className="flex items-center gap-2 mb-3">
            <Smartphone size={18} style={{ color: COLORS.primary }} />
            <span className="font-semibold" style={{ color: COLORS.primary }}>{t("accountant_number")} {comptable.full_name}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-lg mb-3" style={{ background: "#fff" }}>
            <span className="font-bold text-lg" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{comptable.phone}</span>
            <span className="text-xs font-medium flex items-center gap-1" style={{ color: COLORS.primary }} onClick={copyNumber}><Copy size={13} /> {copied ? t("copied") : t("copy")}</span>
          </div>
          <a href={`tel:${comptable.phone}`} className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2" style={{ background: COLORS.ink, color: "#fff" }}>
            {t("call_accountant")}
          </a>
          <p className="text-xs mt-3" style={{ color: COLORS.inkSoft }}>
            {t("pay_remotely_instructions")}
          </p>
        </div>
      )}
    </div>
  );
}

function ParentRemarksView({ remarks, onAdd }) {
  const { t, lang } = useLang();
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
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("my_remarks_title")}</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>{t("my_remarks_subtitle")}</p>

      <div className="rounded-2xl p-5 mb-6" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <FieldLabel>{t("your_remark")}</FieldLabel>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder={t("remark_placeholder")} className="w-full px-3 py-2.5 rounded-lg outline-none mb-3" style={inputStyle} />
        {error && <div className="text-sm mb-3" style={{ color: COLORS.negative }}>{error}</div>}
        <button onClick={submit} disabled={sending} className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2" style={{ background: COLORS.primary, color: "#fff" }}>
          {sending && <Loader2 className="animate-spin" size={16} />}
          {t("send_to_director")}
        </button>
      </div>

      {remarks.length > 0 && (
        <>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: COLORS.inkSoft }}>{t("my_sent_remarks")}</h2>
          <div className="space-y-3">
            {remarks.map((r) => (
              <div key={r.id} className="rounded-2xl p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                <div className="text-xs mb-1.5" style={{ color: COLORS.inkSoft }}>{new Date(r.created_at).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}</div>
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
function ParentsManagementView({ parents, students, onToggleActive, onToggleHidden }) {
  const { t } = useLang();
  const [togglingId, setTogglingId] = useState(null);
  const [showHidden, setShowHidden] = useState(false);

  const childrenOf = (parentId) => students.filter((s) => s.parent_id === parentId).map((s) => s.full_name);

  const handleToggle = async (userId, current) => {
    setTogglingId(userId);
    await onToggleActive(userId, !current);
    setTogglingId(null);
  };

  const handleToggleHidden = async (userId, current) => {
    setTogglingId(userId);
    await onToggleHidden(userId, !current);
    setTogglingId(null);
  };

  const hiddenCount = parents.filter((p) => p.hidden).length;
  const visibleParents = showHidden ? parents : parents.filter((p) => !p.hidden);

  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("parents_title")}</h1>
        {hiddenCount > 0 && (
          <button onClick={() => setShowHidden((v) => !v)} className="text-xs font-medium px-3 py-2 rounded-lg" style={{ background: COLORS.paper, color: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
            {showHidden ? t("hide_hidden_profiles") : `${t("show_hidden")} (${hiddenCount})`}
          </button>
        )}
      </div>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>{t("parents_subtitle")}</p>

      {visibleParents.length === 0 ? (
        <EmptyState text={t("no_parent")} />
      ) : (
        <div className="space-y-2">
          {visibleParents.map((p) => {
            const isActive = p.active !== false;
            const kids = childrenOf(p.user_id);
            return (
              <div key={p.user_id} className="flex items-center justify-between px-4 py-3 rounded-xl flex-wrap gap-2" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}`, opacity: isActive ? 1 : 0.6 }}>
                <div className="min-w-0">
                  <div className="font-medium" style={{ color: COLORS.ink }}>{p.full_name}</div>
                  <div className="text-xs" style={{ color: COLORS.inkSoft }}>{p.phone || t("phone_not_set")}{kids.length > 0 && ` · ${kids.join(", ")}`}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleToggle(p.user_id, isActive)}
                    disabled={togglingId === p.user_id}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1"
                    style={{ background: isActive ? COLORS.negativeSoft : COLORS.positiveSoft, color: isActive ? COLORS.negative : COLORS.positive }}
                  >
                    {togglingId === p.user_id && <Loader2 className="animate-spin" size={11} />}
                    {isActive ? t("deactivate") : t("reactivate")}
                  </button>
                  <button
                    onClick={() => handleToggleHidden(p.user_id, !!p.hidden)}
                    disabled={togglingId === p.user_id}
                    className="text-xs font-medium px-3 py-1.5 rounded-full"
                    style={{ background: COLORS.paper, color: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}
                  >
                    {p.hidden ? t("unhide") : t("hide")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FondateurRemarksView({ remarks, parents, onDelete }) {
  const { t, lang } = useLang();
  const parentInfo = (id) => parents.find((p) => p.user_id === id);

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("parent_remarks_title")}</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>{t("parent_remarks_subtitle")}</p>

      {remarks.length === 0 ? (
        <div className="rounded-2xl p-10" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}><EmptyState text={t("no_remark_received")} /></div>
      ) : (
        <div className="space-y-3">
          {remarks.map((r) => {
            const parent = parentInfo(r.parent_id);
            return (
              <div key={r.id} className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold" style={{ color: COLORS.ink }}>{parent?.full_name || t("parent_word")}</div>
                    <div className="text-xs" style={{ color: COLORS.inkSoft }}>
                      {parent?.phone || t("phone_not_set")} · {new Date(r.created_at).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}
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
function AttendanceView({ students, attendance, readOnly, lockedClass, myClasses, isSecondaire, onSave }) {
  const { t } = useLang();
  const allClassNames = useMemo(() => [...new Set(students.map((s) => s.class_name))].sort(), [students]);
  const selectableClasses = myClasses ? myClasses.filter((c) => allClassNames.includes(c)) : allClassNames;
  const [className, setClassName] = useState(lockedClass || selectableClasses[0] || "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const SESSIONS = isSecondaire
    ? [["8h-10h", "8h00", t("session_8_10")], ["10h-12h", "10h00", t("session_10_12")], ["12h-14h", "12h00", t("session_12_14")]]
    : [["Matin", "8h00", t("morning")], ["Après-midi", "14h00", t("afternoon")]];
  const [session, setSession] = useState(SESSIONS[0][0]);
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
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("attendance_title")}</h1>
      <p className="mb-5" style={{ color: COLORS.inkSoft }}>{t("attendance_subtitle")}</p>

      <div className="flex flex-wrap gap-4 mb-5">
        <div>
          <FieldLabel>{myClasses ? t("choose_your_class") : t("class_label")}</FieldLabel>
          {lockedClass ? (
            <div className="px-3 py-2.5 rounded-lg text-sm font-medium" style={{ ...inputStyle, opacity: 0.7 }}>{lockedClass}</div>
          ) : selectableClasses.length === 0 ? (
            <div className="px-3 py-2.5 rounded-lg text-sm" style={{ ...inputStyle, opacity: 0.7 }}>{t("no_class_assigned")}</div>
          ) : (
            <select value={className} onChange={(e) => setClassName(e.target.value)} className="w-full sm:w-56 px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
              {selectableClasses.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>
        <div>
          <FieldLabel>{t("date_label")}</FieldLabel>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
        </div>
        <div>
          <FieldLabel>{t("control_label")}</FieldLabel>
          <div className="flex gap-2 flex-wrap">
            {SESSIONS.map(([s, time, label]) => (
              <button key={s} onClick={() => setSession(s)} className="px-3 py-2.5 rounded-lg text-sm font-medium" style={{ background: session === s ? COLORS.ink : "#fff", color: session === s ? "#fff" : COLORS.inkSoft, border: `1px solid ${session === s ? COLORS.ink : COLORS.line}` }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-5">
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: COLORS.positiveSoft, color: COLORS.positive }}>{presentCount} {presentCount > 1 ? t("present_count_pl") : t("present_count")}</span>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: COLORS.negativeSoft, color: COLORS.negative }}>{absentCount} {absentCount > 1 ? t("absent_count_pl") : t("absent_count")}</span>
      </div>

      {classStudents.length === 0 ? (
        <EmptyState text={t("no_student_in_class")} />
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
                      {status.present ? t("present") : t("absent")}
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
                      {t("present")}
                    </button>
                    <button
                      onClick={() => toggle(s.id, false)}
                      disabled={saving === s.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: status?.present === false ? COLORS.negative : COLORS.negativeSoft, color: status?.present === false ? "#fff" : COLORS.negative }}
                    >
                      {t("absent")}
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
  const { t, lang } = useLang();
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("announcements_title")}</h1>
          <p style={{ color: COLORS.inkSoft }}>{t("announcements_subtitle")}</p>
        </div>
        {canWrite && <AddButton onClick={onAdd} label={t("publish")} />}
      </div>
      {announcements.length === 0 ? (
        <div className="rounded-2xl p-10" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}><EmptyState text={t("no_announcement")} /></div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold" style={{ color: COLORS.ink }}>{a.title}</div>
                  <div className="text-xs mb-2" style={{ color: COLORS.inkSoft }}>{new Date(a.created_at).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}</div>
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
function StudentModal({ levels, student, existingClassNames, onClose, onSave, onUpdate }) {
  const { t } = useLang();
  const isEdit = !!student;
  const [fullName, setFullName] = useState(student?.full_name || "");
  const [level, setLevel] = useState(student?.level || levels[0]);
  const [className, setClassName] = useState(student?.class_name || "");
  const classOptions = getClassOptions(level);
  useEffect(() => {
    if (!student && classOptions.length > 0 && !classOptions.includes(className)) setClassName(classOptions[0]);
  }, [level]);
  const [totalDue, setTotalDue] = useState(student ? String(student.total_due ?? "") : "");
  const [parentPhone, setParentPhone] = useState(student?.parent_phone || "");
  const [gender, setGender] = useState(student?.gender || "Garçon");
  const submit = async () => {
    if (!fullName.trim() || !className.trim()) return;
    const payload = { full_name: fullName.trim(), level, class_name: className.trim(), total_due: parseFloat(totalDue) || 0, parent_phone: parentPhone.trim() || null, gender };
    if (isEdit) await onUpdate(student.id, payload);
    else await onSave(payload);
    onClose();
  };
  return (
    <Modal title={isEdit ? t("edit_student") : t("new_student")} onClose={onClose}>
      <div className="space-y-4">
        <div><FieldLabel>{t("full_name_label")}</FieldLabel><input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        <div>
          <FieldLabel>{t("gender_label")}</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            {[["Garçon", t("gender_boy")], ["Fille", t("gender_girl")]].map(([g, label]) => (
              <button key={g} onClick={() => setGender(g)} className="px-3 py-2 rounded-lg text-sm font-medium" style={{ background: gender === g ? COLORS.ink : "#fff", color: gender === g ? "#fff" : COLORS.inkSoft, border: `1px solid ${gender === g ? COLORS.ink : COLORS.line}` }}>{label}</button>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel>{t("level_label")}</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            {levels.map((lvl) => (
              <button key={lvl} onClick={() => setLevel(lvl)} className="px-3 py-2 rounded-lg text-sm font-medium" style={{ background: level === lvl ? COLORS.ink : "#fff", color: level === lvl ? "#fff" : COLORS.inkSoft, border: `1px solid ${level === lvl ? COLORS.ink : COLORS.line}` }}>{lvl}</button>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel>{t("class_label")}</FieldLabel>
          <select value={className} onChange={(e) => setClassName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
            {classOptions.length === 0 && <option value="">—</option>}
            {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div><FieldLabel>{t("total_due_label")}</FieldLabel><input type="number" value={totalDue} onChange={(e) => setTotalDue(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        <div>
          <FieldLabel>{t("parent_phone_optional")}</FieldLabel>
          <input type="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="Ex: 622 00 00 00" className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
          <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>{t("parent_phone_hint2")}</p>
        </div>
        <button onClick={submit} className="w-full py-3 rounded-lg font-semibold mt-2" style={{ background: COLORS.ink, color: "#fff" }}>{isEdit ? t("save") : t("add_student_btn")}</button>
      </div>
    </Modal>
  );
}

function UpgradeModal({ onClose }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const copyNumber = () => {
    navigator.clipboard?.writeText(ORANGE_MONEY_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Modal title={t("trial_ended_title")} onClose={onClose}>
      <div className="space-y-5">
        <p className="text-sm" style={{ color: COLORS.inkSoft }}>
          {t("trial_ended_body")}
        </p>
        <div className="space-y-2.5">
          {PRICING_TIERS.map((tier) => (
            <div key={tier.name} className="rounded-xl p-4 flex items-center justify-between" style={{ border: `1px solid ${COLORS.line}` }}>
              <div>
                <div className="font-semibold" style={{ color: COLORS.ink }}>{tier.name}</div>
                <div className="text-xs" style={{ color: COLORS.inkSoft }}>{tier.desc}</div>
              </div>
              <div className="text-right">
                <div className="font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.primary }}>{fmt(tier.price, "GNF")}</div>
                <div className="text-xs" style={{ color: COLORS.inkSoft }}>{tier.yearly ? t("per_year") : t("per_month")}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4" style={{ background: COLORS.primarySoft }}>
          <div className="flex items-center gap-2 mb-2">
            <Smartphone size={16} style={{ color: COLORS.primary }} />
            <span className="text-sm font-semibold" style={{ color: COLORS.primary }}>{t("orange_money_payment")}</span>
          </div>
          <p className="text-xs mb-3" style={{ color: COLORS.inkSoft }}>
            {t("orange_money_instructions")}
          </p>
          <button onClick={copyNumber} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: "#fff" }}>
            <span className="font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{ORANGE_MONEY_NUMBER}</span>
            <span className="text-xs font-medium flex items-center gap-1" style={{ color: COLORS.primary }}><Copy size={13} /> {copied ? t("copied") : t("copy")}</span>
          </button>
        </div>
        <button onClick={onClose} className="w-full py-3 rounded-lg font-semibold" style={{ background: COLORS.ink, color: "#fff" }}>{t("close")}</button>
      </div>
    </Modal>
  );
}

function ExpenseModal({ onClose, onSave }) {
  const { t } = useLang();
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");

  const categoryLabel = (cat) => {
    const map = { "Salaires": t("cat_salaires"), "Factures": t("cat_factures"), "Fournitures": t("cat_fournitures"), "Crédits": t("cat_credits"), "Autres": t("cat_autres") };
    return map[cat] || cat;
  };

  const submit = async () => {
    setError("");
    if (!amount || isNaN(parseFloat(amount))) { setError(t("valid_amount")); return; }
    const err = await onSave({ category, description: description.trim(), amount: parseFloat(amount), date });
    if (err) { setError("Erreur : " + err.message); return; }
    onClose();
  };

  return (
    <Modal title={t("new_expense")} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <FieldLabel>{t("category_label")}</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            {EXPENSE_CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)} className="px-3 py-2 rounded-lg text-sm font-medium" style={{ background: category === c ? COLORS.ink : "#fff", color: category === c ? "#fff" : COLORS.inkSoft, border: `1px solid ${category === c ? COLORS.ink : COLORS.line}` }}>{categoryLabel(c)}</button>
            ))}
          </div>
        </div>
        <div><FieldLabel>{t("description_label")}</FieldLabel><input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Salaire M. Diallo — juillet" className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        <div><FieldLabel>{t("amount_label")}</FieldLabel><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        <div><FieldLabel>{t("date_label")}</FieldLabel><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        {error && <div className="text-sm" style={{ color: COLORS.negative }}>{error}</div>}
        <button onClick={submit} className="w-full py-3 rounded-lg font-semibold mt-2" style={{ background: COLORS.ink, color: "#fff" }}>{t("save")}</button>
      </div>
    </Modal>
  );
}

function LinkParentModal({ student, parents, onClose, onSave }) {
  const { t } = useLang();
  const [parentId, setParentId] = useState(student.parent_id || "");
  return (
    <Modal title={`${t("link_parent_title")} ${student.full_name}`} onClose={onClose}>
      <div className="space-y-4">
        {parents.length === 0 ? (
          <p className="text-sm" style={{ color: COLORS.inkSoft }}>{t("no_parent_yet")}</p>
        ) : (
          <div>
            <FieldLabel>{t("choose_parent")}</FieldLabel>
            <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
              <option value="">{t("none_option")}</option>
              {parents.map((p) => <option key={p.user_id} value={p.user_id}>{p.full_name}{p.phone ? ` · ${p.phone}` : ""}</option>)}
            </select>
          </div>
        )}
        <button onClick={() => onSave(parentId)} className="w-full py-3 rounded-lg font-semibold mt-2" style={{ background: COLORS.ink, color: "#fff" }}>{t("save_link")}</button>
      </div>
    </Modal>
  );
}
function PaymentModal({ students, currency, onClose, onSave }) {
  const { t } = useLang();
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
    <Modal title={t("record_payment")} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <FieldLabel>{t("step1_choose_class")}</FieldLabel>
          <select value={className} onChange={(e) => onClassChange(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
            {classNames.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <FieldLabel>{t("step2_choose_student")} ({studentsInClass.length})</FieldLabel>
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
            {studentsInClass.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </select>
        </div>
        <div><FieldLabel>{t("amount_currency")} ({currency})</FieldLabel><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        <div><FieldLabel>{t("date_label")}</FieldLabel><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        <button onClick={submit} className="w-full py-3 rounded-lg font-semibold mt-2" style={{ background: COLORS.ink, color: "#fff" }}>{t("save")}</button>
      </div>
    </Modal>
  );
}
// ---------- Mon profil (tous les rôles) ----------
function MyProfileModal({ profile, onClose, onSave }) {
  const { t } = useLang();
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
    <Modal title={t("my_profile")} onClose={onClose}>
      <div className="space-y-4">
        <div><FieldLabel>{t("full_name_label")}</FieldLabel><input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        <div>
          <FieldLabel>{t("your_phone")}</FieldLabel>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: 622 00 00 00" className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
          {(profile.role === "comptable" || profile.role === "enseignant") && (
            <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>{t("visible_to_parents_contact")}</p>
          )}
        </div>
        {error && <div className="text-sm" style={{ color: COLORS.negative }}>{error}</div>}
        {saved && <div className="text-sm" style={{ color: COLORS.positive }}>{t("saved_confirm")}</div>}
        <button onClick={submit} disabled={saving} className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2" style={{ background: COLORS.ink, color: "#fff" }}>
          {saving && <Loader2 className="animate-spin" size={16} />} {t("save")}
        </button>
      </div>
    </Modal>
  );
}

function LessonModal({ lockedClass, onClose, onSave }) {
  const { t } = useLang();
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
    if (!className.trim() || !title.trim()) { setError(t("fill_class_title")); return; }
    let attachment_url = null;
    let attachment_name = null;
    if (mode === "photo" && file) {
      setUploading(true);
      const path = `${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("homework-attachments").upload(path, file);
      setUploading(false);
      if (upErr) { setError(`${t("upload_failed")} ${upErr.message}`); return; }
      const { data } = supabase.storage.from("homework-attachments").getPublicUrl(path);
      attachment_url = data.publicUrl;
      attachment_name = file.name;
    }
    await onSave({ class_name: className.trim(), title: title.trim(), description, due_date: dueDate || null, attachment_url, attachment_name });
    onClose();
  };

  return (
    <Modal title={t("publish_homework_title")} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex gap-2">
          {[["texte", t("write_homework")], ["photo", t("send_photo_file")]].map(([key, label]) => (
            <button key={key} onClick={() => setMode(key)} className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ background: mode === key ? COLORS.ink : "#fff", color: mode === key ? "#fff" : COLORS.inkSoft, border: `1px solid ${mode === key ? COLORS.ink : COLORS.line}` }}>
              {label}
            </button>
          ))}
        </div>
        <div><FieldLabel>{t("class_label")}</FieldLabel><input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Ex: CM2" disabled={!!lockedClass} className="w-full px-3 py-2.5 rounded-lg outline-none" style={{ ...inputStyle, opacity: lockedClass ? 0.7 : 1 }} /></div>
        <div><FieldLabel>{t("homework_title_label")}</FieldLabel><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("homework_title_placeholder")} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        {mode === "texte" ? (
          <div><FieldLabel>{t("homework_description")}</FieldLabel><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        ) : (
          <div>
            <FieldLabel>{t("photo_file_from_phone")}</FieldLabel>
            <input type="file" accept="image/*,.pdf" capture="environment" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
            <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>{t("photo_file_hint")}</p>
          </div>
        )}
        <div><FieldLabel>{t("due_optional")}</FieldLabel><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        {error && <div className="text-sm" style={{ color: COLORS.negative }}>{error}</div>}
        <button onClick={submit} disabled={uploading} className="w-full py-3 rounded-lg font-semibold mt-2 flex items-center justify-center gap-2" style={{ background: COLORS.ink, color: "#fff" }}>
          {uploading && <Loader2 className="animate-spin" size={16} />}
          {t("publish")}
        </button>
      </div>
    </Modal>
  );
}
function AnnouncementModal({ onClose, onSave }) {
  const { t } = useLang();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const submit = async () => { if (!title.trim() || !message.trim()) return; await onSave({ title: title.trim(), message: message.trim() }); onClose(); };
  return (
    <Modal title={t("new_announcement_title")} onClose={onClose}>
      <div className="space-y-4">
        <div><FieldLabel>{t("title_label")}</FieldLabel><input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        <div><FieldLabel>{t("message_label")}</FieldLabel><textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        <button onClick={submit} className="w-full py-3 rounded-lg font-semibold mt-2" style={{ background: COLORS.primary, color: "#fff" }}>{t("publish_to_parents_btn")}</button>
      </div>
    </Modal>
  );
}
