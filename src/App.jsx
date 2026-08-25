import React, { useState, useEffect, useMemo, useCallback, useRef, createContext, useContext } from "react";
import {
  LayoutDashboard, Users, FileText, Megaphone, GraduationCap,
  Plus, Trash2, X, Loader2, LogOut, Check, Clock, Copy,
  Wallet, TrendingUp, AlertTriangle, BookOpen, FileSpreadsheet, Smartphone, TrendingDown, Receipt, Shield, ClipboardList, ArrowDownWideNarrow, MessageSquare, Menu, CalendarCheck, Languages, Share2, Banknote, Contact, BookMarked, QrCode, Eye, EyeOff, Sparkles, Package, Coins, Download, Printer, ArrowLeft, ArrowRight, Star, ArrowRightLeft, CreditCard, Image as ImageIcon, Camera, ChevronDown,
} from "lucide-react";
import { supabase } from "./lib/supabase";
import PresencePersonnel from "./PresencePersonnel";

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
    nav_class_assign: "Classes des enseignants",
    nav_lesson_ai: "Assistant IA",
    lesson_ai_subtitle: "Donne le titre de ta leçon, le manuel et la page — l'IA prépare le plan de cours et des questions de consolidation.",
    lesson_title_label: "Titre de la leçon",
    lesson_title_placeholder: "Ex: La photosynthèse",
    lesson_title_required: "Le titre de la leçon est requis.",
    textbook_label: "Manuel / livre",
    textbook_placeholder: "Ex: Sciences naturelles 5e année",
    page_label: "Page",
    ai_generate_button: "Générer le plan de leçon",
    ai_generating: "Génération en cours…",
    ai_generic_error: "Une erreur est survenue. Réessaie dans un instant.",
    objectives_title: "Objectifs",
    materials_title: "Matériel nécessaire",
    lesson_flow_title: "Déroulement du cours",
    consolidation_questions_title: "Questions de consolidation",
    reveal_answer: "Voir la réponse",
    ai_tab_planifier: "Planifier",
    ai_history_group_label: "Historique",
    ai_tab_historique: "Historique",
    ai_tab_sujet: "Composer un sujet",
    ai_tab_sujet_historique: "Historique des sujets",
    ai_tab_fiches_revision: "Fiches de révision",
    no_revision_sheet_history: "Aucune fiche de révision générée pour l'instant.",
    ai_tab_exercice: "Aide sur un exercice",
    exercise_upload_label: "Photo ou PDF de l'exercice",
    exercise_pick_file: "Prendre une photo ou choisir un fichier",
    exercise_pick_hint: "Image (JPEG/PNG) ou PDF, une page à la fois de préférence",
    exercise_remove_file: "Retirer le fichier",
    exercise_instructions_label: "Précisions (optionnel)",
    exercise_instructions_placeholder: "Ex: seulement la question 3, ou explique en détail pour un débutant",
    exercise_analyze_button: "Analyser l'exercice",
    exercise_bad_format: "Format non supporté. Utilise une photo (JPEG/PNG) ou un PDF.",
    exercise_too_large: "Fichier trop volumineux. Essaie une photo plus légère ou une seule page.",
    exercise_file_required: "Ajoute d'abord une photo ou un fichier.",
    exercise_identified_title: "Énoncé identifié",
    exercise_analysis_title: "Analyse",
    exercise_steps_title: "Traitement étape par étape",
    exercise_final_answer_title: "Réponse finale",
    exercise_tip_title: "Conseil pédagogique",
    generate_revision_sheet_button: "Générer une fiche de révision pour les élèves",
    revision_sheet_title: "Fiche de révision (brouillon)",
    status_draft: "Brouillon",
    status_published: "Publiée",
    publish_to_students: "Publier aux élèves",
    unpublish: "Dépublier",
    discard_sheet: "Supprimer le brouillon",
    nav_revision: "Réviser",
    revision_parent_subtitle: "Fiches de révision publiées par les enseignants de vos enfants.",
    no_revision_sheets_yet: "Aucune fiche de révision publiée pour l'instant.",
    no_exam_history: "Aucun sujet généré pour l'instant.",
    competence_specifique_label: "Compétence spécifique",
    competence_specifique_placeholder: "Ex: Localiser et décrire les ressources naturelles de la Guinée",
    competence_specifique_hint: "Selon ta brochure-programme — les objectifs générés seront alignés dessus.",
    no_lesson_history: "Aucune leçon générée pour l'instant.",
    delete_from_history: "Supprimer de l'historique",
    pick_from_history: "Choisir depuis l'historique",
    lesson_titles_label: "Titres des leçons couvertes",
    lesson_titles_placeholder: "Un titre de leçon par ligne",
    lesson_titles_hint: "Coche des leçons ci-dessus ou tape-les toi-même, une par ligne.",
    lesson_titles_required: "Ajoute au moins un titre de leçon.",
    question_type_label: "Type de questions",
    question_type_mixte: "Mélange (choix + réponse construite)",
    question_type_qcm: "Choix multiple uniquement",
    question_type_construite: "Réponse construite uniquement",
    nb_questions_label: "Nombre de questions",
    ai_generate_exam_button: "Générer le sujet",
    nav_lessons: "Devoirs",
    nav_expenses: "Dépenses",
    nav_staff: "Personnel",
    nav_parents: "Parents",
    nav_my_salary: "Mon salaire",
    nav_remarks: "Remarques parents",
    reply_individually_button: "Répondre individuellement",
    edit_reply_button: "Modifier la réponse",
    reply_placeholder: "Ta réponse à ce parent...",
    your_reply_label: "Ta réponse",
    director_reply_label: "Réponse du directeur",
    awaiting_reply_label: "En attente de réponse.",
    send: "Envoyer",
    nav_my_remarks: "Mes remarques",
    nav_my_children: "Mes enfants",
    nav_my_assignments: "Mes matières",
    nav_pay_remotely: "Payer sans se déplacer",
    nav_stats: "Statistiques",
    nav_admin: "Administration",
    nav_feedback: "Avis des utilisateurs",
    give_feedback_menu: "Donner mon avis",
    feedback_subtitle: "Vos remarques nous aident à améliorer l'application — elles ne sont visibles que par l'équipe.",
    feedback_rating_label: "Note",
    feedback_message_label: "Votre message (optionnel)",
    feedback_message_placeholder: "Ce que vous aimez, ce qui vous gêne, une idée...",
    feedback_send_button: "Envoyer",
    feedback_empty_error: "Ajoute au moins une note ou un message.",
    feedback_thanks: "Merci pour votre avis !",
    feedback_admin_subtitle: "Tous les avis envoyés par les utilisateurs, toutes écoles confondues.",
    feedback_count_label: "avis",
    feedback_filter_all: "Toutes les notes",
    feedback_filter_low: "2 étoiles ou moins",
    feedback_filter_mid: "3 étoiles ou moins",
    no_feedback_yet: "Aucun avis reçu pour l'instant.",
    feedback_anonymous: "Anonyme",
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
    send_link: "Envoyer le lien",
    onboarding_title: "Configure ton compte",
    onboarding_subtitle: "Dernière étape avant d'accéder à l'application.",
    back: "← Retour",
    your_full_name: "Ton nom complet",
    your_role: "Ton rôle",
    role_fondateur: "Fondateur (propriétaire)",
    role_directeur: "Directeur",
    role_comptable: "Comptable",
    role_enseignant: "Enseignant",
    role_parent: "Parent",
    role_personnel: "Personnel (autre)",
    your_class: "Ta classe",
    your_class_hint: "Utilise exactement le même nom que le comptable pour cette classe.",
    class_assigned_by_founder: "Ta classe sera assignée par le fondateur/directeur après ton inscription. Tu recevras accès dès qu'elle te sera attribuée.",
    my_class_label: "Ma classe",
    unassigned_class: "Classe non assignée",
    assign_class_title: "Assigner la classe d'un enseignant (primaire)",
    assign_class_subtitle: "Choisis la classe de chaque enseignant. Tu peux la changer à tout moment (ex: le faire monter à la classe supérieure).",
    no_class_assigned_yet: "Aucune classe assignée",
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
    year_status_active: "année en cours",
    year_status_archive: "archive",
    year_status_upcoming: "à venir — consultation seule",
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
    export_all_classes: "Exporter toutes les classes",
    share_button: "Partager",
    share_all_classes: "Partager toutes les classes",
    publish_all_classes: "Publier tout",
    all_published_success: "Tous les résultats ont été publiés aux parents.",
    student: "Élève",
    payment: "Paiement",
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
    order_number: "N°",
    appreciation_col: "Appréciation",
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
    subject_results: "Tableau analytique des résultats (% ayant la moyenne)",
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
    general_average: "Moyenne générale",
    enter_view: "Saisir",
    bulletin_view: "Bulletin & classement",
    grades_sec_subtitle_entry: "Saisis les notes écrites et orales, mois par mois.",
    grades_sec_subtitle_bulletin: "Classement pondéré de la classe, matière par matière.",
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
    valid_amount: "Renseigne un montant valide.",
    save: "Enregistrer",
    cat_salaires: "Salaires",
    from_staff_screen: "depuis Personnel",
    cat_factures: "Factures",
    cat_fournitures: "Fournitures",
    cat_credits: "Crédits",
    cat_autres: "Autres",
    role_fondateur_dir: "Fondateur / Directeur",
    fn_comptable: "Comptable",
    fn_enseignant: "Enseignant",
    fn_personnel: "Personnel",
    hide_hidden_profiles: "Masquer les profils cachés",
    hide_school: "Masquer cette école",
    unhide_school: "Réafficher cette école",
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
    per_year_short: "/an",
    per_month_short: "/mois",
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
    close_button: "Fermer",
    back_button: "Retour",
    bulletin_button: "Bulletin",
    view_bulletin_button: "Voir le bulletin",
    print_pdf_button: "Imprimer / PDF",
    download_pdf_button: "Télécharger (PDF)",
    print_button_only: "Imprimer",
    download_hint: "Choisis \"Enregistrer en PDF\" dans la fenêtre qui s'ouvre pour l'enregistrer sur ton téléphone, ou choisis une imprimante pour imprimer directement.",
    download_hint_v2: "\"Télécharger (PDF)\" enregistre directement le fichier dans ton téléphone. \"Imprimer\" ouvre l'imprimante de ton téléphone.",
    pdf_download_failed: "Le téléchargement PDF a échoué — vérifie ta connexion et réessaie, ou utilise \"Imprimer\" à la place.",
    bulletin_title: "Bulletin de Notes",
    republic_header: "République de Guinée",
    grade_detail_col: "Note(s)",
    overall_average_label: "Moyenne générale",
    mention_label: "Mention",
    appreciation_label: "Appréciation",
    appreciation_placeholder: "Ex: Bon trimestre, élève sérieux et appliqué.",
    no_appreciation_yet: "Aucune appréciation renseignée pour l'instant.",
    director_label: "Le Directeur",
    teacher_in_charge_label: "L'enseignant chargé du cours",
    civilite_label: "Civilité",
    civilite_m: "Monsieur",
    civilite_mme: "Madame",
    civilite_hint: "Apparaîtra devant votre nom sur les bulletins que vous signez.",
    nav_tuition_fees: "Frais de scolarité",
    nav_annual_balance: "Bilan annuel",
    nav_promotion: "Passage de classe",
    nav_reenrollment: "Réinscriptions",
    nav_calendar: "Calendrier",
    nav_discipline: "Conduite",
    nav_payment_declarations: "Déclarations de paiement",
    nav_subscription_declare: "Paiement abonnement",
    subscription_declare_subtitle: "Déclare ton paiement d'abonnement à l'administrateur de la plateforme, avec une capture d'écran à l'appui.",
    school_name_label: "École",
    school_code_label: "Code",
    choose_tier_label: "Palier choisi",
    declare_subscription_payment_button: "Envoyer la déclaration",
    nav_timetable: "Emploi du temps",
    nav_file_movements: "Transferts / Retraits",
    nav_weekly_journal: "Journal de la semaine",
    nav_director_notebook: "Carnet du Directeur",
    director_notebook_subtitle: "Strictement privé — même le Fondateur n'y a pas accès.",
    nb_tab_agenda: "Agenda",
    nb_tab_reunion: "Réunions",
    nb_tab_inspection: "Inspections",
    nb_tab_equipment: "Matériel",
    nb_add_agenda: "Ajouter une note",
    nb_add_reunion: "Ajouter un compte-rendu",
    nb_add_inspection: "Ajouter une visite",
    nb_add_equipment: "Ajouter un article",
    nb_empty_agenda: "Aucune note pour l'instant.",
    nb_empty_reunion: "Aucun compte-rendu pour l'instant.",
    nb_empty_inspection: "Aucune visite enregistrée pour l'instant.",
    nb_empty_equipment: "Aucun article enregistré pour l'instant.",
    nb_title_label: "Titre",
    nb_date_label: "Date",
    nb_content_label: "Contenu",
    nb_is_task_label: "C'est une tâche à faire (avec case à cocher)",
    nb_participants_label: "Participants",
    nb_decisions_label: "Décisions prises",
    nb_visiteur_label: "Visiteur / Organisme",
    nb_observations_label: "Observations",
    nb_actions_label: "Actions demandées",
    nb_item_name_label: "Nom de l'article",
    nb_quantity_label: "Quantité",
    nb_condition_label: "État",
    nb_condition_bon: "Bon",
    nb_condition_moyen: "Moyen",
    nb_condition_mauvais: "Mauvais",
    nb_acquired_date_label: "Date d'acquisition",
    nb_notes_label: "Notes",
    nav_student_cards: "Cartes scolaires",
    nav_staff_cards: "Cartes du personnel",
    nav_school_settings: "Réglages de l'école",
    nav_staffpresence: "Présence du personnel",
    school_settings_subtitle: "Logo, couleurs, titre du responsable et informations administratives.",
    staff_cards_subtitle: "Cherche un membre du personnel pour générer sa carte.",
    staff_card_title: "Carte de Fonction",
    student_cards_subtitle: "Choisis une classe, puis un élève, pour générer sa carte scolaire.",
    school_card_title: "Carte Scolaire",
    quartier_label: "Quartier",
    student_photo_label: "Photo de l'élève",
    remove_signature_bg_label: "Retirer le fond clair automatiquement (papier, ombre légère...)",
    bg_replace_toggle_label: "Remplacer le fond automatiquement (expérimental)",
    bg_method_backdrop_title: "Fond de tissu uni ⚡",
    bg_method_backdrop_hint: "Rapide et fiable — prends la photo devant un drap de couleur unie.",
    bg_method_ai_title: "Détection automatique",
    bg_method_ai_hint: "Sans tissu, mais moins fiable — expérimental.",
    backdrop_color_label: "Couleur du tissu utilisé",
    backdrop_hint: "Prends la photo de l'enfant devant un tissu bien tendu, de cette couleur, sans plis ni ombre.",
    bg_color_blue: "Bleu",
    bg_color_green: "Vert",
    bg_color_white: "Fond blanc",
    bg_color_red: "Fond rouge",
    bg_replace_processing: "Traitement du fond en cours...",
    bg_replace_done: "✓ Fond remplacé.",
    bg_replace_fallback: "Le remplacement a échoué — la photo d'origine a été utilisée à la place, rien n'est perdu.",
    bg_replace_experimental_note: "⚠️ Fonctionnalité expérimentale — peut ne pas fonctionner sur tous les téléphones. Si ça pose souci, laisse cette case décochée.",
    school_logo_title: "Logo de l'école",
    school_logo_hint: "Apparaîtra sur les cartes scolaires et d'autres documents à venir.",
    add_logo_button: "Ajouter le logo",
    director_title_setting: "Titre du responsable de l'établissement",
    director_title_hint: "Utilisé sur les bulletins et les cartes — \"Directeur\" au primaire, \"Principal\" ou \"Proviseur\" au secondaire.",
    admin_info_title: "Informations administratives",
    ville_label: "Ville",
    ire_label: "I.R.E.",
    dpe_label: "D.P.E.",
    dsee_label: "D.S.E.E.",
    admin_info_hint: "Apparaîtra automatiquement en en-tête de toutes les fiches de résultats exportées.",
    emblem_title: "Emblème national",
    add_emblem_button: "Ajouter l'emblème",
    emblem_hint: "Apparaîtra à côté de \"République de Guinée\" sur les fiches exportées.",
    card_theme_title: "Couleurs de la carte scolaire",
    card_theme_hint: "Change à tout moment — par exemple chaque nouvelle année scolaire.",
    print_class_sheet_button: "Imprimer la planche de la classe",
    cut_along_lines_hint: "3 cartes par ligne — imprime, puis découpe chaque carte.",
    weekly_journal_subtitle: "Une entrée par semaine, réservée au personnel — jamais visible par les parents.",
    add_journal_entry_button: "Ajouter une entrée",
    week_of_label: "Semaine du",
    journal_content_label: "Ce qui s'est passé cette semaine",
    journal_content_placeholder: "Événements importants, ce qui n'a pas marché, mouvements notables...",
    no_journal_entries: "Aucune entrée pour l'instant.",
    written_by_label: "Écrit par",
    file_movements_subtitle: "Garde une trace de chaque élève qui quitte l'école — vers où, et quand. Aucune donnée financière ici.",
    record_movement_button: "Enregistrer un mouvement",
    movement_type_label: "Type",
    movement_type_transfert: "Transfert",
    movement_type_retrait: "Retrait",
    movement_date_label: "Date",
    destination_label: "Destination",
    destination_placeholder: "Ex: École Les Flamboyants, Kindia",
    reason_optional_label: "Raison (optionnel)",
    no_file_movements: "Aucun mouvement enregistré pour l'instant.",
    timetable_subtitle: "Consultable par tous, modifiable par le Directeur uniquement.",
    add_slot_button: "Ajouter un créneau",
    day_label: "Jour",
    start_time_label: "Heure de début",
    end_time_label: "Heure de fin",
    subject_label: "Matière",
    teacher_optional_label: "Enseignant (optionnel)",
    no_timetable_yet: "Aucun emploi du temps défini pour cette classe pour l'instant.",
    no_slot_this_day: "Rien de prévu ce jour.",
    momo_settings_title: "Paiement Mobile Money",
    momo_provider_label: "Opérateur",
    momo_number_label: "Numéro Mobile Money de l'école",
    momo_settings_hint: "Ce numéro sera affiché aux parents pour qu'ils puissent envoyer la scolarité depuis leur téléphone.",
    momo_instructions: "Envoie le montant à ce numéro depuis ton Orange Money ou MTN Money, puis déclare ton paiement ci-dessous.",
    declare_payment_button: "Déclarer un paiement",
    child_label: "Enfant",
    amount_sent_label: "Montant envoyé",
    momo_reference_label: "Code de confirmation reçu",
    momo_reference_placeholder: "Ex: MP240815.1234.A56789",
    payment_screenshot_label: "Capture d'écran du paiement (optionnel)",
    payment_screenshot_hint: "Aide le comptable à vérifier plus vite — la confirmation reste toujours manuelle.",
    attach_screenshot_button: "Joindre une capture",
    screenshot_attached_label: "Capture jointe",
    confirm_declaration_button: "Envoyer la déclaration",
    my_declarations_title: "Mes déclarations",
    declaration_status_pending: "En attente",
    declaration_status_confirmed: "Confirmé",
    declaration_status_rejected: "Rejeté",
    view_receipt_button: "Voir le reçu",
    or_contact_accountant: "Ou contacter directement le comptable",
    payment_declarations_subtitle: "Vérifie que l'argent est bien arrivé sur ton compte avant de confirmer.",
    pending_declarations_title: "En attente",
    no_pending_declarations: "Aucune déclaration en attente pour l'instant.",
    recent_declarations_title: "Récentes",
    confirm_payment_button: "Confirmer — argent reçu",
    reject_button: "Rejeter",
    reject_reason_placeholder: "Raison (optionnel)...",
    confirm_reject_button: "Confirmer le rejet",
    receipt_title: "Reçu de Paiement",
    amount_label: "Montant",
    confirmed_on_label: "Confirmé le",
    payment_confirmed_label: "Paiement confirmé",
    broadcast_title: "Message à toutes les écoles",
    broadcast_subtitle: "Visible par tous les utilisateurs, sur toutes les écoles de la plateforme, jusqu'à ce qu'ils le referment.",
    broadcast_send_button: "Diffuser",
    total_schools_label: "Écoles",
    subscribed_count_label: "Abonnées",
    trial_count_label: "En essai",
    expired_count_label: "Essai expiré",
    expiring_soon_title: "Essai qui expire bientôt",
    platform_users_title: "Utilisateurs sur toute la plateforme",
    platform_users_unavailable: "Impossible de charger ces chiffres pour l'instant — réessaie plus tard.",
    expires_today: "Expire aujourd'hui",
    days_left_label: "jour(s) restant(s)",
    discipline_subtitle: "Un carnet privé — rien ne va au parent tant que vous ne cliquez pas \"Partager\".",
    add_note_button: "Ajouter une observation",
    student_label: "Élève",
    discipline_type_label: "Type",
    discipline_note_label: "Note (optionnelle)",
    discipline_note_placeholder: "Détails de la situation...",
    discipline_type_indiscipline: "Indiscipline",
    discipline_type_retard: "Retard",
    discipline_type_absence: "Absence non justifiée",
    discipline_type_bon: "Bon comportement",
    no_discipline_notes: "Aucune observation enregistrée pour l'instant.",
    share_with_parent_button: "Partager avec le parent",
    shared_with_parent_label: "Partagé avec le parent",
    nav_dossiers: "Dossiers élèves",
    dossiers_subtitle: "Consulte et complète les dossiers administratifs — naissance, filiation, documents. Aucune donnée financière ici.",
    dossier_complete: "Dossier complet",
    dossier_incomplete: "À compléter",
    generate_info_sheet_button: "Fiche de renseignements",
    info_sheet_title: "Fiche de Renseignements des Élèves",
    gender_col_short: "Sexe",
    contact_phone_col: "Contact (parent/tuteur)",
    contact_label_simple: "Contact",
    livret_short: "Livret",
    extrait_short: "Extrait naissance",
    calendar_subtitle: "Visible par tout le monde — vacances, examens, réunions et autres dates importantes.",
    add_event_button: "Ajouter",
    event_title_label: "Titre",
    event_title_placeholder: "Ex: Rentrée scolaire",
    event_date_label: "Date",
    event_type_label: "Type",
    event_description_label: "Détails (optionnel)",
    upcoming_events_title: "À venir",
    past_events_title: "Passés",
    no_upcoming_events: "Aucun événement à venir pour l'instant.",
    status_a_faire: "À faire",
    status_en_cours: "En cours",
    status_termine: "Terminé",
    vacances_type: "Vacances",
    examen_type: "Examen",
    reunion_type: "Réunion",
    rentree_type: "Rentrée",
    autre_type: "Autre",
    promotion_prep_subtitle: "Prépare la liste d'attente pour la nouvelle année — rien n'est créé tant qu'un parent ne vient pas réinscrire l'élève.",
    target_year_label: "Nouvelle année scolaire",
    target_year_placeholder: "Ex: 2026-2027",
    generate_list_button: "Générer la liste",
    promotion_generate_hint: "Chaque élève reçoit automatiquement sa classe supérieure — modifiable ensuite un par un, ou à cocher \"Redouble\".",
    viewing_year_label: "Liste pour l'année",
    no_promotion_list_yet: "Aucune liste préparée pour l'instant.",
    already_enrolled_badge: "✓ Déjà réinscrit",
    needs_manual_class: "à choisir",
    repeating_label: "Redouble",
    stays_in_class_label: "Reste en",
    status_promoted_label: "Passage en classe supérieure",
    status_repeating_label: "Redoublant",
    repeating_section_title: "Redoublants",
    average_short: "Moy.",
    no_grades_yet: "Aucune note",
    promoted_section_title: "Admis en classe supérieure",
    staff_trash_title: "Corbeille du personnel",
    staff_trash_subtitle: "Les personnes ici ne sont plus visibles dans la liste principale. Restaurez-les individuellement si besoin — sinon elles restent ici, hors de votre chemin.",
    staff_trash_empty: "La corbeille est vide.",
    search_by_name_placeholder: "Rechercher par nom...",
    restore_button: "Restaurer",
    move_to_trash: "Corbeille",
    class_prefilled_hint: "La classe a déjà été décidée par le directeur/fondateur — modifie seulement si nécessaire.",
    reenrollment_subtitle: "Cherche l'élève dont le parent vient réinscrire, confirme sa classe, encaisse le premier paiement.",
    no_pending_reenrollment: "Aucune réinscription en attente. Demande au directeur/fondateur de préparer la liste de passage.",
    enroll_for_year_button: "Inscrire pour",
    first_payment_label: "Premier paiement (optionnel)",
    confirm_enrollment_button: "Confirmer l'inscription",
    annual_balance_subtitle: "Vue d'ensemble en lecture seule — la saisie reste séparée pour chaque source",
    net_result_label: "Résultat net",
    net_result_hint: "Toutes recettes moins toutes dépenses, pour l'année sélectionnée.",
    total_income_label: "Total des recettes",
    total_expenses_label: "Total des dépenses",
    income_breakdown_title: "Détail des recettes",
    expense_breakdown_title: "Détail des dépenses",
    salaries_source_label: "Salaires du personnel",
    other_expenses_source_label: "Autres dépenses",
    tuition_source_label: "Scolarité",
    no_services_for_balance: "Aucun service créé pour l'instant.",
    annual_balance_note: "Ce bilan rassemble uniquement les chiffres pour la lecture — chaque source (scolarité, services, dépenses) reste saisie séparément dans son propre écran.",
    nav_services: "Services",
    services_subtitle: "Transport, cantine, informatique, librairie... séparés de la scolarité, pour un suivi clair de chaque activité.",
    services_subtitle_fondateur: "Vue de contrôle — le comptable inscrit les élèves et enregistre les paiements ; vous consultez le bilan de chaque service.",
    fondateur_view_only_note: "Cette section est gérée par le comptable. Vous pouvez consulter le bilan ci-dessus, mais l'inscription et les paiements se font depuis son compte.",
    service_summary_title: "Bilan",
    total_enrolled_label: "Inscrits",
    fully_paid_label: "Payé intégral",
    total_collected_label: "Total encaissé",
    total_remaining_label: "Total restant",
    view_daily_history: "Historique",
    daily_history_title: "Historique des recettes",
    no_payments_yet: "Aucun paiement enregistré pour l'instant.",
    today_label: "aujourd'hui",
    today_tuition_collected: "Scolarité collectée aujourd'hui",
    today_service_collected: "Collecté aujourd'hui",
    search_label: "Rechercher",
    manage_services_button: "Gérer les services",
    service_name_placeholder: "Ex: Transport, Cantine, Informatique",
    add_service_button: "Ajouter le service",
    no_service_yet: "Aucun service créé pour l'instant. Le fondateur peut en ajouter depuis \"Gérer les services\".",
    service_label: "Service",
    enrolled_students_title: "Élèves inscrits",
    no_student_enrolled: "Aucun élève inscrit à ce service pour l'instant.",
    not_enrolled_title: "Élèves non inscrits",
    all_enrolled: "Tous les élèves sont déjà inscrits à ce service.",
    unenroll_button: "Retirer",
    enroll_button: "Inscrire",
    paid_label: "Payé",
    remaining_label: "Reste",
    amount_placeholder: "Montant",
    record_payment_button: "Enregistrer un paiement",
    edit_button: "Modifier",
    search_student_placeholder: "Rechercher un élève par nom...",
    tuition_fees_subtitle: "Définis une fois le montant de la scolarité pour chaque classe — il se remplira automatiquement à chaque nouvel élève inscrit dans cette classe.",
    tuition_amount_placeholder: "Montant pour l'année",
    tuition_auto_filled: "✓ Montant rempli automatiquement selon la classe — modifiable si besoin.",
    tuition_auto_filled_new: "✓ Montant \"nouveau venant\" rempli automatiquement — modifiable si besoin.",
    tuition_locked_comptable: "🔒 Montant fixé par le fondateur pour cette classe — non modifiable ici.",
    tuition_locked_comptable_new: "🔒 Montant \"nouveau venant\" fixé par le fondateur — non modifiable ici.",
    dossier_section_title: "Dossier administratif",
    birth_date_label: "Date de naissance",
    birth_place_label: "Lieu de naissance",
    father_name_label: "Nom du père",
    mother_name_label: "Nom de la mère",
    has_livret_label: "A un livret de famille à l'école",
    has_extrait_label: "A un extrait de naissance à l'école",
    tuition_standard_label: "Frais standard (élève déjà inscrit)",
    tuition_amount_label_simple: "Scolarité annuelle",
    tuition_new_student_label: "Frais nouveau venant (optionnel)",
    tuition_new_student_placeholder: "Laisser vide = même tarif",
    is_new_student_label: "Nouveau venant à l'école (pas encore inscrit avant)",
    special_status_label: "Statut particulier",
    special_status_none: "— Aucun (payant normal)",
    special_status_boursier: "Boursier",
    special_status_protege: "Protégé",
    special_status_hint: "À préciser seulement pour un élève boursier ou protégé — les élèves payants n'ont rien à choisir ici.",
    gender_missing_badge: "Sexe manquant",
    change_photo: "Changer la photo",
    no_file_detected: "Aucun fichier détecté — réessaie de choisir une photo.",
    offline_banner: "Pas de connexion internet — vérifie ton réseau et réessaie.",
    offline_banner_short: "Pas de connexion internet",
    offline_showing_cached: "Pas de connexion — tu vois les dernières données enregistrées sur ce téléphone.",
    offline_showing_cached_short: "Hors-ligne — données enregistrées sur ce téléphone",
    syncing_now: "Envoi des données en attente…",
    pending_sync_count: "{n} modification(s) enregistrée(s) en attente d'envoi",
    sync_success: "✓ Toutes les modifications ont été envoyées avec succès.",
    saved_offline_pending: "Enregistré hors-ligne — sera envoyé dès le retour du réseau.",
    student_offline_limit_failed: "Un élève ajouté hors-ligne n'a pas pu être créé : limite d'essai atteinte entretemps.",
    offline_action_rejected: "Une action enregistrée hors-ligne n'a pas pu être envoyée — elle a été annulée.",
    sync_issues_title: "Une action hors-ligne n'est pas passée",
    dismiss_all: "Tout fermer",
    offline_action_rejected_trial: "Une note/présence enregistrée hors-ligne n'a pas pu être envoyée : l'essai gratuit est terminé. Abonnez-vous pour continuer.",
    retry_button: "Réessayer",
    take_photo_now: "Prendre une photo",
    upload_failed_retry: "Échec de l'envoi (signal faible ?). Appuie sur Réessayer.",
    my_signature_label: "Ma signature",
    no_signature_yet: "Aucune signature ajoutée",
    add_signature: "Ajouter une signature",
    change_signature: "Changer la signature",
    signature_hint: "Photo de ta signature manuscrite, sur fond clair de préférence.",
    live_log_title: "Journal en direct (pour diagnostic)",
    low_memory_warning: "⚠️ Ton téléphone a peu de mémoire disponible — privilégie la galerie plutôt que l'appareil photo si possible.",
    my_email_label: "Mon adresse email",
    update_email_button: "Modifier",
    email_change_hint: "Un lien de confirmation sera envoyé à la nouvelle adresse avant que le changement ne prenne effet.",
    email_change_confirm_sent: "✓ Vérifie ta boîte mail pour confirmer le changement.",
    email_change_failed: "Le changement a échoué — vérifie l'adresse et réessaie.",
    deactivate_account_title: "Désactiver mon compte",
    deactivate_account_hint: "Réversible — un Fondateur pourra te réactiver à tout moment. Rien de ton historique n'est supprimé.",
    deactivate_my_account_button: "Désactiver mon compte",
    deactivate_confirm_question: "Es-tu sûr ? Tu seras déconnecté immédiatement.",
    yes_deactivate: "Oui, désactiver",
    cancel_button: "Annuler",
    delete_account_title: "Supprimer mon compte",
    delete_account_hint: "⚠️ Définitif — ton compte sera entièrement supprimé. Tes enfants restent inscrits normalement, juste détachés de ce compte.",
    delete_my_account_button: "Supprimer mon compte",
    delete_confirm_question: "C'est définitif et irréversible. Continuer ?",
    yes_delete: "Oui, supprimer définitivement",
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
    nav_class_assign: "Teachers' Classes",
    nav_lesson_ai: "AI Assistant",
    lesson_ai_subtitle: "Give your lesson title, textbook, and page — the AI prepares the lesson plan and consolidation questions.",
    lesson_title_label: "Lesson title",
    lesson_title_placeholder: "Ex: Photosynthesis",
    lesson_title_required: "The lesson title is required.",
    textbook_label: "Textbook / book",
    textbook_placeholder: "Ex: Grade 5 Natural Sciences",
    page_label: "Page",
    ai_generate_button: "Generate lesson plan",
    ai_generating: "Generating…",
    ai_generic_error: "Something went wrong. Try again in a moment.",
    objectives_title: "Objectives",
    materials_title: "Materials needed",
    lesson_flow_title: "Lesson flow",
    consolidation_questions_title: "Consolidation questions",
    reveal_answer: "Show answer",
    ai_tab_planifier: "Plan",
    ai_history_group_label: "History",
    ai_tab_historique: "History",
    ai_tab_sujet: "Compose a test",
    ai_tab_sujet_historique: "Test history",
    ai_tab_fiches_revision: "Revision sheets",
    no_revision_sheet_history: "No revision sheet generated yet.",
    ai_tab_exercice: "Exercise help",
    exercise_upload_label: "Photo or PDF of the exercise",
    exercise_pick_file: "Take a photo or choose a file",
    exercise_pick_hint: "Image (JPEG/PNG) or PDF, one page at a time preferred",
    exercise_remove_file: "Remove file",
    exercise_instructions_label: "Notes (optional)",
    exercise_instructions_placeholder: "Ex: only question 3, or explain in detail for a beginner",
    exercise_analyze_button: "Analyze exercise",
    exercise_bad_format: "Unsupported format. Use a photo (JPEG/PNG) or a PDF.",
    exercise_too_large: "File too large. Try a lighter photo or a single page.",
    exercise_file_required: "Add a photo or file first.",
    exercise_identified_title: "Identified problem",
    exercise_analysis_title: "Analysis",
    exercise_steps_title: "Step-by-step treatment",
    exercise_final_answer_title: "Final answer",
    exercise_tip_title: "Teaching tip",
    generate_revision_sheet_button: "Generate a revision sheet for students",
    revision_sheet_title: "Revision sheet (draft)",
    status_draft: "Draft",
    status_published: "Published",
    publish_to_students: "Publish to students",
    unpublish: "Unpublish",
    discard_sheet: "Discard draft",
    nav_revision: "Revise",
    revision_parent_subtitle: "Revision sheets published by your children's teachers.",
    no_revision_sheets_yet: "No revision sheet published yet.",
    no_exam_history: "No test generated yet.",
    competence_specifique_label: "Specific competency",
    competence_specifique_placeholder: "Ex: Locate and describe Guinea's natural resources",
    competence_specifique_hint: "Based on your curriculum brochure — generated objectives will align with it.",
    no_lesson_history: "No lesson generated yet.",
    delete_from_history: "Delete from history",
    pick_from_history: "Pick from history",
    lesson_titles_label: "Titles of lessons covered",
    lesson_titles_placeholder: "One lesson title per line",
    lesson_titles_hint: "Check lessons above or type them yourself, one per line.",
    lesson_titles_required: "Add at least one lesson title.",
    question_type_label: "Question type",
    question_type_mixte: "Mixed (multiple choice + constructed)",
    question_type_qcm: "Multiple choice only",
    question_type_construite: "Constructed answer only",
    nb_questions_label: "Number of questions",
    ai_generate_exam_button: "Generate test",
    nav_lessons: "Homework",
    nav_expenses: "Expenses",
    nav_staff: "Staff",
    nav_parents: "Parents",
    nav_my_salary: "My Salary",
    nav_remarks: "Parent Remarks",
    reply_individually_button: "Reply individually",
    edit_reply_button: "Edit reply",
    reply_placeholder: "Your reply to this parent...",
    your_reply_label: "Your reply",
    director_reply_label: "Director's reply",
    awaiting_reply_label: "Awaiting reply.",
    send: "Send",
    nav_my_remarks: "My Remarks",
    nav_my_children: "My Children",
    nav_my_assignments: "My Subjects",
    nav_pay_remotely: "Pay Remotely",
    nav_stats: "Statistics",
    nav_admin: "Administration",
    nav_feedback: "User Feedback",
    give_feedback_menu: "Give feedback",
    feedback_subtitle: "Your remarks help us improve the application — only visible to the team.",
    feedback_rating_label: "Rating",
    feedback_message_label: "Your message (optional)",
    feedback_message_placeholder: "What you like, what bothers you, an idea...",
    feedback_send_button: "Send",
    feedback_empty_error: "Add at least a rating or a message.",
    feedback_thanks: "Thanks for your feedback!",
    feedback_admin_subtitle: "All feedback sent by users, across all schools.",
    feedback_count_label: "reviews",
    feedback_filter_all: "All ratings",
    feedback_filter_low: "2 stars or less",
    feedback_filter_mid: "3 stars or less",
    no_feedback_yet: "No feedback received yet.",
    feedback_anonymous: "Anonymous",
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
    send_link: "Send link",
    onboarding_title: "Set up your account",
    onboarding_subtitle: "Last step before accessing the application.",
    back: "← Back",
    your_full_name: "Your full name",
    your_role: "Your role",
    role_fondateur: "Founder (owner)",
    role_directeur: "Director",
    role_comptable: "Accountant",
    role_enseignant: "Teacher",
    role_parent: "Parent",
    role_personnel: "Staff (other)",
    your_class: "Your class",
    your_class_hint: "Use exactly the same name as the accountant for this class.",
    class_assigned_by_founder: "Your class will be assigned by the founder/director after signup. You'll get access as soon as it's assigned.",
    my_class_label: "My class",
    unassigned_class: "No class assigned",
    assign_class_title: "Assign a teacher's class (primary)",
    assign_class_subtitle: "Choose each teacher's class. You can change it anytime (e.g. move them up a grade).",
    no_class_assigned_yet: "No class assigned",
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
    year_status_active: "current year",
    year_status_archive: "archive",
    year_status_upcoming: "upcoming — view only",
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
    export_all_classes: "Export all classes",
    share_button: "Share",
    share_all_classes: "Share all classes",
    publish_all_classes: "Publish all",
    all_published_success: "All results have been published to parents.",
    student: "Student",
    payment: "Payment",
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
    order_number: "No.",
    appreciation_col: "Appreciation",
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
    subject_results: "Analytical results table (% passing)",
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
    general_average: "General average",
    enter_view: "Enter grades",
    bulletin_view: "Report card & ranking",
    grades_sec_subtitle_entry: "Enter written and oral grades, month by month.",
    grades_sec_subtitle_bulletin: "Weighted class ranking, subject by subject.",
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
    valid_amount: "Enter a valid amount.",
    save: "Save",
    cat_salaires: "Salaries",
    from_staff_screen: "from Staff",
    cat_factures: "Bills",
    cat_fournitures: "Supplies",
    cat_credits: "Credits",
    cat_autres: "Other",
    role_fondateur_dir: "Founder / Director",
    fn_comptable: "Accountant",
    fn_enseignant: "Teacher",
    fn_personnel: "Staff",
    hide_hidden_profiles: "Hide hidden profiles",
    hide_school: "Hide this school",
    unhide_school: "Unhide this school",
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
    per_year_short: "/yr",
    per_month_short: "/mo",
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
    close_button: "Close",
    back_button: "Back",
    bulletin_button: "Report card",
    view_bulletin_button: "View report card",
    print_pdf_button: "Print / PDF",
    download_pdf_button: "Download (PDF)",
    print_button_only: "Print",
    download_hint: "Choose \"Save as PDF\" in the window that opens to save it on your phone, or choose a printer to print directly.",
    download_hint_v2: "\"Download (PDF)\" saves the file directly on your phone. \"Print\" opens your phone's printer.",
    pdf_download_failed: "PDF download failed — check your connection and try again, or use \"Print\" instead.",
    bulletin_title: "Report Card",
    republic_header: "Republic of Guinea",
    grade_detail_col: "Grade(s)",
    overall_average_label: "Overall average",
    mention_label: "Mention",
    appreciation_label: "Teacher's remark",
    appreciation_placeholder: "Ex: Good term, serious and diligent student.",
    no_appreciation_yet: "No remark added yet.",
    director_label: "The Director",
    teacher_in_charge_label: "Teacher in charge",
    civilite_label: "Title",
    civilite_m: "Mr.",
    civilite_mme: "Mrs.",
    civilite_hint: "Will appear before your name on report cards you sign.",
    nav_tuition_fees: "Tuition Fees",
    nav_annual_balance: "Annual Balance",
    nav_promotion: "Grade Promotion",
    nav_reenrollment: "Re-enrollments",
    nav_calendar: "Calendar",
    nav_discipline: "Conduct",
    nav_payment_declarations: "Payment Declarations",
    nav_subscription_declare: "Subscription Payment",
    subscription_declare_subtitle: "Declare your subscription payment to the platform administrator, with a supporting screenshot.",
    school_name_label: "School",
    school_code_label: "Code",
    choose_tier_label: "Chosen tier",
    declare_subscription_payment_button: "Send declaration",
    nav_timetable: "Timetable",
    nav_file_movements: "Transfers / Withdrawals",
    nav_weekly_journal: "Weekly Journal",
    nav_director_notebook: "Director's Notebook",
    director_notebook_subtitle: "Strictly private — not even the Founder has access.",
    nb_tab_agenda: "Agenda",
    nb_tab_reunion: "Meetings",
    nb_tab_inspection: "Inspections",
    nb_tab_equipment: "Equipment",
    nb_add_agenda: "Add a note",
    nb_add_reunion: "Add minutes",
    nb_add_inspection: "Add a visit",
    nb_add_equipment: "Add an item",
    nb_empty_agenda: "No note yet.",
    nb_empty_reunion: "No minutes yet.",
    nb_empty_inspection: "No visit recorded yet.",
    nb_empty_equipment: "No item recorded yet.",
    nb_title_label: "Title",
    nb_date_label: "Date",
    nb_content_label: "Content",
    nb_is_task_label: "This is a task (with checkbox)",
    nb_participants_label: "Participants",
    nb_decisions_label: "Decisions made",
    nb_visiteur_label: "Visitor / Organization",
    nb_observations_label: "Observations",
    nb_actions_label: "Actions requested",
    nb_item_name_label: "Item name",
    nb_quantity_label: "Quantity",
    nb_condition_label: "Condition",
    nb_condition_bon: "Good",
    nb_condition_moyen: "Fair",
    nb_condition_mauvais: "Poor",
    nb_acquired_date_label: "Date acquired",
    nb_notes_label: "Notes",
    nav_student_cards: "School Cards",
    nav_staff_cards: "Staff Cards",
    nav_school_settings: "School Settings",
    nav_staffpresence: "Staff Presence",
    school_settings_subtitle: "Logo, colors, head of school title, and administrative information.",
    staff_cards_subtitle: "Search a staff member to generate their card.",
    staff_card_title: "Staff ID Card",
    student_cards_subtitle: "Choose a class, then a student, to generate their school card.",
    school_card_title: "School Card",
    quartier_label: "Neighborhood",
    student_photo_label: "Student photo",
    remove_signature_bg_label: "Automatically remove light background (paper, faint shadow...)",
    bg_replace_toggle_label: "Automatically replace background (experimental)",
    bg_method_backdrop_title: "Solid cloth backdrop ⚡",
    bg_method_backdrop_hint: "Fast and reliable — take the photo in front of a solid-colored cloth.",
    bg_method_ai_title: "Automatic detection",
    bg_method_ai_hint: "No cloth needed, but less reliable — experimental.",
    backdrop_color_label: "Backdrop color used",
    backdrop_hint: "Take the child's photo in front of a well-stretched cloth of this color, without folds or shadow.",
    bg_color_blue: "Blue",
    bg_color_green: "Green",
    bg_color_white: "White background",
    bg_color_red: "Red background",
    bg_replace_processing: "Processing background...",
    bg_replace_done: "✓ Background replaced.",
    bg_replace_fallback: "Replacement failed — the original photo was used instead, nothing is lost.",
    bg_replace_experimental_note: "⚠️ Experimental feature — may not work on all phones. If it causes trouble, leave this box unchecked.",
    school_logo_title: "School logo",
    school_logo_hint: "Will appear on school cards and other future documents.",
    add_logo_button: "Add logo",
    director_title_setting: "Head of school title",
    director_title_hint: "Used on report cards and ID cards — \"Directeur\" for primary, \"Principal\" or \"Proviseur\" for secondary.",
    admin_info_title: "Administrative information",
    ville_label: "City",
    ire_label: "I.R.E.",
    dpe_label: "D.P.E.",
    dsee_label: "D.S.E.E.",
    admin_info_hint: "Will appear automatically as the header of every exported results sheet.",
    emblem_title: "National emblem",
    add_emblem_button: "Add emblem",
    emblem_hint: "Will appear next to \"République de Guinée\" on exported sheets.",
    card_theme_title: "School card colors",
    card_theme_hint: "Change anytime — for example, each new school year.",
    print_class_sheet_button: "Print class sheet",
    cut_along_lines_hint: "3 cards per row — print, then cut each card out.",
    weekly_journal_subtitle: "One entry per week, staff only — never visible to parents.",
    add_journal_entry_button: "Add an entry",
    week_of_label: "Week of",
    journal_content_label: "What happened this week",
    journal_content_placeholder: "Important events, what didn't go well, notable movements...",
    no_journal_entries: "No entry yet.",
    written_by_label: "Written by",
    file_movements_subtitle: "Keep track of every student who leaves the school — where to, and when. No financial data here.",
    record_movement_button: "Record a movement",
    movement_type_label: "Type",
    movement_type_transfert: "Transfer",
    movement_type_retrait: "Withdrawal",
    movement_date_label: "Date",
    destination_label: "Destination",
    destination_placeholder: "Ex: Les Flamboyants School, Kindia",
    reason_optional_label: "Reason (optional)",
    no_file_movements: "No movement recorded yet.",
    timetable_subtitle: "Visible to everyone, editable by the Director only.",
    add_slot_button: "Add a time slot",
    day_label: "Day",
    start_time_label: "Start time",
    end_time_label: "End time",
    subject_label: "Subject",
    teacher_optional_label: "Teacher (optional)",
    no_timetable_yet: "No timetable set for this class yet.",
    no_slot_this_day: "Nothing scheduled this day.",
    momo_settings_title: "Mobile Money Payment",
    momo_provider_label: "Provider",
    momo_number_label: "School's Mobile Money number",
    momo_settings_hint: "This number will be shown to parents so they can send tuition from their phone.",
    momo_instructions: "Send the amount to this number from your Orange Money or MTN Money, then declare your payment below.",
    declare_payment_button: "Declare a payment",
    child_label: "Child",
    amount_sent_label: "Amount sent",
    momo_reference_label: "Confirmation code received",
    momo_reference_placeholder: "Ex: MP240815.1234.A56789",
    payment_screenshot_label: "Payment screenshot (optional)",
    payment_screenshot_hint: "Helps the accountant verify faster — confirmation always stays manual.",
    attach_screenshot_button: "Attach a screenshot",
    screenshot_attached_label: "Screenshot attached",
    confirm_declaration_button: "Send declaration",
    my_declarations_title: "My declarations",
    declaration_status_pending: "Pending",
    declaration_status_confirmed: "Confirmed",
    declaration_status_rejected: "Rejected",
    view_receipt_button: "View receipt",
    or_contact_accountant: "Or contact the accountant directly",
    payment_declarations_subtitle: "Check the money actually arrived on your account before confirming.",
    pending_declarations_title: "Pending",
    no_pending_declarations: "No pending declaration right now.",
    recent_declarations_title: "Recent",
    confirm_payment_button: "Confirm — money received",
    reject_button: "Reject",
    reject_reason_placeholder: "Reason (optional)...",
    confirm_reject_button: "Confirm rejection",
    receipt_title: "Payment Receipt",
    amount_label: "Amount",
    confirmed_on_label: "Confirmed on",
    payment_confirmed_label: "Payment confirmed",
    broadcast_title: "Message to all schools",
    broadcast_subtitle: "Visible to every user, across every school on the platform, until they dismiss it.",
    broadcast_send_button: "Broadcast",
    total_schools_label: "Schools",
    subscribed_count_label: "Subscribed",
    trial_count_label: "On trial",
    expired_count_label: "Trial expired",
    expiring_soon_title: "Trial expiring soon",
    platform_users_title: "Users across the platform",
    platform_users_unavailable: "Could not load these numbers right now — try again later.",
    expires_today: "Expires today",
    days_left_label: "day(s) left",
    discipline_subtitle: "A private notebook — nothing reaches the parent until you click \"Share\".",
    add_note_button: "Add observation",
    student_label: "Student",
    discipline_type_label: "Type",
    discipline_note_label: "Note (optional)",
    discipline_note_placeholder: "Details of the situation...",
    discipline_type_indiscipline: "Misconduct",
    discipline_type_retard: "Late arrival",
    discipline_type_absence: "Unexcused absence",
    discipline_type_bon: "Good behavior",
    no_discipline_notes: "No observation recorded yet.",
    share_with_parent_button: "Share with parent",
    shared_with_parent_label: "Shared with parent",
    nav_dossiers: "Student Files",
    dossiers_subtitle: "Review and complete administrative files — birth details, filiation, documents. No financial data here.",
    dossier_complete: "Complete file",
    dossier_incomplete: "To complete",
    generate_info_sheet_button: "Information sheet",
    info_sheet_title: "Student Information Sheet",
    gender_col_short: "Gender",
    contact_phone_col: "Contact (parent/guardian)",
    contact_label_simple: "Contact",
    livret_short: "Family book",
    extrait_short: "Birth certificate",
    calendar_subtitle: "Visible to everyone — holidays, exams, meetings and other important dates.",
    add_event_button: "Add",
    event_title_label: "Title",
    event_title_placeholder: "Ex: First day of school",
    event_date_label: "Date",
    event_type_label: "Type",
    event_description_label: "Details (optional)",
    upcoming_events_title: "Upcoming",
    past_events_title: "Past",
    no_upcoming_events: "No upcoming event yet.",
    status_a_faire: "To do",
    status_en_cours: "In progress",
    status_termine: "Done",
    vacances_type: "Holidays",
    examen_type: "Exam",
    reunion_type: "Meeting",
    rentree_type: "First day",
    autre_type: "Other",
    promotion_prep_subtitle: "Prepare the waiting list for the new year — nothing is created until a parent comes to re-enroll the student.",
    target_year_label: "New school year",
    target_year_placeholder: "Ex: 2026-2027",
    generate_list_button: "Generate list",
    promotion_generate_hint: "Each student automatically gets the next grade — editable one by one, or check \"Repeating\".",
    viewing_year_label: "List for year",
    no_promotion_list_yet: "No list prepared yet.",
    already_enrolled_badge: "✓ Already re-enrolled",
    needs_manual_class: "to choose",
    repeating_label: "Repeating",
    stays_in_class_label: "Stays in",
    status_promoted_label: "Promoted to next grade",
    status_repeating_label: "Repeating",
    repeating_section_title: "Repeating students",
    average_short: "Avg.",
    no_grades_yet: "No grades",
    promoted_section_title: "Promoted to next grade",
    staff_trash_title: "Staff trash",
    staff_trash_subtitle: "People here no longer appear in the main list. Restore them individually if needed — otherwise they stay here, out of your way.",
    staff_trash_empty: "The trash is empty.",
    search_by_name_placeholder: "Search by name...",
    restore_button: "Restore",
    move_to_trash: "Trash",
    class_prefilled_hint: "The class was already decided by the director/founder — only change it if needed.",
    reenrollment_subtitle: "Find the student whose parent is here to re-enroll, confirm their class, collect the first payment.",
    no_pending_reenrollment: "No pending re-enrollment. Ask the director/founder to prepare the promotion list.",
    enroll_for_year_button: "Enroll for",
    first_payment_label: "First payment (optional)",
    confirm_enrollment_button: "Confirm enrollment",
    annual_balance_subtitle: "Read-only overview — data entry stays separate for each source",
    net_result_label: "Net result",
    net_result_hint: "All income minus all expenses, for the selected year.",
    total_income_label: "Total income",
    total_expenses_label: "Total expenses",
    income_breakdown_title: "Income breakdown",
    expense_breakdown_title: "Expense breakdown",
    salaries_source_label: "Staff salaries",
    other_expenses_source_label: "Other expenses",
    tuition_source_label: "Tuition",
    no_services_for_balance: "No service created yet.",
    annual_balance_note: "This balance only gathers the numbers for reading — each source (tuition, services, expenses) is still entered separately in its own screen.",
    nav_services: "Services",
    services_subtitle: "Transport, canteen, IT, library... kept separate from tuition, for a clear view of each activity.",
    services_subtitle_fondateur: "Overview only — the accountant enrolls students and records payments; you review each service's summary.",
    fondateur_view_only_note: "This section is managed by the accountant. You can review the summary above, but enrollment and payments happen from their account.",
    service_summary_title: "Summary",
    total_enrolled_label: "Enrolled",
    fully_paid_label: "Fully paid",
    total_collected_label: "Total collected",
    total_remaining_label: "Total remaining",
    view_daily_history: "History",
    daily_history_title: "Revenue history",
    no_payments_yet: "No payment recorded yet.",
    today_label: "today",
    today_tuition_collected: "Tuition collected today",
    today_service_collected: "Collected today",
    search_label: "Search",
    manage_services_button: "Manage services",
    service_name_placeholder: "Ex: Transport, Canteen, IT",
    add_service_button: "Add service",
    no_service_yet: "No service created yet. The founder can add one from \"Manage services\".",
    service_label: "Service",
    enrolled_students_title: "Enrolled students",
    no_student_enrolled: "No student enrolled in this service yet.",
    not_enrolled_title: "Not enrolled",
    all_enrolled: "All students are already enrolled in this service.",
    unenroll_button: "Remove",
    enroll_button: "Enroll",
    paid_label: "Paid",
    remaining_label: "Remaining",
    amount_placeholder: "Amount",
    record_payment_button: "Record a payment",
    edit_button: "Edit",
    search_student_placeholder: "Search a student by name...",
    tuition_fees_subtitle: "Set the tuition amount once for each class — it will auto-fill for every new student enrolled in that class.",
    tuition_amount_placeholder: "Amount for the year",
    tuition_auto_filled: "✓ Amount auto-filled based on class — editable if needed.",
    tuition_auto_filled_new: "✓ \"New student\" amount auto-filled — editable if needed.",
    tuition_locked_comptable: "🔒 Amount set by the founder for this class — cannot be changed here.",
    tuition_locked_comptable_new: "🔒 \"New student\" amount set by the founder — cannot be changed here.",
    dossier_section_title: "Administrative file",
    birth_date_label: "Date of birth",
    birth_place_label: "Place of birth",
    father_name_label: "Father's name",
    mother_name_label: "Mother's name",
    has_livret_label: "Has a family record book on file",
    has_extrait_label: "Has a birth certificate on file",
    tuition_standard_label: "Standard fee (already enrolled student)",
    tuition_amount_label_simple: "Annual tuition",
    tuition_new_student_label: "New student fee (optional)",
    tuition_new_student_placeholder: "Leave empty = same rate",
    is_new_student_label: "New arrival at the school (not previously enrolled)",
    special_status_label: "Special status",
    special_status_none: "— None (regular paying student)",
    special_status_boursier: "Scholarship",
    special_status_protege: "Sponsored",
    special_status_hint: "Only set this for a scholarship or sponsored student — paying students don't need anything selected here.",
    gender_missing_badge: "Gender missing",
    change_photo: "Change photo",
    no_file_detected: "No file detected — try picking a photo again.",
    offline_banner: "No internet connection — check your network and try again.",
    offline_banner_short: "No internet connection",
    offline_showing_cached: "No connection — showing the latest data saved on this phone.",
    offline_showing_cached_short: "Offline — showing data saved on this phone",
    syncing_now: "Sending pending changes…",
    pending_sync_count: "{n} change(s) saved, waiting to be sent",
    sync_success: "✓ All changes were sent successfully.",
    saved_offline_pending: "Saved offline — will be sent once back online.",
    student_offline_limit_failed: "A student added offline could not be created: trial limit reached in the meantime.",
    offline_action_rejected: "An offline change could not be sent — it was cancelled.",
    sync_issues_title: "An offline action failed to sync",
    dismiss_all: "Dismiss all",
    offline_action_rejected_trial: "An offline grade/attendance entry could not be sent: the free trial has ended. Subscribe to continue.",
    retry_button: "Retry",
    take_photo_now: "Take a photo",
    upload_failed_retry: "Upload failed (weak signal?). Tap Retry.",
    my_signature_label: "My signature",
    no_signature_yet: "No signature added yet",
    add_signature: "Add signature",
    change_signature: "Change signature",
    signature_hint: "A photo of your handwritten signature, preferably on a light background.",
    live_log_title: "Live log (for diagnosis)",
    low_memory_warning: "⚠️ Your phone has little available memory — prefer the gallery over the camera if possible.",
    my_email_label: "My email address",
    update_email_button: "Update",
    email_change_hint: "A confirmation link will be sent to the new address before the change takes effect.",
    email_change_confirm_sent: "✓ Check your inbox to confirm the change.",
    email_change_failed: "The change failed — check the address and try again.",
    deactivate_account_title: "Deactivate my account",
    deactivate_account_hint: "Reversible — a Founder can reactivate you anytime. None of your history is deleted.",
    deactivate_my_account_button: "Deactivate my account",
    deactivate_confirm_question: "Are you sure? You will be signed out immediately.",
    yes_deactivate: "Yes, deactivate",
    cancel_button: "Cancel",
    delete_account_title: "Delete my account",
    delete_account_hint: "⚠️ Permanent — your account will be fully deleted. Your children stay enrolled normally, just unlinked from this account.",
    delete_my_account_button: "Delete my account",
    delete_confirm_question: "This is permanent and cannot be undone. Continue?",
    yes_delete: "Yes, delete permanently",
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
const CLASSES_MATERNELLE = ["Garderie", "Petite Section", "Moyenne Section", "Grande Section"];
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

// Calcule la classe suivante par défaut pour le passage en classe supérieure.
// Retourne null quand la suite ne peut pas être devinée automatiquement (fin de cycle,
// choix de série au lycée) — dans ce cas le fondateur/directeur doit la choisir lui-même.
function getNextClass(currentClass) {
  const inSeq = (list) => {
    const idx = list.indexOf(currentClass);
    if (idx === -1) return undefined;
    return idx + 1 < list.length ? list[idx + 1] : null;
  };
  if (CLASSES_MATERNELLE.includes(currentClass)) {
    const r = inSeq(CLASSES_MATERNELLE);
    return r === null ? CLASSES_ELEMENTAIRE[0] : r;
  }
  if (CLASSES_ELEMENTAIRE.includes(currentClass)) return inSeq(CLASSES_ELEMENTAIRE);
  if (CLASSES_COLLEGE.includes(currentClass)) return inSeq(CLASSES_COLLEGE);
  const lyceeMatch = CLASSES_LYCEE.find((c) => c === currentClass);
  if (lyceeMatch) {
    const serie = currentClass.split(" ").pop(); // SM / SE / SS
    const track = [`11ème année ${serie}`, `12ème année ${serie}`, `Terminale ${serie}`];
    const idx = track.indexOf(currentClass);
    return idx + 1 < track.length ? track[idx + 1] : null;
  }
  return null;
}

const EXPENSE_CATEGORIES = ["Salaires", "Factures", "Fournitures", "Crédits", "Autres"];
const PASS_THRESHOLD = 10; // moyenne sur 20 pour être admis
const ORANGE_MONEY_NUMBER = "+224 610185122";
// Système d'abonnement à 3 paliers, basé sur les FONCTIONNALITÉS (pas le nombre d'élèves).
const SUBSCRIPTION_TIERS = [
  {
    key: "essentiel",
    name: "Essentiel",
    price: 150000,
    period: "month",
    desc: "Le strict nécessaire pour digitaliser l'école : élèves, scolarité, notes, présences.",
  },
  {
    key: "avance",
    name: "Avancé",
    price: 250000,
    period: "month",
    desc: "+ Bulletins PDF, communication (annonces, calendrier, remarques), devoirs, mode hors-ligne, rôle Directeur, Assistant IA, cahier de conduite.",
  },
  {
    key: "complet",
    name: "Complet",
    price: 500000,
    period: "year",
    desc: "+ Services annexes, bilan financier annuel, passage de classe automatique, dossiers administratifs élèves, statuts boursier/protégé.",
  },
];
// Affiche le prix avec la bonne période — "/mois" ou "/an" selon le palier.
function tierPriceLabel(tier, t) {
  return `${fmt(tier.price, "GNF")}${tier.period === "year" ? t("per_year_short") : t("per_month_short")}`;
}
const TIER_RANK = { essentiel: 1, avance: 2, complet: 3 };
// Une école en essai gratuit a accès à tout, pour montrer la pleine valeur avant de choisir.
// Après l'essai, l'accès suit strictement le palier payé.
function hasTierAccess(school, requiredTierKey) {
  if (!school) return false;
  if (!school.subscribed) return true; // essai gratuit = accès complet, limité par la durée (7 jours), pas par palier
  const currentRank = TIER_RANK[school.subscription_tier] || TIER_RANK.complet; // repli sûr : ne jamais couper un ancien abonné
  return currentRank >= TIER_RANK[requiredTierKey];
}
// Palier minimum requis pour chaque écran — tout ce qui n'est pas listé ici fait partie du
// palier "Essentiel" de base (élèves, scolarité standard, notes, présences, export Excel).
const TAB_TIER_REQUIREMENT = {
  annualbalance: "complet",
  promotion: "complet",
  reenrollment: "complet",
  services: "complet",
  dossiers: "complet",
  discipline: "avance",
  announcements: "avance",
  calendar: "avance",
  remarks: "avance",
  lessons: "avance",
  lessonai: "avance",
  revision: "avance",
};
const canAccessTab = (school, tabKey) => !TAB_TIER_REQUIREMENT[tabKey] || hasTierAccess(school, TAB_TIER_REQUIREMENT[tabKey]);

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
// À utiliser sur tout lien "tel:"/"mailto:" pour que la confirmation "quitter le site ?"
// ne se déclenche jamais lors d'un appel ou d'un email — ce n'est pas une vraie sortie.
const skipUnloadGuard = () => {
  window.__ecSkipUnloadGuard = true;
  setTimeout(() => { window.__ecSkipUnloadGuard = false; }, 1500);
};
// Une année scolaire (format "2025-2026") se compare simplement comme du texte, dans l'ordre —
// utile pour distinguer une vraie archive (déjà passée) d'une année préparée à l'avance (future).
function yearStatusKey(y, currentYear) {
  if (y === currentYear) return "active";
  return y < currentYear ? "archive" : "upcoming";
}
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
// Moyenne annuelle simple d'un élève (primaire ou secondaire) — pour aider à décider s'il
// redouble ou passe, directement visible sans devoir ouvrir un autre écran.
function computeStudentQuickAverage(student, grades, gradesSecondaire) {
  const isSecondaireLevel = student.level === "Collège" || student.level === "Lycée";
  if (isSecondaireLevel) {
    const rows = gradesSecondaire.filter((g) => g.student_id === student.id && g.class_name === student.class_name);
    const scores = rows
      .map((g) => {
        const vals = [g.ecrit, g.oral].filter((v) => v !== null && v !== undefined);
        return vals.length > 0 ? vals.reduce((a, b) => a + Number(b), 0) / vals.length : null;
      })
      .filter((v) => v !== null);
    if (scores.length === 0) return null;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }
  const rows = grades.filter((g) => g.student_id === student.id && g.class_name === student.class_name && g.score !== null && g.score !== undefined);
  if (rows.length === 0) return null;
  return rows.reduce((sum, g) => sum + Number(g.score), 0) / rows.length;
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
    fondateur: t("role_fondateur"), directeur: t("role_directeur"), comptable: t("role_comptable"), enseignant: t("role_enseignant"), parent: t("role_parent"), personnel: t("role_personnel"),
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
      const { error: profileError } = await supabase.from("profiles").insert({ user_id: userId, school_id: schoolId, role, full_name: fullName.trim(), phone: phone.trim() || null, class_name: role === "enseignant" && resolvedLevelType === "secondaire" ? className.trim() || null : null, fonction: role === "personnel" ? fonction.trim() || null : null, active: role === "comptable" || role === "directeur" ? false : true });
      if (profileError) throw profileError;
      if (role === "enseignant" && resolvedLevelType === "secondaire" && subject.trim() && className.trim()) {
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
              ) : resolvedLevelType === "primaire" ? (
                <p className="text-sm" style={{ color: COLORS.inkSoft }}>{t("class_assigned_by_founder")}</p>
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
// ---------- Filet de sécurité : si quelque chose plante, on l'affiche clairement au lieu
// de laisser l'écran devenir blanc en silence. Permet de voir enfin le vrai message d'erreur.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    this.setState({ error, info });
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", background: "#F7F4EE", padding: 20, fontFamily: "sans-serif" }}>
          <h2 style={{ color: "#B23B32", fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Une erreur est survenue</h2>
          <p style={{ color: "#20304A", fontSize: 14, marginBottom: 10 }}>
            Envoie une capture de ce message à ton assistant :
          </p>
          <pre style={{ background: "#fff", border: "1px solid #DCD6C8", borderRadius: 10, padding: 12, fontSize: 12, color: "#20304A", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {String(this.state.error?.message || this.state.error)}
            {this.state.info?.componentStack ? "\n\n" + this.state.info.componentStack.split("\n").slice(0, 6).join("\n") : ""}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 16, background: "#20304A", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 600 }}
          >
            Recharger l'application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(undefined);

  const loadProfile = useCallback(async (userId) => {
    const { data } = await supabase.from("profiles").select("*, schools(name, code, currency, current_year, level_type, subscribed, subscription_tier, trial_started_at, momo_number, momo_provider, logo_url, emblem_url, card_theme, director_title, ire, dpe, dsee, ville, latitude, longitude, rayon_metres)").eq("user_id", userId).maybeSingle();
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
    <ErrorBoundary>
      <LanguageProvider>
        {!session ? (
          <AuthScreen />
        ) : !profile ? (
          <OnboardingScreen userId={session.user.id} onDone={() => loadProfile(session.user.id)} onBack={() => supabase.auth.signOut()} />
        ) : (
          <MainApp key={session.user.id} profile={profile} refreshProfile={() => loadProfile(session.user.id)} userEmail={session?.user?.email} />
        )}
      </LanguageProvider>
    </ErrorBoundary>
  );
}

function MainApp({ profile, refreshProfile, userEmail }) {
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
  const [tab, setTab] = useState(role === "comptable" ? "students" : role === "enseignant" ? "grades" : role === "personnel" ? "mysalary" : role === "directeur" ? "grades" : "dashboard");
  const [platformBroadcasts, setPlatformBroadcasts] = useState([]);

  // ---------- Petit signal rouge : quelque chose de nouveau (annonce ou événement calendrier)
  // que la personne n'a pas encore vu depuis sa dernière visite de ces écrans. ----------
  const lastSeenKey = (kind) => `ec_last_seen_${kind}_${schoolId}_${profile.user_id}`;
  const [lastSeenAnnouncements, setLastSeenAnnouncements] = useState(() => { try { return localStorage.getItem(lastSeenKey("announcements")) || ""; } catch (e) { return ""; } });
  const [lastSeenCalendar, setLastSeenCalendar] = useState(() => { try { return localStorage.getItem(lastSeenKey("calendar")) || ""; } catch (e) { return ""; } });
  // Messages diffusés par l'administrateur : chacun peut être refermé individuellement,
  // une fois pour toutes (pas propre à une école, donc pas de schoolId dans la clé).
  const [dismissedBroadcasts, setDismissedBroadcasts] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`ec_dismissed_broadcasts_${profile.user_id}`) || "[]"); } catch (e) { return []; }
  });
  const dismissBroadcast = (id) => {
    const next = [...dismissedBroadcasts, id];
    setDismissedBroadcasts(next);
    try { localStorage.setItem(`ec_dismissed_broadcasts_${profile.user_id}`, JSON.stringify(next)); } catch (e) {}
  };
  const activeBroadcast = platformBroadcasts.find((b) => !dismissedBroadcasts.includes(b.id));
  const markSeen = (kind) => {
    const now = new Date().toISOString();
    try { localStorage.setItem(lastSeenKey(kind), now); } catch (e) {}
    if (kind === "announcements") setLastSeenAnnouncements(now);
    if (kind === "calendar") setLastSeenCalendar(now);
  };
  useEffect(() => {
    if (tab === "announcements") markSeen("announcements");
    if (tab === "calendar") markSeen("calendar");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);
  const [isOffline, setIsOffline] = useState(typeof navigator !== "undefined" ? !navigator.onLine : false);
  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);
  // ---------- Mémoire locale hors-ligne ----------
  // Clé unique par école, pour ne jamais mélanger les données de deux écoles sur le même téléphone.
  const OFFLINE_CACHE_KEY = `ec_offline_cache_${schoolId}`;
  const loadOfflineCache = () => {
    try {
      const raw = localStorage.getItem(OFFLINE_CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  };
  const cachedData = useMemo(() => loadOfflineCache(), []);
  const saveOfflineCache = (data) => {
    try {
      localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify({ ...data, _savedAt: Date.now() }));
    } catch (e) {
      // Stockage plein ou indisponible : on continue sans bloquer l'utilisateur.
    }
  };

  // ---------- File d'attente hors-ligne (Notes + Présences) ----------
  // Quand une saisie échoue à cause du réseau, on la garde en mémoire sur le téléphone.
  // Dès que la connexion revient, chaque action en attente est renvoyée automatiquement,
  // dans l'ordre où elle a été faite.
  const OFFLINE_QUEUE_KEY = `ec_offline_queue_${schoolId}`;
  const loadOfflineQueue = () => {
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };
  const [offlineQueue, setOfflineQueue] = useState(loadOfflineQueue);
  const [syncingQueue, setSyncingQueue] = useState(false);
  const persistQueue = (queue) => {
    try { localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue)); } catch (e) {}
  };
  const enqueueOfflineAction = (action) => {
    setOfflineQueue((prev) => {
      const next = [...prev, { operation: "upsert", ...action, id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}` }];
      persistQueue(next);
      return next;
    });
  };
  const isNetworkFailure = (err) => {
    if (!err) return false;
    if (typeof navigator !== "undefined" && !navigator.onLine) return true;
    const msg = (err.message || String(err)).toLowerCase();
    return msg.includes("failed to fetch") || msg.includes("network") || msg.includes("load failed");
  };

  const [students, setStudents] = useState(cachedData?.students || []);
  const [payments, setPayments] = useState(cachedData?.payments || []);
  const [lessons, setLessons] = useState(cachedData?.lessons || []);
  const [homework, setHomework] = useState(cachedData?.homework || []);
  const [announcements, setAnnouncements] = useState(cachedData?.announcements || []);
  const [parents, setParents] = useState(cachedData?.parents || []);
  const [expenses, setExpenses] = useState(cachedData?.expenses || []);
  const [grades, setGrades] = useState(cachedData?.grades || []);
  const [releases, setReleases] = useState(cachedData?.releases || []);
  const [staffProfiles, setStaffProfiles] = useState(cachedData?.staffProfiles || []);
  const [staffPayments, setStaffPayments] = useState(cachedData?.staffPayments || []);
  const [remarks, setRemarks] = useState(cachedData?.remarks || []);
  const [attendance, setAttendance] = useState(cachedData?.attendance || []);
  const [teacherAssignments, setTeacherAssignments] = useState(cachedData?.teacherAssignments || []);
  const [classHeadTeachers, setClassHeadTeachers] = useState(cachedData?.classHeadTeachers || []);
  const [subjectsSecondaire, setSubjectsSecondaire] = useState(cachedData?.subjectsSecondaire || []);
  const [gradesSecondaire, setGradesSecondaire] = useState(cachedData?.gradesSecondaire || []);
  const [tuitionFees, setTuitionFees] = useState(cachedData?.tuitionFees || []);
  const [services, setServices] = useState(cachedData?.services || []);
  const [serviceSubscriptions, setServiceSubscriptions] = useState(cachedData?.serviceSubscriptions || []);
  const [servicePayments, setServicePayments] = useState(cachedData?.servicePayments || []);
  const [bulletinAppreciations, setBulletinAppreciations] = useState(cachedData?.bulletinAppreciations || []);
  const [promotionEntries, setPromotionEntries] = useState(cachedData?.promotionEntries || []);
  const [calendarEvents, setCalendarEvents] = useState(cachedData?.calendarEvents || []);
  const [disciplineNotes, setDisciplineNotes] = useState(cachedData?.disciplineNotes || []);
  const [paymentDeclarations, setPaymentDeclarations] = useState(cachedData?.paymentDeclarations || []);
  const [timetableSlots, setTimetableSlots] = useState(cachedData?.timetableSlots || []);
  const [fileMovements, setFileMovements] = useState(cachedData?.fileMovements || []);
  const [weeklyJournalEntries, setWeeklyJournalEntries] = useState(cachedData?.weeklyJournalEntries || []);
  const [directorNotebookEntries, setDirectorNotebookEntries] = useState(cachedData?.directorNotebookEntries || []);
  const [schoolEquipment, setSchoolEquipment] = useState(cachedData?.schoolEquipment || []);
  const [presencePersonnel, setPresencePersonnel] = useState(cachedData?.presencePersonnel || []);
  const [offlineDataAge, setOfflineDataAge] = useState(cachedData?._savedAt || null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [linkingStudent, setLinkingStudent] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [toast, setToast] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  // Journal des actions hors-ligne refusées par le serveur au moment du renvoi — contrairement
  // au petit message qui disparaît vite, celui-ci reste affiché jusqu'à ce qu'on le referme,
  // pour ne jamais rater une information importante sur une donnée qui n'est pas passée.
  const [syncIssues, setSyncIssues] = useState([]);
  const logSyncIssue = (table, reason) => {
    setSyncIssues((prev) => [...prev, { id: genCode(), table, reason, time: new Date().toLocaleString("fr-FR") }]);
  };

  const loadAll = useCallback(async () => {
    try {
      const [s, p, l, h, a, par, exp, gr, rel, staff, sp, rem, att, ta, cht, subj, grs, tf, svc, svcSub, svcPay, appr, promo, cal, disc, pdecl, tt, fmov, wj, dnb, seq, presPers] = await Promise.all([
        supabase.from("students").select("*").order("full_name"),
        supabase.from("payments").select("*").order("date", { ascending: false }),
        supabase.from("lessons").select("*").order("created_at", { ascending: false }),
        supabase.from("homework_status").select("*"),
        supabase.from("announcements").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("user_id, full_name, phone, active, hidden").eq("role", "parent"),
        supabase.from("expenses").select("*").order("date", { ascending: false }),
        supabase.from("grades").select("*"),
        supabase.from("grade_releases").select("*"),
        supabase.from("profiles").select("user_id, full_name, role, class_name, fonction, phone, active, hidden, signature_url, avatar_url, civilite").neq("role", "parent"),
        supabase.from("staff_payments").select("*"),
        supabase.from("remarks").select("*").order("created_at", { ascending: false }),
        supabase.from("attendance").select("*"),
        supabase.from("teacher_assignments").select("*"),
        supabase.from("class_head_teachers").select("*"),
        supabase.from("subjects_secondaire").select("*"),
        supabase.from("grades_secondaire").select("*"),
        supabase.from("tuition_fees").select("*"),
        supabase.from("services").select("*"),
        supabase.from("service_subscriptions").select("*"),
        supabase.from("service_payments").select("*").order("date", { ascending: false }),
        supabase.from("bulletin_appreciations").select("*"),
        supabase.from("promotion_entries").select("*"),
        supabase.from("calendar_events").select("*").order("event_date", { ascending: true }),
        supabase.from("discipline_notes").select("*").order("note_date", { ascending: false }),
        supabase.from("payment_declarations").select("*").order("created_at", { ascending: false }),
        supabase.from("timetable_slots").select("*"),
        supabase.from("student_file_movements").select("*").order("movement_date", { ascending: false }),
        supabase.from("weekly_journal_entries").select("*").order("week_start_date", { ascending: false }),
        supabase.from("director_notebook_entries").select("*").order("entry_date", { ascending: false }),
        supabase.from("school_equipment").select("*").order("created_at", { ascending: false }),
        supabase.from("presence_personnel").select("*").order("date", { ascending: false }),
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
      if (tf.data) setTuitionFees(tf.data);
      if (svc.data) setServices(svc.data);
      if (svcSub.data) setServiceSubscriptions(svcSub.data);
      if (svcPay.data) setServicePayments(svcPay.data);
      if (appr.data) setBulletinAppreciations(appr.data);
      if (promo.data) setPromotionEntries(promo.data);
      if (cal.data) setCalendarEvents(cal.data);
      if (disc.data) setDisciplineNotes(disc.data);
      if (pdecl.data) setPaymentDeclarations(pdecl.data);
      if (tt.data) setTimetableSlots(tt.data);
      if (fmov.data) setFileMovements(fmov.data);
      if (wj.data) setWeeklyJournalEntries(wj.data);
      if (dnb.data) setDirectorNotebookEntries(dnb.data);
      if (seq.data) setSchoolEquipment(seq.data);
      if (presPers.data) setPresencePersonnel(presPers.data);

      // Tout s'est bien chargé : on sauvegarde une copie locale pour la consultation hors-ligne.
      const allSucceeded = [s, p, l, h, a, par, exp, gr, rel, staff, sp, rem, att, ta, cht, subj, grs, tf, svc, svcSub, svcPay, appr, promo, cal, disc, pdecl, tt, fmov, wj, dnb, seq].every((r) => r.data);
      if (allSucceeded) {
        const snapshot = {
          students: s.data, payments: p.data, lessons: l.data, homework: h.data, announcements: a.data,
          parents: par.data, expenses: exp.data, grades: gr.data, releases: rel.data, staffProfiles: staff.data,
          staffPayments: sp.data, remarks: rem.data, attendance: att.data, teacherAssignments: ta.data,
          classHeadTeachers: cht.data, subjectsSecondaire: subj.data, gradesSecondaire: grs.data, tuitionFees: tf.data,
          services: svc.data, serviceSubscriptions: svcSub.data, servicePayments: svcPay.data, bulletinAppreciations: appr.data,
          promotionEntries: promo.data, calendarEvents: cal.data, disciplineNotes: disc.data, paymentDeclarations: pdecl.data,
          timetableSlots: tt.data, fileMovements: fmov.data, weeklyJournalEntries: wj.data,
          directorNotebookEntries: dnb.data, schoolEquipment: seq.data,
        };
        saveOfflineCache(snapshot);
        setOfflineDataAge(Date.now());
      }
    } catch (e) {
      // Coupure réseau ou autre échec total : on garde silencieusement les données déjà
      // affichées à l'écran plutôt que de planter — l'utilisateur voit toujours ce qu'il avait.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Messages diffusés par l'administrateur à toute la plateforme — pas propres à une école,
  // donc chargés à part, indépendamment du reste des données de l'école.
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("platform_broadcasts").select("*").order("created_at", { ascending: false }).limit(5);
      if (data) setPlatformBroadcasts(data);
    })();
  }, []);

  // Demande confirmation avant de fermer/quitter l'application, pour éviter de perdre
  // une saisie en cours par un geste accidentel. Le texte du message est géré par le
  // téléphone lui-même (impossible à personnaliser), mais le principe "Oui/Non" s'applique.
  // Désactivée un court instant pour les liens "tel:"/"mailto:" (appeler, écrire un email) —
  // ce ne sont pas de vraies sorties de l'application, pas besoin de confirmer.
  useEffect(() => {
    const handler = (e) => {
      if (window.__ecSkipUnloadGuard) return;
      e.preventDefault();
      e.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // Au tout premier chargement, s'il restait des actions en attente d'une session hors-ligne
  // précédente (app fermée avant le retour du réseau), on essaie de les envoyer tout de suite.
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.onLine && loadOfflineQueue().length > 0) {
      processOfflineQueue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processOfflineQueue = useCallback(async () => {
    const queue = loadOfflineQueue();
    if (queue.length === 0) return;
    setSyncingQueue(true);
    const remaining = [];
    // Si un élève a été créé hors-ligne (identifiant provisoire), puis qu'un paiement/service/note
    // a été enregistré pour lui dans la même session, on doit remplacer cet identifiant provisoire
    // par le vrai identifiant définitif dès que l'élève est synchronisé — sinon ces actions suivantes
    // pointent vers un élève qui n'existe plus et échouent silencieusement.
    const studentIdMap = {};
    for (const rawAction of queue) {
      const action = rawAction.payload?.student_id && studentIdMap[rawAction.payload.student_id]
        ? { ...rawAction, payload: { ...rawAction.payload, student_id: studentIdMap[rawAction.payload.student_id] } }
        : rawAction;
      try {
        const { data, error } = action.operation === "insert"
          ? await supabase.from(action.table).insert(action.payload).select()
          : await supabase.from(action.table).upsert(action.payload, { onConflict: action.conflict }).select();
        if (error) {
          // Le serveur a refusé cette action de façon définitive (ce n'est pas une coupure
          // réseau, puisqu'on a bien reçu une réponse) — par exemple limite d'essai atteinte
          // entre-temps, ou droit retiré. On retire la fiche provisoire au lieu de réessayer
          // indéfiniment une action qui ne passera jamais, et on prévient clairement — avec un
          // vrai journal qui reste affiché, pas juste un message qui disparaît vite.
          const isTrialLimit = error.message?.includes("LIMITE_ESSAI_ATTEINTE");
          if (action.localId && ["students", "payments", "expenses", "announcements", "service_payments"].includes(action.table)) {
            const removeLocal = (setter) => setter((prev) => prev.filter((x) => x.id !== action.localId));
            if (action.table === "students") removeLocal(setStudents);
            else if (action.table === "payments") removeLocal(setPayments);
            else if (action.table === "expenses") removeLocal(setExpenses);
            else if (action.table === "announcements") removeLocal(setAnnouncements);
            else if (action.table === "service_payments") removeLocal(setServicePayments);
            logSyncIssue(action.table, error.message || "Erreur inconnue");
            notify(isTrialLimit ? t("student_offline_limit_failed") : t("offline_action_rejected"));
            continue;
          }
          // Notes et présences (mises à jour, pas de fiche à retirer) : on prévient quand
          // même clairement plutôt que de réessayer indéfiniment une action bloquée.
          if (isTrialLimit && ["grades", "grades_secondaire", "attendance"].includes(action.table)) {
            logSyncIssue(action.table, error.message || "Erreur inconnue");
            notify(t("offline_action_rejected_trial"));
            continue;
          }
          remaining.push(rawAction);
          continue;
        }
        if (!data) { remaining.push(rawAction); continue; }
        if (action.table === "students" && rawAction.localId && data[0]?.id) {
          const oldId = rawAction.localId;
          const newId = data[0].id;
          studentIdMap[oldId] = newId;
          // On corrige aussi tout ce qui, déjà affiché à l'écran, pointait encore vers
          // l'ancien identifiant provisoire de cet élève (notes/présences saisies avant lui).
          const remap = (setter) => setter((prev) => prev.map((x) => (x.student_id === oldId ? { ...x, student_id: newId } : x)));
          remap(setGrades);
          remap(setGradesSecondaire);
          remap(setAttendance);
          remap(setPayments);
          remap(setServicePayments);
        }
        if (action.table === "grades") {
          setGrades((prev) => {
            const idx = prev.findIndex((g) => g.student_id === action.payload.student_id && g.subject === action.payload.subject && g.term === action.payload.term && g.school_year === action.payload.school_year);
            if (idx >= 0) return prev.map((g, i) => (i === idx ? data[0] : g));
            return [...prev, data[0]];
          });
        } else if (action.table === "grades_secondaire") {
          setGradesSecondaire((prev) => {
            const idx = prev.findIndex((g) => g.student_id === action.payload.student_id && g.subject === action.payload.subject && g.month === action.payload.month && g.school_year === action.payload.school_year);
            if (idx >= 0) return prev.map((g, i) => (i === idx ? data[0] : g));
            return [...prev, data[0]];
          });
        } else if (action.table === "attendance") {
          setAttendance((prev) => {
            const idx = prev.findIndex((a) => a.student_id === action.payload.student_id && a.date === action.payload.date && a.session === action.payload.session && a.school_year === action.payload.school_year);
            if (idx >= 0) return prev.map((a, i) => (i === idx ? data[0] : a));
            return [...prev, data[0]];
          });
        } else if (action.table === "announcements") {
          setAnnouncements((prev) => [data[0], ...prev.filter((x) => x.id !== action.localId)]);
        } else if (action.table === "expenses") {
          setExpenses((prev) => [data[0], ...prev.filter((x) => x.id !== action.localId)]);
        } else if (action.table === "payments") {
          setPayments((prev) => [data[0], ...prev.filter((x) => x.id !== action.localId)]);
        } else if (action.table === "service_payments") {
          setServicePayments((prev) => [data[0], ...prev.filter((x) => x.id !== action.localId)]);
        } else if (action.table === "students") {
          setStudents((prev) => prev.map((x) => (x.id === action.localId ? data[0] : x)));
        }
      } catch (e) {
        remaining.push(action);
      }
    }
    persistQueue(remaining);
    setOfflineQueue(remaining);
    setSyncingQueue(false);
    if (remaining.length === 0 && queue.length > 0) notify(t("sync_success"));
  }, []);

  // Dès que la connexion revient après une coupure, on renvoie d'abord ce qui était en attente,
  // puis on recharge tout en silence, sans que l'utilisateur ait besoin de rafraîchir la page.
  useEffect(() => {
    const onReconnect = async () => {
      await processOfflineQueue();
      await loadAll();
    };
    window.addEventListener("online", onReconnect);
    return () => window.removeEventListener("online", onReconnect);
  }, [loadAll, processOfflineQueue]);

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
    const payload = { ...s, school_id: schoolId, school_year: currentYear };
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      const localId = `local_${Date.now()}`;
      setStudents((p) => [...p, { ...payload, id: localId, _pendingSync: true }]);
      enqueueOfflineAction({ table: "students", payload, operation: "insert", localId });
      notify(t("saved_offline_pending"));
      return "ok";
    }
    const { data, error } = await supabase.from("students").insert(payload).select();
    if (error) {
      if (error.message?.includes("LIMITE_ESSAI_ATTEINTE")) { setShowUpgrade(true); return "limit"; }
      if (isNetworkFailure(error)) {
        const localId = `local_${Date.now()}`;
        setStudents((p) => [...p, { ...payload, id: localId, _pendingSync: true }]);
        enqueueOfflineAction({ table: "students", payload, operation: "insert", localId });
        notify(t("saved_offline_pending"));
        return "ok";
      }
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

  // Changer son propre email — Supabase envoie un lien de confirmation à la nouvelle
  // adresse avant que le changement ne devienne vraiment effectif (sécurité normale).
  const updateMyEmail = async (newEmail) => {
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    return error;
  };

  // Désactiver son propre compte (jamais une suppression définitive, pour ne jamais
  // perdre l'historique des notes/paiements/décisions liés à ce compte).
  const deactivateSelf = async () => {
    await supabase.from("profiles").update({ active: false }).eq("user_id", profile.user_id);
    await supabase.auth.signOut();
  };

  // Suppression complète et définitive — réservée aux Parents (sûr : ça ne touche à
  // aucune note, paiement ou décision liée à l'école, seulement leur propre compte).
  const deleteMyParentAccount = async () => {
    const { error } = await supabase.rpc("delete_my_parent_account");
    if (!error) await supabase.auth.signOut();
    return error;
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
  const addPayment = async (pay) => {
    const payload = { ...pay, school_id: schoolId, school_year: currentYear };
    const offlineFallback = () => {
      const localId = `local_${Date.now()}`;
      setPayments((p) => [{ ...payload, id: localId, date: payload.date || new Date().toISOString().slice(0, 10), _pendingSync: true }, ...p]);
      enqueueOfflineAction({ table: "payments", payload, operation: "insert", localId });
      notify(t("saved_offline_pending"));
    };
    if (typeof navigator !== "undefined" && !navigator.onLine) { offlineFallback(); return; }
    try {
      const { data, error } = await supabase.from("payments").insert(payload).select();
      if (error?.message?.includes("LIMITE_ESSAI_ATTEINTE")) { setShowUpgrade(true); return; }
      if (data) { setPayments((p) => [data[0], ...p]); notify(t("success_saved")); }
    } catch (e) {
      if (isNetworkFailure(e)) offlineFallback();
      else throw e;
    }
  };
  const addLesson = async (l) => {
    const { data, error } = await supabase.from("lessons").insert({ ...l, school_id: schoolId, teacher_id: profile.user_id, school_year: currentYear }).select();
    if (error?.message?.includes("LIMITE_ESSAI_ATTEINTE")) { setShowUpgrade(true); return; }
    if (data) { setLessons((p) => [data[0], ...p]); notify(t("success_saved")); }
  };
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
  const addAnnouncement = async (a) => {
    const payload = { ...a, school_id: schoolId, author_id: profile.user_id };
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      const localId = `local_${Date.now()}`;
      setAnnouncements((p) => [{ ...payload, id: localId, created_at: new Date().toISOString(), _pendingSync: true }, ...p]);
      enqueueOfflineAction({ table: "announcements", payload, operation: "insert", localId });
      notify(t("saved_offline_pending"));
      return;
    }
    try {
      const { data, error } = await supabase.from("announcements").insert(payload).select();
      if (error?.message?.includes("LIMITE_ESSAI_ATTEINTE")) { setShowUpgrade(true); return; }
      if (data) { setAnnouncements((p) => [data[0], ...p]); notify(t("success_saved")); }
    } catch (e) {
      if (isNetworkFailure(e)) {
        const localId = `local_${Date.now()}`;
        setAnnouncements((p) => [{ ...payload, id: localId, created_at: new Date().toISOString(), _pendingSync: true }, ...p]);
        enqueueOfflineAction({ table: "announcements", payload, operation: "insert", localId });
        notify(t("saved_offline_pending"));
      } else throw e;
    }
  };
  const deleteAnnouncement = async (id) => { await supabase.from("announcements").delete().eq("id", id); setAnnouncements((p) => p.filter((a) => a.id !== id)); };
  const addExpense = async (e) => {
    const payload = { ...e, school_id: schoolId, created_by: profile.user_id, school_year: currentYear };
    const offlineFallback = () => {
      const localId = `local_${Date.now()}`;
      setExpenses((p) => [{ ...payload, id: localId, date: payload.date || new Date().toISOString().slice(0, 10), _pendingSync: true }, ...p]);
      enqueueOfflineAction({ table: "expenses", payload, operation: "insert", localId });
      notify(t("saved_offline_pending"));
    };
    if (typeof navigator !== "undefined" && !navigator.onLine) { offlineFallback(); return null; }
    try {
      const { data, error } = await supabase.from("expenses").insert(payload).select();
      if (error?.message?.includes("LIMITE_ESSAI_ATTEINTE")) { setShowUpgrade(true); return null; }
      if (data) { setExpenses((p) => [data[0], ...p]); notify(t("success_saved")); }
      return error;
    } catch (err) {
      if (isNetworkFailure(err)) { offlineFallback(); return null; }
      throw err;
    }
  };
  const deleteExpense = async (id) => { await supabase.from("expenses").delete().eq("id", id); setExpenses((p) => p.filter((e) => e.id !== id)); };
  const saveTuitionFee = async (classNameArg, amount, newStudentAmount) => {
    const { data, error } = await supabase
      .from("tuition_fees")
      .upsert({ school_id: schoolId, class_name: classNameArg, amount, new_student_amount: newStudentAmount, school_year: currentYear }, { onConflict: "school_id,class_name,school_year" })
      .select();
    if (data && data.length > 0) {
      setTuitionFees((prev) => {
        const idx = prev.findIndex((f) => f.class_name === classNameArg && f.school_year === currentYear);
        if (idx >= 0) return prev.map((f, i) => (i === idx ? data[0] : f));
        return [...prev, data[0]];
      });
      notify(t("success_saved"));
    }
    return error;
  };

  // ---------- Services annexes (transport, cantine, informatique, librairie...) ----------
  const saveService = async (name, defaultAmount, existingId) => {
    const payload = { school_id: schoolId, name: name.trim(), default_amount: defaultAmount, school_year: currentYear };
    const { data, error } = existingId
      ? await supabase.from("services").update(payload).eq("id", existingId).select()
      : await supabase.from("services").insert(payload).select();
    if (data && data.length > 0) {
      setServices((prev) => (existingId ? prev.map((s) => (s.id === existingId ? data[0] : s)) : [...prev, data[0]]));
      notify(t("success_saved"));
    }
    return error;
  };
  const deleteService = async (id) => {
    await supabase.from("services").delete().eq("id", id);
    setServices((prev) => prev.filter((s) => s.id !== id));
  };
  const enrollStudentInService = async (serviceId, studentId, amountDue) => {
    const { data, error } = await supabase
      .from("service_subscriptions")
      .upsert({ school_id: schoolId, service_id: serviceId, student_id: studentId, amount_due: amountDue, school_year: currentYear }, { onConflict: "service_id,student_id,school_year" })
      .select();
    if (error?.message?.includes("LIMITE_ESSAI_ATTEINTE")) { setShowUpgrade(true); return error; }
    if (data && data.length > 0) {
      setServiceSubscriptions((prev) => {
        const idx = prev.findIndex((x) => x.service_id === serviceId && x.student_id === studentId && x.school_year === currentYear);
        if (idx >= 0) return prev.map((x, i) => (i === idx ? data[0] : x));
        return [...prev, data[0]];
      });
      notify(t("success_saved"));
    }
    return error;
  };
  const unenrollStudentFromService = async (subscriptionId) => {
    await supabase.from("service_subscriptions").delete().eq("id", subscriptionId);
    setServiceSubscriptions((prev) => prev.filter((x) => x.id !== subscriptionId));
  };
  const addServicePayment = async (serviceId, studentId, amount) => {
    const payload = { school_id: schoolId, service_id: serviceId, student_id: studentId, amount, school_year: currentYear, recorded_by: profile.user_id };
    try {
      const { data, error } = await supabase.from("service_payments").insert(payload).select();
      if (error?.message?.includes("LIMITE_ESSAI_ATTEINTE")) { setShowUpgrade(true); return; }
      if (data) { setServicePayments((p) => [data[0], ...p]); notify(t("success_saved")); }
    } catch (e) {
      if (isNetworkFailure(e)) {
        const localId = `local_${Date.now()}`;
        setServicePayments((p) => [{ ...payload, id: localId, date: new Date().toISOString().slice(0, 10), _pendingSync: true }, ...p]);
        enqueueOfflineAction({ table: "service_payments", payload, operation: "insert", localId });
        notify(t("saved_offline_pending"));
      } else throw e;
    }
  };

  const saveAppreciation = async (studentId, term, text) => {
    const { data, error } = await supabase
      .from("bulletin_appreciations")
      .upsert({ school_id: schoolId, student_id: studentId, term, school_year: currentYear, appreciation: text, updated_by: profile.user_id }, { onConflict: "student_id,term,school_year" })
      .select();
    if (data && data.length > 0) {
      setBulletinAppreciations((prev) => {
        const idx = prev.findIndex((x) => x.student_id === studentId && x.term === term && x.school_year === currentYear);
        if (idx >= 0) return prev.map((x, i) => (i === idx ? data[0] : x));
        return [...prev, data[0]];
      });
      notify(t("success_saved"));
    }
    return error;
  };

  // ---------- Passage à la classe supérieure (liste d'attente + réinscriptions) ----------
  const generatePromotionList = async (targetYear) => {
    const currentStudents = students.filter((s) => s.school_year === currentYear);
    const rows = currentStudents.map((s) => {
      const nextClass = getNextClass(s.class_name);
      return {
        school_id: schoolId,
        source_student_id: s.id,
        target_school_year: targetYear,
        target_class_name: nextClass || null,
        target_level: nextClass ? s.level : null,
        is_repeating: false,
        status: "pending",
      };
    });
    const { error } = await supabase
      .from("promotion_entries")
      .upsert(rows, { onConflict: "source_student_id,target_school_year", ignoreDuplicates: true });
    if (error) return error;
    // On recharge la liste complète pour cette année cible plutôt que de se fier à la réponse
    // de l'upsert (qui n'inclut pas toujours les lignes déjà existantes, ignorées en silence).
    const { data: freshList } = await supabase.from("promotion_entries").select("*").eq("target_school_year", targetYear);
    if (freshList) {
      setPromotionEntries((prev) => [...prev.filter((p) => p.target_school_year !== targetYear), ...freshList]);
      notify(t("success_saved"));
    }
    return null;
  };

  const updatePromotionEntry = async (entryId, changes) => {
    const { data, error } = await supabase.from("promotion_entries").update(changes).eq("id", entryId).select().maybeSingle();
    if (data) setPromotionEntries((prev) => prev.map((p) => (p.id === entryId ? data : p)));
    return error;
  };

  const enrollFromPromotion = async (entry, sourceStudent, formData) => {
    const payload = {
      school_id: schoolId,
      school_year: entry.target_school_year,
      full_name: sourceStudent.full_name,
      level: formData.level,
      class_name: formData.className,
      gender: sourceStudent.gender,
      parent_id: sourceStudent.parent_id,
      parent_phone: sourceStudent.parent_phone,
      total_due: formData.totalDue,
    };
    const { data: newStudent, error: studentErr } = await supabase.from("students").insert(payload).select().maybeSingle();
    if (studentErr) {
      if (studentErr.message?.includes("LIMITE_ESSAI_ATTEINTE")) { setShowUpgrade(true); return "limit"; }
      return studentErr.message;
    }
    setStudents((prev) => [...prev, newStudent]);

    if (formData.paymentAmount && parseFloat(formData.paymentAmount) > 0) {
      const { data: payment } = await supabase
        .from("payments")
        .insert({ school_id: schoolId, school_year: entry.target_school_year, student_id: newStudent.id, amount: parseFloat(formData.paymentAmount), date: new Date().toISOString().slice(0, 10) })
        .select()
        .maybeSingle();
      if (payment) setPayments((prev) => [payment, ...prev]);
    }

    const { data: updatedEntry } = await supabase
      .from("promotion_entries")
      .update({ status: "enrolled", enrolled_student_id: newStudent.id })
      .eq("id", entry.id)
      .select()
      .maybeSingle();
    if (updatedEntry) setPromotionEntries((prev) => prev.map((p) => (p.id === entry.id ? updatedEntry : p)));
    notify(t("success_saved"));
    return null;
  };

  // ---------- Calendrier scolaire partagé ----------
  const addCalendarEvent = async (payload) => {
    const { data, error } = await supabase.from("calendar_events").insert({ ...payload, school_id: schoolId, created_by: profile.user_id }).select().maybeSingle();
    if (error?.message?.includes("LIMITE_ESSAI_ATTEINTE")) { setShowUpgrade(true); return; }
    if (data) { setCalendarEvents((prev) => [...prev, data].sort((a, b) => a.event_date.localeCompare(b.event_date))); notify(t("success_saved")); }
    return error;
  };
  const deleteCalendarEvent = async (id) => {
    await supabase.from("calendar_events").delete().eq("id", id);
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id));
  };
  const updateCalendarEventStatus = async (id, status) => {
    const { data } = await supabase.from("calendar_events").update({ status }).eq("id", id).select().maybeSingle();
    if (data) setCalendarEvents((prev) => prev.map((e) => (e.id === id ? data : e)));
  };

  // ---------- Cahier de discipline / conduite ----------
  const addDisciplineNote = async (payload) => {
    const { data, error } = await supabase.from("discipline_notes").insert({ ...payload, school_id: schoolId, author_id: profile.user_id }).select().maybeSingle();
    if (error?.message?.includes("LIMITE_ESSAI_ATTEINTE")) { setShowUpgrade(true); return; }
    if (data) { setDisciplineNotes((prev) => [data, ...prev]); notify(t("success_saved")); }
    return error;
  };
  const deleteDisciplineNote = async (id) => {
    await supabase.from("discipline_notes").delete().eq("id", id);
    setDisciplineNotes((prev) => prev.filter((n) => n.id !== id));
  };
  const toggleShareDisciplineNote = async (id, share) => {
    const { data } = await supabase
      .from("discipline_notes")
      .update({ shared_with_parent: share, shared_at: share ? new Date().toISOString() : null })
      .eq("id", id)
      .select()
      .maybeSingle();
    if (data) setDisciplineNotes((prev) => prev.map((n) => (n.id === id ? data : n)));
  };

  // ---------- Paiement Mobile Money : déclaration parent + confirmation comptable ----------
  const declarePayment = async (payload) => {
    const { data, error } = await supabase
      .from("payment_declarations")
      .insert({ ...payload, school_id: schoolId, parent_id: profile.user_id })
      .select()
      .maybeSingle();
    if (error?.message?.includes("LIMITE_ESSAI_ATTEINTE")) { setShowUpgrade(true); return; }
    if (data) { setPaymentDeclarations((prev) => [data, ...prev]); notify(t("success_saved")); }
    return error;
  };

  // ---------- Déclaration de paiement d'abonnement (Fondateur → Admin plateforme) ----------
  const [subscriptionDeclarations, setSubscriptionDeclarations] = useState([]);
  const loadMySubDeclarations = useCallback(async () => {
    if (role !== "fondateur") return;
    const { data } = await supabase.from("subscription_payment_declarations").select("*").eq("school_id", schoolId).order("created_at", { ascending: false });
    if (data) setSubscriptionDeclarations(data);
  }, [role, schoolId]);
  useEffect(() => { loadMySubDeclarations(); }, [loadMySubDeclarations]);

  const declareSubscriptionPayment = async (payload) => {
    const { data, error } = await supabase
      .from("subscription_payment_declarations")
      .insert({ ...payload, school_id: schoolId, declared_by: profile.user_id })
      .select()
      .maybeSingle();
    if (data) { setSubscriptionDeclarations((prev) => [data, ...prev]); notify(t("success_saved")); }
    return data;
  };

  const uploadSubscriptionScreenshot = async (declarationId, file) => {
    if (typeof navigator !== "undefined" && !navigator.onLine) { return null; }
    try {
      if (!file || !file.type || !file.type.startsWith("image/")) { alert("Ce fichier n'est pas reconnu comme une image."); return null; }
      if (file.size > 15_000_000) { alert("Cette image est trop lourde. Choisis-en une plus légère."); return null; }
      const resized = await resizeImageMemorySafe(file, 900, 0.85);
      const path = `${schoolId}/${declarationId}.jpg`;
      const { error: upErr } = await supabase.storage.from("subscription-screenshots").upload(path, resized, { upsert: true, contentType: "image/jpeg" });
      if (upErr) return null;
      const { data } = supabase.storage.from("subscription-screenshots").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      await supabase.from("subscription_payment_declarations").update({ screenshot_url: url }).eq("id", declarationId);
      setSubscriptionDeclarations((prev) => prev.map((d) => (d.id === declarationId ? { ...d, screenshot_url: url } : d)));
      notify(t("success_saved"));
      return url;
    } catch (e) {
      return null;
    }
  };

  // Capture d'écran du paiement — une preuve visuelle d'appui pour le comptable, la
  // confirmation reste toujours une vérification humaine, jamais automatique.
  const uploadPaymentScreenshot = async (declarationId, file) => {
    if (typeof navigator !== "undefined" && !navigator.onLine) { return null; }
    try {
      if (!file || !file.type || !file.type.startsWith("image/")) { alert("Ce fichier n'est pas reconnu comme une image."); return null; }
      if (file.size > 15_000_000) { alert("Cette image est trop lourde. Choisis-en une plus légère."); return null; }
      const resized = await resizeImageMemorySafe(file, 900, 0.85);
      const path = `${schoolId}/${declarationId}.jpg`;
      const { error: upErr } = await supabase.storage.from("payment-screenshots").upload(path, resized, { upsert: true, contentType: "image/jpeg" });
      if (upErr) return null;
      const { data } = supabase.storage.from("payment-screenshots").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      const { error: dbErr } = await supabase.from("payment_declarations").update({ screenshot_url: url }).eq("id", declarationId);
      if (dbErr) return null;
      setPaymentDeclarations((prev) => prev.map((d) => (d.id === declarationId ? { ...d, screenshot_url: url } : d)));
      notify(t("success_saved"));
      return url;
    } catch (e) {
      return null;
    }
  };

  const confirmPaymentDeclaration = async (d) => {
    // On enregistre le paiement officiellement, comme un paiement normal, puis on marque la
    // déclaration confirmée — le parent voit alors son reçu automatiquement.
    const { data: payment } = await supabase
      .from("payments")
      .insert({ school_id: schoolId, school_year: currentYear, student_id: d.student_id, amount: d.amount, date: new Date().toISOString().slice(0, 10) })
      .select()
      .maybeSingle();
    if (payment) setPayments((prev) => [payment, ...prev]);
    const { data: updated } = await supabase
      .from("payment_declarations")
      .update({ status: "confirmed", confirmed_by: profile.user_id, confirmed_at: new Date().toISOString() })
      .eq("id", d.id)
      .select()
      .maybeSingle();
    if (updated) setPaymentDeclarations((prev) => prev.map((x) => (x.id === d.id ? updated : x)));
    notify(t("success_saved"));
  };

  const rejectPaymentDeclaration = async (d, reason) => {
    const { data } = await supabase
      .from("payment_declarations")
      .update({ status: "rejected", rejection_reason: reason || null, confirmed_by: profile.user_id, confirmed_at: new Date().toISOString() })
      .eq("id", d.id)
      .select()
      .maybeSingle();
    if (data) setPaymentDeclarations((prev) => prev.map((x) => (x.id === d.id ? data : x)));
  };

  // Une fois traitée (confirmée ou rejetée), une déclaration peut être supprimée pour ne
  // pas encombrer l'espace — jamais tant qu'elle est encore en attente.
  const deletePaymentDeclaration = async (id) => {
    await supabase.from("payment_declarations").delete().eq("id", id);
    setPaymentDeclarations((prev) => prev.filter((x) => x.id !== id));
  };

  const saveMomoSettings = async (momoNumber, momoProvider) => {
    const { error } = await supabase.from("schools").update({ momo_number: momoNumber || null, momo_provider: momoProvider }).eq("id", schoolId);
    if (!error) { await refreshProfile(); notify(t("success_saved")); }
  };

  const saveCardTheme = async (theme) => {
    const { error } = await supabase.from("schools").update({ card_theme: theme }).eq("id", schoolId);
    if (!error) { await refreshProfile(); notify(t("success_saved")); }
  };

  const saveDirectorTitle = async (title) => {
    const { error } = await supabase.from("schools").update({ director_title: title }).eq("id", schoolId);
    if (!error) { await refreshProfile(); notify(t("success_saved")); }
  };

  const saveAdminInfo = async (ire, dpe, dsee, ville) => {
    const { error } = await supabase.from("schools").update({ ire: ire || null, dpe: dpe || null, dsee: dsee || null, ville: ville || null }).eq("id", schoolId);
    if (!error) { await refreshProfile(); notify(t("success_saved")); }
  };

  const saveSchoolLocation = async (latitude, longitude, rayonMetres) => {
    const { error } = await supabase.from("schools").update({ latitude, longitude, rayon_metres: rayonMetres || 200 }).eq("id", schoolId);
    if (!error) { await refreshProfile(); notify(t("success_saved")); }
    return error;
  };

  // ---------- Emploi du temps ----------
  const addTimetableSlot = async (payload) => {
    const { data, error } = await supabase.from("timetable_slots").insert({ ...payload, school_id: schoolId }).select().maybeSingle();
    if (error?.message?.includes("LIMITE_ESSAI_ATTEINTE")) { setShowUpgrade(true); return; }
    if (data) { setTimetableSlots((prev) => [...prev, data]); notify(t("success_saved")); }
    return error;
  };
  const deleteTimetableSlot = async (id) => {
    await supabase.from("timetable_slots").delete().eq("id", id);
    setTimetableSlots((prev) => prev.filter((s) => s.id !== id));
  };

  // ---------- Transfert / retrait de dossier élève ----------
  const addFileMovement = async (payload) => {
    const { data, error } = await supabase.from("student_file_movements").insert({ ...payload, school_id: schoolId, recorded_by: profile.user_id }).select().maybeSingle();
    if (error?.message?.includes("LIMITE_ESSAI_ATTEINTE")) { setShowUpgrade(true); return; }
    if (data) { setFileMovements((prev) => [data, ...prev]); notify(t("success_saved")); }
    return error;
  };
  const deleteFileMovement = async (id) => {
    await supabase.from("student_file_movements").delete().eq("id", id);
    setFileMovements((prev) => prev.filter((m) => m.id !== id));
  };

  // ---------- Journal hebdomadaire du personnel ----------
  const addWeeklyJournalEntry = async (payload) => {
    const { data, error } = await supabase.from("weekly_journal_entries").insert({ ...payload, school_id: schoolId, author_id: profile.user_id }).select().maybeSingle();
    if (error?.message?.includes("LIMITE_ESSAI_ATTEINTE")) { setShowUpgrade(true); return; }
    if (data) { setWeeklyJournalEntries((prev) => [data, ...prev]); notify(t("success_saved")); }
    return error;
  };
  const deleteWeeklyJournalEntry = async (id) => {
    await supabase.from("weekly_journal_entries").delete().eq("id", id);
    setWeeklyJournalEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // ---------- Carnet du Directeur ----------
  const addDirectorNotebookEntry = async (payload) => {
    const { data, error } = await supabase.from("director_notebook_entries").insert({ ...payload, school_id: schoolId, director_id: profile.user_id }).select().maybeSingle();
    if (error?.message?.includes("LIMITE_ESSAI_ATTEINTE")) { setShowUpgrade(true); return; }
    if (data) { setDirectorNotebookEntries((prev) => [data, ...prev]); notify(t("success_saved")); }
    return error;
  };
  const toggleNotebookTask = async (id, done) => {
    const { data } = await supabase.from("director_notebook_entries").update({ is_done: done }).eq("id", id).select().maybeSingle();
    if (data) setDirectorNotebookEntries((prev) => prev.map((e) => (e.id === id ? data : e)));
  };
  const deleteNotebookEntry = async (id) => {
    await supabase.from("director_notebook_entries").delete().eq("id", id);
    setDirectorNotebookEntries((prev) => prev.filter((e) => e.id !== id));
  };
  const addSchoolEquipment = async (payload) => {
    const { data, error } = await supabase.from("school_equipment").insert({ ...payload, school_id: schoolId, director_id: profile.user_id }).select().maybeSingle();
    if (error?.message?.includes("LIMITE_ESSAI_ATTEINTE")) { setShowUpgrade(true); return; }
    if (data) { setSchoolEquipment((prev) => [data, ...prev]); notify(t("success_saved")); }
    return error;
  };
  const deleteSchoolEquipment = async (id) => {
    await supabase.from("school_equipment").delete().eq("id", id);
    setSchoolEquipment((prev) => prev.filter((e) => e.id !== id));
  };

  const validateExpense = async (id) => {
    const { error } = await supabase.rpc("validate_credit_expense", { p_expense_id: id });
    if (!error) {
      setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, validated: true } : e)));
      notify(t("success_saved"));
    }
    return error;
  };

  const saveGrade = async (studentId, subject, score, term) => {
    const payload = { school_id: schoolId, student_id: studentId, subject, score, term, school_year: currentYear, class_name: students.find((s) => s.id === studentId)?.class_name || "" };
    const applyLocally = () => {
      setGrades((prev) => {
        const existing = prev.find((g) => g.student_id === studentId && g.subject === subject && g.term === term && g.school_year === currentYear);
        if (existing) return prev.map((g) => (g.id === existing.id ? { ...g, ...payload, _pendingSync: true } : g));
        return [...prev, { ...payload, id: `local_${Date.now()}`, _pendingSync: true }];
      });
    };
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      applyLocally();
      enqueueOfflineAction({ table: "grades", payload, conflict: "student_id,subject,term,school_year" });
      return null;
    }
    try {
      const { data, error } = await supabase
        .from("grades")
        .upsert(payload, { onConflict: "student_id,subject,term,school_year" })
        .select();
      if (error?.message?.includes("LIMITE_ESSAI_ATTEINTE")) { setShowUpgrade(true); return error; }
      if (data) {
        setGrades((prev) => {
          const existing = prev.find((g) => g.student_id === studentId && g.subject === subject && g.term === term && g.school_year === currentYear);
          if (existing) return prev.map((g) => (g.id === existing.id ? data[0] : g));
          return [...prev, data[0]];
        });
      }
      return error;
    } catch (e) {
      if (isNetworkFailure(e)) {
        applyLocally();
        enqueueOfflineAction({ table: "grades", payload, conflict: "student_id,subject,term,school_year" });
        return null;
      }
      throw e;
    }
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

  const publishAllReleases = async (classNamesList, term) => {
    const rowsToUpsert = classNamesList.map((cName) => ({ school_id: schoolId, class_name: cName, term, published: true, school_year: currentYear }));
    if (rowsToUpsert.length === 0) return;
    const { data } = await supabase
      .from("grade_releases")
      .upsert(rowsToUpsert, { onConflict: "school_id,class_name,term,school_year" })
      .select();
    if (data) {
      setReleases((prev) => {
        const next = [...prev];
        data.forEach((row) => {
          const idx = next.findIndex((r) => r.class_name === row.class_name && r.term === row.term && r.school_year === row.school_year);
          if (idx >= 0) next[idx] = row;
          else next.push(row);
        });
        return next;
      });
      notify(t("all_published_success"));
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

  const updateMyProfile = async (fullNameVal, phoneVal, civiliteVal) => {
    const { error } = await supabase.rpc("update_my_contact_info", { p_full_name: fullNameVal, p_phone: phoneVal });
    if (!error && civiliteVal !== undefined) {
      await supabase.from("profiles").update({ civilite: civiliteVal || null }).eq("user_id", profile.user_id);
    }
    if (!error) { await refreshProfile(); await loadAll(); }
    return error;
  };

  const compressImageFile = (file, maxDim, quality) =>
    new Promise((resolve) => {
      let settled = false;
      const finish = (result) => {
        if (settled) return;
        settled = true;
        resolve(result);
      };
      // Filet de sécurité : si rien ne se passe en 8 secondes (souci de décodage sur certains
      // téléphones), on envoie la photo originale telle quelle plutôt que de rester bloqué.
      const safetyTimeout = setTimeout(() => finish(file), 8000);
      try {
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          try {
            let { width, height } = img;
            if (width > maxDim || height > maxDim) {
              const scale = maxDim / Math.max(width, height);
              width = Math.round(width * scale);
              height = Math.round(height * scale);
            }
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            canvas.getContext("2d").drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => { clearTimeout(safetyTimeout); URL.revokeObjectURL(objectUrl); finish(blob || file); }, "image/jpeg", quality);
          } catch (e) {
            clearTimeout(safetyTimeout);
            URL.revokeObjectURL(objectUrl);
            finish(file);
          }
        };
        img.onerror = () => { clearTimeout(safetyTimeout); URL.revokeObjectURL(objectUrl); finish(file); };
        img.src = objectUrl;
      } catch (e) {
        clearTimeout(safetyTimeout);
        finish(file);
      }
    });

  const uploadAvatar = async (file) => {
    if (typeof navigator !== "undefined" && !navigator.onLine) { return null; }
    try {
      if (!file || !file.type || !file.type.startsWith("image/")) { alert("Ce fichier n'est pas reconnu comme une image. Choisis une photo JPEG ou PNG."); return null; }
      if (file.size > 8_000_000) { alert("Cette photo est trop lourde (max 8 Mo). Choisis-en une plus légère, ou une photo déjà existante plutôt qu'une prise fraîche en haute résolution."); return null; }
      const ext = file.type.includes("png") ? "png" : "jpg";
      const path = `${profile.user_id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) return null;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      const { error: dbErr } = await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", profile.user_id);
      if (dbErr) return null;
      await refreshProfile();
      await loadAll();
      return url;
    } catch (e) {
      return null;
    }
  };

  // Photo de l'élève, pour son dossier et sa carte scolaire — même principe que la photo
  // de profil du personnel, mais rattachée à l'élève plutôt qu'à un compte utilisateur.
  // Réduit une photo AVANT l'envoi, de façon économe en mémoire (décodage direct en petite
  // taille) — évite les plantages observés sur certains téléphones avec les photos fraîches
  // de l'appareil photo, en haute résolution.
  const resizeImageMemorySafe = (file, maxDim = 900, quality = 0.85) =>
    new Promise((resolve) => {
      const finish = (result) => resolve(result || file);
      (async () => {
        if (window.createImageBitmap) {
          try {
            const bitmap = await createImageBitmap(file, { resizeWidth: maxDim, resizeQuality: "medium" });
            const canvas = document.createElement("canvas");
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            canvas.getContext("2d").drawImage(bitmap, 0, 0);
            bitmap.close?.();
            canvas.toBlob((blob) => finish(blob), "image/jpeg", quality);
            return;
          } catch (e) {
            // On continue avec la méthode de repli ci-dessous si celle-ci échoue.
          }
        }
        try {
          const objectUrl = URL.createObjectURL(file);
          const img = new Image();
          const timeout = setTimeout(() => { URL.revokeObjectURL(objectUrl); finish(null); }, 8000);
          img.onload = () => {
            clearTimeout(timeout);
            let { width, height } = img;
            if (width > maxDim || height > maxDim) {
              const scale = maxDim / Math.max(width, height);
              width = Math.round(width * scale);
              height = Math.round(height * scale);
            }
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            canvas.getContext("2d").drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => finish(blob), "image/jpeg", quality);
            URL.revokeObjectURL(objectUrl);
          };
          img.onerror = () => { clearTimeout(timeout); URL.revokeObjectURL(objectUrl); finish(null); };
          img.src = objectUrl;
        } catch (e) {
          finish(null);
        }
      })();
    });

  const uploadStudentPhoto = async (studentId, file) => {
    if (typeof navigator !== "undefined" && !navigator.onLine) { return null; }
    try {
      if (!file || !file.type || !file.type.startsWith("image/")) { alert("Ce fichier n'est pas reconnu comme une image. Choisis une photo JPEG ou PNG."); return null; }
      if (file.size > 15_000_000) { alert("Cette photo est trop lourde. Choisis-en une plus légère."); return null; }
      const resized = await resizeImageMemorySafe(file);
      const path = `${schoolId}/${studentId}-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from("student-photos").upload(path, resized, { upsert: true, contentType: "image/jpeg" });
      if (upErr) return null;
      const { data } = supabase.storage.from("student-photos").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      const { error: dbErr } = await supabase.from("students").update({ photo_url: url }).eq("id", studentId);
      if (dbErr) return null;
      setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, photo_url: url } : s)));
      notify(t("success_saved"));
      return url;
    } catch (e) {
      return null;
    }
  };

  // Logo de l'école — pour la carte scolaire et d'autres documents à venir.
  const uploadSchoolLogo = async (file) => {
    if (typeof navigator !== "undefined" && !navigator.onLine) { return null; }
    try {
      if (!file || !file.type || !file.type.startsWith("image/")) { alert("Ce fichier n'est pas reconnu comme une image. Choisis une photo JPEG ou PNG."); return null; }
      if (file.size > 15_000_000) { alert("Cette image est trop lourde. Choisis-en une plus légère."); return null; }
      const resized = await resizeImageMemorySafe(file, 500, 0.9);
      const path = `${schoolId}/logo-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from("school-logos").upload(path, resized, { upsert: true, contentType: "image/jpeg" });
      if (upErr) return null;
      const { data } = supabase.storage.from("school-logos").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      const { error: dbErr } = await supabase.from("schools").update({ logo_url: url }).eq("id", schoolId);
      if (dbErr) return null;
      await refreshProfile();
      notify(t("success_saved"));
      return url;
    } catch (e) {
      return null;
    }
  };

  // Emblème national — affiché à côté de "République de Guinée" sur les fiches exportées.
  const uploadSchoolEmblem = async (file) => {
    if (typeof navigator !== "undefined" && !navigator.onLine) { return null; }
    try {
      if (!file || !file.type || !file.type.startsWith("image/")) { alert("Ce fichier n'est pas reconnu comme une image. Choisis une photo JPEG ou PNG."); return null; }
      if (file.size > 15_000_000) { alert("Cette image est trop lourde. Choisis-en une plus légère."); return null; }
      const resized = await resizeImageMemorySafe(file, 500, 0.9);
      const path = `${schoolId}/emblem-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from("school-logos").upload(path, resized, { upsert: true, contentType: "image/jpeg" });
      if (upErr) return null;
      const { data } = supabase.storage.from("school-logos").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      const { error: dbErr } = await supabase.from("schools").update({ emblem_url: url }).eq("id", schoolId);
      if (dbErr) return null;
      await refreshProfile();
      notify(t("success_saved"));
      return url;
    } catch (e) {
      return null;
    }
  };

  const uploadSignature = async (file, removeBackground) => {
    if (typeof navigator !== "undefined" && !navigator.onLine) { return null; }
    try {
      if (!file || !file.type || !file.type.startsWith("image/")) { alert("Ce fichier n'est pas reconnu comme une image. Choisis une photo JPEG ou PNG."); return null; }
      if (file.size > 8_000_000) { alert("Cette photo est trop lourde (max 8 Mo). Choisis-en une plus légère."); return null; }
      const toUpload = removeBackground ? await removeLightBackground(file) : file;
      const uploadType = toUpload?.type || file.type;
      const ext = uploadType.includes("png") ? "png" : "jpg";
      const path = `${profile.user_id}/signature.${ext}`;
      const { error: upErr } = await supabase.storage.from("signatures").upload(path, toUpload, { upsert: true, contentType: uploadType });
      if (upErr) return null;
      const { data } = supabase.storage.from("signatures").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      const { error: dbErr } = await supabase.from("profiles").update({ signature_url: url }).eq("user_id", profile.user_id);
      if (dbErr) return null;
      await refreshProfile();
      await loadAll();
      return url;
    } catch (e) {
      return null;
    }
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
  const setTeacherClassPrimaire = async (teacherId, newClassName) => {
    const { data, error } = await supabase.from("profiles").update({ class_name: newClassName || null }).eq("user_id", teacherId).select();
    if (data && data.length > 0) { setStaffProfiles((prev) => prev.map((sp) => (sp.user_id === teacherId ? data[0] : sp))); notify(t("success_saved")); }
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
    const applyLocally = () => {
      setGradesSecondaire((prev) => {
        const idx = prev.findIndex((g) => g.student_id === studentId && g.subject === subj && g.month === month && g.school_year === currentYear);
        if (idx >= 0) return prev.map((g, i) => (i === idx ? { ...g, ...payload, _pendingSync: true } : g));
        return [...prev, { ...payload, id: `local_${Date.now()}`, _pendingSync: true }];
      });
    };
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      applyLocally();
      enqueueOfflineAction({ table: "grades_secondaire", payload, conflict: "student_id,subject,month,school_year" });
      return null;
    }
    try {
      const { data, error } = await supabase.from("grades_secondaire").upsert(payload, { onConflict: "student_id,subject,month,school_year" }).select();
      if (error?.message?.includes("LIMITE_ESSAI_ATTEINTE")) { setShowUpgrade(true); return error; }
      if (data && data.length > 0) setGradesSecondaire((prev) => {
        const idx = prev.findIndex((g) => g.student_id === studentId && g.subject === subj && g.month === month && g.school_year === currentYear);
        if (idx >= 0) return prev.map((g, i) => (i === idx ? data[0] : g));
        return [...prev, data[0]];
      });
      return error;
    } catch (e) {
      if (isNetworkFailure(e)) {
        applyLocally();
        enqueueOfflineAction({ table: "grades_secondaire", payload, conflict: "student_id,subject,month,school_year" });
        return null;
      }
      throw e;
    }
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
  const replyToRemark = async (id, replyText) => {
    const { data, error } = await supabase
      .from("remarks")
      .update({ reply: replyText, replied_at: new Date().toISOString(), replied_by: profile.user_id })
      .eq("id", id)
      .select()
      .maybeSingle();
    if (data) { setRemarks((prev) => prev.map((r) => (r.id === id ? data : r))); notify(t("success_saved")); }
    return error;
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
    const payload = { school_id: schoolId, student_id: studentId, class_name: classNameArg, date, session, present, recorded_by: profile.user_id, school_year: currentYear };
    const applyLocally = () => {
      setAttendance((prev) => {
        const existing = prev.find((a) => a.student_id === studentId && a.date === date && a.session === session && a.school_year === currentYear);
        if (existing) return prev.map((a) => (a.id === existing.id ? { ...a, ...payload, _pendingSync: true } : a));
        return [...prev, { ...payload, id: `local_${Date.now()}`, _pendingSync: true }];
      });
    };
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      applyLocally();
      enqueueOfflineAction({ table: "attendance", payload, conflict: "student_id,date,session,school_year" });
      return null;
    }
    try {
      const { data, error } = await supabase
        .from("attendance")
        .upsert(payload, { onConflict: "student_id,date,session,school_year" })
        .select();
      if (error?.message?.includes("LIMITE_ESSAI_ATTEINTE")) { setShowUpgrade(true); return error; }
      if (data) {
        setAttendance((prev) => {
          const existing = prev.find((a) => a.student_id === studentId && a.date === date && a.session === session && a.school_year === currentYear);
          if (existing) return prev.map((a) => (a.id === existing.id ? data[0] : a));
          return [...prev, data[0]];
        });
      }
      return error;
    } catch (e) {
      if (isNetworkFailure(e)) {
        applyLocally();
        enqueueOfflineAction({ table: "attendance", payload, conflict: "student_id,date,session,school_year" });
        return null;
      }
      throw e;
    }
  };

  const isSecondaire = levelType === "secondaire";
  const { t, lang } = useLang();
  const NAV = {
    fondateur: [["dashboard", t("nav_dashboard"), LayoutDashboard], ["students", t("nav_students"), Users], ["paymentdeclarations", t("nav_payment_declarations"), Smartphone], ["subscriptiondeclare", t("nav_subscription_declare"), Star], ["studentcards", t("nav_student_cards"), CreditCard], ["staffcards", t("nav_staff_cards"), Contact], ["annualbalance", t("nav_annual_balance"), TrendingUp], ["promotion", t("nav_promotion"), ArrowRight], ["filemovements", t("nav_file_movements"), ArrowRightLeft], ["tuitionfees", t("nav_tuition_fees"), Coins], ["schoolsettings", t("nav_school_settings"), QrCode], ["services", t("nav_services"), Package], ["attendance", t("nav_attendance"), Eye], ["staffpresence", t("nav_staffpresence"), CalendarCheck], ["grades", t("nav_grades"), ClipboardList], ["expenses", t("nav_expenses"), Receipt], ["staff", t("nav_staff"), Wallet], ["mysalary", t("nav_my_salary"), Banknote], ["calendar", t("nav_calendar"), BookMarked]],
    comptable: [["students", t("nav_students_payments"), Users], ["dashboard", t("nav_stats"), LayoutDashboard], ["paymentdeclarations", t("nav_payment_declarations"), Smartphone], ["reenrollment", t("nav_reenrollment"), ArrowRight], ["services", t("nav_services"), Package], ["weeklyjournal", t("nav_weekly_journal"), BookMarked], ["expenses", t("nav_expenses"), Receipt], ["staff", t("nav_staff"), Wallet], ["mysalary", t("nav_my_salary"), Banknote], ["calendar", t("nav_calendar"), BookMarked]],
    enseignant: isSecondaire
      ? [["grades", t("nav_grades"), ClipboardList], ["myassignments", t("nav_my_assignments"), FileText], ["attendance", t("nav_attendance"), Eye], ["lessonai", t("nav_lesson_ai"), Sparkles], ["lessons", t("nav_lessons"), BookOpen], ["discipline", t("nav_discipline"), AlertTriangle], ["timetable", t("nav_timetable"), CalendarCheck], ["weeklyjournal", t("nav_weekly_journal"), BookMarked], ["students", t("nav_students"), Users], ["mysalary", t("nav_my_salary"), Banknote], ["calendar", t("nav_calendar"), BookMarked]]
      : [["grades", t("nav_grades"), ClipboardList], ["attendance", t("nav_attendance"), Eye], ["lessonai", t("nav_lesson_ai"), Sparkles], ["lessons", t("nav_lessons"), BookOpen], ["discipline", t("nav_discipline"), AlertTriangle], ["timetable", t("nav_timetable"), CalendarCheck], ["weeklyjournal", t("nav_weekly_journal"), BookMarked], ["students", t("nav_students"), Users], ["mysalary", t("nav_my_salary"), Banknote], ["calendar", t("nav_calendar"), BookMarked]],
    parent: [["dashboard", t("nav_my_children"), GraduationCap], ["revision", t("nav_revision"), Sparkles], ["lessons", t("nav_lessons"), BookOpen], ["timetable", t("nav_timetable"), CalendarCheck], ["announcements", t("nav_announcements"), Megaphone], ["remarks", t("nav_my_remarks"), MessageSquare], ["pay", t("nav_pay_remotely"), Smartphone], ["calendar", t("nav_calendar"), BookMarked]],
    personnel: [["mysalary", t("nav_my_salary"), Banknote], ["weeklyjournal", t("nav_weekly_journal"), BookMarked], ["announcements", t("nav_announcements"), Megaphone], ["calendar", t("nav_calendar"), BookMarked]],
    directeur: [["grades", t("nav_grades"), ClipboardList], ["directornotebook", t("nav_director_notebook"), FileText], ["timetable", t("nav_timetable"), CalendarCheck], ["dossiers", t("nav_dossiers"), Contact], ["studentcards", t("nav_student_cards"), CreditCard], ["staffcards", t("nav_staff_cards"), Contact], ["schoolsettings", t("nav_school_settings"), QrCode], ["staffpresence", t("nav_staffpresence"), CalendarCheck], ["filemovements", t("nav_file_movements"), ArrowRightLeft], ["weeklyjournal", t("nav_weekly_journal"), BookMarked], ["discipline", t("nav_discipline"), AlertTriangle], ["promotion", t("nav_promotion"), ArrowRight], ["announcements", t("nav_announcements"), Megaphone], ["attendance", t("nav_attendance"), Eye], ...(isSecondaire ? [["classteachers", t("nav_head_teachers"), Shield]] : [["classassign", t("nav_class_assign"), Shield]]), ["lessons", t("nav_lessons"), BookOpen], ["mysalary", t("nav_my_salary"), Banknote], ["remarks", t("nav_remarks"), MessageSquare], ["calendar", t("nav_calendar"), BookMarked]],
  }[role];
  const NAV_FULL_RAW = profile.is_admin ? [...NAV, ["admin", t("nav_admin"), Shield], ["feedback", t("nav_feedback"), Star]] : NAV;
  // On retire les onglets non couverts par le palier d'abonnement de l'école — l'admin (nous)
  // n'est jamais concerné par cette limite.
  const NAV_FULL = profile.is_admin ? NAV_FULL_RAW : NAV_FULL_RAW.filter(([key]) => canAccessTab(profile.schools, key));
  const hasNewAnnouncement = announcements.some((a) => a.created_at > lastSeenAnnouncements);
  const hasNewCalendarEvent = calendarEvents.some((e) => e.created_at > lastSeenCalendar);
  const hasNewContent = hasNewAnnouncement || hasNewCalendarEvent;
  const homeTab = role === "comptable" ? "students" : role === "enseignant" ? "grades" : role === "personnel" ? "mysalary" : role === "directeur" ? "grades" : "dashboard";
  const quickAccessKeys = NAV_FULL.slice(0, 4).map(([key]) => key);
  const isSecondaryScreen = tab !== homeTab && !quickAccessKeys.includes(tab);

  // Filet de sécurité : si l'onglet actuellement affiché n'est plus couvert par le palier de
  // l'école (ex: rétrogradation), on ramène la personne sur son écran d'accueil plutôt que de
  // laisser un écran cassé ou un contenu auquel elle ne devrait plus avoir accès.
  useEffect(() => {
    if (!profile.is_admin && !canAccessTab(profile.schools, tab)) setTab(homeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, profile.schools?.subscription_tier, profile.schools?.subscribed]);

  if (loading && !cachedData) return <div className="h-screen w-full flex items-center justify-center" style={{ background: COLORS.paper }}><Loader2 className="animate-spin" size={28} style={{ color: COLORS.ink }} /></div>;

  return (
    <div className="min-h-screen w-full flex" style={{ background: COLORS.paper, fontFamily: "'Inter', sans-serif" }}>
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-[45] flex items-center justify-center gap-1.5 px-3 py-1.5" style={{ background: COLORS.negative }}>
          <AlertTriangle size={12} color="#fff" />
          <span className="text-xs font-medium truncate" style={{ color: "#fff" }}>
            {offlineDataAge ? t("offline_showing_cached_short") : t("offline_banner_short")}
          </span>
        </div>
      )}
      {!isOffline && offlineQueue.length > 0 && (
        <div className="fixed top-0 left-0 right-0 z-[45] flex items-center justify-center gap-1.5 px-3 py-1.5" style={{ background: syncingQueue ? COLORS.primary : COLORS.primarySoft }}>
          {syncingQueue ? <Loader2 className="animate-spin" size={12} color="#fff" /> : <AlertTriangle size={12} style={{ color: COLORS.primary }} />}
          <span className="text-xs font-medium truncate" style={{ color: syncingQueue ? "#fff" : COLORS.primary }}>
            {syncingQueue ? t("syncing_now") : t("pending_sync_count").replace("{n}", offlineQueue.length)}
          </span>
        </div>
      )}
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
        className="md:hidden fixed top-4 right-4 z-[80] w-10 h-10 rounded-full flex items-center justify-center shadow-md"
        style={{ background: COLORS.ink }}
      >
        <Menu size={20} color="#fff" />
        {hasNewContent && (
          <span className="absolute top-0 right-0 w-3 h-3 rounded-full" style={{ background: COLORS.negative, border: `2px solid ${COLORS.paper}` }} />
        )}
      </button>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around py-2 border-t" style={{ background: COLORS.card, borderColor: COLORS.line }}>
        {NAV_FULL.slice(0, 4).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)} className="relative p-2 rounded-lg" style={{ color: tab === key ? COLORS.ink : COLORS.inkSoft }}>
            <Icon size={20} />
            {((key === "announcements" && hasNewAnnouncement) || (key === "calendar" && hasNewCalendarEvent)) && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: COLORS.negative }} />
            )}
          </button>
        ))}
      </div>

      {showMoreMenu && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end" style={{ background: "rgba(32,48,74,0.45)" }} onClick={() => setShowMoreMenu(false)}>
          <div className="w-full rounded-t-2xl flex flex-col" style={{ background: COLORS.card, maxHeight: "85vh" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: COLORS.line }}>
              <h3 className="text-lg font-bold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("menu")}</h3>
              <button onClick={() => setShowMoreMenu(false)} style={{ color: COLORS.inkSoft }}><X size={20} /></button>
            </div>
            <button
              onClick={() => { setShowProfileModal(true); setShowMoreMenu(false); }}
              className="flex items-center gap-3 px-5 py-4 border-b shrink-0 text-left"
              style={{ borderColor: COLORS.line }}
            >
              <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center shrink-0" style={{ background: COLORS.paper, border: `2px solid ${COLORS.line}` }}>
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold" style={{ color: COLORS.inkSoft }}>{(profile.full_name || "?").charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-base font-bold truncate" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{profile.full_name}</div>
                <div className="text-xs" style={{ color: COLORS.inkSoft }}>{ROLE_LABELS[role]}{profile.class_name ? ` · ${profile.class_name}` : ""}</div>
              </div>
            </button>
            <div className="overflow-y-auto flex-1 min-h-0 py-2">
              {NAV_FULL.slice(4).map(([key, label, Icon]) => (
                <button
                  key={key}
                  onClick={() => { setTab(key); setShowMoreMenu(false); }}
                  className="w-full flex items-center gap-3 px-5 py-3.5"
                  style={{ background: tab === key ? COLORS.paper : "transparent" }}
                >
                  <span className="relative">
                    <Icon size={20} style={{ color: tab === key ? COLORS.ink : COLORS.inkSoft }} />
                    {((key === "announcements" && hasNewAnnouncement) || (key === "calendar" && hasNewCalendarEvent)) && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: COLORS.negative }} />
                    )}
                  </span>
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
              <button onClick={() => { setShowFeedbackModal(true); setShowMoreMenu(false); }} className="w-full flex items-center gap-3 px-5 py-4 border-t" style={{ borderColor: COLORS.line, color: COLORS.ink }}>
                <MessageSquare size={20} /> <span className="text-[15px] font-medium">{t("give_feedback_menu")}</span>
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
        {syncIssues.length > 0 && (
          <div className="rounded-2xl p-4 mb-5" style={{ background: "#FBE9E7", border: "1px solid #E0A79C" }}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} style={{ color: COLORS.negative }} />
                <span className="font-semibold text-sm" style={{ color: COLORS.negative }}>{t("sync_issues_title")}</span>
              </div>
              <button onClick={() => setSyncIssues([])} className="text-xs font-medium" style={{ color: COLORS.negative }}>{t("dismiss_all")}</button>
            </div>
            <div className="space-y-1.5">
              {syncIssues.map((s) => (
                <div key={s.id} className="text-xs" style={{ color: "#7A2E27" }}>
                  <span className="font-semibold">{s.table}</span> — {s.time} — {s.reason}
                </div>
              ))}
            </div>
          </div>
        )}
        {activeBroadcast && (
          <div className="rounded-2xl p-4 mb-5 flex items-start justify-between gap-3" style={{ background: COLORS.ink }}>
            <div className="flex items-start gap-2.5 min-w-0">
              <Megaphone size={17} className="shrink-0 mt-0.5" style={{ color: COLORS.primary }} />
              <div className="min-w-0">
                <div className="font-semibold text-sm" style={{ color: "#fff" }}>{activeBroadcast.title}</div>
                <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>{activeBroadcast.message}</p>
              </div>
            </div>
            <button onClick={() => dismissBroadcast(activeBroadcast.id)} className="shrink-0" style={{ color: "rgba(255,255,255,0.6)" }}><X size={16} /></button>
          </div>
        )}
        {isSecondaryScreen && (
          <button onClick={() => setTab(homeTab)} className="flex items-center gap-1.5 mb-4 text-sm font-semibold" style={{ color: COLORS.ink }}>
            <ArrowLeft size={18} /> {t("back_button")}
          </button>
        )}
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
        {(role === "enseignant" || role === "directeur") && profile.schools?.latitude && profile.schools?.longitude && (
          <div className="mb-6">
            <PresencePersonnel
              school={{
                id: schoolId,
                latitude: profile.schools.latitude,
                longitude: profile.schools.longitude,
                rayon_metres: profile.schools.rayon_metres,
              }}
              userId={profile.user_id}
            />
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
              schoolName={profile.schools?.name}
              bulletinAppreciations={bulletinAppreciations}
              disciplineNotes={disciplineNotes}
              directorTitle={profile.schools?.director_title}
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
            payments={yearPayments}
          />
        )}
        {tab === "students" && (role === "comptable" || role === "fondateur") && (
          <>
            {role === "comptable" && <SchoolCodeShareCard schoolCode={profile.schools?.code} onShare={shareApp} />}
            <StudentsView students={yearStudents} paidByStudent={paidByStudent} currency={currency} readOnly={role === "fondateur" || isArchiveView} parents={parents} subscribed={profile.schools?.subscribed} trialDaysLeft={trialDaysLeft} levels={levels} availableYears={availableYears} viewYear={viewYear} setViewYear={setViewYear} currentYear={currentYear} onAdd={() => setModal("student")} onDelete={deleteStudent} onPay={() => setModal("payment")} onLink={(s) => setLinkingStudent(s)} onEdit={(s) => { setEditingStudent(s); setModal("student"); }} />
          </>
        )}
        {tab === "students" && role === "enseignant" && <StudentsReadOnlyView students={role === "enseignant" ? yearStudents.filter((s) => s.class_name === profile.class_name) : yearStudents} />}
        {tab === "lessons" && (role === "enseignant" || role === "directeur") && (
          <LessonsTeacherView
            lessons={role === "enseignant" ? yearLessons.filter((l) => l.class_name === profile.class_name) : yearLessons}
            students={role === "enseignant" ? yearStudents.filter((s) => s.class_name === profile.class_name) : yearStudents}
            homework={homework}
            readOnly={false}
            lockedClass={role === "enseignant" ? profile.class_name : null}
            onAdd={() => setModal("lesson")} onDelete={deleteLesson} onToggle={toggleHomework}
          />
        )}
        {tab === "lessons" && role === "parent" && <LessonsParentView lessons={yearLessons} children={myChildren} homework={homework} onToggle={toggleHomework} />}
        {tab === "revision" && role === "parent" && <RevisionSheetsParentView children={myChildren} />}
        {tab === "expenses" && (role === "comptable" || role === "fondateur") && (
          <ExpensesView expenses={yearExpenses} staffPayments={yearStaffPayments} staffProfiles={staffProfiles} currency={currency} readOnly={role !== "comptable" || isArchiveView} onAdd={() => setModal("expense")} onDelete={deleteExpense} onValidate={validateExpense} />
        )}
        {tab === "grades" && !isSecondaire && (role === "enseignant" || role === "fondateur" || role === "directeur") && (
          <>
            {role === "directeur" && <SchoolCodeShareCard schoolCode={profile.schools?.code} onShare={shareApp} />}
            <GradesView students={yearStudents} grades={yearGrades} releases={yearReleases} readOnly={role === "fondateur" || role === "directeur"} canPublish={role === "directeur"} lockedClass={role === "enseignant" ? profile.class_name : null} passThreshold={isSecondaire ? 10 : 5} staffProfiles={staffProfiles} onSave={saveGrade} onToggleRelease={toggleRelease} onPublishAll={publishAllReleases} schoolName={profile.schools?.name} bulletinAppreciations={bulletinAppreciations} onSaveAppreciation={saveAppreciation} directorTitle={profile.schools?.director_title} schoolInfo={{ name: profile.schools?.name, ire: profile.schools?.ire, dpe: profile.schools?.dpe, dsee: profile.schools?.dsee, emblem_url: profile.schools?.emblem_url, ville: profile.schools?.ville, currentYear }} />
          </>
        )}
        {tab === "grades" && isSecondaire && (role === "enseignant" || role === "fondateur" || role === "directeur") && (
          <>
            {role === "directeur" && <SchoolCodeShareCard schoolCode={profile.schools?.code} onShare={shareApp} />}
            <GradesSecondaireView
            students={yearStudents}
            gradesSecondaire={yearGradesSecondaire}
            releases={yearReleases}
            allAssignments={teacherAssignments}
            myUserId={profile.user_id}
            classHeadTeachers={classHeadTeachers}
            subjectsSecondaire={subjectsSecondaire}
            currency={currency}
            readOnly={role === "fondateur" || role === "directeur"}
            canPublish={role === "directeur"}
            staffProfiles={staffProfiles}
            isHeadTeacherOf={classHeadTeachers.filter((c) => c.teacher_id === profile.user_id).map((c) => c.class_name)}
            onSave={saveGradeSecondaire}
            onSetCoefficient={setSubjectCoefficient}
            onToggleRelease={toggleRelease}
            onPublishAll={publishAllReleases}
            schoolName={profile.schools?.name}
            bulletinAppreciations={bulletinAppreciations}
            onSaveAppreciation={saveAppreciation}
            directorTitle={profile.schools?.director_title}
            schoolInfo={{ name: profile.schools?.name, ire: profile.schools?.ire, dpe: profile.schools?.dpe, dsee: profile.schools?.dsee, emblem_url: profile.schools?.emblem_url, ville: profile.schools?.ville, currentYear }}
          />
          </>
        )}
        {tab === "myassignments" && role === "enseignant" && (
          <MyAssignmentsView assignments={teacherAssignments.filter((t) => t.teacher_id === profile.user_id)} existingClassNames={existingClassNames} existingSubjectNames={existingSubjectNames} onAdd={addTeacherAssignment} onDelete={deleteTeacherAssignment} />
        )}
        {tab === "classteachers" && role === "directeur" && (
          <ClassTeachersView students={yearStudents} teacherAssignments={teacherAssignments} classHeadTeachers={classHeadTeachers} staffProfiles={staffProfiles} existingClassNames={existingClassNames} existingSubjectNames={existingSubjectNames} onSet={setClassHeadTeacher} onAssign={assignTeacherFondateur} onUnassign={deleteTeacherAssignment} onApprove={approveTeacherAssignment} />
        )}
        {tab === "classassign" && role === "directeur" && (
          <PrimaryClassAssignView teachers={staffProfiles.filter((sp) => sp.role === "enseignant")} classOptions={[...CLASSES_MATERNELLE, ...CLASSES_ELEMENTAIRE]} onAssign={setTeacherClassPrimaire} />
        )}
        {tab === "tuitionfees" && role === "fondateur" && (
          <TuitionFeesView levelType={levelType} tuitionFees={tuitionFees} onSave={saveTuitionFee} tierComplete={hasTierAccess(profile.schools, "complet")} schoolMomo={profile.schools} onSaveMomo={saveMomoSettings} />
        )}
        {tab === "schoolsettings" && (role === "fondateur" || role === "directeur") && (
          <SchoolSettingsView
            levelType={levelType}
            schoolInfo={profile.schools}
            onUploadLogo={uploadSchoolLogo}
            onUploadEmblem={uploadSchoolEmblem}
            onSaveTheme={saveCardTheme}
            onSaveDirectorTitle={saveDirectorTitle}
            onSaveAdminInfo={saveAdminInfo}
            onSaveLocation={saveSchoolLocation}
          />
        )}
        {tab === "staffpresence" && (role === "fondateur" || role === "directeur") && (
          <StaffPresenceView records={presencePersonnel} staffProfiles={staffProfiles} />
        )}
        {tab === "annualbalance" && role === "fondateur" && (
          <AnnualBalanceView
            payments={yearPayments}
            servicePayments={servicePayments.filter((p) => p.school_year === viewYear)}
            services={services}
            expenses={yearExpenses}
            staffPayments={staffPayments.filter((sp) => sp.school_year === viewYear)}
            currency={currency}
            viewYear={viewYear}
          />
        )}
        {tab === "promotion" && (role === "fondateur" || role === "directeur") && (
          <PromotionPrepView
            students={students}
            viewYear={currentYear}
            promotionEntries={promotionEntries}
            levelType={levelType}
            grades={grades.filter((g) => g.school_year === currentYear)}
            gradesSecondaire={gradesSecondaire.filter((g) => g.school_year === currentYear)}
            passThreshold={isSecondaire ? 10 : 5}
            onGenerate={generatePromotionList}
            onUpdateEntry={updatePromotionEntry}
          />
        )}
        {tab === "dossiers" && role === "directeur" && (
          <StudentDossiersView students={yearStudents} schoolName={profile.schools?.name} onEdit={(s) => { setEditingStudent(s); setModal("student"); }} />
        )}
        {tab === "studentcards" && (role === "directeur" || role === "fondateur") && (
          <StudentCardsView
            students={yearStudents}
            schoolName={profile.schools?.name}
            schoolLogo={profile.schools?.logo_url}
            cardTheme={profile.schools?.card_theme}
            currentYear={currentYear}
            directeur={staffProfiles.find((sp) => sp.role === "directeur")}
            directorTitle={profile.schools?.director_title}
            onUploadPhoto={uploadStudentPhoto}
          />
        )}
        {tab === "staffcards" && (role === "directeur" || role === "fondateur") && (
          <StaffCardsView
            staffProfiles={staffProfiles}
            schoolName={profile.schools?.name}
            schoolLogo={profile.schools?.logo_url}
            cardTheme={profile.schools?.card_theme}
            currentYear={currentYear}
            directeur={staffProfiles.find((sp) => sp.role === "directeur")}
            directorTitle={profile.schools?.director_title}
            isSecondaire={isSecondaire}
            teacherAssignments={teacherAssignments}
          />
        )}
        {tab === "discipline" && (role === "enseignant" || role === "directeur") && (
          <DisciplineView
            students={role === "enseignant" ? yearStudents.filter((s) => s.class_name === profile.class_name || teacherAssignments.some((a) => a.teacher_id === profile.user_id && a.approved && a.class_name === s.class_name)) : yearStudents}
            notes={disciplineNotes}
            role={role}
            myUserId={profile.user_id}
            onAdd={addDisciplineNote}
            onDelete={deleteDisciplineNote}
            onToggleShare={toggleShareDisciplineNote}
          />
        )}
        {tab === "reenrollment" && role === "comptable" && (
          <ReenrollmentView
            students={students}
            promotionEntries={promotionEntries}
            tuitionFees={tuitionFees}
            currency={currency}
            grades={grades.filter((g) => g.school_year === currentYear)}
            gradesSecondaire={gradesSecondaire.filter((g) => g.school_year === currentYear)}
            passThreshold={isSecondaire ? 10 : 5}
            onEnroll={enrollFromPromotion}
          />
        )}
        {tab === "paymentdeclarations" && (role === "comptable" || role === "fondateur") && (
          <PaymentDeclarationsView
            declarations={paymentDeclarations}
            students={students}
            canManage={role === "comptable"}
            onConfirm={confirmPaymentDeclaration}
            onReject={rejectPaymentDeclaration}
            onDelete={deletePaymentDeclaration}
          />
        )}
        {tab === "subscriptiondeclare" && role === "fondateur" && (
          <SubscriptionDeclareView
            school={profile.schools}
            declarations={subscriptionDeclarations}
            onDeclare={declareSubscriptionPayment}
            onUploadScreenshot={uploadSubscriptionScreenshot}
          />
        )}
        {tab === "timetable" && (
          <TimetableView
            slots={timetableSlots}
            classOptions={
              role === "directeur"
                ? existingClassNames
                : role === "enseignant"
                ? [...new Set(isSecondaire ? teacherAssignments.filter((a) => a.teacher_id === profile.user_id && a.approved).map((a) => a.class_name) : [profile.class_name].filter(Boolean))]
                : role === "parent"
                ? [...new Set(myChildren.map((c) => c.class_name))]
                : []
            }
            canManage={role === "directeur"}
            onAdd={addTimetableSlot}
            onDelete={deleteTimetableSlot}
          />
        )}
        {tab === "filemovements" && (role === "directeur" || role === "fondateur") && (
          <StudentFileMovementsView
            movements={fileMovements}
            students={yearStudents}
            onAdd={addFileMovement}
            onDelete={deleteFileMovement}
          />
        )}
        {tab === "weeklyjournal" && (role === "directeur" || role === "enseignant" || role === "comptable" || role === "personnel") && (
          <WeeklyJournalView
            entries={weeklyJournalEntries}
            staffProfiles={staffProfiles}
            myUserId={profile.user_id}
            role={role}
            onAdd={addWeeklyJournalEntry}
            onDelete={deleteWeeklyJournalEntry}
          />
        )}
        {tab === "directornotebook" && role === "directeur" && (
          <DirectorNotebookView
            entries={directorNotebookEntries}
            equipment={schoolEquipment}
            onAddEntry={addDirectorNotebookEntry}
            onToggleTask={toggleNotebookTask}
            onDeleteEntry={deleteNotebookEntry}
            onAddEquipment={addSchoolEquipment}
            onDeleteEquipment={deleteSchoolEquipment}
          />
        )}
        {tab === "calendar" && (
          <CalendarView
            events={calendarEvents}
            canManage={role === "fondateur" || role === "directeur"}
            onAdd={addCalendarEvent}
            onDelete={deleteCalendarEvent}
            onUpdateStatus={updateCalendarEventStatus}
          />
        )}
        {tab === "services" && (role === "fondateur" || role === "comptable") && (
          <ServicesView
            role={role}
            students={yearStudents}
            services={services}
            serviceSubscriptions={serviceSubscriptions}
            servicePayments={servicePayments}
            currency={currency}
            onSaveService={saveService}
            onDeleteService={deleteService}
            onEnroll={enrollStudentInService}
            onUnenroll={unenrollStudentFromService}
            onAddPayment={addServicePayment}
          />
        )}
        {tab === "lessonai" && role === "enseignant" && (
          <LessonAIView
            subjectsOptions={isSecondaire ? [...new Set(teacherAssignments.filter((a) => a.teacher_id === profile.user_id && a.approved).map((a) => a.subject))] : []}
            classOptions={isSecondaire ? [...new Set(teacherAssignments.filter((a) => a.teacher_id === profile.user_id && a.approved).map((a) => a.class_name))] : (profile.class_name ? [profile.class_name] : [])}
            lang={lang}
          />
        )}
        {tab === "announcements" && (
          <AnnouncementsView announcements={announcements} canWrite={role === "directeur"} onAdd={() => setModal("announcement")} onDelete={deleteAnnouncement} />
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
        {tab === "remarks" && role === "directeur" && (
          <FondateurRemarksView remarks={remarks} parents={parents} onDelete={deleteRemark} onReply={replyToRemark} />
        )}
        {tab === "pay" && role === "parent" && (
          <ParentPayView
            comptable={staffProfiles.find((sp) => sp.role === "comptable" && !sp.hidden && sp.phone) || staffProfiles.find((sp) => sp.role === "comptable" && !sp.hidden) || staffProfiles.find((sp) => sp.role === "comptable")}
            currency={currency}
            schoolMomo={profile.schools}
            schoolName={profile.schools?.name}
            children={myChildren}
            declarations={paymentDeclarations.filter((d) => d.parent_id === profile.user_id)}
            onDeclare={declarePayment}
            onUploadScreenshot={uploadPaymentScreenshot}
          />
        )}
        {tab === "attendance" && (role === "enseignant" || role === "fondateur" || role === "directeur") && (
          <AttendanceView
            students={yearStudents}
            attendance={yearAttendance}
            readOnly={role === "fondateur" || role === "directeur"}
            lockedClass={role === "enseignant" && !isSecondaire ? profile.class_name : null}
            myClasses={role === "enseignant" && isSecondaire ? [...new Set(teacherAssignments.filter((a) => a.teacher_id === profile.user_id).map((a) => a.class_name))] : null}
            isSecondaire={isSecondaire}
            onSave={setAttendanceStatus}
          />
        )}
        {tab === "admin" && profile.is_admin && <AdminView />}
        {tab === "feedback" && profile.is_admin && <FeedbackAdminView />}
      </main>

      {modal === "student" && <StudentModal levels={levels} student={editingStudent} existingClassNames={existingClassNames} tuitionFees={tuitionFees} role={role} tierComplete={hasTierAccess(profile.schools, "complet")} onClose={() => { setModal(null); setEditingStudent(null); }} onSave={addStudent} onUpdate={updateStudent} onUploadPhoto={uploadStudentPhoto} />}
      {modal === "payment" && <PaymentModal students={yearStudents} currency={currency} onClose={() => setModal(null)} onSave={addPayment} />}
      {modal === "lesson" && <LessonModal lockedClass={role === "enseignant" ? profile.class_name : null} onClose={() => setModal(null)} onSave={addLesson} />}
      {showProfileModal && <MyProfileModal profile={{ ...profile, email: userEmail }} onClose={() => setShowProfileModal(false)} onSave={updateMyProfile} onUploadAvatar={uploadAvatar} onUploadSignature={uploadSignature} onUpdateEmail={updateMyEmail} onDeactivateSelf={deactivateSelf} onDeleteParentAccount={deleteMyParentAccount} />}
      {showFeedbackModal && <FeedbackModal profile={profile} onClose={() => setShowFeedbackModal(false)} />}
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
  const { t } = useLang();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(32,48,74,0.45)" }}>
      <div className="w-full max-w-lg rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" style={{ background: COLORS.card }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: COLORS.line }}>
          <h3 className="text-lg font-bold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{title}</h3>
          <button onClick={onClose} className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ color: COLORS.inkSoft }}>
            <X size={20} /> <span className="text-sm font-medium hidden sm:inline">{t("close_button")}</span>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
// ---------- Génération de vrais fichiers Excel (.xlsx) avec mise en forme ----------
async function fetchImageForExcel(url) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const lower = url.toLowerCase();
    const extension = lower.includes(".png") ? "png" : "jpeg";
    return { buffer, extension };
  } catch (e) {
    return null;
  }
}

// Partage direct du fichier (WhatsApp, Bluetooth, clé USB via le gestionnaire de fichiers, etc.)
// quand l'appareil le permet ; sinon, téléchargement classique en repli.
// Charge une bibliothèque externe une seule fois (utilisé pour générer un vrai PDF téléchargeable).
function loadExternalScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Impossible de charger " + src));
    document.head.appendChild(script);
  });
}

// Remplace le fond d'une photo par une couleur unie, en détectant automatiquement la
// silhouette de la personne — modèle léger conçu pour mobile. Activable au choix ; si ça
// échoue ou prend trop de temps, on revient à la photo d'origine sans jamais la perdre.
// Retire un fond de couleur unie connue (ex: un tissu rouge derrière l'enfant) et le remplace
// par du blanc — beaucoup plus rapide et fiable que la détection de silhouette par IA, puisque
// ça n'a pas besoin de "deviner" la personne, juste de reconnaître une couleur précise.
function removeSolidBackdrop(file, backdropColor, maxDim = 900) {
  const target = {
    r: parseInt(backdropColor.slice(1, 3), 16),
    g: parseInt(backdropColor.slice(3, 5), 16),
    b: parseInt(backdropColor.slice(5, 7), 16),
  };
  return new Promise((resolve) => {
    const finish = (result) => resolve(result || file);
    const processCanvas = (source, width, height) => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(source, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const d = imageData.data;
        // Distance de couleur : proche du tissu → transparent puis blanc en dessous ;
        // un dégradé doux sur les bords pour ne pas laisser de contour dur.
        const CLOSE = 60;
        const FAR = 130;
        for (let i = 0; i < d.length; i += 4) {
          const dist = Math.sqrt((d[i] - target.r) ** 2 + (d[i + 1] - target.g) ** 2 + (d[i + 2] - target.b) ** 2);
          if (dist <= CLOSE) {
            d[i] = 255; d[i + 1] = 255; d[i + 2] = 255;
          } else if (dist < FAR) {
            const t = (dist - CLOSE) / (FAR - CLOSE);
            d[i] = Math.round(d[i] * t + 255 * (1 - t));
            d[i + 1] = Math.round(d[i + 1] * t + 255 * (1 - t));
            d[i + 2] = Math.round(d[i + 2] * t + 255 * (1 - t));
          }
        }
        ctx.putImageData(imageData, 0, 0);
        canvas.toBlob((blob) => finish(blob), "image/jpeg", 0.9);
      } catch (e) {
        finish(null);
      }
    };
    if (window.createImageBitmap) {
      createImageBitmap(file, { resizeWidth: maxDim, resizeQuality: "medium" })
        .then((bitmap) => { processCanvas(bitmap, bitmap.width, bitmap.height); bitmap.close?.(); })
        .catch(() => finish(null));
    } else {
      try {
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        const timeout = setTimeout(() => { URL.revokeObjectURL(objectUrl); finish(null); }, 8000);
        img.onload = () => {
          clearTimeout(timeout);
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            const scale = maxDim / Math.max(width, height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
          processCanvas(img, width, height);
          URL.revokeObjectURL(objectUrl);
        };
        img.onerror = () => { clearTimeout(timeout); URL.revokeObjectURL(objectUrl); finish(null); };
        img.src = objectUrl;
      } catch (e) {
        finish(null);
      }
    }
  });
}

async function replacePhotoBackground(file, bgColor = "#ffffff", maxDim = 640, onLog = () => {}) {
  const fallback = () => file;
  try {
    onLog("Chargement du modèle de détection...");
    await loadExternalScript("https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1.1675465747/selfie_segmentation.js");
    if (!window.SelfieSegmentation) { onLog("✗ Le modèle ne s'est pas chargé correctement — retour à la photo d'origine"); return fallback(); }
    onLog("✓ Modèle chargé");

    const bitmap = window.createImageBitmap
      ? await createImageBitmap(file, { resizeWidth: maxDim, resizeQuality: "medium" })
      : null;
    let sourceCanvas = document.createElement("canvas");
    if (bitmap) {
      sourceCanvas.width = bitmap.width;
      sourceCanvas.height = bitmap.height;
      sourceCanvas.getContext("2d").drawImage(bitmap, 0, 0);
      bitmap.close?.();
    } else {
      const img = await new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const im = new Image();
        im.onload = () => { URL.revokeObjectURL(objectUrl); resolve(im); };
        im.onerror = reject;
        im.src = objectUrl;
      });
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      sourceCanvas.width = img.width * scale;
      sourceCanvas.height = img.height * scale;
      sourceCanvas.getContext("2d").drawImage(img, 0, 0, sourceCanvas.width, sourceCanvas.height);
    }
    onLog("Photo préparée, lancement de la détection...");

    const segmenter = new window.SelfieSegmentation({
      locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1.1675465747/${f}`,
    });
    segmenter.setOptions({ modelSelection: 1 });

    const resultCanvas = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("délai dépassé (15s)")), 15000);
      segmenter.onResults((results) => {
        clearTimeout(timeout);
        try {
          onLog("✓ Silhouette détectée, composition en cours...");
          const out = document.createElement("canvas");
          out.width = sourceCanvas.width;
          out.height = sourceCanvas.height;
          const ctx = out.getContext("2d");
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, out.width, out.height);
          ctx.save();
          ctx.drawImage(results.segmentationMask, 0, 0, out.width, out.height);
          ctx.globalCompositeOperation = "source-in";
          ctx.drawImage(results.image, 0, 0, out.width, out.height);
          ctx.restore();
          resolve(out);
        } catch (e) {
          reject(e);
        }
      });
      segmenter.send({ image: sourceCanvas }).catch(reject);
    });

    segmenter.close?.();
    const blob = await new Promise((resolve) => resultCanvas.toBlob(resolve, "image/jpeg", 0.9));
    if (!blob) { onLog("✗ Échec de la conversion finale — retour à la photo d'origine"); return fallback(); }
    onLog("✓ Fond remplacé avec succès");
    return blob;
  } catch (e) {
    onLog(`✗ Erreur : ${e?.message || e} — retour à la photo d'origine`);
    return fallback();
  }
}

// Convertit une zone de l'écran (le bulletin) en un vrai fichier PDF téléchargé directement,
// sans passer par la fenêtre d'impression du téléphone.
async function downloadElementAsPdf(elementId, filename) {
  await loadExternalScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
  await loadExternalScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  const element = document.getElementById(elementId);
  if (!element || !window.html2canvas || !window.jspdf) throw new Error("Génération PDF indisponible");
  const canvas = await window.html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    // On ignore tout ce qui ne doit pas apparaître dans le PDF (la case de saisie de
    // l'appréciation, les boutons, etc.) — même logique que ce qui est déjà caché à l'impression.
    ignoreElements: (el) => el.classList && el.classList.contains("no-print"),
  });
  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  // On force le tout à tenir sur UNE seule page : on réduit l'image si besoin
  // pour qu'elle rentre entièrement dans la hauteur de la page, sans la couper.
  const marginPt = 20;
  const availableWidth = pageWidth - marginPt * 2;
  const availableHeight = pageHeight - marginPt * 2;
  const widthRatio = availableWidth / canvas.width;
  const heightRatio = availableHeight / canvas.height;
  const scaleRatio = Math.min(widthRatio, heightRatio);
  const finalWidth = canvas.width * scaleRatio;
  const finalHeight = canvas.height * scaleRatio;
  const x = (pageWidth - finalWidth) / 2;
  const y = marginPt;
  pdf.addImage(imgData, "JPEG", x, y, finalWidth, finalHeight);
  pdf.save(filename);
}

// Variante multi-pages : pour une feuille contenant plusieurs cartes/éléments qui peut être
// plus haute qu'une seule page — on découpe automatiquement sur autant de pages que nécessaire,
// sans jamais réduire le contenu (contrairement à la version "une page" ci-dessus).
async function downloadElementAsPdfMultiPage(elementId, filename) {
  await loadExternalScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
  await loadExternalScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  const element = document.getElementById(elementId);
  if (!element || !window.html2canvas || !window.jspdf) throw new Error("Génération PDF indisponible");
  const canvas = await window.html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    ignoreElements: (el) => el.classList && el.classList.contains("no-print"),
  });
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  let heightLeft = imgHeight;
  let position = 0;
  pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  pdf.save(filename);
}

// Supprime le fond clair d'une photo de signature (papier blanc, léger gris...) pour ne
// garder que l'encre — rend un vrai PNG transparent. Activable au choix, jamais automatique.
function removeLightBackground(file, maxDim = 700) {
  return new Promise((resolve) => {
    const finish = (result) => resolve(result || file);
    const processCanvas = (source, width, height) => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(source, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const d = imageData.data;
        // Seuils de luminosité : plus clair que 200 devient invisible, plus sombre que 130
        // reste pleinement visible (l'encre) — abaissés pour attraper aussi un papier qui
        // paraît grisâtre sous une lumière intérieure, pas seulement du blanc pur.
        const LIGHT = 200;
        const DARK = 130;
        for (let i = 0; i < d.length; i += 4) {
          const luminance = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          if (luminance >= LIGHT) {
            d[i + 3] = 0;
          } else if (luminance > DARK) {
            d[i + 3] = Math.round(((LIGHT - luminance) / (LIGHT - DARK)) * 255);
          }
        }
        ctx.putImageData(imageData, 0, 0);
        canvas.toBlob((blob) => finish(blob), "image/png");
      } catch (e) {
        finish(null);
      }
    };

    // Méthode économe en mémoire : le téléphone décode directement la photo en petite taille,
    // sans jamais garder la version géante (haute résolution) en mémoire.
    if (window.createImageBitmap) {
      createImageBitmap(file, { resizeWidth: maxDim, resizeQuality: "medium" })
        .then((bitmap) => {
          processCanvas(bitmap, bitmap.width, bitmap.height);
          bitmap.close?.();
        })
        .catch(() => {
          try {
            const objectUrl = URL.createObjectURL(file);
            const img = new Image();
            const timeout = setTimeout(() => { URL.revokeObjectURL(objectUrl); finish(null); }, 8000);
            img.onload = () => {
              clearTimeout(timeout);
              let { width, height } = img;
              if (width > maxDim || height > maxDim) {
                const scale = maxDim / Math.max(width, height);
                width = Math.round(width * scale);
                height = Math.round(height * scale);
              }
              processCanvas(img, width, height);
              URL.revokeObjectURL(objectUrl);
            };
            img.onerror = () => { clearTimeout(timeout); URL.revokeObjectURL(objectUrl); finish(null); };
            img.src = objectUrl;
          } catch (e) {
            finish(null);
          }
        });
    } else {
      try {
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        const timeout = setTimeout(() => { URL.revokeObjectURL(objectUrl); finish(null); }, 8000);
        img.onload = () => {
          clearTimeout(timeout);
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            const scale = maxDim / Math.max(width, height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
          processCanvas(img, width, height);
          URL.revokeObjectURL(objectUrl);
        };
        img.onerror = () => { clearTimeout(timeout); URL.revokeObjectURL(objectUrl); finish(null); };
        img.src = objectUrl;
      } catch (e) {
        finish(null);
      }
    }
  });
}

async function shareOrDownloadExcel(blob, filename) {
  try {
    const file = new File([blob], filename, { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: filename });
      return;
    }
  } catch (e) {
    if (e?.name === "AbortError") return; // L'utilisateur a annulé le partage — rien à faire de plus.
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function addSignatureFooter(workbook, sheet, startRow, { directeurName, directeurSignatureImg, teacherLabel, teacherName, teacherSignatureImg, ville }) {
  // "Fait à [ville], le [date du jour]" — juste avant les signatures, comme sur un vrai document officiel.
  if (ville) {
    const dateRow = sheet.addRow([`Fait à ${ville}, le ${new Date().toLocaleDateString("fr-FR")}`]);
    dateRow.getCell(1).font = { italic: true, size: 10, color: { argb: "FF20304A" } };
  }

  const gapRow = sheet.addRow([]);
  // Colonne 2 (Élève, large) plutôt que colonne 1 (N°, étroite) — sinon le texte du
  // libellé est coupé visuellement par la largeur réduite de la première colonne.
  const labelRow = sheet.addRow(["", "Le Directeur", "", "", "", teacherLabel]);
  labelRow.getCell(2).font = { bold: true, size: 10, color: { argb: "FF20304A" } };
  labelRow.getCell(6).font = { bold: true, size: 10, color: { argb: "FF20304A" } };

  // Réserve de la place pour les images de signature
  for (let i = 0; i < 3; i++) sheet.addRow([]);

  const nameRow = sheet.addRow(["", directeurName ? `${directeurName}` : "", "", "", "", teacherName || ""]);
  nameRow.getCell(2).font = { italic: true, size: 9, color: { argb: "FF7C7568" } };
  nameRow.getCell(6).font = { italic: true, size: 9, color: { argb: "FF7C7568" } };

  // L'image démarre une ligne EN DESSOUS du libellé (jamais dessus), pour ne jamais le
  // recouvrir — et reste bien centrée entre le libellé et le nom grâce aux 3 lignes réservées.
  if (directeurSignatureImg) {
    const imgId = workbook.addImage(directeurSignatureImg);
    sheet.addImage(imgId, { tl: { col: 1.2, row: labelRow.number + 0.3 }, ext: { width: 110, height: 45 } });
  }
  if (teacherSignatureImg) {
    const imgId = workbook.addImage(teacherSignatureImg);
    sheet.addImage(imgId, { tl: { col: 5.2, row: labelRow.number + 0.3 }, ext: { width: 110, height: 45 } });
  }
}

// Libellé du titre de la composition, selon le trimestre (ou la synthèse de fin d'année).
function termLabelFor(term, schoolYear) {
  const map = {
    "Trimestre 1": "Composition du 1er trimestre",
    "Trimestre 2": "Composition du 2ème trimestre",
    "Trimestre 3": "Composition du 3ème trimestre",
    "Annuel": "Résultats de fin d'année",
  };
  const label = map[term] || `Composition — ${term}`;
  return schoolYear ? `${label} ${schoolYear}` : label;
}

// En-tête officielle : I.R.E/D.P.E/D.S.E.E/École/Classe à gauche, République de Guinée à
// droite, puis le titre de la composition et "Classement par ordre de mérite" centrés.
// Rien ne s'affiche pour les lignes dont l'information n'a pas été renseignée par l'école.
async function writeOfficialHeader(workbook, sheet, schoolInfo, className, termLabel, span) {
  const colSpan = Math.max(span, 4);
  const halfSpan = Math.max(1, Math.floor(colSpan / 2));

  const leftLines = [];
  if (schoolInfo?.ire) leftLines.push(`I.R.E. : ${schoolInfo.ire}`);
  if (schoolInfo?.dpe) leftLines.push(`D.P.E. : ${schoolInfo.dpe}`);
  if (schoolInfo?.dsee) leftLines.push(`D.S.E.E. : ${schoolInfo.dsee}`);
  if (schoolInfo?.name) leftLines.push(`G.S. : ${schoolInfo.name}`);
  if (className) leftLines.push(`Classe : ${className}`);
  const rightLines = ["République de Guinée", "Travail - Justice - Solidarité"];

  const emblemImg = schoolInfo?.emblem_url ? await fetchImageForExcel(schoolInfo.emblem_url) : null;
  const firstRowNumber = sheet.rowCount + 1;

  const maxLines = Math.max(leftLines.length, rightLines.length);
  for (let i = 0; i < maxLines; i++) {
    const row = sheet.addRow([leftLines[i] || ""]);
    if (halfSpan > 1) sheet.mergeCells(row.number, 1, row.number, halfSpan);
    row.getCell(1).font = { bold: true, size: 11, color: { argb: "FF20304A" } };
    row.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
    if (rightLines[i]) {
      // Une colonne de large est réservée à gauche du texte pour l'emblème, quand il y en a un.
      const textStartCol = halfSpan + (emblemImg ? 2 : 1);
      sheet.mergeCells(row.number, textStartCol, row.number, colSpan);
      const rightCell = row.getCell(textStartCol);
      if (i === 0) {
        // "République de Guinée" ressort bien en gros caractère gras.
        rightCell.value = rightLines[i];
        rightCell.font = { bold: true, size: 13, color: { argb: "FF20304A" } };
      } else {
        // La devise reprend les couleurs du drapeau : Travail en rouge, Justice en jaune,
        // Solidarité en vert.
        rightCell.value = {
          richText: [
            { text: "Travail", font: { bold: true, size: 9, color: { argb: "FFCE1126" } } },
            { text: " - ", font: { size: 9, color: { argb: "FF20304A" } } },
            { text: "Justice", font: { bold: true, size: 9, color: { argb: "FFB8860B" } } },
            { text: " - ", font: { size: 9, color: { argb: "FF20304A" } } },
            { text: "Solidarité", font: { bold: true, size: 9, color: { argb: "FF009460" } } },
          ],
        };
      }
      rightCell.alignment = { horizontal: "right", vertical: "middle" };
    }
  }

  if (emblemImg) {
    const imgId = workbook.addImage(emblemImg);
    sheet.addImage(imgId, { tl: { col: halfSpan + 0.3, row: firstRowNumber - 1 + 0.1 }, ext: { width: 48, height: 48 } });
  }

  sheet.addRow([]);

  const addCentered = (text, size) => {
    const row = sheet.addRow([text]);
    sheet.mergeCells(row.number, 1, row.number, colSpan);
    row.getCell(1).font = { bold: true, size, color: { argb: "FF20304A" } };
    row.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
  };
  addCentered(termLabel, 13);
  addCentered("Classement par ordre de mérite", 11);
  sheet.addRow([]);
}

async function addStyledSheet(workbook, { title, headers, rows, boldRows = [], nameColIndex = 1, alwaysRedCols = [], schoolInfo, className, termLabel }) {
  const sheet = workbook.addWorksheet((title || "Feuille1").replace(/[\\/*?:[\]]/g, "").slice(0, 31));

  if (schoolInfo && termLabel) await writeOfficialHeader(workbook, sheet, schoolInfo, className, termLabel, headers.length);

  const titleRow = sheet.addRow([title]);
  sheet.mergeCells(titleRow.number, 1, titleRow.number, headers.length);
  titleRow.getCell(1).font = { bold: true, size: 14, color: { argb: "FF20304A" } };
  titleRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
  sheet.addRow([]);

  const headerRow = sheet.addRow(headers);
  headerRow.height = 30;
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
    col.width = i === 0 ? 5 : i === (nameColIndex - 1) ? 26 : 12;
  });
}

async function exportStyledExcel({ filename, title, headers, rows, boldRows = [], nameColIndex = 1, alwaysRedCols = [] }) {
  if (!window.ExcelJS) { alert("Le générateur Excel n'a pas pu se charger. Vérifie ta connexion et réessaie."); return; }
  const workbook = new window.ExcelJS.Workbook();
  await addStyledSheet(workbook, { title, headers, rows, boldRows, nameColIndex, alwaysRedCols });

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

// ---------- Carte "Code école" réutilisable (Fondateur, Comptable, Directeur) ----------
function SchoolCodeShareCard({ schoolCode, onShare }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const copyCode = () => {
    navigator.clipboard?.writeText(schoolCode || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  if (!schoolCode) return null;
  return (
    <>
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
    </>
  );
}

// ---------- Dashboard (fondateur / comptable) ----------
// ---------- Recettes du jour + historique (réutilisable : scolarité et services) ----------
function DailyRevenueCard({ title, payments, currency }) {
  const { t, lang } = useLang();
  const [showHistory, setShowHistory] = useState(false);
  const todayStr = new Date().toISOString().slice(0, 10);

  const byDate = useMemo(() => {
    const map = {};
    payments.forEach((p) => {
      const d = (p.date || "").slice(0, 10);
      if (!d) return;
      map[d] = (map[d] || 0) + Number(p.amount);
    });
    return Object.entries(map).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [payments]);

  const todayTotal = byDate.find(([d]) => d === todayStr)?.[1] || 0;

  return (
    <>
      <div className="rounded-2xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3" style={{ background: COLORS.positiveSoft }}>
        <div>
          <div className="text-xs uppercase font-semibold" style={{ color: COLORS.positive }}>{title}</div>
          <div className="text-2xl font-extrabold" style={{ color: COLORS.positive, fontFamily: "'IBM Plex Mono', monospace" }}>{fmt(todayTotal, currency)}</div>
        </div>
        <button onClick={() => setShowHistory(true)} className="text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5" style={{ background: "#fff", color: COLORS.positive }}>
          <Clock size={14} /> {t("view_daily_history")}
        </button>
      </div>

      {showHistory && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" style={{ background: "rgba(32,48,74,0.55)" }} onClick={() => setShowHistory(false)}>
          <div className="w-full max-w-sm max-h-[80vh] overflow-y-auto rounded-2xl p-5" style={{ background: COLORS.card }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("daily_history_title")}</h3>
              <button onClick={() => setShowHistory(false)} style={{ color: COLORS.inkSoft }}><X size={20} /></button>
            </div>
            {byDate.length === 0 ? (
              <EmptyState text={t("no_payments_yet")} />
            ) : (
              <div className="space-y-1.5">
                {byDate.map(([d, amount]) => (
                  <div key={d} className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: d === todayStr ? COLORS.positiveSoft : COLORS.paper }}>
                    <span className="text-sm font-medium" style={{ color: COLORS.ink }}>
                      {new Date(d).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                      {d === todayStr && <span className="ml-1.5 text-xs font-semibold" style={{ color: COLORS.positive }}>({t("today_label")})</span>}
                    </span>
                    <span className="text-sm font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.positive }}>{fmt(amount, currency)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function DashboardView({ stats, currency, schoolCode, role, availableYears, viewYear, setViewYear, currentYear, onStartNewYear, isArchiveView, onShare, payments }) {
  const { t } = useLang();
  const [showNewYear, setShowNewYear] = useState(false);
  const [newYearInput, setNewYearInput] = useState("");
  const [starting, setStarting] = useState(false);
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
            {availableYears.map((y) => <option key={y} value={y}>{y} — {t(`year_status_${yearStatusKey(y, currentYear)}`)}</option>)}
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

      {role === "fondateur" && <SchoolCodeShareCard schoolCode={schoolCode} onShare={onShare} />}

      <DailyRevenueCard title={t("today_tuition_collected")} payments={payments} currency={currency} />

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
function StudentsView({ students, paidByStudent, currency, readOnly, parents, subscribed, trialDaysLeft, levels, availableYears, viewYear, setViewYear, currentYear, onAdd, onDelete, onPay, onLink, onEdit }) {
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
                    <button onClick={() => onEdit(s)} className="text-left hover:underline" style={{ color: "inherit" }}>
                      {s.full_name}
                      {!s.gender && <span className="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "#FFF3D6", color: "#B8860B" }}>{t("gender_missing_badge")}</span>}
                    </button>
                    <div className="text-xs font-normal mt-0.5" style={{ color: s.parent_id ? COLORS.positive : COLORS.primary }}>
                      {s.parent_id ? (
                        <>
                          {t("parent_label")}: {parentName(s.parent_id) || t("linked")}
                          {parentPhone(s.parent_id) && (
                            <a href={`tel:${parentPhone(s.parent_id)}`} onClick={(e) => { e.stopPropagation(); skipUnloadGuard(); }} className="ml-1.5 underline" style={{ color: COLORS.primary }}>
                              {parentPhone(s.parent_id)}
                            </a>
                          )}
                        </>
                      ) : t("no_parent_linked")}
                    </div>
                    {s.statut_special && (
                      <div className="mt-1">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                          style={s.statut_special === "boursier" ? { background: "#E3F3E9", color: COLORS.positive } : { background: "#E7EAF0", color: COLORS.ink }}
                        >
                          {s.statut_special === "boursier" ? t("special_status_boursier") : t("special_status_protege")}
                        </span>
                      </div>
                    )}
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
          {availableYears && availableYears.length > 1 && (
            <select value={viewYear} onChange={(e) => setViewYear(e.target.value)} className="px-3 py-2.5 rounded-lg outline-none text-sm font-medium" style={inputStyle}>
              {availableYears.map((y) => <option key={y} value={y}>{y} — {t(`year_status_${yearStatusKey(y, currentYear)}`)}</option>)}
            </select>
          )}
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
// ---------- Frais de scolarité par classe (fondateur) ----------
// ---------- Services annexes : transport, cantine, informatique, librairie... ----------
// ---------- Bilan financier annuel (Fondateur uniquement) — vue de lecture seule qui rassemble
// scolarité, services et dépenses, sans jamais mélanger leur saisie respective. ----------
// ---------- Passage à la classe supérieure : préparer la liste (Fondateur/Directeur) ----------
// ---------- Calendrier scolaire partagé — visible par tous, modifiable par Directeur/Fondateur ----------
const EVENT_TYPE_STYLES = {
  vacances: { label: "vacances_type", color: "#2F7D4F", bg: "#E3F3E9" },
  examen: { label: "examen_type", color: "#B23B32", bg: "#FBE9E7" },
  reunion: { label: "reunion_type", color: "#C1502E", bg: "#FBEAE3" },
  rentree: { label: "rentree_type", color: "#20304A", bg: "#E7EAF0" },
  autre: { label: "autre_type", color: "#5B6B82", bg: "#F0F0EE" },
};

// ---------- Cahier de discipline / conduite ----------
const DISCIPLINE_TYPE_STYLES = {
  indiscipline: { label: "discipline_type_indiscipline", color: "#B23B32", bg: "#FBE9E7" },
  retard: { label: "discipline_type_retard", color: "#B8860B", bg: "#FFF3D6" },
  absence_non_justifiee: { label: "discipline_type_absence", color: "#B23B32", bg: "#FBE9E7" },
  bon_comportement: { label: "discipline_type_bon", color: "#2F7D4F", bg: "#E3F3E9" },
};

function DisciplineView({ students, notes, role, myUserId, onAdd, onDelete, onToggleShare }) {
  const { t, lang } = useLang();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [type, setType] = useState("indiscipline");
  const [note, setNote] = useState("");
  const [noteDate, setNoteDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const studentName = (id) => students.find((s) => s.id === id)?.full_name || "—";
  const filtered = notes.filter((n) => !search.trim() || studentName(n.student_id).toLowerCase().includes(search.toLowerCase()));

  const submit = async () => {
    if (!studentId) return;
    setSaving(true);
    await onAdd({ student_id: studentId, type, note: note.trim() || null, note_date: noteDate });
    setSaving(false);
    setShowForm(false);
    setStudentId(""); setNote(""); setType("indiscipline");
  };

  const handleToggleShare = async (n) => {
    setTogglingId(n.id);
    await onToggleShare(n.id, !n.shared_with_parent);
    setTogglingId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("nav_discipline")}</h1>
        <button onClick={() => setShowForm((v) => !v)} className="text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.primary, color: "#fff" }}>
          <Plus size={14} /> {t("add_note_button")}
        </button>
      </div>
      <p className="mb-5" style={{ color: COLORS.inkSoft }}>{t("discipline_subtitle")}</p>

      {showForm && (
        <div className="rounded-2xl p-4 mb-6" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <div className="mb-3">
            <FieldLabel>{t("student_label")}</FieldLabel>
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle}>
              <option value="">—</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.full_name} · {s.class_name}</option>)}
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div>
              <FieldLabel>{t("discipline_type_label")}</FieldLabel>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle}>
                {Object.entries(DISCIPLINE_TYPE_STYLES).map(([key, s]) => <option key={key} value={key}>{t(s.label)}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>{t("event_date_label")}</FieldLabel>
              <input type="date" value={noteDate} onChange={(e) => setNoteDate(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
            </div>
          </div>
          <div className="mb-3">
            <FieldLabel>{t("discipline_note_label")}</FieldLabel>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder={t("discipline_note_placeholder")} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
          </div>
          <button onClick={submit} disabled={saving || !studentId} className="text-sm font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.ink, color: "#fff" }}>
            {saving && <Loader2 className="animate-spin" size={14} />} {t("save")}
          </button>
        </div>
      )}

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search_student_placeholder")} className="w-full px-4 py-3 rounded-xl outline-none text-sm mb-5" style={inputStyle} />

      {filtered.length === 0 ? (
        <EmptyState text={t("no_discipline_notes")} />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((n) => {
            const style = DISCIPLINE_TYPE_STYLES[n.type] || DISCIPLINE_TYPE_STYLES.indiscipline;
            const canManageThis = role === "directeur" || n.author_id === myUserId;
            return (
              <div key={n.id} className="rounded-2xl p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <div>
                    <div className="font-semibold" style={{ color: COLORS.ink }}>{studentName(n.student_id)}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: style.bg, color: style.color }}>{t(style.label)}</span>
                      <span className="text-xs" style={{ color: COLORS.inkSoft }}>{new Date(n.note_date).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}</span>
                    </div>
                  </div>
                  {canManageThis && (
                    <button onClick={() => onDelete(n.id)} style={{ color: COLORS.inkSoft }}><Trash2 size={15} /></button>
                  )}
                </div>
                {n.note && <p className="text-sm mb-3" style={{ color: COLORS.ink }}>{n.note}</p>}
                {canManageThis && (
                  <button
                    onClick={() => handleToggleShare(n)}
                    disabled={togglingId === n.id}
                    className="text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5"
                    style={n.shared_with_parent ? { background: COLORS.positiveSoft, color: COLORS.positive } : { background: COLORS.paper, color: COLORS.inkSoft }}
                  >
                    {togglingId === n.id && <Loader2 className="animate-spin" size={12} />}
                    {n.shared_with_parent ? `✓ ${t("shared_with_parent_label")}` : t("share_with_parent_button")}
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

// ---------- Emploi du temps — géré par le Directeur, consulté par tous ----------
const TIMETABLE_DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

// ---------- Transfert / retrait de dossier élève (Directeur + Fondateur) ----------
// ---------- Journal hebdomadaire du personnel (jamais visible par les parents) ----------
function getMondayOf(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0 = dimanche
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function WeeklyJournalView({ entries, staffProfiles, myUserId, role, onAdd, onDelete }) {
  const { t, lang } = useLang();
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState("");
  const [weekStart, setWeekStart] = useState(getMondayOf(new Date().toISOString().slice(0, 10)));
  const [saving, setSaving] = useState(false);

  const authorName = (id) => staffProfiles.find((p) => p.user_id === id)?.full_name || "—";

  const submit = async () => {
    if (!content.trim()) return;
    setSaving(true);
    await onAdd({ week_start_date: weekStart, content: content.trim() });
    setSaving(false);
    setShowForm(false);
    setContent("");
  };

  const sorted = [...entries].sort((a, b) => b.week_start_date.localeCompare(a.week_start_date));

  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("nav_weekly_journal")}</h1>
        <button onClick={() => setShowForm((v) => !v)} className="text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.primary, color: "#fff" }}>
          <Plus size={14} /> {t("add_journal_entry_button")}
        </button>
      </div>
      <p className="mb-5" style={{ color: COLORS.inkSoft }}>{t("weekly_journal_subtitle")}</p>

      {showForm && (
        <div className="rounded-2xl p-4 mb-6" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <div className="mb-3">
            <FieldLabel>{t("week_of_label")}</FieldLabel>
            <input type="date" value={weekStart} onChange={(e) => setWeekStart(getMondayOf(e.target.value))} className="w-full sm:w-56 px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
          </div>
          <div className="mb-3">
            <FieldLabel>{t("journal_content_label")}</FieldLabel>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} placeholder={t("journal_content_placeholder")} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
          </div>
          <button onClick={submit} disabled={saving || !content.trim()} className="text-sm font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.ink, color: "#fff" }}>
            {saving && <Loader2 className="animate-spin" size={14} />} {t("save")}
          </button>
        </div>
      )}

      {sorted.length === 0 ? (
        <EmptyState text={t("no_journal_entries")} />
      ) : (
        <div className="space-y-3">
          {sorted.map((e) => {
            const weekEnd = new Date(e.week_start_date);
            weekEnd.setDate(weekEnd.getDate() + 5);
            const canManage = role === "directeur" || e.author_id === myUserId;
            return (
              <div key={e.id} className="rounded-2xl p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <div className="text-sm font-bold" style={{ color: COLORS.primary }}>
                    {t("week_of_label")} {new Date(e.week_start_date).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR", { day: "numeric", month: "short" })} – {weekEnd.toLocaleDateString(lang === "en" ? "en-US" : "fr-FR", { day: "numeric", month: "short" })}
                  </div>
                  {canManage && (
                    <button onClick={() => onDelete(e.id)} style={{ color: COLORS.inkSoft }}><Trash2 size={15} /></button>
                  )}
                </div>
                <p className="text-sm mb-2 whitespace-pre-wrap" style={{ color: COLORS.ink }}>{e.content}</p>
                <div className="text-xs" style={{ color: COLORS.inkSoft }}>{t("written_by_label")} {authorName(e.author_id)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StudentFileMovementsView({ movements, students, onAdd, onDelete }) {
  const { t, lang } = useLang();
  const [showForm, setShowForm] = useState(false);
  const [formClass, setFormClass] = useState("");
  const [studentId, setStudentId] = useState("");
  const [movementType, setMovementType] = useState("transfert");
  const [destination, setDestination] = useState("");
  const [reason, setReason] = useState("");
  const [movementDate, setMovementDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const studentName = (id) => students.find((s) => s.id === id)?.full_name || "—";
  const classNames = useMemo(() => [...new Set(students.map((s) => s.class_name).filter(Boolean))].sort(), [students]);
  const studentsInFormClass = students.filter((s) => s.class_name === formClass);

  const submit = async () => {
    if (!studentId || !destination.trim()) return;
    const student = students.find((s) => s.id === studentId);
    setSaving(true);
    await onAdd({ student_id: studentId, class_name: student?.class_name || formClass, movement_type: movementType, destination: destination.trim(), reason: reason.trim() || null, movement_date: movementDate });
    setSaving(false);
    setShowForm(false);
    setFormClass(""); setStudentId(""); setDestination(""); setReason("");
  };

  const filtered = movements.filter((m) => !search.trim() || studentName(m.student_id).toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("nav_file_movements")}</h1>
        <button onClick={() => setShowForm((v) => !v)} className="text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.primary, color: "#fff" }}>
          <Plus size={14} /> {t("record_movement_button")}
        </button>
      </div>
      <p className="mb-5" style={{ color: COLORS.inkSoft }}>{t("file_movements_subtitle")}</p>

      {showForm && (
        <div className="rounded-2xl p-4 mb-6" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div>
              <FieldLabel>{t("class_label")}</FieldLabel>
              <select value={formClass} onChange={(e) => { setFormClass(e.target.value); setStudentId(""); }} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle}>
                <option value="">—</option>
                {classNames.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>{t("student_label")}</FieldLabel>
              <select value={studentId} onChange={(e) => setStudentId(e.target.value)} disabled={!formClass} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle}>
                <option value="">—</option>
                {studentsInFormClass.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div>
              <FieldLabel>{t("movement_type_label")}</FieldLabel>
              <select value={movementType} onChange={(e) => setMovementType(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle}>
                <option value="transfert">{t("movement_type_transfert")}</option>
                <option value="retrait">{t("movement_type_retrait")}</option>
              </select>
            </div>
            <div>
              <FieldLabel>{t("movement_date_label")}</FieldLabel>
              <input type="date" value={movementDate} onChange={(e) => setMovementDate(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
            </div>
          </div>
          <div className="mb-3">
            <FieldLabel>{t("destination_label")}</FieldLabel>
            <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder={t("destination_placeholder")} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
          </div>
          <div className="mb-3">
            <FieldLabel>{t("reason_optional_label")}</FieldLabel>
            <input value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
          </div>
          <button onClick={submit} disabled={saving || !studentId || !destination.trim()} className="text-sm font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.ink, color: "#fff" }}>
            {saving && <Loader2 className="animate-spin" size={14} />} {t("save")}
          </button>
        </div>
      )}

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search_student_placeholder")} className="w-full px-4 py-3 rounded-xl outline-none text-sm mb-5" style={inputStyle} />

      {filtered.length === 0 ? (
        <EmptyState text={t("no_file_movements")} />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((m) => (
            <div key={m.id} className="rounded-2xl p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                <div>
                  <div className="font-semibold" style={{ color: COLORS.ink }}>{studentName(m.student_id)}</div>
                  {m.class_name && <div className="text-xs" style={{ color: COLORS.inkSoft }}>{m.class_name}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={m.movement_type === "transfert" ? { background: "#E7EAF0", color: COLORS.ink } : { background: "#FFF3D6", color: "#B8860B" }}>
                    {m.movement_type === "transfert" ? t("movement_type_transfert") : t("movement_type_retrait")}
                  </span>
                  <button onClick={() => onDelete(m.id)} style={{ color: COLORS.inkSoft }}><Trash2 size={15} /></button>
                </div>
              </div>
              <div className="text-sm" style={{ color: COLORS.inkSoft }}>{t("destination_label")} : <span style={{ color: COLORS.ink }}>{m.destination}</span></div>
              {m.reason && <div className="text-sm mt-0.5" style={{ color: COLORS.inkSoft }}>{m.reason}</div>}
              <div className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>{new Date(m.movement_date).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TimetableView({ slots, classOptions, canManage, onAdd, onDelete }) {
  const { t } = useLang();
  const [selectedClass, setSelectedClass] = useState(classOptions[0] || "");
  const [showForm, setShowForm] = useState(false);
  const [day, setDay] = useState("Lundi");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [subject, setSubject] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (classOptions.length > 0 && !classOptions.includes(selectedClass)) setSelectedClass(classOptions[0]); }, [classOptions]);

  const classSlots = slots.filter((s) => s.class_name === selectedClass);
  const byDay = TIMETABLE_DAYS.map((d) => ({
    day: d,
    rows: classSlots.filter((s) => s.day_of_week === d).sort((a, b) => a.start_time.localeCompare(b.start_time)),
  })).filter((d) => canManage || d.rows.length > 0);

  const submit = async () => {
    if (!startTime || !endTime || !subject.trim()) return;
    setSaving(true);
    await onAdd({ class_name: selectedClass, day_of_week: day, start_time: startTime, end_time: endTime, subject: subject.trim(), teacher_name: teacherName.trim() || null });
    setSaving(false);
    setStartTime(""); setEndTime(""); setSubject(""); setTeacherName("");
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("nav_timetable")}</h1>
      <p className="mb-5" style={{ color: COLORS.inkSoft }}>{t("timetable_subtitle")}</p>

      {classOptions.length === 0 ? (
        <EmptyState text={t("no_student_in_class")} />
      ) : (
        <>
          <div className="mb-5">
            <FieldLabel>{t("class_label")}</FieldLabel>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full sm:w-64 px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle}>
              {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {canManage && (
            <div className="rounded-2xl p-4 mb-6" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <button onClick={() => setShowForm((v) => !v)} className="text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 mb-3" style={{ background: COLORS.primary, color: "#fff" }}>
                <Plus size={14} /> {t("add_slot_button")}
              </button>
              {showForm && (
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <FieldLabel>{t("day_label")}</FieldLabel>
                      <select value={day} onChange={(e) => setDay(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle}>
                        {TIMETABLE_DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <FieldLabel>{t("start_time_label")}</FieldLabel>
                      <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
                    </div>
                    <div>
                      <FieldLabel>{t("end_time_label")}</FieldLabel>
                      <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>{t("subject_label")}</FieldLabel>
                      <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
                    </div>
                    <div>
                      <FieldLabel>{t("teacher_optional_label")}</FieldLabel>
                      <input value={teacherName} onChange={(e) => setTeacherName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
                    </div>
                  </div>
                  <button onClick={submit} disabled={saving} className="text-sm font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.ink, color: "#fff" }}>
                    {saving && <Loader2 className="animate-spin" size={14} />} {t("save")}
                  </button>
                </div>
              )}
            </div>
          )}

          {byDay.every((d) => d.rows.length === 0) ? (
            <EmptyState text={t("no_timetable_yet")} />
          ) : (
            byDay.map(({ day: d, rows }) => (
              <div key={d} className="mb-5">
                <h2 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: COLORS.primary }}>{d}</h2>
                {rows.length === 0 ? (
                  <p className="text-xs px-1" style={{ color: COLORS.inkSoft }}>{t("no_slot_this_day")}</p>
                ) : (
                  <div className="space-y-2">
                    {rows.map((s) => (
                      <div key={s.id} className="rounded-xl p-3 flex items-center justify-between" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                        <div className="flex items-center gap-3">
                          <div className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: COLORS.paper, color: COLORS.ink, fontFamily: "'IBM Plex Mono', monospace" }}>{s.start_time}–{s.end_time}</div>
                          <div>
                            <div className="text-sm font-semibold" style={{ color: COLORS.ink }}>{s.subject}</div>
                            {s.teacher_name && <div className="text-xs" style={{ color: COLORS.inkSoft }}>{s.teacher_name}</div>}
                          </div>
                        </div>
                        {canManage && (
                          <button onClick={() => onDelete(s.id)} style={{ color: COLORS.inkSoft }}><Trash2 size={15} /></button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}

function CalendarView({ events, canManage, onAdd, onDelete, onUpdateStatus }) {
  const { t, lang } = useLang();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState("autre");
  const [saving, setSaving] = useState(false);
  const [statusSavingId, setStatusSavingId] = useState(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => e.event_date >= todayStr);
  const past = events.filter((e) => e.event_date < todayStr).sort((a, b) => b.event_date.localeCompare(a.event_date));

  const submit = async () => {
    if (!title.trim() || !eventDate) return;
    setSaving(true);
    await onAdd({ title: title.trim(), description: description.trim() || null, event_date: eventDate, event_type: eventType });
    setSaving(false);
    setShowForm(false);
    setTitle(""); setDescription(""); setEventDate(""); setEventType("autre");
  };

  const STATUS_STYLES = {
    a_faire: { label: "status_a_faire", color: COLORS.inkSoft, bg: COLORS.paper },
    en_cours: { label: "status_en_cours", color: "#B8860B", bg: "#FFF3D6" },
    termine: { label: "status_termine", color: COLORS.positive, bg: COLORS.positiveSoft },
  };

  const cycleStatus = async (ev) => {
    const order = ["a_faire", "en_cours", "termine"];
    const next = order[(order.indexOf(ev.status) + 1) % order.length];
    setStatusSavingId(ev.id);
    await onUpdateStatus(ev.id, next);
    setStatusSavingId(null);
  };

  const EventCard = ({ ev }) => {
    const style = EVENT_TYPE_STYLES[ev.event_type] || EVENT_TYPE_STYLES.autre;
    const statusStyle = STATUS_STYLES[ev.status] || STATUS_STYLES.a_faire;
    return (
      <div className="rounded-2xl p-4 flex items-start justify-between gap-3" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: style.bg, color: style.color }}>{t(style.label)}</span>
            <span className="text-xs" style={{ color: COLORS.inkSoft }}>
              {new Date(ev.event_date).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          <div className="font-semibold" style={{ color: COLORS.ink }}>{ev.title}</div>
          {ev.description && <div className="text-sm mt-0.5" style={{ color: COLORS.inkSoft }}>{ev.description}</div>}
          <button
            onClick={() => canManage && cycleStatus(ev)}
            disabled={!canManage || statusSavingId === ev.id}
            className="text-xs font-semibold px-2.5 py-1 rounded-full mt-2 inline-flex items-center gap-1.5"
            style={{ background: statusStyle.bg, color: statusStyle.color, cursor: canManage ? "pointer" : "default" }}
          >
            {statusSavingId === ev.id && <Loader2 className="animate-spin" size={11} />} {t(statusStyle.label)}
          </button>
        </div>
        {canManage && (
          <button onClick={() => onDelete(ev.id)} className="shrink-0" style={{ color: COLORS.inkSoft }}><Trash2 size={15} /></button>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("nav_calendar")}</h1>
        {canManage && (
          <button onClick={() => setShowForm((v) => !v)} className="text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.primary, color: "#fff" }}>
            <Plus size={14} /> {t("add_event_button")}
          </button>
        )}
      </div>
      <p className="mb-5" style={{ color: COLORS.inkSoft }}>{t("calendar_subtitle")}</p>

      {showForm && (
        <div className="rounded-2xl p-4 mb-6" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div>
              <FieldLabel>{t("event_title_label")}</FieldLabel>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("event_title_placeholder")} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
            </div>
            <div>
              <FieldLabel>{t("event_date_label")}</FieldLabel>
              <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
            </div>
          </div>
          <div className="mb-3">
            <FieldLabel>{t("event_type_label")}</FieldLabel>
            <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="w-full sm:w-64 px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle}>
              {Object.entries(EVENT_TYPE_STYLES).map(([key, s]) => <option key={key} value={key}>{t(s.label)}</option>)}
            </select>
          </div>
          <div className="mb-3">
            <FieldLabel>{t("event_description_label")}</FieldLabel>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
          </div>
          <button onClick={submit} disabled={saving} className="text-sm font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.ink, color: "#fff" }}>
            {saving && <Loader2 className="animate-spin" size={14} />} {t("save")}
          </button>
        </div>
      )}

      <h2 className="text-lg font-bold mb-3" style={{ color: COLORS.ink }}>{t("upcoming_events_title")}</h2>
      {upcoming.length === 0 ? (
        <EmptyState text={t("no_upcoming_events")} />
      ) : (
        <div className="space-y-2.5 mb-8">
          {upcoming.map((ev) => <EventCard key={ev.id} ev={ev} />)}
        </div>
      )}

      {past.length > 0 && (
        <>
          <h2 className="text-lg font-bold mb-3" style={{ color: COLORS.inkSoft }}>{t("past_events_title")}</h2>
          <div className="space-y-2.5 opacity-70">
            {past.map((ev) => <EventCard key={ev.id} ev={ev} />)}
          </div>
        </>
      )}
    </div>
  );
}

function PromotionPrepView({ students, viewYear, promotionEntries, levelType, grades, gradesSecondaire, passThreshold, onGenerate, onUpdateEntry }) {
  const { t } = useLang();
  const [targetYear, setTargetYear] = useState("");
  const [generating, setGenerating] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [selectedTargetYear, setSelectedTargetYear] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  const existingTargetYears = useMemo(() => [...new Set(promotionEntries.map((p) => p.target_school_year))].sort().reverse(), [promotionEntries]);
  const activeYear = selectedTargetYear || existingTargetYears[0] || "";
  const entriesForYear = promotionEntries.filter((p) => p.target_school_year === activeYear);

  const currentStudents = students.filter((s) => s.school_year === viewYear);
  const byClass = useMemo(() => {
    const map = {};
    entriesForYear.forEach((entry) => {
      const student = currentStudents.find((s) => s.id === entry.source_student_id);
      if (!student) return;
      (map[student.class_name] = map[student.class_name] || []).push({ entry, student });
    });
    return map;
  }, [entriesForYear, currentStudents]);
  const classNamesForYear = useMemo(() => Object.keys(byClass).sort(), [byClass]);
  useEffect(() => {
    if (classNamesForYear.length > 0 && !classNamesForYear.includes(selectedClass)) setSelectedClass(classNamesForYear[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classNamesForYear.join("|")]);

  const handleGenerate = async () => {
    if (!targetYear.trim()) return;
    setGenerating(true);
    await onGenerate(targetYear.trim());
    setSelectedTargetYear(targetYear.trim());
    setGenerating(false);
  };

  const toggleRepeat = async (entry, student) => {
    setSavingId(entry.id);
    const willRepeat = !entry.is_repeating;
    await onUpdateEntry(entry.id, {
      is_repeating: willRepeat,
      target_class_name: willRepeat ? student.class_name : (getNextClass(student.class_name) || null),
      target_level: willRepeat ? student.level : student.level,
    });
    setSavingId(null);
  };

  const changeTargetClass = async (entry, newClass) => {
    setSavingId(entry.id);
    await onUpdateEntry(entry.id, { target_class_name: newClass });
    setSavingId(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("nav_promotion")}</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>{t("promotion_prep_subtitle")}</p>

      <div className="rounded-2xl p-5 mb-6" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <FieldLabel>{t("target_year_label")}</FieldLabel>
        <div className="flex gap-2">
          <input value={targetYear} onChange={(e) => setTargetYear(e.target.value)} placeholder={t("target_year_placeholder")} className="flex-1 px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
          <button onClick={handleGenerate} disabled={generating} className="text-sm font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.primary, color: "#fff" }}>
            {generating && <Loader2 className="animate-spin" size={14} />} {t("generate_list_button")}
          </button>
        </div>
        <p className="text-xs mt-2" style={{ color: COLORS.inkSoft }}>{t("promotion_generate_hint")}</p>
      </div>

      {existingTargetYears.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          <div>
            <FieldLabel>{t("viewing_year_label")}</FieldLabel>
            <select value={activeYear} onChange={(e) => setSelectedTargetYear(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle}>
              {existingTargetYears.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {classNamesForYear.length > 0 && (
            <div>
              <FieldLabel>{t("class_label")}</FieldLabel>
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle}>
                {classNamesForYear.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      {classNamesForYear.length === 0 ? (
        <EmptyState text={t("no_promotion_list_yet")} />
      ) : (
        (() => {
          const className = selectedClass;
          const rows = byClass[className] || [];
          return (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3" style={{ color: COLORS.primary }}>{className}</h2>
            <div className="space-y-2">
              {rows.map(({ entry, student }) => {
                const avg = computeStudentQuickAverage(student, grades, gradesSecondaire);
                const threshold = passThreshold ?? 10;
                return (
                <div key={entry.id} className="rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3" style={{ background: entry.is_repeating ? "#FFF3D6" : COLORS.card, border: `1px solid ${entry.is_repeating ? "#E8B84B" : COLORS.line}` }}>
                  <div>
                    <div className="font-semibold flex items-center gap-2 flex-wrap" style={{ color: student.gender === "Fille" ? COLORS.negative : COLORS.ink }}>
                      {student.full_name}
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={
                          avg === null
                            ? { background: COLORS.paper, color: COLORS.inkSoft }
                            : avg >= threshold
                            ? { background: COLORS.positiveSoft, color: COLORS.positive }
                            : { background: COLORS.negativeSoft, color: COLORS.negative }
                        }
                      >
                        {avg === null ? t("no_grades_yet") : `${t("average_short")} ${avg.toFixed(2)}`}
                      </span>
                      {entry.is_repeating && entry.status !== "enrolled" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{ background: "#E8B84B", color: "#fff" }}>{t("repeating_label")}</span>
                      )}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: COLORS.inkSoft }}>
                      {entry.status === "enrolled" ? (
                        <span style={{ color: COLORS.positive, fontWeight: 600 }}>{t("already_enrolled_badge")}</span>
                      ) : entry.is_repeating ? (
                        <>{t("stays_in_class_label")} <b style={{ color: COLORS.ink }}>{entry.target_class_name}</b></>
                      ) : (
                        <>{className} → {entry.target_class_name ? <b style={{ color: COLORS.ink }}>{entry.target_class_name}</b> : <span style={{ color: COLORS.primary }}>{t("needs_manual_class")}</span>}</>
                      )}
                    </div>
                  </div>
                  {entry.status !== "enrolled" && (
                    <div className="flex items-center gap-2">
                      <select
                        value={entry.target_class_name || ""}
                        onChange={(e) => changeTargetClass(entry, e.target.value)}
                        disabled={savingId === entry.id}
                        className="text-xs px-2 py-2 rounded-lg outline-none"
                        style={inputStyle}
                      >
                        <option value="">—</option>
                        {getLevels(levelType).flatMap((lvl) => getClassOptions(lvl)).map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <label className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-2 rounded-lg cursor-pointer" style={{ background: entry.is_repeating ? COLORS.primarySoft : COLORS.paper, color: entry.is_repeating ? COLORS.primary : COLORS.inkSoft }}>
                        <input type="checkbox" checked={entry.is_repeating} onChange={() => toggleRepeat(entry, student)} disabled={savingId === entry.id} className="w-3.5 h-3.5" />
                        {t("repeating_label")}
                      </label>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </div>
          );
        })()
      )}
    </div>
  );
}

// ---------- Réinscriptions (Comptable) : accueillir un parent, réinscrire l'élève ----------
function ReenrollmentView({ students, promotionEntries, tuitionFees, currency, grades, gradesSecondaire, passThreshold, onEnroll }) {
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [openEntry, setOpenEntry] = useState(null);
  const [className, setClassName] = useState("");
  const [totalDue, setTotalDue] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const pending = promotionEntries.filter((p) => p.status === "pending");
  const allRows = pending
    .map((entry) => ({ entry, student: students.find((s) => s.id === entry.source_student_id) }))
    .filter((r) => r.student);

  // On regroupe par classe ACTUELLE de l'élève (celle qu'il vient de terminer) — c'est là que
  // le comptable ira chercher, pas par sa future classe qui peut varier (passage ou redoublement).
  const sourceClassNames = useMemo(() => [...new Set(allRows.map((r) => r.student.class_name))].sort(), [allRows]);
  useEffect(() => { if (!selectedClass && sourceClassNames.length > 0) setSelectedClass(sourceClassNames[0]); }, [sourceClassNames]);

  const rows = allRows
    .filter((r) => r.student.class_name === selectedClass)
    .filter((r) => !search.trim() || r.student.full_name.toLowerCase().includes(search.toLowerCase()))
    // Admis (passage en classe supérieure) en premier, redoublants ensuite — pour repérer vite.
    .sort((a, b) => Number(a.entry.is_repeating) - Number(b.entry.is_repeating));
  const firstRepeatingIndex = rows.findIndex((r) => r.entry.is_repeating);

  const openForm = (entry, student) => {
    setOpenEntry(entry);
    setClassName(entry.target_class_name || student.class_name);
    const fee = tuitionFees.find((f) => f.class_name === (entry.target_class_name || student.class_name));
    setTotalDue(fee ? String(fee.amount) : "");
    setPaymentAmount("");
    setError("");
  };

  const submit = async () => {
    if (!className.trim()) { setError(t("fill_class_title")); return; }
    setSaving(true);
    const student = students.find((s) => s.id === openEntry.source_student_id);
    const result = await onEnroll(openEntry, student, { className: className.trim(), level: student.level, totalDue: parseFloat(totalDue) || 0, paymentAmount });
    setSaving(false);
    if (result && result !== "limit") setError(result);
    else setOpenEntry(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("nav_reenrollment")}</h1>
      <p className="mb-5" style={{ color: COLORS.inkSoft }}>{t("reenrollment_subtitle")}</p>

      {sourceClassNames.length === 0 ? (
        <EmptyState text={t("no_pending_reenrollment")} />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            <div>
              <FieldLabel>{t("class_label")}</FieldLabel>
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle}>
                {sourceClassNames.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>{t("search_label")}</FieldLabel>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search_student_placeholder")} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
            </div>
          </div>

          {rows.length === 0 ? (
            <EmptyState text={t("no_pending_reenrollment")} />
      ) : (
        <div className="space-y-2">
          {rows.map(({ entry, student }, i) => (
            <React.Fragment key={entry.id}>
              {i === firstRepeatingIndex && (
                <div className="rounded-xl px-4 py-2.5 mt-4 mb-1 text-xs font-bold uppercase tracking-wide" style={{ background: "#E8B84B", color: "#fff" }}>
                  {t("repeating_section_title")}
                </div>
              )}
              {i === 0 && firstRepeatingIndex !== 0 && (
                <div className="rounded-xl px-4 py-2.5 mb-1 text-xs font-bold uppercase tracking-wide" style={{ background: COLORS.positive, color: "#fff" }}>
                  {t("promoted_section_title")}
                </div>
              )}
            <div className="rounded-2xl p-4" style={{ background: entry.is_repeating ? "#FFF3D6" : COLORS.card, border: `1px solid ${entry.is_repeating ? "#E8B84B" : COLORS.line}` }}>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <div>
                  <div className="font-semibold flex items-center gap-2 flex-wrap" style={{ color: student.gender === "Fille" ? COLORS.negative : COLORS.ink }}>
                    {student.full_name}
                    {(() => {
                      const avg = computeStudentQuickAverage(student, grades, gradesSecondaire);
                      const threshold = passThreshold ?? 10;
                      return (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={
                            avg === null
                              ? { background: COLORS.paper, color: COLORS.inkSoft }
                              : avg >= threshold
                              ? { background: COLORS.positiveSoft, color: COLORS.positive }
                              : { background: COLORS.negativeSoft, color: COLORS.negative }
                          }
                        >
                          {avg === null ? t("no_grades_yet") : `${t("average_short")} ${avg.toFixed(2)}`}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="mt-1.5">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
                      style={entry.is_repeating ? { background: "#E8B84B", color: "#fff" } : { background: COLORS.positiveSoft, color: COLORS.positive }}
                    >
                      {entry.is_repeating ? t("status_repeating_label") : t("status_promoted_label")}
                    </span>
                  </div>
                  <div className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>
                    {entry.is_repeating ? (
                      <>{t("stays_in_class_label")} <b style={{ color: COLORS.ink }}>{entry.target_class_name}</b></>
                    ) : (
                      <>{student.class_name} → {entry.target_class_name ? <b style={{ color: COLORS.ink }}>{entry.target_class_name}</b> : <span style={{ color: COLORS.primary }}>{t("needs_manual_class")}</span>}</>
                    )}
                  </div>
                </div>
                <button onClick={() => openForm(entry, student)} className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ background: COLORS.ink, color: "#fff" }}>
                  {t("enroll_for_year_button")} {entry.target_school_year}
                </button>
              </div>

              {openEntry?.id === entry.id && (
                <div className="mt-3 pt-3 space-y-3" style={{ borderTop: `1px solid ${COLORS.line}` }}>
                  <p className="text-xs" style={{ color: COLORS.inkSoft }}>{t("class_prefilled_hint")}</p>
                  <div>
                    <FieldLabel>{t("class_label")}</FieldLabel>
                    <input value={className} onChange={(e) => setClassName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
                  </div>
                  <div>
                    <FieldLabel>{t("total_due_label")}</FieldLabel>
                    <input type="number" value={totalDue} onChange={(e) => setTotalDue(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
                  </div>
                  <div>
                    <FieldLabel>{t("first_payment_label")}</FieldLabel>
                    <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder={t("amount_placeholder")} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
                  </div>
                  {error && <div className="text-sm" style={{ color: COLORS.negative }}>{error}</div>}
                  <div className="flex gap-2">
                    <button onClick={submit} disabled={saving} className="flex-1 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5" style={{ background: COLORS.positive, color: "#fff" }}>
                      {saving && <Loader2 className="animate-spin" size={14} />} {t("confirm_enrollment_button")}
                    </button>
                    <button onClick={() => setOpenEntry(null)} className="px-4 py-2.5 rounded-lg font-semibold text-sm" style={{ color: COLORS.inkSoft }}>{t("close_button")}</button>
                  </div>
                </div>
              )}
            </div>
            </React.Fragment>
          ))}
        </div>
          )}
        </>
      )}
    </div>
  );
}

// ---------- Fiche de renseignements des élèves (PDF imprimable, par classe) ----------
// ---------- Reçu de paiement Mobile Money (PDF, une fois le paiement confirmé) ----------
function PaymentReceiptView({ schoolName, declaration, studentName, currency, onClose }) {
  const { t, lang } = useLang();

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto" style={{ background: "rgba(32,48,74,0.55)" }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt-print-area, #receipt-print-area * { visibility: visible; }
          #receipt-print-area { position: absolute; top: 0; left: 0; width: 100%; margin: 0; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="min-h-screen flex items-start justify-center p-3 sm:p-6">
        <div className="w-full max-w-md">
          <div className="flex justify-end gap-2 mb-3 no-print">
            <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm" style={{ background: COLORS.ink, color: "#fff" }}>
              <Printer size={15} /> {t("print_pdf_button")}
            </button>
            <button onClick={onClose} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm" style={{ background: "#fff", color: COLORS.ink }}>
              <X size={15} /> {t("close_button")}
            </button>
          </div>

          <div id="receipt-print-area" className="rounded-2xl p-7" style={{ background: "#fff", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
            <div className="text-center mb-6 pb-5" style={{ borderBottom: `2px solid ${COLORS.ink}` }}>
              <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: COLORS.inkSoft }}>{t("republic_header")}</div>
              <h1 className="text-lg font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{schoolName}</h1>
              <div className="text-lg font-bold" style={{ color: COLORS.positive }}>{t("receipt_title")}</div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm"><span style={{ color: COLORS.inkSoft }}>{t("full_name_label")}</span><span className="font-semibold" style={{ color: COLORS.ink }}>{studentName}</span></div>
              <div className="flex justify-between text-sm"><span style={{ color: COLORS.inkSoft }}>{t("amount_label")}</span><span className="font-bold" style={{ color: COLORS.positive, fontFamily: "'IBM Plex Mono', monospace" }}>{fmt(declaration.amount, currency)}</span></div>
              <div className="flex justify-between text-sm"><span style={{ color: COLORS.inkSoft }}>{t("momo_reference_label")}</span><span className="font-medium" style={{ color: COLORS.ink }}>{declaration.reference_code || "—"}</span></div>
              <div className="flex justify-between text-sm"><span style={{ color: COLORS.inkSoft }}>{t("confirmed_on_label")}</span><span className="font-medium" style={{ color: COLORS.ink }}>{new Date(declaration.confirmed_at).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}</span></div>
            </div>
            <div className="text-center py-3 rounded-xl" style={{ background: COLORS.positiveSoft }}>
              <span className="text-sm font-bold" style={{ color: COLORS.positive }}>✓ {t("payment_confirmed_label")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Déclarations de paiement Mobile Money (Comptable) ----------
function PaymentDeclarationsView({ declarations, students, canManage, onConfirm, onReject, onDelete }) {
  const { t, lang } = useLang();
  const [busyId, setBusyId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [zoomedImg, setZoomedImg] = useState(null);

  const studentName = (id) => students.find((s) => s.id === id)?.full_name || "—";
  const pending = declarations.filter((d) => d.status === "pending");
  const resolved = declarations.filter((d) => d.status !== "pending").slice(0, 20);

  const handleConfirm = async (d) => {
    setBusyId(d.id);
    await onConfirm(d);
    setBusyId(null);
  };
  const handleReject = async (d) => {
    setBusyId(d.id);
    await onReject(d, rejectReason.trim());
    setBusyId(null);
    setRejectingId(null);
    setRejectReason("");
  };

  const DeclCard = ({ d }) => (
    <div className="rounded-2xl p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <div>
          <div className="font-semibold" style={{ color: COLORS.ink }}>{studentName(d.student_id)}</div>
          <div className="text-xs mt-0.5" style={{ color: COLORS.inkSoft }}>{new Date(d.created_at).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")} {new Date(d.created_at).toLocaleTimeString(lang === "en" ? "en-US" : "fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
        <div className="text-lg font-bold" style={{ color: COLORS.positive, fontFamily: "'IBM Plex Mono', monospace" }}>{fmt(d.amount, "GNF")}</div>
      </div>
      <div className="text-sm mb-2" style={{ color: COLORS.inkSoft }}>{t("momo_reference_label")} : <span className="font-medium" style={{ color: COLORS.ink }}>{d.reference_code || "—"}</span></div>
      {d.screenshot_url && (
        <button onClick={() => setZoomedImg(d.screenshot_url)} className="mb-3 block">
          <img src={d.screenshot_url} alt="" className="h-20 rounded-lg object-cover" style={{ border: `1px solid ${COLORS.line}` }} />
        </button>
      )}

      {d.status === "pending" ? (
        rejectingId === d.id ? (
          <div className="space-y-2">
            <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder={t("reject_reason_placeholder")} className="w-full px-3 py-2 rounded-lg outline-none text-sm" style={inputStyle} />
            <div className="flex gap-2">
              <button onClick={() => handleReject(d)} disabled={busyId === d.id} className="flex-1 py-2 rounded-lg font-semibold text-sm" style={{ background: COLORS.negative, color: "#fff" }}>{t("confirm_reject_button")}</button>
              <button onClick={() => setRejectingId(null)} className="px-3 py-2 rounded-lg text-sm" style={{ color: COLORS.inkSoft }}>{t("close_button")}</button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => handleConfirm(d)} disabled={busyId === d.id} className="flex-1 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5" style={{ background: COLORS.positive, color: "#fff" }}>
              {busyId === d.id && <Loader2 className="animate-spin" size={13} />} {t("confirm_payment_button")}
            </button>
            <button onClick={() => setRejectingId(d.id)} className="px-4 py-2.5 rounded-lg font-semibold text-sm" style={{ background: COLORS.negativeSoft, color: COLORS.negative }}>{t("reject_button")}</button>
          </div>
        )
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={d.status === "confirmed" ? { background: COLORS.positiveSoft, color: COLORS.positive } : { background: COLORS.negativeSoft, color: COLORS.negative }}>
            {d.status === "confirmed" ? `✓ ${t("declaration_status_confirmed")}` : `✕ ${t("declaration_status_rejected")}${d.rejection_reason ? " — " + d.rejection_reason : ""}`}
          </span>
          {onDelete && (
            <button onClick={() => onDelete(d.id)} style={{ color: COLORS.inkSoft }}><Trash2 size={14} /></button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("nav_payment_declarations")}</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>{t("payment_declarations_subtitle")}</p>

      <h2 className="text-lg font-bold mb-3" style={{ color: COLORS.primary }}>{t("pending_declarations_title")} ({pending.length})</h2>
      {pending.length === 0 ? (
        <EmptyState text={t("no_pending_declarations")} />
      ) : (
        <div className="space-y-2.5 mb-8">{pending.map((d) => <DeclCard key={d.id} d={d} />)}</div>
      )}

      {resolved.length > 0 && (
        <>
          <h2 className="text-lg font-bold mb-3" style={{ color: COLORS.inkSoft }}>{t("recent_declarations_title")}</h2>
          <div className="space-y-2.5 opacity-80">{resolved.map((d) => <DeclCard key={d.id} d={d} />)}</div>
        </>
      )}

      {zoomedImg && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setZoomedImg(null)}>
          <img src={zoomedImg} alt="" className="max-w-full max-h-full rounded-lg" />
          <button onClick={() => setZoomedImg(null)} className="absolute top-4 right-4 p-2 rounded-full" style={{ background: "#fff" }}><X size={18} /></button>
        </div>
      )}
    </div>
  );
}

function ClassInfoSheetView({ schoolName, className, students, onClose }) {
  const { t } = useLang();

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto" style={{ background: "rgba(32,48,74,0.55)" }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #infosheet-print-area, #infosheet-print-area * { visibility: visible; }
          #infosheet-print-area { position: absolute; top: 0; left: 0; width: 100%; margin: 0; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="min-h-screen flex items-start justify-center p-3 sm:p-6">
        <div className="w-full max-w-3xl">
          <div className="flex justify-end gap-2 mb-3 no-print flex-wrap">
            <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm" style={{ background: COLORS.ink, color: "#fff" }}>
              <Printer size={15} /> {t("print_pdf_button")}
            </button>
            <button onClick={onClose} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm" style={{ background: "#fff", color: COLORS.ink }}>
              <X size={15} /> {t("close_button")}
            </button>
          </div>

          <div id="infosheet-print-area" className="rounded-2xl p-7 sm:p-10" style={{ background: "#fff", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
            <div className="text-center mb-6 pb-5" style={{ borderBottom: `2px solid ${COLORS.ink}` }}>
              <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: COLORS.inkSoft }}>{t("republic_header")}</div>
              <h1 className="text-xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{schoolName}</h1>
              <div className="text-lg font-bold" style={{ color: COLORS.primary }}>{t("info_sheet_title")}</div>
              <div className="text-sm mt-1" style={{ color: COLORS.inkSoft }}>{className}</div>
            </div>

            <div className="overflow-x-auto">
              <table className="text-xs" style={{ borderCollapse: "collapse", minWidth: 650 }}>
                <thead>
                  <tr style={{ background: COLORS.ink }}>
                    <th className="text-left px-2 py-2 font-semibold whitespace-nowrap" style={{ color: "#fff" }}>{t("full_name_label")}</th>
                    <th className="text-center px-2 py-2 font-semibold whitespace-nowrap" style={{ color: "#fff" }}>{t("gender_col_short")}</th>
                    <th className="text-center px-2 py-2 font-semibold whitespace-nowrap" style={{ color: "#fff" }}>{t("birth_date_label")}</th>
                    <th className="text-left px-2 py-2 font-semibold whitespace-nowrap" style={{ color: "#fff" }}>{t("birth_place_label")}</th>
                    <th className="text-left px-2 py-2 font-semibold whitespace-nowrap" style={{ color: "#fff" }}>{t("father_name_label")}</th>
                    <th className="text-left px-2 py-2 font-semibold whitespace-nowrap" style={{ color: "#fff" }}>{t("mother_name_label")}</th>
                    <th className="text-left px-2 py-2 font-semibold whitespace-nowrap" style={{ color: "#fff" }}>{t("contact_phone_col")}</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={s.id} style={{ borderBottom: `1px solid ${COLORS.line}`, background: i % 2 === 1 ? COLORS.paper : "transparent" }}>
                      <td className="px-2 py-2 font-medium whitespace-nowrap" style={{ color: COLORS.ink }}>{s.full_name}</td>
                      <td className="px-2 py-2 text-center whitespace-nowrap" style={{ color: COLORS.inkSoft }}>{s.gender === "Fille" ? "F" : "M"}</td>
                      <td className="px-2 py-2 text-center whitespace-nowrap" style={{ color: COLORS.inkSoft }}>{s.date_naissance ? new Date(s.date_naissance).toLocaleDateString("fr-FR") : "—"}</td>
                      <td className="px-2 py-2 whitespace-nowrap" style={{ color: COLORS.inkSoft }}>{s.lieu_naissance || "—"}</td>
                      <td className="px-2 py-2 whitespace-nowrap" style={{ color: COLORS.inkSoft }}>{s.nom_pere || "—"}</td>
                      <td className="px-2 py-2 whitespace-nowrap" style={{ color: COLORS.inkSoft }}>{s.nom_mere || "—"}</td>
                      <td className="px-2 py-2 whitespace-nowrap font-medium" style={{ color: COLORS.ink, fontFamily: "'IBM Plex Mono', monospace" }}>{s.parent_phone || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Carte scolaire — écran dédié, avec génération PDF individuelle ----------
const CARD_THEMES = {
  corail: { name: "Corail", from: "#C1502E", to: "#E8B84B" },
  ocean: { name: "Océan", from: "#1E6091", to: "#52B69A" },
  emeraude: { name: "Émeraude", from: "#2F7D4F", to: "#E8B84B" },
  royal: { name: "Royal", from: "#4C3A82", to: "#E8B84B" },
};

// Drapeau guinéen — trois bandes verticales, dessinées directement (pas besoin d'image).
function GuineaFlag({ size = 24 }) {
  return (
    <div className="rounded-full overflow-hidden shrink-0" style={{ width: size, height: size, display: "flex", border: "1px solid rgba(0,0,0,0.1)" }}>
      <div style={{ flex: 1, background: "#CE1126" }} />
      <div style={{ flex: 1, background: "#FCD116" }} />
      <div style={{ flex: 1, background: "#009460" }} />
    </div>
  );
}

function StudentCardPreview({ schoolName, schoolLogo, currentYear, student, directeur, theme, directorTitle, onClose }) {
  const { t } = useLang();
  const genderColor = student.gender === "Fille" ? "#C1502E" : "#20304A";
  const th = CARD_THEMES[theme] || CARD_THEMES.corail;
  const gradient = `linear-gradient(90deg, ${th.from}, ${th.to})`;
  const [downloading, setDownloading] = useState(false);
  const [pdfError, setPdfError] = useState("");

  const handleDownload = async () => {
    setDownloading(true);
    setPdfError("");
    try {
      await downloadElementAsPdf("card-print-area", `carte_${student.full_name.replace(/\s+/g, "_")}.pdf`);
    } catch (e) {
      setPdfError(t("pdf_download_failed"));
    }
    setDownloading(false);
  };

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto" style={{ background: "rgba(32,48,74,0.55)" }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #card-print-area, #card-print-area * { visibility: visible; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
          #card-print-area { position: absolute; top: 0; left: 0; width: 100%; margin: 0; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="min-h-screen flex items-start justify-center p-3 sm:p-6">
        <div className="w-full max-w-sm">
          <div className="flex justify-end gap-2 mb-2 no-print flex-wrap">
            <button onClick={handleDownload} disabled={downloading} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm" style={{ background: COLORS.primary, color: "#fff" }}>
              {downloading ? <Loader2 className="animate-spin" size={15} /> : <Download size={15} />} {t("download_pdf_button")}
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm" style={{ background: COLORS.ink, color: "#fff" }}>
              <Printer size={15} /> {t("print_button_only")}
            </button>
            <button onClick={onClose} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm" style={{ background: "#fff", color: COLORS.ink }}>
              <X size={15} /> {t("close_button")}
            </button>
          </div>
          {pdfError && <p className="text-xs mb-2 no-print" style={{ color: COLORS.negative }}>{pdfError}</p>}

          <div id="card-print-area" className="rounded-2xl overflow-hidden relative p-1" style={{ background: gradient, boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
          <div className="rounded-xl overflow-hidden" style={{ background: "#fff" }}>
            <div className="px-4 py-3 flex items-center gap-3" style={{ background: COLORS.ink }}>
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center" style={{ background: "#fff" }}>
                {schoolLogo ? <img src={schoolLogo} alt="" className="w-full h-full object-contain" /> : <div className="w-full h-full rounded-full" style={{ background: gradient }} />}
              </div>
              <div className="text-center flex-1">
                <div className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>{t("republic_header")}</div>
                <div className="text-sm font-extrabold" style={{ color: "#fff", fontFamily: "'Manrope', sans-serif" }}>{t("school_card_title")}</div>
              </div>
              <GuineaFlag size={30} />
            </div>

            <div className="p-4">
              <div className="text-center mb-3">
                <div className="text-base font-extrabold" style={{ color: COLORS.ink, fontFamily: "'Manrope', sans-serif" }}>{schoolName}</div>
                <div className="text-xs font-medium" style={{ color: th.from }}>{currentYear}</div>
              </div>

              <div className="flex gap-3 mb-3">
                <div className="shrink-0 rounded-xl overflow-hidden" style={{ width: 90, height: 110, background: COLORS.paper, border: `3px solid ${genderColor}` }}>
                  {student.photo_url ? (
                    <img src={student.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Users size={28} style={{ color: COLORS.inkSoft }} /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div>
                    <div className="text-[9px] uppercase font-semibold" style={{ color: COLORS.inkSoft }}>{t("full_name_label")}</div>
                    <div className="inline-block text-sm font-bold" style={{ color: COLORS.ink, textDecoration: "underline", textDecorationColor: th.from, textDecorationThickness: "2px", textUnderlineOffset: "2px" }}>{student.full_name}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-semibold" style={{ color: COLORS.inkSoft }}>{t("class_label")}</div>
                    <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-0.5" style={{ background: `${th.from}22`, color: th.from }}>{student.class_name}</span>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-semibold" style={{ color: COLORS.inkSoft }}>{t("gender_col_short")}</div>
                    <div className="text-sm" style={{ color: genderColor, fontWeight: 600 }}>{student.gender || "—"}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 text-xs p-2.5 rounded-xl" style={{ background: COLORS.paper }}>
                <div>
                  <div className="text-[9px] uppercase font-semibold" style={{ color: COLORS.inkSoft }}>{t("birth_date_label")}</div>
                  <div style={{ color: COLORS.ink }}>{student.date_naissance ? new Date(student.date_naissance).toLocaleDateString("fr-FR") : "—"}</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-semibold" style={{ color: COLORS.inkSoft }}>{t("birth_place_label")}</div>
                  <div style={{ color: COLORS.ink }}>{student.lieu_naissance || "—"}</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-semibold" style={{ color: COLORS.inkSoft }}>{t("quartier_label")}</div>
                  <div style={{ color: COLORS.ink }}>{student.quartier || "—"}</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-semibold" style={{ color: COLORS.inkSoft }}>{t("contact_phone_col")}</div>
                  <div style={{ color: COLORS.ink, fontFamily: "'IBM Plex Mono', monospace" }}>{student.parent_phone || "—"}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px dashed ${COLORS.line}` }}>
                <div className="text-[10px]" style={{ color: COLORS.inkSoft }}>{directorTitle || t("director_label")}</div>
                <div className="text-center">
                  {directeur?.signature_url && <img src={directeur.signature_url} alt="" className="h-8 object-contain mx-auto" />}
                  <div className="text-xs font-semibold" style={{ color: COLORS.ink }}>{formatSignerName(directeur, t)}</div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Une carte compacte, pensée pour tenir plusieurs par page (planche à découper).
function MiniStudentCard({ schoolName, schoolLogo, currentYear, student, directeur, theme, directorTitle }) {
  const { t } = useLang();
  const genderColor = student.gender === "Fille" ? "#C1502E" : "#20304A";
  const th = CARD_THEMES[theme] || CARD_THEMES.corail;
  const gradient = `linear-gradient(90deg, ${th.from}, ${th.to})`;

  return (
    <div className="rounded-xl overflow-hidden p-[3px]" style={{ background: gradient, breakInside: "avoid" }}>
      <div className="rounded-lg overflow-hidden" style={{ background: "#fff" }}>
        <div className="px-2 py-1.5 flex items-center gap-1.5" style={{ background: COLORS.ink }}>
          <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 flex items-center justify-center" style={{ background: "#fff" }}>
            {schoolLogo ? <img src={schoolLogo} alt="" className="w-full h-full object-contain" /> : <div className="w-full h-full rounded-full" style={{ background: gradient }} />}
          </div>
          <div className="text-center flex-1 min-w-0">
            <div className="text-[5px] uppercase tracking-widest font-semibold truncate" style={{ color: "rgba(255,255,255,0.6)" }}>{t("republic_header")}</div>
            <div className="text-[8px] font-extrabold truncate" style={{ color: "#fff", fontFamily: "'Manrope', sans-serif" }}>{t("school_card_title")}</div>
          </div>
          <GuineaFlag size={16} />
        </div>
        <div className="p-2">
          <div className="text-center mb-1.5">
            <div className="text-[9px] font-extrabold truncate" style={{ color: COLORS.ink, fontFamily: "'Manrope', sans-serif" }}>{schoolName}</div>
            <div className="text-[7px] font-medium" style={{ color: th.from }}>{currentYear}</div>
          </div>
          <div className="rounded-md overflow-hidden mb-1.5 mx-auto" style={{ width: 54, height: 66, background: COLORS.paper, border: `2px solid ${genderColor}` }}>
            {student.photo_url ? <img src={student.photo_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Users size={18} style={{ color: COLORS.inkSoft }} /></div>}
          </div>
          <div className="text-center shrink-0">
            <div className="text-[8px] font-bold truncate" style={{ color: COLORS.ink, textDecoration: "underline", textDecorationColor: th.from, textDecorationThickness: "1px" }}>{student.full_name}</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className="text-[7px] font-semibold px-1 py-0.5 rounded-full" style={{ background: `${th.from}22`, color: th.from }}>{student.class_name}</span>
              <span className="text-[7px] font-semibold" style={{ color: genderColor }}>{student.gender === "Fille" ? "F" : "M"}</span>
            </div>
          </div>
          <div className="text-[6px] leading-tight p-1 rounded-md mt-1.5 shrink-0" style={{ background: COLORS.paper, color: COLORS.ink }}>
            <div>{t("birth_date_label")}: {student.date_naissance ? new Date(student.date_naissance).toLocaleDateString("fr-FR") : "—"}</div>
            <div>{t("contact_phone_col")}: {student.parent_phone || "—"}</div>
          </div>
          <div className="flex items-center justify-between pt-1 mt-1 shrink-0" style={{ borderTop: `1px dashed ${COLORS.line}` }}>
            <div className="text-[5px]" style={{ color: COLORS.inkSoft }}>{directorTitle || t("director_label")}</div>
            <div className="text-[6.5px] font-semibold truncate" style={{ color: COLORS.ink, maxWidth: 60 }}>{formatSignerName(directeur, t)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClassCardsSheetView({ students, schoolName, schoolLogo, cardTheme, currentYear, directeur, directorTitle, className, onClose }) {
  const { t } = useLang();
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    setDownloading(true);
    setError("");
    try {
      await downloadElementAsPdfMultiPage("sheet-print-area", `cartes_${className.replace(/\s+/g, "_")}.pdf`);
    } catch (e) {
      setError(t("pdf_download_failed"));
    }
    setDownloading(false);
  };

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto" style={{ background: "rgba(32,48,74,0.55)" }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #sheet-print-area, #sheet-print-area * { visibility: visible; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
          #sheet-print-area { position: absolute; top: 0; left: 0; width: 100%; margin: 0; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="min-h-screen p-3 sm:p-6">
        <div className="flex justify-end gap-2 mb-3 no-print flex-wrap">
          <button onClick={handleDownload} disabled={downloading} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm" style={{ background: COLORS.primary, color: "#fff" }}>
            {downloading ? <Loader2 className="animate-spin" size={15} /> : <Download size={15} />} {t("download_pdf_button")}
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm" style={{ background: COLORS.ink, color: "#fff" }}>
            <Printer size={15} /> {t("print_button_only")}
          </button>
          <button onClick={onClose} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm" style={{ background: "#fff", color: COLORS.ink }}>
            <X size={15} /> {t("close_button")}
          </button>
        </div>
        {error && <p className="text-xs mb-2 no-print" style={{ color: COLORS.negative }}>{error}</p>}
        <p className="text-xs mb-3 no-print" style={{ color: COLORS.inkSoft }}>{t("cut_along_lines_hint")}</p>

        <div id="sheet-print-area" className="rounded-2xl p-4" style={{ background: "#fff" }}>
          <div className="grid grid-cols-3 gap-3">
            {students.map((s) => (
              <MiniStudentCard key={s.id} schoolName={schoolName} schoolLogo={schoolLogo} currentYear={currentYear} student={s} directeur={directeur} theme={cardTheme} directorTitle={directorTitle} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Carte du personnel — nom, fonction, classe/matière, téléphone, signature ----------
function StaffCardPreview({ schoolName, schoolLogo, currentYear, staffMember, functionLabel, directeur, theme, directorTitle, onClose }) {
  const { t } = useLang();
  const th = CARD_THEMES[theme] || CARD_THEMES.corail;
  const gradient = `linear-gradient(90deg, ${th.from}, ${th.to})`;
  const [downloading, setDownloading] = useState(false);
  const [pdfError, setPdfError] = useState("");

  const handleDownload = async () => {
    setDownloading(true);
    setPdfError("");
    try {
      await downloadElementAsPdf("staffcard-print-area", `carte_${staffMember.full_name.replace(/\s+/g, "_")}.pdf`);
    } catch (e) {
      setPdfError(t("pdf_download_failed"));
    }
    setDownloading(false);
  };

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto" style={{ background: "rgba(32,48,74,0.55)" }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #staffcard-print-area, #staffcard-print-area * { visibility: visible; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
          #staffcard-print-area { position: absolute; top: 0; left: 0; width: 100%; margin: 0; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="min-h-screen flex items-start justify-center p-3 sm:p-6">
        <div className="w-full max-w-sm">
          <div className="flex justify-end gap-2 mb-2 no-print flex-wrap">
            <button onClick={handleDownload} disabled={downloading} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm" style={{ background: COLORS.primary, color: "#fff" }}>
              {downloading ? <Loader2 className="animate-spin" size={15} /> : <Download size={15} />} {t("download_pdf_button")}
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm" style={{ background: COLORS.ink, color: "#fff" }}>
              <Printer size={15} /> {t("print_button_only")}
            </button>
            <button onClick={onClose} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm" style={{ background: "#fff", color: COLORS.ink }}>
              <X size={15} /> {t("close_button")}
            </button>
          </div>
          {pdfError && <p className="text-xs mb-2 no-print" style={{ color: COLORS.negative }}>{pdfError}</p>}

          <div id="staffcard-print-area" className="rounded-2xl overflow-hidden relative p-1" style={{ background: gradient, boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
          <div className="rounded-xl overflow-hidden" style={{ background: "#fff" }}>
            <div className="px-4 py-3 flex items-center gap-3" style={{ background: COLORS.ink }}>
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center" style={{ background: "#fff" }}>
                {schoolLogo ? <img src={schoolLogo} alt="" className="w-full h-full object-contain" /> : <div className="w-full h-full rounded-full" style={{ background: gradient }} />}
              </div>
              <div className="text-center flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>{t("republic_header")}</div>
                <div className="text-sm font-extrabold" style={{ color: "#fff", fontFamily: "'Manrope', sans-serif" }}>{t("staff_card_title")}</div>
              </div>
              <GuineaFlag size={26} />
            </div>

            <div className="p-4">
              <div className="text-center mb-3">
                <div className="text-base font-extrabold" style={{ color: COLORS.ink, fontFamily: "'Manrope', sans-serif" }}>{schoolName}</div>
                <div className="text-xs font-medium" style={{ color: th.from }}>{currentYear}</div>
              </div>

              <div className="flex gap-3 mb-3">
                <div className="shrink-0 rounded-xl overflow-hidden" style={{ width: 90, height: 110, background: COLORS.paper, border: `2px solid ${COLORS.ink}` }}>
                  {staffMember.avatar_url ? (
                    <img src={staffMember.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Users size={28} style={{ color: COLORS.inkSoft }} /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div>
                    <div className="text-[9px] uppercase font-semibold" style={{ color: COLORS.inkSoft }}>{t("full_name_label")}</div>
                    <div className="inline-block text-sm font-bold" style={{ color: COLORS.ink, textDecoration: "underline", textDecorationColor: th.from, textDecorationThickness: "2px", textUnderlineOffset: "2px" }}>{staffMember.full_name}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-semibold" style={{ color: COLORS.inkSoft }}>{t("function_col")}</div>
                    <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-0.5" style={{ background: `${th.from}22`, color: th.from }}>{functionLabel}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl p-2.5 mb-3 text-xs" style={{ background: COLORS.paper }}>
                <div className="text-[9px] uppercase font-semibold" style={{ color: COLORS.inkSoft }}>{t("contact_label_simple")}</div>
                <div style={{ color: COLORS.ink, fontFamily: "'IBM Plex Mono', monospace" }}>{staffMember.phone || "—"}</div>
              </div>

              <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px dashed ${COLORS.line}` }}>
                <div className="text-[10px]" style={{ color: COLORS.inkSoft }}>{directorTitle || t("director_label")}</div>
                <div className="text-center">
                  {directeur?.signature_url && <img src={directeur.signature_url} alt="" className="h-8 object-contain mx-auto" />}
                  <div className="text-xs font-semibold" style={{ color: COLORS.ink }}>{formatSignerName(directeur, t)}</div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Carnet du Directeur — Agenda, Réunions, Inspections, Matériel ----------
// Strictement privé : même le Fondateur n'y a jamais accès.
function DirectorNotebookView({ entries, equipment, onAddEntry, onToggleTask, onDeleteEntry, onAddEquipment, onDeleteEquipment }) {
  const { t, lang } = useLang();
  const [tab, setTab] = useState("agenda");

  const tabs = [
    ["agenda", t("nb_tab_agenda")],
    ["reunion", t("nb_tab_reunion")],
    ["inspection", t("nb_tab_inspection")],
    ["equipment", t("nb_tab_equipment")],
  ];

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("nav_director_notebook")}</h1>
      <p className="mb-5" style={{ color: COLORS.inkSoft }}>{t("director_notebook_subtitle")}</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={tab === key ? { background: COLORS.primary, color: "#fff" } : { background: COLORS.paper, color: COLORS.inkSoft }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "agenda" && <NotebookEntryTab kind="agenda" entries={entries.filter((e) => e.kind === "agenda")} onAdd={onAddEntry} onToggleTask={onToggleTask} onDelete={onDeleteEntry} lang={lang} />}
      {tab === "reunion" && <NotebookEntryTab kind="reunion" entries={entries.filter((e) => e.kind === "reunion")} onAdd={onAddEntry} onDelete={onDeleteEntry} lang={lang} />}
      {tab === "inspection" && <NotebookEntryTab kind="inspection" entries={entries.filter((e) => e.kind === "inspection")} onAdd={onAddEntry} onDelete={onDeleteEntry} lang={lang} />}
      {tab === "equipment" && <EquipmentTab equipment={equipment} onAdd={onAddEquipment} onDelete={onDeleteEquipment} />}
    </div>
  );
}

function NotebookEntryTab({ kind, entries, onAdd, onToggleTask, onDelete, lang }) {
  const { t } = useLang();
  const [showForm, setShowForm] = useState(false);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isTask, setIsTask] = useState(false);
  const [participants, setParticipants] = useState("");
  const [decisions, setDecisions] = useState("");
  const [visiteur, setVisiteur] = useState("");
  const [observations, setObservations] = useState("");
  const [actionsDemandees, setActionsDemandees] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const payload = { kind, entry_date: entryDate, title: title.trim(), content: content.trim() || null };
    if (kind === "agenda") payload.is_task = isTask;
    if (kind === "reunion") { payload.participants = participants.trim() || null; payload.decisions = decisions.trim() || null; }
    if (kind === "inspection") { payload.visiteur = visiteur.trim() || null; payload.observations = observations.trim() || null; payload.actions_demandees = actionsDemandees.trim() || null; }
    await onAdd(payload);
    setSaving(false);
    setShowForm(false);
    setTitle(""); setContent(""); setIsTask(false); setParticipants(""); setDecisions(""); setVisiteur(""); setObservations(""); setActionsDemandees("");
  };

  const sorted = [...entries].sort((a, b) => b.entry_date.localeCompare(a.entry_date));
  const addLabel = { agenda: "nb_add_agenda", reunion: "nb_add_reunion", inspection: "nb_add_inspection" }[kind];
  const emptyLabel = { agenda: "nb_empty_agenda", reunion: "nb_empty_reunion", inspection: "nb_empty_inspection" }[kind];

  return (
    <div>
      <button onClick={() => setShowForm((v) => !v)} className="text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 mb-4" style={{ background: COLORS.ink, color: "#fff" }}>
        <Plus size={14} /> {t(addLabel)}
      </button>

      {showForm && (
        <div className="rounded-2xl p-4 mb-6" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div>
              <FieldLabel>{t("nb_title_label")}</FieldLabel>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
            </div>
            <div>
              <FieldLabel>{t("nb_date_label")}</FieldLabel>
              <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
            </div>
          </div>

          {kind === "agenda" && (
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input type="checkbox" checked={isTask} onChange={(e) => setIsTask(e.target.checked)} className="w-4 h-4" />
              <span className="text-sm" style={{ color: COLORS.ink }}>{t("nb_is_task_label")}</span>
            </label>
          )}

          <div className="mb-3">
            <FieldLabel>{t("nb_content_label")}</FieldLabel>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
          </div>

          {kind === "reunion" && (
            <>
              <div className="mb-3">
                <FieldLabel>{t("nb_participants_label")}</FieldLabel>
                <input value={participants} onChange={(e) => setParticipants(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
              </div>
              <div className="mb-3">
                <FieldLabel>{t("nb_decisions_label")}</FieldLabel>
                <textarea value={decisions} onChange={(e) => setDecisions(e.target.value)} rows={2} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
              </div>
            </>
          )}

          {kind === "inspection" && (
            <>
              <div className="mb-3">
                <FieldLabel>{t("nb_visiteur_label")}</FieldLabel>
                <input value={visiteur} onChange={(e) => setVisiteur(e.target.value)} placeholder="Ex: I.R.E N'Zérékoré" className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
              </div>
              <div className="mb-3">
                <FieldLabel>{t("nb_observations_label")}</FieldLabel>
                <textarea value={observations} onChange={(e) => setObservations(e.target.value)} rows={2} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
              </div>
              <div className="mb-3">
                <FieldLabel>{t("nb_actions_label")}</FieldLabel>
                <textarea value={actionsDemandees} onChange={(e) => setActionsDemandees(e.target.value)} rows={2} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
              </div>
            </>
          )}

          <button onClick={submit} disabled={saving || !title.trim()} className="text-sm font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.primary, color: "#fff" }}>
            {saving && <Loader2 className="animate-spin" size={14} />} {t("save")}
          </button>
        </div>
      )}

      {sorted.length === 0 ? (
        <EmptyState text={t(emptyLabel)} />
      ) : (
        <div className="space-y-2.5">
          {sorted.map((e) => (
            <div key={e.id} className="rounded-2xl p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  {e.is_task && (
                    <button onClick={() => onToggleTask(e.id, !e.is_done)} className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: e.is_done ? COLORS.positive : COLORS.paper, border: `1px solid ${e.is_done ? COLORS.positive : COLORS.line}` }}>
                      {e.is_done && <Check size={13} style={{ color: "#fff" }} />}
                    </button>
                  )}
                  <div className="font-semibold" style={{ color: COLORS.ink, textDecoration: e.is_done ? "line-through" : "none", opacity: e.is_done ? 0.6 : 1 }}>{e.title}</div>
                </div>
                <button onClick={() => onDelete(e.id)} style={{ color: COLORS.inkSoft }}><Trash2 size={15} /></button>
              </div>
              <div className="text-xs mb-2" style={{ color: COLORS.inkSoft }}>{new Date(e.entry_date).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}</div>
              {e.content && <p className="text-sm mb-1.5 whitespace-pre-wrap" style={{ color: COLORS.ink }}>{e.content}</p>}
              {e.participants && <p className="text-sm mb-1"><span className="font-semibold" style={{ color: COLORS.inkSoft }}>{t("nb_participants_label")} : </span><span style={{ color: COLORS.ink }}>{e.participants}</span></p>}
              {e.decisions && <p className="text-sm mb-1"><span className="font-semibold" style={{ color: COLORS.inkSoft }}>{t("nb_decisions_label")} : </span><span style={{ color: COLORS.ink }}>{e.decisions}</span></p>}
              {e.visiteur && <p className="text-sm mb-1"><span className="font-semibold" style={{ color: COLORS.inkSoft }}>{t("nb_visiteur_label")} : </span><span style={{ color: COLORS.ink }}>{e.visiteur}</span></p>}
              {e.observations && <p className="text-sm mb-1"><span className="font-semibold" style={{ color: COLORS.inkSoft }}>{t("nb_observations_label")} : </span><span style={{ color: COLORS.ink }}>{e.observations}</span></p>}
              {e.actions_demandees && <p className="text-sm"><span className="font-semibold" style={{ color: COLORS.inkSoft }}>{t("nb_actions_label")} : </span><span style={{ color: COLORS.ink }}>{e.actions_demandees}</span></p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EquipmentTab({ equipment, onAdd, onDelete }) {
  const { t, lang } = useLang();
  const [showForm, setShowForm] = useState(false);
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [condition, setCondition] = useState("bon");
  const [acquiredDate, setAcquiredDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!itemName.trim()) return;
    setSaving(true);
    await onAdd({ item_name: itemName.trim(), quantity: parseInt(quantity) || 1, condition, acquired_date: acquiredDate || null, notes: notes.trim() || null });
    setSaving(false);
    setShowForm(false);
    setItemName(""); setQuantity("1"); setCondition("bon"); setAcquiredDate(""); setNotes("");
  };

  const CONDITION_STYLES = {
    bon: { bg: COLORS.positiveSoft, color: COLORS.positive },
    moyen: { bg: "#FFF3D6", color: "#B8860B" },
    mauvais: { bg: COLORS.negativeSoft, color: COLORS.negative },
  };

  return (
    <div>
      <button onClick={() => setShowForm((v) => !v)} className="text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 mb-4" style={{ background: COLORS.ink, color: "#fff" }}>
        <Plus size={14} /> {t("nb_add_equipment")}
      </button>

      {showForm && (
        <div className="rounded-2xl p-4 mb-6" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <div className="mb-3">
            <FieldLabel>{t("nb_item_name_label")}</FieldLabel>
            <input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Ex: Tables-bancs" className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mb-3">
            <div>
              <FieldLabel>{t("nb_quantity_label")}</FieldLabel>
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
            </div>
            <div>
              <FieldLabel>{t("nb_condition_label")}</FieldLabel>
              <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle}>
                <option value="bon">{t("nb_condition_bon")}</option>
                <option value="moyen">{t("nb_condition_moyen")}</option>
                <option value="mauvais">{t("nb_condition_mauvais")}</option>
              </select>
            </div>
            <div>
              <FieldLabel>{t("nb_acquired_date_label")}</FieldLabel>
              <input type="date" value={acquiredDate} onChange={(e) => setAcquiredDate(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
            </div>
          </div>
          <div className="mb-3">
            <FieldLabel>{t("nb_notes_label")}</FieldLabel>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
          </div>
          <button onClick={submit} disabled={saving || !itemName.trim()} className="text-sm font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.primary, color: "#fff" }}>
            {saving && <Loader2 className="animate-spin" size={14} />} {t("save")}
          </button>
        </div>
      )}

      {equipment.length === 0 ? (
        <EmptyState text={t("nb_empty_equipment")} />
      ) : (
        <div className="space-y-2.5">
          {equipment.map((item) => (
            <div key={item.id} className="rounded-2xl p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                <div className="font-semibold" style={{ color: COLORS.ink }}>{item.item_name} <span className="font-normal" style={{ color: COLORS.inkSoft }}>× {item.quantity}</span></div>
                <div className="flex items-center gap-2">
                  {item.condition && <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={CONDITION_STYLES[item.condition]}>{t(`nb_condition_${item.condition}`)}</span>}
                  <button onClick={() => onDelete(item.id)} style={{ color: COLORS.inkSoft }}><Trash2 size={15} /></button>
                </div>
              </div>
              {item.acquired_date && <div className="text-xs mb-1" style={{ color: COLORS.inkSoft }}>{new Date(item.acquired_date).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}</div>}
              {item.notes && <p className="text-sm" style={{ color: COLORS.ink }}>{item.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StaffCardsView({ staffProfiles, schoolName, schoolLogo, cardTheme, currentYear, directeur, directorTitle, isSecondaire, teacherAssignments }) {
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [cardFor, setCardFor] = useState(null);

  const visibleStaff = staffProfiles.filter((sp) => !sp.hidden && sp.role !== "fondateur");
  const filtered = visibleStaff.filter((sp) => !search.trim() || sp.full_name.toLowerCase().includes(search.toLowerCase()));

  const functionLabel = (sp) => {
    if (sp.role === "directeur") return directorTitle || t("role_directeur");
    if (sp.role === "comptable") return t("fn_comptable");
    if (sp.role === "enseignant") {
      if (isSecondaire) {
        const subjects = [...new Set(teacherAssignments.filter((a) => a.teacher_id === sp.user_id && a.approved).map((a) => a.subject))];
        return subjects.length > 0 ? `${t("fn_enseignant")} — ${subjects.join(", ")}` : t("fn_enseignant");
      }
      return sp.class_name ? `${t("fn_enseignant")} — ${sp.class_name}` : t("fn_enseignant");
    }
    return sp.fonction || t("fn_personnel");
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("nav_staff_cards")}</h1>
      <p className="mb-5" style={{ color: COLORS.inkSoft }}>{t("staff_cards_subtitle")}</p>

      {cardFor && (
        <StaffCardPreview
          schoolName={schoolName}
          schoolLogo={schoolLogo}
          currentYear={currentYear}
          staffMember={cardFor}
          functionLabel={functionLabel(cardFor)}
          directeur={directeur}
          theme={cardTheme}
          directorTitle={directorTitle}
          onClose={() => setCardFor(null)}
        />
      )}

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search_by_name_placeholder")} className="w-full px-4 py-3 rounded-xl outline-none text-sm mb-5" style={inputStyle} />

      {filtered.length === 0 ? (
        <EmptyState text={t("no_staff")} />
      ) : (
        <div className="space-y-2">
          {filtered.map((sp) => (
            <button
              key={sp.user_id}
              onClick={() => setCardFor(sp)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left"
              style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{ background: COLORS.paper }}>
                  {sp.avatar_url ? <img src={sp.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Users size={16} style={{ color: COLORS.inkSoft }} /></div>}
                </div>
                <div className="min-w-0">
                  <div className="font-medium truncate" style={{ color: COLORS.ink }}>{sp.full_name}</div>
                  <div className="text-xs truncate" style={{ color: COLORS.inkSoft }}>{functionLabel(sp)}</div>
                </div>
              </div>
              <CreditCard size={16} style={{ color: COLORS.primary, flexShrink: 0 }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentCardsView({ students, schoolName, schoolLogo, cardTheme, currentYear, directeur, directorTitle, onUploadPhoto }) {
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const classNames = useMemo(() => [...new Set(students.map((s) => s.class_name).filter(Boolean))].sort(), [students]);
  const [selectedClass, setSelectedClass] = useState("");
  const [cardFor, setCardFor] = useState(null);
  const [showSheet, setShowSheet] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const cameraRefs = useRef({});
  const galleryRefs = useRef({});
  useEffect(() => { if (!selectedClass && classNames.length > 0) setSelectedClass(classNames[0]); }, [classNames]);

  const classStudents = students
    .filter((s) => s.class_name === selectedClass)
    .filter((s) => !search.trim() || s.full_name.toLowerCase().includes(search.toLowerCase()));

  const handlePick = async (studentId, file) => {
    if (!file) return;
    setUploadingId(studentId);
    await onUploadPhoto(studentId, file);
    setUploadingId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("nav_student_cards")}</h1>
        {classStudents.length > 0 && (
          <button onClick={() => setShowSheet(true)} className="text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.primary, color: "#fff" }}>
            <Printer size={14} /> {t("print_class_sheet_button")}
          </button>
        )}
      </div>
      <p className="mb-5" style={{ color: COLORS.inkSoft }}>{t("student_cards_subtitle")}</p>

      {cardFor && (
        <StudentCardPreview schoolName={schoolName} schoolLogo={schoolLogo} currentYear={currentYear} student={students.find((s) => s.id === cardFor) || {}} directeur={directeur} theme={cardTheme} directorTitle={directorTitle} onClose={() => setCardFor(null)} />
      )}
      {showSheet && (
        <ClassCardsSheetView
          students={classStudents}
          schoolName={schoolName}
          schoolLogo={schoolLogo}
          cardTheme={cardTheme}
          currentYear={currentYear}
          directeur={directeur}
          directorTitle={directorTitle}
          className={selectedClass}
          onClose={() => setShowSheet(false)}
        />
      )}

      <div className="grid sm:grid-cols-2 gap-3 mb-5">
        <div>
          <FieldLabel>{t("class_label")}</FieldLabel>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle}>
            {classNames.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <FieldLabel>{t("search_label")}</FieldLabel>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search_student_placeholder")} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
        </div>
      </div>

      {classStudents.length === 0 ? (
        <EmptyState text={t("no_student_in_class")} />
      ) : (
        <div className="space-y-2">
          {classStudents.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <button onClick={() => setCardFor(s.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                <div className="relative w-10 h-10 shrink-0">
                  <div className="w-10 h-10 rounded-lg overflow-hidden" style={{ background: COLORS.paper }}>
                    {s.photo_url ? <img src={s.photo_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Users size={16} style={{ color: COLORS.inkSoft }} /></div>}
                  </div>
                  {uploadingId === s.id && (
                    <div className="absolute inset-0 rounded-lg flex items-center justify-center" style={{ background: "rgba(32,48,74,0.55)" }}>
                      <Loader2 className="animate-spin" size={14} style={{ color: "#fff" }} />
                    </div>
                  )}
                </div>
                <div className="font-medium truncate" style={{ color: s.gender === "Fille" ? COLORS.negative : COLORS.ink }}>{s.full_name}</div>
              </button>
              <div className="flex items-center gap-1.5 shrink-0">
                <input ref={(el) => (cameraRefs.current[s.id] = el)} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { handlePick(s.id, e.target.files?.[0]); e.target.value = ""; }} />
                <input ref={(el) => (galleryRefs.current[s.id] = el)} type="file" accept="image/*" className="hidden" onChange={(e) => { handlePick(s.id, e.target.files?.[0]); e.target.value = ""; }} />
                <button onClick={() => cameraRefs.current[s.id]?.click()} disabled={uploadingId === s.id} className="p-2 rounded-lg" style={{ background: COLORS.paper, color: COLORS.ink }} title={t("take_photo_now")}>
                  {uploadingId === s.id ? <Loader2 className="animate-spin" size={15} /> : <Camera size={15} />}
                </button>
                <button onClick={() => galleryRefs.current[s.id]?.click()} disabled={uploadingId === s.id} className="p-2 rounded-lg" style={{ background: COLORS.paper, color: COLORS.ink }} title={t("change_photo")}>
                  <ImageIcon size={15} />
                </button>
                <button onClick={() => setCardFor(s.id)} className="p-2 rounded-lg" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>
                  <CreditCard size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentDossiersView({ students, schoolName, onEdit }) {
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const classNames = useMemo(() => [...new Set(students.map((s) => s.class_name).filter(Boolean))].sort(), [students]);
  const [selectedClass, setSelectedClass] = useState("");
  const [showSheet, setShowSheet] = useState(false);
  useEffect(() => { if (!selectedClass && classNames.length > 0) setSelectedClass(classNames[0]); }, [classNames]);

  const classStudents = students
    .filter((s) => s.class_name === selectedClass)
    .filter((s) => !search.trim() || s.full_name.toLowerCase().includes(search.toLowerCase()));
  const allClassStudents = students.filter((s) => s.class_name === selectedClass);

  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("nav_dossiers")}</h1>
        {allClassStudents.length > 0 && (
          <button onClick={() => setShowSheet(true)} className="text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.primary, color: "#fff" }}>
            <FileText size={14} /> {t("generate_info_sheet_button")}
          </button>
        )}
      </div>
      <p className="mb-5" style={{ color: COLORS.inkSoft }}>{t("dossiers_subtitle")}</p>

      <div className="grid sm:grid-cols-2 gap-3 mb-5">
        <div>
          <FieldLabel>{t("class_label")}</FieldLabel>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle}>
            {classNames.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <FieldLabel>{t("search_label")}</FieldLabel>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search_student_placeholder")} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
        </div>
      </div>

      {showSheet && (
        <ClassInfoSheetView schoolName={schoolName} className={selectedClass} students={allClassStudents} onClose={() => setShowSheet(false)} />
      )}

      {classStudents.length === 0 ? (
        <EmptyState text={t("no_student_in_class")} />
      ) : (
        <div className="space-y-2">
          {classStudents.map((s) => {
            const complete = s.date_naissance && s.lieu_naissance && s.nom_pere && s.nom_mere && s.has_livret && s.has_extrait_naissance;
            return (
              <button
                key={s.id}
                onClick={() => onEdit(s)}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left"
                style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}
              >
                <div>
                  <div className="font-medium" style={{ color: s.gender === "Fille" ? COLORS.negative : COLORS.ink }}>{s.full_name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: s.has_livret ? COLORS.positiveSoft : COLORS.paper, color: s.has_livret ? COLORS.positive : COLORS.inkSoft }}>{t("livret_short")}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: s.has_extrait_naissance ? COLORS.positiveSoft : COLORS.paper, color: s.has_extrait_naissance ? COLORS.positive : COLORS.inkSoft }}>{t("extrait_short")}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={complete ? { background: COLORS.positiveSoft, color: COLORS.positive } : { background: COLORS.primarySoft, color: COLORS.primary }}>
                  {complete ? t("dossier_complete") : t("dossier_incomplete")}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AnnualBalanceView({ payments, servicePayments, services, expenses, staffPayments, currency, viewYear }) {
  const { t } = useLang();

  const totalTuition = useMemo(() => payments.reduce((sum, p) => sum + Number(p.amount), 0), [payments]);
  const totalOtherExpenses = useMemo(() => expenses.reduce((sum, e) => sum + Number(e.amount), 0), [expenses]);
  const totalSalaries = useMemo(() => staffPayments.reduce((sum, sp) => sum + Number(sp.paye || 0), 0), [staffPayments]);
  const totalExpenses = totalOtherExpenses + totalSalaries;
  const serviceBreakdown = useMemo(() => {
    return services.map((s) => {
      const total = servicePayments.filter((p) => p.service_id === s.id).reduce((sum, p) => sum + Number(p.amount), 0);
      return { name: s.name, total };
    });
  }, [services, servicePayments]);
  const totalServices = serviceBreakdown.reduce((sum, s) => sum + s.total, 0);
  const totalIncome = totalTuition + totalServices;
  const netResult = totalIncome - totalExpenses;

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("nav_annual_balance")}</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>{t("annual_balance_subtitle")} — {viewYear}</p>

      {/* Résultat net, mis en avant */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: COLORS.ink }}>
        <div className="text-xs uppercase font-semibold tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>{t("net_result_label")}</div>
        <div className="text-3xl font-extrabold" style={{ color: netResult >= 0 ? "#8FE0B0" : "#F0A79E", fontFamily: "'IBM Plex Mono', monospace" }}>
          {netResult >= 0 ? "+" : ""}{fmt(netResult, currency)}
        </div>
        <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>{t("net_result_hint")}</div>
      </div>

      {/* Recettes vs dépenses */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl p-4" style={{ background: COLORS.positiveSoft }}>
          <div className="text-xs uppercase font-semibold mb-1" style={{ color: COLORS.positive }}>{t("total_income_label")}</div>
          <div className="text-xl font-extrabold" style={{ color: COLORS.positive, fontFamily: "'IBM Plex Mono', monospace" }}>{fmt(totalIncome, currency)}</div>
        </div>
        <div className="rounded-2xl p-4" style={{ background: COLORS.negativeSoft }}>
          <div className="text-xs uppercase font-semibold mb-1" style={{ color: COLORS.negative }}>{t("total_expenses_label")}</div>
          <div className="text-xl font-extrabold" style={{ color: COLORS.negative, fontFamily: "'IBM Plex Mono', monospace" }}>{fmt(totalExpenses, currency)}</div>
        </div>
      </div>

      {/* Détail des recettes, chaque source bien séparée */}
      <h2 className="text-lg font-bold mb-3" style={{ color: COLORS.ink }}>{t("income_breakdown_title")}</h2>
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <span className="text-sm font-medium" style={{ color: COLORS.ink }}>{t("tuition_source_label")}</span>
          <span className="text-sm font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.positive }}>{fmt(totalTuition, currency)}</span>
        </div>
        {serviceBreakdown.map((s) => (
          <div key={s.name} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <span className="text-sm font-medium" style={{ color: COLORS.ink }}>{s.name}</span>
            <span className="text-sm font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.positive }}>{fmt(s.total, currency)}</span>
          </div>
        ))}
        {serviceBreakdown.length === 0 && (
          <p className="text-xs px-1" style={{ color: COLORS.inkSoft }}>{t("no_services_for_balance")}</p>
        )}
      </div>

      {/* Détail des dépenses, chaque poste bien séparé — les salaires y sont inclus */}
      <h2 className="text-lg font-bold mb-3" style={{ color: COLORS.ink }}>{t("expense_breakdown_title")}</h2>
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <span className="text-sm font-medium" style={{ color: COLORS.ink }}>{t("salaries_source_label")}</span>
          <span className="text-sm font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.negative }}>{fmt(totalSalaries, currency)}</span>
        </div>
        <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <span className="text-sm font-medium" style={{ color: COLORS.ink }}>{t("other_expenses_source_label")}</span>
          <span className="text-sm font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.negative }}>{fmt(totalOtherExpenses, currency)}</span>
        </div>
      </div>

      <p className="text-xs px-1" style={{ color: COLORS.inkSoft }}>{t("annual_balance_note")}</p>
    </div>
  );
}

function ServicesView({ role, students, services, serviceSubscriptions, servicePayments, currency, onSaveService, onDeleteService, onEnroll, onUnenroll, onAddPayment }) {
  const { t, lang } = useLang();
  const canManage = role === "comptable";
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || "");
  const [showManage, setShowManage] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceAmount, setNewServiceAmount] = useState("");
  const [editingService, setEditingService] = useState(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [search, setSearch] = useState("");
  const [payingStudent, setPayingStudent] = useState(null);
  const [payAmount, setPayAmount] = useState("");

  useEffect(() => {
    if (services.length > 0 && !services.some((s) => s.id === selectedServiceId)) setSelectedServiceId(services[0].id);
  }, [services]);

  const classNames = useMemo(() => [...new Set(students.map((s) => s.class_name).filter(Boolean))].sort(), [students]);
  useEffect(() => {
    if (!selectedClass && classNames.length > 0) setSelectedClass(classNames[0]);
  }, [classNames]);

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const subsForService = serviceSubscriptions.filter((x) => x.service_id === selectedServiceId);
  const paidFor = (studentId) =>
    servicePayments.filter((p) => p.service_id === selectedServiceId && p.student_id === studentId).reduce((sum, p) => sum + Number(p.amount), 0);

  // ---------- Bilan global du service (visible Comptable + Fondateur) ----------
  const serviceSummary = useMemo(() => {
    const totalDue = subsForService.reduce((sum, s) => sum + Number(s.amount_due), 0);
    const totalPaid = subsForService.reduce((sum, s) => sum + paidFor(s.student_id), 0);
    const fullyPaidCount = subsForService.filter((s) => paidFor(s.student_id) >= Number(s.amount_due)).length;
    return { inscrits: subsForService.length, fullyPaidCount, totalDue, totalPaid, totalRemaining: totalDue - totalPaid };
  }, [subsForService, servicePayments]);

  // ---------- Listes filtrées par classe (comptable uniquement, pour rester gérable avec beaucoup d'élèves) ----------
  const classStudents = students.filter((s) => s.class_name === selectedClass);
  const enrolledStudents = subsForService
    .map((sub) => ({ sub, student: students.find((s) => s.id === sub.student_id) }))
    .filter((x) => x.student && x.student.class_name === selectedClass)
    .filter((x) => !search.trim() || x.student.full_name.toLowerCase().includes(search.toLowerCase()))
    // Ceux qui n'ont encore rien payé restent en haut (priorité) ; ceux qui ont déjà commencé
    // à payer descendent en bas de la liste, pour que le comptable trouve vite qui reste à faire.
    .sort((a, b) => {
      const paidA = paidFor(a.student.id) > 0 ? 1 : 0;
      const paidB = paidFor(b.student.id) > 0 ? 1 : 0;
      return paidA - paidB;
    });

  const unenrolledStudents = classStudents.filter(
    (s) => !subsForService.some((sub) => sub.student_id === s.id) && (!search.trim() || s.full_name.toLowerCase().includes(search.toLowerCase()))
  );

  const submitService = async () => {
    if (!newServiceName.trim()) return;
    await onSaveService(newServiceName, parseFloat(newServiceAmount) || 0, editingService?.id);
    setNewServiceName("");
    setNewServiceAmount("");
    setEditingService(null);
  };

  const buildServiceRows = (cName) => {
    const list = subsForService
      .map((sub) => ({ sub, student: students.find((s) => s.id === sub.student_id) }))
      .filter((x) => x.student && x.student.class_name === cName);
    return list.map(({ sub, student }) => {
      const paid = paidFor(student.id);
      return {
        cells: [student.full_name, Number(sub.amount_due), paid, Number(sub.amount_due) - paid],
        isRed: student.gender === "Fille",
      };
    });
  };

  const [exportingOne, setExportingOne] = useState(false);
  const exportServiceExcel = async () => {
    setExportingOne(true);
    await exportStyledExcel({
      filename: `${selectedService?.name || "service"}_${selectedClass}_${new Date().toISOString().slice(0, 10)}.xlsx`,
      title: `${selectedService?.name} — ${selectedClass}`,
      headers: [t("student"), t("total_due_label"), t("paid_label"), t("remaining_label")],
      rows: buildServiceRows(selectedClass),
      nameColIndex: 1,
    });
    setExportingOne(false);
  };

  const [exportingAllService, setExportingAllService] = useState(false);
  const exportAllServiceExcel = async () => {
    if (!window.ExcelJS) { alert("Le générateur Excel n'a pas pu se charger. Vérifie ta connexion et réessaie."); return; }
    setExportingAllService(true);
    const workbook = new window.ExcelJS.Workbook();
    classNames.forEach((cName) => {
      const rowsData = buildServiceRows(cName);
      if (rowsData.length > 0) {
        addStyledSheet(workbook, {
          title: `${cName}`,
          headers: [t("student"), t("total_due_label"), t("paid_label"), t("remaining_label")],
          rows: rowsData,
          nameColIndex: 1,
        });
      }
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedService?.name || "service"}_toutes_classes_${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    setExportingAllService(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("nav_services")}</h1>
        {role === "fondateur" && (
          <button onClick={() => setShowManage((v) => !v)} className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ background: COLORS.paper, color: COLORS.ink, border: `1px solid ${COLORS.line}` }}>
            {showManage ? t("close_button") : t("manage_services_button")}
          </button>
        )}
      </div>
      <p className="mb-5" style={{ color: COLORS.inkSoft }}>{role === "fondateur" ? t("services_subtitle_fondateur") : t("services_subtitle")}</p>

      {role === "fondateur" && showManage && (
        <div className="rounded-2xl p-4 mb-6" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <h2 className="font-bold mb-3" style={{ color: COLORS.ink }}>{t("manage_services_button")}</h2>
          <div className="space-y-2 mb-4">
            {services.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: COLORS.paper }}>
                <span className="text-sm font-medium" style={{ color: COLORS.ink }}>{s.name} — {fmt(s.default_amount, currency)}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditingService(s); setNewServiceName(s.name); setNewServiceAmount(String(s.default_amount)); }} className="text-xs font-semibold" style={{ color: COLORS.primary }}>{t("edit_button")}</button>
                  <button onClick={() => onDeleteService(s.id)} style={{ color: COLORS.negative }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-2 mb-2">
            <input value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} placeholder={t("service_name_placeholder")} className="px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
            <input type="number" value={newServiceAmount} onChange={(e) => setNewServiceAmount(e.target.value)} placeholder={t("tuition_amount_placeholder")} className="px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
          </div>
          <button onClick={submitService} className="text-xs font-semibold px-4 py-2.5 rounded-lg" style={{ background: COLORS.primary, color: "#fff" }}>
            {editingService ? t("save") : t("add_service_button")}
          </button>
        </div>
      )}

      {services.length === 0 ? (
        <EmptyState text={t("no_service_yet")} />
      ) : (
        <>
          <div className="mb-5">
            <FieldLabel>{t("service_label")}</FieldLabel>
            <select value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)} className="w-full sm:w-72 px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
              {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {/* Bilan global — Comptable ET Fondateur */}
          <div className="rounded-2xl p-4 mb-6" style={{ background: COLORS.ink }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>{selectedService?.name} · {t("service_summary_title")}</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-xl font-bold" style={{ color: "#fff" }}>{serviceSummary.inscrits}</div>
                <div className="text-[10px] uppercase font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>{t("total_enrolled_label")}</div>
              </div>
              <div>
                <div className="text-xl font-bold" style={{ color: "#8FE0B0" }}>{serviceSummary.fullyPaidCount}</div>
                <div className="text-[10px] uppercase font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>{t("fully_paid_label")}</div>
              </div>
              <div>
                <div className="text-lg font-bold" style={{ color: "#8FE0B0" }}>{fmt(serviceSummary.totalPaid, currency)}</div>
                <div className="text-[10px] uppercase font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>{t("total_collected_label")}</div>
              </div>
              <div>
                <div className="text-lg font-bold" style={{ color: "#F0A79E" }}>{fmt(serviceSummary.totalRemaining, currency)}</div>
                <div className="text-[10px] uppercase font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>{t("total_remaining_label")}</div>
              </div>
            </div>
          </div>

          <DailyRevenueCard
            title={`${t("today_service_collected")} — ${selectedService?.name || ""}`}
            payments={servicePayments.filter((p) => p.service_id === selectedServiceId)}
            currency={currency}
          />

          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div>
              <FieldLabel>{t("class_label")}</FieldLabel>
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
                {classNames.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>{t("search_label")}</FieldLabel>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search_student_placeholder")} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
            </div>
          </div>

          <div className="flex gap-2 mb-5 flex-wrap">
            <button onClick={exportServiceExcel} disabled={exportingOne} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-sm" style={{ background: "#fff", color: COLORS.ink, border: `1px solid ${COLORS.line}` }}>
              {exportingOne ? <Loader2 className="animate-spin" size={16} /> : <FileSpreadsheet size={16} />} {t("export_excel")}
            </button>
            <button onClick={exportAllServiceExcel} disabled={exportingAllService} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-sm" style={{ background: "#fff", color: COLORS.ink, border: `1px solid ${COLORS.line}` }}>
              {exportingAllService ? <Loader2 className="animate-spin" size={16} /> : <FileSpreadsheet size={16} />} {t("export_all_classes")}
            </button>
          </div>

          {!canManage && (
            <p className="text-sm rounded-xl px-4 py-3 mb-5" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>{t("fondateur_view_only_note")}</p>
          )}

          <h2 className="text-lg font-bold mb-3" style={{ color: COLORS.ink }}>{t("enrolled_students_title")} ({enrolledStudents.length})</h2>
          {enrolledStudents.length === 0 ? (
            <EmptyState text={t("no_student_enrolled")} />
          ) : (
            <div className="space-y-2.5 mb-8">
              {enrolledStudents.map(({ sub, student }) => {
                const paid = paidFor(student.id);
                const reste = Number(sub.amount_due) - paid;
                return (
                  <div key={sub.id} className="rounded-2xl p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                      <div>
                        <div className="font-semibold" style={{ color: student.gender === "Fille" ? COLORS.negative : COLORS.ink }}>{student.full_name}</div>
                        <div className="text-xs" style={{ color: COLORS.inkSoft }}>{student.class_name}</div>
                      </div>
                      {canManage && (
                        <button onClick={() => onUnenroll(sub.id)} className="text-xs font-medium" style={{ color: COLORS.negative }}>{t("unenroll_button")}</button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                      <div>
                        <div className="text-[10px] uppercase font-semibold" style={{ color: COLORS.inkSoft }}>{t("total_due_label")}</div>
                        <div className="text-sm font-bold" style={{ color: COLORS.ink }}>{fmt(sub.amount_due, currency)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-semibold" style={{ color: COLORS.inkSoft }}>{t("paid_label")}</div>
                        <div className="text-sm font-bold" style={{ color: COLORS.positive }}>{fmt(paid, currency)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-semibold" style={{ color: COLORS.inkSoft }}>{t("remaining_label")}</div>
                        <div className="text-sm font-bold" style={{ color: reste > 0 ? COLORS.negative : COLORS.positive }}>{fmt(reste, currency)}</div>
                      </div>
                    </div>
                    {canManage && (
                      payingStudent === student.id ? (
                        <div className="flex gap-2">
                          <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder={t("amount_placeholder")} className="flex-1 px-3 py-2 rounded-lg outline-none text-sm" style={inputStyle} />
                          <button
                            onClick={async () => { await onAddPayment(selectedServiceId, student.id, parseFloat(payAmount) || 0); setPayingStudent(null); setPayAmount(""); }}
                            className="text-xs font-semibold px-3 py-2 rounded-lg"
                            style={{ background: COLORS.positive, color: "#fff" }}
                          >
                            {t("save")}
                          </button>
                          <button onClick={() => setPayingStudent(null)} className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ color: COLORS.inkSoft }}>{t("close_button")}</button>
                        </div>
                      ) : (
                        <button onClick={() => setPayingStudent(student.id)} className="w-full py-2 rounded-lg text-xs font-semibold" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>
                          {t("record_payment_button")}
                        </button>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {canManage && (
            <>
              <h2 className="text-lg font-bold mb-3" style={{ color: COLORS.ink }}>{t("not_enrolled_title")} ({unenrolledStudents.length})</h2>
              {unenrolledStudents.length === 0 ? (
                <EmptyState text={t("all_enrolled")} />
              ) : (
                <div className="space-y-2">
                  {unenrolledStudents.map((s) => (
                    <div key={s.id} className="flex items-center justify-between px-4 py-3 rounded-xl flex-wrap gap-2" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                      <div>
                        <div className="font-medium text-sm" style={{ color: s.gender === "Fille" ? COLORS.negative : COLORS.ink }}>{s.full_name}</div>
                        <div className="text-xs" style={{ color: COLORS.inkSoft }}>{s.class_name}</div>
                      </div>
                      <button
                        onClick={() => onEnroll(selectedServiceId, s.id, selectedService?.default_amount || 0)}
                        className="text-xs font-semibold px-3 py-2 rounded-lg"
                        style={{ background: COLORS.ink, color: "#fff" }}
                      >
                        {t("enroll_button")} ({fmt(selectedService?.default_amount || 0, currency)})
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

// ---------- Bulletin individuel de l'élève (PDF via impression navigateur) ----------
function formatSignerName(person, t) {
  if (!person?.full_name) return "—";
  const title = person.civilite ? `${person.civilite} ` : "";
  return `${title}${person.full_name}`;
}

function mentionFor(moyenne, passThreshold) {
  if (moyenne === null || moyenne === undefined) return "—";
  const scale = passThreshold === 10 ? 20 : 10; // 20 pour secondaire, 10 pour primaire
  const pct = (moyenne / scale) * 100;
  if (pct >= 90) return { fr: "Excellent", en: "Excellent" };
  if (pct >= 80) return { fr: "Très Bien", en: "Very Good" };
  if (pct >= 70) return { fr: "Bien", en: "Good" };
  if (pct >= 60) return { fr: "Assez Bien", en: "Fairly Good" };
  if (pct >= 50) return { fr: "Passable", en: "Passing" };
  return { fr: "Insuffisant", en: "Needs Improvement" };
}

function StudentBulletinView({
  schoolName, student, className, term, schoolYear, subjectRows, totalScore, moyenneGenerale, passThreshold,
  rank, totalInClass, directeur, teacher, appreciation, canEditAppreciation, onSaveAppreciation, directorTitle, onClose,
}) {
  const { t, lang } = useLang();
  const [apprText, setApprText] = useState(appreciation || "");
  const [savingAppr, setSavingAppr] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const mention = mentionFor(moyenneGenerale, passThreshold)?.[lang] || mentionFor(moyenneGenerale, passThreshold)?.fr;

  const handleSaveAppr = async () => {
    setSavingAppr(true);
    await onSaveAppreciation(apprText);
    setSavingAppr(false);
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    setPdfError("");
    try {
      await downloadElementAsPdf("bulletin-print-area", `bulletin_${student.full_name.replace(/\s+/g, "_")}_${term}.pdf`);
    } catch (e) {
      setPdfError(t("pdf_download_failed"));
    }
    setDownloadingPdf(false);
  };

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto" style={{ background: "rgba(32,48,74,0.55)" }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #bulletin-print-area, #bulletin-print-area * { visibility: visible; }
          #bulletin-print-area { position: absolute; top: 0; left: 0; width: 100%; margin: 0; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="min-h-screen flex items-start justify-center p-3 sm:p-6">
        <div className="w-full max-w-2xl">
          <div className="flex justify-end gap-2 mb-2 no-print flex-wrap">
            <button onClick={handleDownloadPdf} disabled={downloadingPdf} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm" style={{ background: COLORS.primary, color: "#fff" }}>
              {downloadingPdf ? <Loader2 className="animate-spin" size={15} /> : <Download size={15} />} {t("download_pdf_button")}
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm" style={{ background: COLORS.ink, color: "#fff" }}>
              <Printer size={15} /> {t("print_button_only")}
            </button>
            <button onClick={onClose} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm" style={{ background: "#fff", color: COLORS.ink }}>
              <X size={15} /> {t("close_button")}
            </button>
          </div>
          {pdfError && <p className="text-xs mb-2 no-print" style={{ color: COLORS.negative }}>{pdfError}</p>}
          <p className="text-xs mb-3 no-print" style={{ color: COLORS.inkSoft }}>{t("download_hint_v2")}</p>

          <div id="bulletin-print-area" className="rounded-2xl p-7 sm:p-10" style={{ background: "#fff", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
            {/* En-tête */}
            <div className="text-center mb-6 pb-5" style={{ borderBottom: `2px solid ${COLORS.ink}` }}>
              <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: COLORS.inkSoft }}>{t("republic_header")}</div>
              <h1 className="text-2xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{schoolName}</h1>
              <div className="text-lg font-bold" style={{ color: COLORS.primary }}>{t("bulletin_title")}</div>
              <div className="text-sm mt-1" style={{ color: COLORS.inkSoft }}>{className} · {term} · {schoolYear}</div>
            </div>

            {/* Infos élève */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6 rounded-xl px-4 py-3" style={{ background: COLORS.paper }}>
              <div>
                <div className="text-xs uppercase font-semibold" style={{ color: COLORS.inkSoft }}>{t("student")}</div>
                <div className="text-lg font-bold" style={{ color: student.gender === "Fille" ? COLORS.negative : COLORS.ink }}>{student.full_name}</div>
              </div>
              {rank && (
                <div className="text-right">
                  <div className="text-xs uppercase font-semibold" style={{ color: COLORS.inkSoft }}>{t("rank")}</div>
                  <div className="text-lg font-bold" style={{ color: COLORS.primary }}>{rank} / {totalInClass}</div>
                </div>
              )}
            </div>

            {/* Tableau des notes */}
            <table className="w-full text-sm mb-6" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: COLORS.ink }}>
                  <th className="text-left px-3 py-2.5 font-semibold" style={{ color: "#fff" }}>{t("subject_col")}</th>
                  <th className="text-center px-3 py-2.5 font-semibold" style={{ color: "#fff" }}>{t("grade_detail_col")}</th>
                  <th className="text-center px-3 py-2.5 font-semibold" style={{ color: "#fff" }}>{t("average")}</th>
                </tr>
              </thead>
              <tbody>
                {subjectRows.map((r, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${COLORS.line}`, background: i % 2 === 1 ? COLORS.paper : "transparent" }}>
                    <td className="px-3 py-2.5 font-medium" style={{ color: COLORS.ink }}>{r.subject}</td>
                    <td className="px-3 py-2.5 text-center" style={{ color: COLORS.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>{r.detail}</td>
                    <td className="px-3 py-2.5 text-center font-bold" style={{ color: COLORS.ink, fontFamily: "'IBM Plex Mono', monospace" }}>{r.moyenne !== null && r.moyenne !== undefined ? r.moyenne.toFixed(2) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Résultats globaux */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-xl p-4 text-center" style={{ background: COLORS.primarySoft }}>
                <div className="text-xs uppercase font-semibold mb-1" style={{ color: COLORS.primary }}>{t("overall_average_label")}</div>
                <div className="text-2xl font-extrabold" style={{ color: COLORS.primary, fontFamily: "'IBM Plex Mono', monospace" }}>{moyenneGenerale !== null && moyenneGenerale !== undefined ? moyenneGenerale.toFixed(2) : "—"}</div>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ background: COLORS.paper }}>
                <div className="text-xs uppercase font-semibold mb-1" style={{ color: COLORS.inkSoft }}>{t("mention_label")}</div>
                <div className="text-lg font-bold mt-1" style={{ color: COLORS.ink }}>{mention}</div>
              </div>
            </div>

            {/* Appréciation */}
            <div className="mb-6">
              <div className="text-xs uppercase font-semibold mb-2" style={{ color: COLORS.inkSoft }}>{t("appreciation_label")}</div>
              {canEditAppreciation && (
                <div className="no-print mb-2">
                  <textarea
                    value={apprText}
                    onChange={(e) => setApprText(e.target.value)}
                    placeholder={t("appreciation_placeholder")}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-lg outline-none text-sm mb-2"
                    style={inputStyle}
                  />
                  <button onClick={handleSaveAppr} disabled={savingAppr} className="text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.primary, color: "#fff" }}>
                    {savingAppr && <Loader2 className="animate-spin" size={12} />} {t("save")}
                  </button>
                </div>
              )}
              <p className="text-sm italic px-4 py-3 rounded-lg" style={{ background: COLORS.paper, color: COLORS.ink }}>
                {apprText || t("no_appreciation_yet")}
              </p>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-6 pt-5" style={{ borderTop: `1px solid ${COLORS.line}` }}>
              <div className="text-center flex flex-col items-center">
                <div className="text-xs font-semibold mb-3 flex items-center justify-center" style={{ color: COLORS.inkSoft, minHeight: 32 }}>{directorTitle || t("director_label")}</div>
                <div className="h-12 flex items-center justify-center mb-1">
                  {directeur?.signature_url && <img src={directeur.signature_url} alt="" className="h-12 object-contain" />}
                </div>
                <div className="text-sm font-semibold" style={{ color: COLORS.ink }}>{formatSignerName(directeur, t)}</div>
              </div>
              <div className="text-center flex flex-col items-center">
                <div className="text-xs font-semibold mb-3 flex items-center justify-center" style={{ color: COLORS.inkSoft, minHeight: 32 }}>{t("teacher_in_charge_label")}</div>
                <div className="h-12 flex items-center justify-center mb-1">
                  {teacher?.signature_url && <img src={teacher.signature_url} alt="" className="h-12 object-contain" />}
                </div>
                <div className="text-sm font-semibold" style={{ color: COLORS.ink }}>{formatSignerName(teacher, t)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Réglages de l'école (logo, couleurs, titre du responsable, en-tête administrative)
// Accessible au Directeur ET au Fondateur — c'est souvent le Directeur qui remplit ces
// informations au quotidien, mais le Fondateur garde un œil dessus aussi.
// ---------- Déclaration de paiement d'abonnement (Fondateur → Admin plateforme) ----------
function SubscriptionDeclareView({ school, declarations, onDeclare, onUploadScreenshot }) {
  const { t, lang } = useLang();
  const [tier, setTier] = useState("essentiel");
  const [saving, setSaving] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const fileInputRef = useRef(null);
  const retryRefs = useRef({});
  const [uploadingId, setUploadingId] = useState(null);

  const selectedTierInfo = SUBSCRIPTION_TIERS.find((tr) => tr.key === tier);

  const submit = async () => {
    setSaving(true);
    const result = await onDeclare({ tier, amount: selectedTierInfo.price });
    if (result?.id && screenshotFile) {
      await onUploadScreenshot(result.id, screenshotFile);
    }
    setSaving(false);
    setScreenshotFile(null);
  };

  const handleLateScreenshot = async (declId, file) => {
    if (!file) return;
    setUploadingId(declId);
    await onUploadScreenshot(declId, file);
    setUploadingId(null);
  };

  const STATUS_STYLES = {
    pending: { label: "declaration_status_pending", color: "#B8860B", bg: "#FFF3D6" },
    confirmed: { label: "declaration_status_confirmed", color: COLORS.positive, bg: COLORS.positiveSoft },
    rejected: { label: "declaration_status_rejected", color: COLORS.negative, bg: COLORS.negativeSoft },
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("nav_subscription_declare")}</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>{t("subscription_declare_subtitle")}</p>

      <div className="rounded-2xl p-5 mb-8" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="grid sm:grid-cols-2 gap-3 mb-4 text-sm">
          <div><span style={{ color: COLORS.inkSoft }}>{t("school_name_label")} : </span><span className="font-semibold" style={{ color: COLORS.ink }}>{school?.name}</span></div>
          <div><span style={{ color: COLORS.inkSoft }}>{t("school_code_label")} : </span><span className="font-semibold" style={{ color: COLORS.ink, fontFamily: "'IBM Plex Mono', monospace" }}>{school?.code}</span></div>
        </div>

        <FieldLabel>{t("choose_tier_label")}</FieldLabel>
        <div className="space-y-2 mb-4">
          {SUBSCRIPTION_TIERS.map((tr) => (
            <button
              key={tr.key}
              onClick={() => setTier(tr.key)}
              className="w-full text-left rounded-xl p-3 flex items-center justify-between"
              style={tier === tr.key ? { background: COLORS.ink, color: "#fff" } : { background: COLORS.paper, color: COLORS.ink, border: `1px solid ${COLORS.line}` }}
            >
              <span className="font-semibold text-sm">{tr.name}</span>
              <span className="text-sm font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{tierPriceLabel(tr, t)}</span>
            </button>
          ))}
        </div>

        <FieldLabel>{t("payment_screenshot_label")}</FieldLabel>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)} />
        <button onClick={() => fileInputRef.current?.click()} className="w-full px-3 py-2.5 rounded-lg text-sm flex items-center justify-center gap-1.5 mb-4" style={{ background: COLORS.paper, color: COLORS.ink, border: `1px dashed ${COLORS.line}` }}>
          <ImageIcon size={14} /> {screenshotFile ? screenshotFile.name.slice(0, 24) : t("attach_screenshot_button")}
        </button>

        <button onClick={submit} disabled={saving} className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2" style={{ background: COLORS.primary, color: "#fff" }}>
          {saving && <Loader2 className="animate-spin" size={16} />} {t("declare_subscription_payment_button")}
        </button>
      </div>

      {declarations.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-3" style={{ color: COLORS.ink }}>{t("my_declarations_title")}</h2>
          <div className="space-y-2">
            {declarations.map((d) => {
              const style = STATUS_STYLES[d.status];
              const trInfo = SUBSCRIPTION_TIERS.find((tr) => tr.key === d.tier);
              return (
                <div key={d.id} className="rounded-xl p-3.5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <div className="text-sm font-semibold" style={{ color: COLORS.ink }}>{trInfo?.name} · {fmt(d.amount, "GNF")}</div>
                      <div className="text-xs" style={{ color: COLORS.inkSoft }}>{new Date(d.created_at).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}</div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: style.bg, color: style.color }}>{t(style.label)}</span>
                  </div>
                  {d.status === "pending" && !d.screenshot_url && (
                    <>
                      <input ref={(el) => (retryRefs.current[d.id] = el)} type="file" accept="image/*" className="hidden" onChange={(e) => { handleLateScreenshot(d.id, e.target.files?.[0]); e.target.value = ""; }} />
                      <button onClick={() => retryRefs.current[d.id]?.click()} disabled={uploadingId === d.id} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.paper, color: COLORS.ink }}>
                        {uploadingId === d.id ? <Loader2 className="animate-spin" size={12} /> : <ImageIcon size={12} />} {t("attach_screenshot_button")}
                      </button>
                    </>
                  )}
                  {d.screenshot_url && <div className="text-xs" style={{ color: COLORS.positive }}>✓ {t("screenshot_attached_label")}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StaffPresenceView({ records, staffProfiles }) {
  const { t } = useLang();
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));

  const nameFor = (userId) => staffProfiles.find((sp) => sp.user_id === userId)?.full_name || "—";
  const dayRecords = records.filter((r) => r.date === dateFilter);

  const fmtTime = (iso) => (iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—");

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Présence du personnel</h1>
      <p className="mb-5" style={{ color: COLORS.inkSoft }}>Arrivées et départs pointés par les enseignants depuis l'enceinte de l'école.</p>

      <div className="mb-5">
        <FieldLabel>Date</FieldLabel>
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
      </div>

      {dayRecords.length === 0 ? (
        <div className="rounded-2xl p-6 text-center text-sm" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.inkSoft }}>
          Aucun pointage pour cette date.
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          {dayRecords.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${COLORS.line}` }}>
              <div className="font-semibold" style={{ color: COLORS.ink }}>{nameFor(r.user_id)}</div>
              <div className="flex items-center gap-4 text-sm" style={{ color: COLORS.inkSoft }}>
                <span>Arrivée : <b style={{ color: COLORS.positive }}>{fmtTime(r.heure_arrivee)}</b></span>
                <span>Départ : <b style={{ color: r.heure_depart ? COLORS.ink : COLORS.inkSoft }}>{fmtTime(r.heure_depart)}</b></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SchoolSettingsView({ levelType, schoolInfo, onUploadLogo, onUploadEmblem, onSaveTheme, onSaveDirectorTitle, onSaveAdminInfo, onSaveLocation }) {
  const { t } = useLang();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingEmblem, setUploadingEmblem] = useState(false);
  const [directorTitle, setDirectorTitle] = useState(schoolInfo?.director_title || "Directeur");
  const [savingDirectorTitle, setSavingDirectorTitle] = useState(false);
  const [ire, setIre] = useState(schoolInfo?.ire || "");
  const [dpe, setDpe] = useState(schoolInfo?.dpe || "");
  const [dsee, setDsee] = useState(schoolInfo?.dsee || "");
  const [ville, setVille] = useState(schoolInfo?.ville || "");
  const [savingAdminInfo, setSavingAdminInfo] = useState(false);
  const [schoolLat, setSchoolLat] = useState(schoolInfo?.latitude ?? "");
  const [schoolLng, setSchoolLng] = useState(schoolInfo?.longitude ?? "");
  const [schoolRadius, setSchoolRadius] = useState(schoolInfo?.rayon_metres ?? 200);
  const [locatingGps, setLocatingGps] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const logoInputRef = useRef(null);
  const emblemInputRef = useRef(null);

  const handleSaveDirectorTitle = async (title) => {
    setDirectorTitle(title);
    setSavingDirectorTitle(true);
    await onSaveDirectorTitle(title);
    setSavingDirectorTitle(false);
  };

  const handleSaveAdminInfo = async () => {
    setSavingAdminInfo(true);
    await onSaveAdminInfo(ire.trim(), dpe.trim(), dsee.trim(), ville.trim());
    setSavingAdminInfo(false);
  };

  const handleUseCurrentPosition = () => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }
    setLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSchoolLat(pos.coords.latitude);
        setSchoolLng(pos.coords.longitude);
        setLocatingGps(false);
      },
      (err) => {
        setLocationError(err.code === 1 ? "Autorisation de localisation refusée." : "Impossible de récupérer la position.");
        setLocatingGps(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSaveLocation = async () => {
    setLocationError("");
    const lat = parseFloat(schoolLat);
    const lng = parseFloat(schoolLng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setLocationError("Utilise le bouton ci-dessus, sur place à l'école, pour capter des coordonnées valides.");
      return;
    }
    setSavingLocation(true);
    await onSaveLocation(lat, lng, parseInt(schoolRadius, 10) || 200);
    setSavingLocation(false);
  };

  const handleLogoPick = async (file) => {
    if (!file) return;
    setUploadingLogo(true);
    await onUploadLogo(file);
    setUploadingLogo(false);
  };

  const handleEmblemPick = async (file) => {
    if (!file) return;
    setUploadingEmblem(true);
    await onUploadEmblem(file);
    setUploadingEmblem(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("nav_school_settings")}</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>{t("school_settings_subtitle")}</p>

      <div className="rounded-2xl p-5 mb-8" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: COLORS.inkSoft }}>{t("school_logo_title")}</div>
        <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { handleLogoPick(e.target.files?.[0]); e.target.value = ""; }} />
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0" style={{ background: COLORS.paper, border: `1px solid ${COLORS.line}` }}>
            {schoolInfo?.logo_url ? <img src={schoolInfo.logo_url} alt="" className="w-full h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={20} style={{ color: COLORS.inkSoft }} /></div>}
          </div>
          <button onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo} className="text-xs font-semibold px-3 py-2.5 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.primary, color: "#fff" }}>
            {uploadingLogo && <Loader2 className="animate-spin" size={12} />} {schoolInfo?.logo_url ? t("change_photo") : t("add_logo_button")}
          </button>
        </div>
        <p className="text-xs mt-2" style={{ color: COLORS.inkSoft }}>{t("school_logo_hint")}</p>
      </div>

      <div className="rounded-2xl p-5 mb-8" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: COLORS.inkSoft }}>{t("emblem_title")}</div>
        <input ref={emblemInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { handleEmblemPick(e.target.files?.[0]); e.target.value = ""; }} />
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0" style={{ background: COLORS.paper, border: `1px solid ${COLORS.line}` }}>
            {schoolInfo?.emblem_url ? <img src={schoolInfo.emblem_url} alt="" className="w-full h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={20} style={{ color: COLORS.inkSoft }} /></div>}
          </div>
          <button onClick={() => emblemInputRef.current?.click()} disabled={uploadingEmblem} className="text-xs font-semibold px-3 py-2.5 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.primary, color: "#fff" }}>
            {uploadingEmblem && <Loader2 className="animate-spin" size={12} />} {schoolInfo?.emblem_url ? t("change_photo") : t("add_emblem_button")}
          </button>
        </div>
        <p className="text-xs mt-2" style={{ color: COLORS.inkSoft }}>{t("emblem_hint")}</p>
      </div>

      {levelType === "secondaire" && (
        <div className="rounded-2xl p-5 mb-8" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: COLORS.inkSoft }}>{t("director_title_setting")}</div>
          <div className="grid grid-cols-2 gap-2">
            {["Principal", "Proviseur"].map((titleOption) => (
              <button
                key={titleOption}
                onClick={() => handleSaveDirectorTitle(titleOption)}
                disabled={savingDirectorTitle}
                className="text-xs font-semibold px-3 py-2.5 rounded-lg"
                style={directorTitle === titleOption ? { background: COLORS.ink, color: "#fff" } : { background: COLORS.paper, color: COLORS.ink, border: `1px solid ${COLORS.line}` }}
              >
                {titleOption}
              </button>
            ))}
          </div>
          <p className="text-xs mt-2" style={{ color: COLORS.inkSoft }}>{t("director_title_hint")}</p>
        </div>
      )}

      <div className="rounded-2xl p-5 mb-8" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: COLORS.inkSoft }}>{t("admin_info_title")}</div>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <FieldLabel>{t("ville_label")}</FieldLabel>
            <input value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Ex: N'Zérékoré" className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mb-3">
          <div>
            <FieldLabel>{t("ire_label")}</FieldLabel>
            <input value={ire} onChange={(e) => setIre(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
          </div>
          <div>
            <FieldLabel>{t("dpe_label")}</FieldLabel>
            <input value={dpe} onChange={(e) => setDpe(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
          </div>
          <div>
            <FieldLabel>{t("dsee_label")}</FieldLabel>
            <input value={dsee} onChange={(e) => setDsee(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
          </div>
        </div>
        <button onClick={handleSaveAdminInfo} disabled={savingAdminInfo} className="text-xs font-semibold px-3 py-2.5 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.primary, color: "#fff" }}>
          {savingAdminInfo && <Loader2 className="animate-spin" size={12} />} {t("set_button")}
        </button>
        <p className="text-xs mt-2" style={{ color: COLORS.inkSoft }}>{t("admin_info_hint")}</p>
      </div>

      <div className="rounded-2xl p-5 mb-8" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: COLORS.inkSoft }}>Position GPS de l'école</div>
        <p className="text-xs mb-3" style={{ color: COLORS.inkSoft }}>
          Sert à vérifier que les enseignants pointent leur présence depuis l'enceinte de l'école. Tiens-toi sur place, dans la cour de l'école, avant de cliquer sur le bouton ci-dessous.
        </p>
        <button
          onClick={handleUseCurrentPosition}
          disabled={locatingGps}
          className="text-xs font-semibold px-3 py-2.5 rounded-lg flex items-center gap-1.5 mb-3"
          style={{ background: COLORS.ink, color: "#fff" }}
        >
          {locatingGps && <Loader2 className="animate-spin" size={12} />} Utiliser ma position actuelle
        </button>
        <div className="grid sm:grid-cols-3 gap-3 mb-3">
          <div>
            <FieldLabel>Latitude</FieldLabel>
            <input value={schoolLat} onChange={(e) => setSchoolLat(e.target.value)} placeholder="Ex: 9.6412" className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
          </div>
          <div>
            <FieldLabel>Longitude</FieldLabel>
            <input value={schoolLng} onChange={(e) => setSchoolLng(e.target.value)} placeholder="Ex: -13.5784" className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
          </div>
          <div>
            <FieldLabel>Rayon autorisé (mètres)</FieldLabel>
            <input type="number" value={schoolRadius} onChange={(e) => setSchoolRadius(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
          </div>
        </div>
        {locationError && <p className="text-xs mb-2" style={{ color: COLORS.negative }}>{locationError}</p>}
        <button onClick={handleSaveLocation} disabled={savingLocation} className="text-xs font-semibold px-3 py-2.5 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.primary, color: "#fff" }}>
          {savingLocation && <Loader2 className="animate-spin" size={12} />} {t("set_button")}
        </button>
      </div>

      <div className="rounded-2xl p-5 mb-8" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: COLORS.inkSoft }}>{t("card_theme_title")}</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(CARD_THEMES).map(([key, th]) => (
            <button
              key={key}
              onClick={() => onSaveTheme(key)}
              className="rounded-xl p-2.5 flex flex-col items-center gap-1.5"
              style={{ border: (schoolInfo?.card_theme || "corail") === key ? `2px solid ${th.from}` : `1px solid ${COLORS.line}` }}
            >
              <div className="w-full h-6 rounded-lg" style={{ background: `linear-gradient(90deg, ${th.from}, ${th.to})` }} />
              <span className="text-xs font-medium" style={{ color: COLORS.ink }}>{th.name}</span>
            </button>
          ))}
        </div>
        <p className="text-xs mt-2" style={{ color: COLORS.inkSoft }}>{t("card_theme_hint")}</p>
      </div>
    </div>
  );
}

function TuitionFeesView({ levelType, tuitionFees, onSave, tierComplete, schoolMomo, onSaveMomo }) {
  const { t } = useLang();
  const [values, setValues] = useState({});
  const [newValues, setNewValues] = useState({});
  const [savingClass, setSavingClass] = useState(null);
  const [momoNumber, setMomoNumber] = useState(schoolMomo?.momo_number || "");
  const [momoProvider, setMomoProvider] = useState(schoolMomo?.momo_provider || "Orange Money");
  const [savingMomo, setSavingMomo] = useState(false);

  const levels = getLevels(levelType);

  const getValue = (cName) => {
    if (values[cName] !== undefined) return values[cName];
    const existing = tuitionFees.find((f) => f.class_name === cName);
    return existing ? String(existing.amount) : "";
  };
  const getNewValue = (cName) => {
    if (newValues[cName] !== undefined) return newValues[cName];
    const existing = tuitionFees.find((f) => f.class_name === cName);
    return existing?.new_student_amount !== null && existing?.new_student_amount !== undefined ? String(existing.new_student_amount) : "";
  };

  const handleSave = async (cName) => {
    setSavingClass(cName);
    const newAmountRaw = getNewValue(cName);
    await onSave(cName, parseFloat(getValue(cName)) || 0, newAmountRaw.trim() === "" ? null : parseFloat(newAmountRaw) || 0);
    setSavingClass(null);
  };

  const handleSaveMomo = async () => {
    setSavingMomo(true);
    await onSaveMomo(momoNumber.trim(), momoProvider);
    setSavingMomo(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("nav_tuition_fees")}</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>{t("tuition_fees_subtitle")}</p>

      <div className="rounded-2xl p-5 mb-8" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: COLORS.inkSoft }}>{t("momo_settings_title")}</div>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <FieldLabel>{t("momo_provider_label")}</FieldLabel>
            <select value={momoProvider} onChange={(e) => setMomoProvider(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle}>
              <option value="Orange Money">Orange Money</option>
              <option value="MTN Money">MTN Money</option>
            </select>
          </div>
          <div>
            <FieldLabel>{t("momo_number_label")}</FieldLabel>
            <input value={momoNumber} onChange={(e) => setMomoNumber(e.target.value)} placeholder="Ex: 622 00 00 00" className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
          </div>
        </div>
        <button onClick={handleSaveMomo} disabled={savingMomo} className="text-xs font-semibold px-3 py-2.5 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.primary, color: "#fff" }}>
          {savingMomo && <Loader2 className="animate-spin" size={12} />} {t("set_button")}
        </button>
        <p className="text-xs mt-2" style={{ color: COLORS.inkSoft }}>{t("momo_settings_hint")}</p>
      </div>

      {levels.map((lvl) => (
        <div key={lvl} className="mb-8">
          <h2 className="text-lg font-bold mb-3" style={{ color: COLORS.primary }}>{lvl}</h2>
          <div className="space-y-2.5">
            {getClassOptions(lvl).map((cName) => (
              <div key={cName} className="rounded-2xl p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                <div className="font-semibold mb-3" style={{ color: COLORS.ink }}>{cName}</div>
                <div className="grid sm:grid-cols-2 gap-2.5 mb-3">
                  <div>
                    <FieldLabel>{tierComplete ? t("tuition_standard_label") : t("tuition_amount_label_simple")}</FieldLabel>
                    <input
                      type="number"
                      value={getValue(cName)}
                      onChange={(e) => setValues((v) => ({ ...v, [cName]: e.target.value }))}
                      placeholder={t("tuition_amount_placeholder")}
                      className="w-full px-3 py-2.5 rounded-lg outline-none text-sm"
                      style={inputStyle}
                    />
                  </div>
                  {tierComplete && (
                    <div>
                      <FieldLabel>{t("tuition_new_student_label")}</FieldLabel>
                      <input
                        type="number"
                        value={getNewValue(cName)}
                        onChange={(e) => setNewValues((v) => ({ ...v, [cName]: e.target.value }))}
                        placeholder={t("tuition_new_student_placeholder")}
                        className="w-full px-3 py-2.5 rounded-lg outline-none text-sm"
                        style={inputStyle}
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleSave(cName)}
                  disabled={savingClass === cName}
                  className="text-xs font-semibold px-3 py-2.5 rounded-lg flex items-center gap-1.5"
                  style={{ background: COLORS.primary, color: "#fff" }}
                >
                  {savingClass === cName && <Loader2 className="animate-spin" size={12} />} {t("set_button")}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function FeedbackAdminView() {
  const { t, lang } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("app_feedback").select("*, schools(name)").order("created_at", { ascending: false });
      if (data) setItems(data);
      setLoading(false);
    })();
  }, []);

  const filtered = items.filter((it) => minRating === 0 || (it.rating || 0) <= minRating);
  const avgRating = items.filter((it) => it.rating).length > 0
    ? (items.reduce((sum, it) => sum + (it.rating || 0), 0) / items.filter((it) => it.rating).length).toFixed(1)
    : null;

  if (loading) return <div className="py-10 flex justify-center"><Loader2 className="animate-spin" size={22} style={{ color: COLORS.ink }} /></div>;

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("nav_feedback")}</h1>
      <p className="mb-5" style={{ color: COLORS.inkSoft }}>{t("feedback_admin_subtitle")}</p>

      <div className="flex items-center gap-4 mb-6 flex-wrap">
        {avgRating && (
          <div className="rounded-2xl px-5 py-3 flex items-center gap-2" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <Star size={20} fill="#F2B84B" color="#F2B84B" />
            <span className="text-xl font-extrabold" style={{ color: COLORS.ink }}>{avgRating}</span>
            <span className="text-sm" style={{ color: COLORS.inkSoft }}>/ 5 · {items.length} {t("feedback_count_label")}</span>
          </div>
        )}
        <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle}>
          <option value={0}>{t("feedback_filter_all")}</option>
          <option value={2}>{t("feedback_filter_low")}</option>
          <option value={3}>{t("feedback_filter_mid")}</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState text={t("no_feedback_yet")} />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((it) => (
            <div key={it.id} className="rounded-2xl p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={15} fill={it.rating >= n ? "#F2B84B" : "none"} color={it.rating >= n ? "#F2B84B" : COLORS.line} />
                  ))}
                </div>
                <span className="text-xs" style={{ color: COLORS.inkSoft }}>{new Date(it.created_at).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
              {it.message && <p className="text-sm mb-2" style={{ color: COLORS.ink }}>{it.message}</p>}
              <div className="text-xs" style={{ color: COLORS.inkSoft }}>
                {it.full_name || t("feedback_anonymous")} · {ROLE_LABELS[it.role] || it.role} · {it.schools?.name || "—"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BroadcastModal({ onSend, onClose }) {
  const { t } = useLang();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!title.trim() || !message.trim()) return;
    setSaving(true);
    await onSend(title.trim(), message.trim());
    setSaving(false);
    onClose();
  };

  return (
    <Modal title={t("broadcast_title")} onClose={onClose}>
      <p className="text-sm mb-4" style={{ color: COLORS.inkSoft }}>{t("broadcast_subtitle")}</p>
      <div className="space-y-3">
        <div>
          <FieldLabel>{t("event_title_label")}</FieldLabel>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
        </div>
        <div>
          <FieldLabel>{t("discipline_note_label")}</FieldLabel>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
        </div>
        <button onClick={submit} disabled={saving} className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2" style={{ background: COLORS.ink, color: "#fff" }}>
          {saving && <Loader2 className="animate-spin" size={16} />} {t("broadcast_send_button")}
        </button>
      </div>
    </Modal>
  );
}

function AdminView() {
  const { t, lang } = useLang();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [showHidden, setShowHidden] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [userCounts, setUserCounts] = useState(null);
  const [userCountsError, setUserCountsError] = useState(false);
  const [subDeclarations, setSubDeclarations] = useState([]);
  const [zoomedSubImg, setZoomedSubImg] = useState(null);
  const [subBusyId, setSubBusyId] = useState(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from("schools").select("*").order("created_at", { ascending: false });
    if (data && data.length > 0) setSchools(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Déclarations de paiement d'abonnement, envoyées par les écoles.
  const loadSubDeclarations = useCallback(async () => {
    const { data } = await supabase.from("subscription_payment_declarations").select("*, schools(name, code)").order("created_at", { ascending: false });
    if (data) setSubDeclarations(data);
  }, []);
  useEffect(() => { loadSubDeclarations(); }, [loadSubDeclarations]);

  const confirmSubDeclaration = async (d) => {
    setSubBusyId(d.id);
    const trInfo = SUBSCRIPTION_TIERS.find((tr) => tr.key === d.tier);
    await supabase.from("schools").update({ subscribed: true, subscription_tier: d.tier }).eq("id", d.school_id);
    const { data } = await supabase.from("subscription_payment_declarations").update({ status: "confirmed", confirmed_at: new Date().toISOString() }).eq("id", d.id).select("*, schools(name, code)").maybeSingle();
    if (data) setSubDeclarations((prev) => prev.map((x) => (x.id === d.id ? data : x)));
    setSchools((prev) => prev.map((s) => (s.id === d.school_id ? { ...s, subscribed: true, subscription_tier: d.tier } : s)));
    setSubBusyId(null);
  };

  const rejectSubDeclaration = async (d) => {
    setSubBusyId(d.id);
    const { data } = await supabase.from("subscription_payment_declarations").update({ status: "rejected", confirmed_at: new Date().toISOString() }).eq("id", d.id).select("*, schools(name, code)").maybeSingle();
    if (data) setSubDeclarations((prev) => prev.map((x) => (x.id === d.id ? data : x)));
    setSubBusyId(null);
  };

  const deleteSubDeclaration = async (id) => {
    await supabase.from("subscription_payment_declarations").delete().eq("id", id);
    setSubDeclarations((prev) => prev.filter((x) => x.id !== id));
  };

  // Nombre total d'utilisateurs sur toute la plateforme, par rôle. Nécessite que l'admin
  // puisse lire la colonne "role" de tous les profils, toutes écoles confondues.
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("profiles").select("role");
      if (error || !data) { setUserCountsError(true); return; }
      const counts = {};
      data.forEach((p) => { counts[p.role] = (counts[p.role] || 0) + 1; });
      setUserCounts(counts);
    })();
  }, []);

  const sendBroadcast = async (title, message) => {
    await supabase.from("platform_broadcasts").insert({ title, message });
  };

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
      .update({ subscribed: true, subscription_tier: tier.key })
      .eq("id", school.id)
      .select();
    if (data && data.length > 0) setSchools((prev) => prev.map((s) => (s.id === school.id ? data[0] : s)));
    if (error) alert("Erreur : " + error.message);
    setSavingId(null);
  };

  const toggleHiddenSchool = async (school) => {
    setSavingId(school.id);
    const { data, error } = await supabase
      .from("schools")
      .update({ hidden: !school.hidden })
      .eq("id", school.id)
      .select();
    if (data && data.length > 0) setSchools((prev) => prev.map((s) => (s.id === school.id ? data[0] : s)));
    if (error) alert("Erreur : " + error.message);
    setSavingId(null);
  };

  if (loading) return <div className="py-10 flex justify-center"><Loader2 className="animate-spin" size={24} style={{ color: COLORS.ink }} /></div>;

  const hiddenCount = schools.filter((s) => s.hidden).length;
  const baseList = showHidden ? schools : schools.filter((s) => !s.hidden);
  const filtered = baseList.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
  });

  // ---------- Vue d'ensemble + alertes ----------
  const visibleSchools = schools.filter((s) => !s.hidden);
  const subscribedCount = visibleSchools.filter((s) => s.subscribed).length;
  const now = Date.now();
  const trialInfo = (s) => {
    if (!s.trial_started_at) return { expired: false, daysLeft: null };
    const end = new Date(s.trial_started_at).getTime() + 7 * 24 * 60 * 60 * 1000;
    const daysLeft = Math.ceil((end - now) / (24 * 60 * 60 * 1000));
    return { expired: daysLeft < 0, daysLeft };
  };
  const trialSchools = visibleSchools.filter((s) => !s.subscribed);
  const expiredCount = trialSchools.filter((s) => trialInfo(s).expired).length;
  const expiringSoon = trialSchools.filter((s) => { const ti = trialInfo(s); return !ti.expired && ti.daysLeft !== null && ti.daysLeft <= 2; });

  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("admin_title")}</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowBroadcast(true)} className="text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.primary, color: "#fff" }}>
            <Megaphone size={13} /> {t("broadcast_title")}
          </button>
          {hiddenCount > 0 && (
            <button onClick={() => setShowHidden((v) => !v)} className="text-xs font-medium px-3 py-2 rounded-lg" style={{ background: COLORS.paper, color: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
              {showHidden ? t("hide_hidden_profiles") : `${t("show_hidden")} (${hiddenCount})`}
            </button>
          )}
        </div>
      </div>
      <p className="mb-4" style={{ color: COLORS.inkSoft }}>{t("admin_subtitle")}</p>

      {showBroadcast && <BroadcastModal onSend={sendBroadcast} onClose={() => setShowBroadcast(false)} />}

      {/* Vue d'ensemble globale */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="rounded-xl p-3.5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <div className="text-2xl font-extrabold" style={{ color: COLORS.ink }}>{visibleSchools.length}</div>
          <div className="text-[11px] uppercase font-semibold" style={{ color: COLORS.inkSoft }}>{t("total_schools_label")}</div>
        </div>
        <div className="rounded-xl p-3.5" style={{ background: COLORS.positiveSoft }}>
          <div className="text-2xl font-extrabold" style={{ color: COLORS.positive }}>{subscribedCount}</div>
          <div className="text-[11px] uppercase font-semibold" style={{ color: COLORS.positive }}>{t("subscribed_count_label")}</div>
        </div>
        <div className="rounded-xl p-3.5" style={{ background: COLORS.primarySoft }}>
          <div className="text-2xl font-extrabold" style={{ color: COLORS.primary }}>{trialSchools.length - expiredCount}</div>
          <div className="text-[11px] uppercase font-semibold" style={{ color: COLORS.primary }}>{t("trial_count_label")}</div>
        </div>
        <div className="rounded-xl p-3.5" style={{ background: COLORS.negativeSoft }}>
          <div className="text-2xl font-extrabold" style={{ color: COLORS.negative }}>{expiredCount}</div>
          <div className="text-[11px] uppercase font-semibold" style={{ color: COLORS.negative }}>{t("expired_count_label")}</div>
        </div>
      </div>

      {/* Alertes : essai qui expire bientôt */}
      {expiringSoon.length > 0 && (
        <div className="rounded-2xl p-4 mb-5" style={{ background: "#FFF3D6", border: "1px solid #E8B84B" }}>
          <div className="text-sm font-bold mb-2 flex items-center gap-1.5" style={{ color: "#B8860B" }}>
            <AlertTriangle size={15} /> {t("expiring_soon_title")}
          </div>
          <div className="space-y-1">
            {expiringSoon.map((s) => {
              const ti = trialInfo(s);
              return (
                <div key={s.id} className="text-sm flex items-center justify-between" style={{ color: COLORS.ink }}>
                  <span>{s.name}</span>
                  <span className="font-semibold">{ti.daysLeft <= 0 ? t("expires_today") : `${ti.daysLeft} ${t("days_left_label")}`}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Nombre d'utilisateurs sur toute la plateforme, par rôle */}
      <div className="rounded-2xl p-4 mb-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="text-sm font-bold mb-3" style={{ color: COLORS.ink }}>{t("platform_users_title")}</div>
        {userCountsError ? (
          <p className="text-xs" style={{ color: COLORS.inkSoft }}>{t("platform_users_unavailable")}</p>
        ) : !userCounts ? (
          <Loader2 className="animate-spin" size={16} style={{ color: COLORS.inkSoft }} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              ["fondateur", t("role_fondateur_dir")],
              ["directeur", t("role_directeur")],
              ["comptable", t("fn_comptable")],
              ["enseignant", t("fn_enseignant")],
              ["personnel", t("fn_personnel")],
              ["parent", t("parent_word")],
            ].map(([key, label]) => (
              <div key={key} className="rounded-xl px-3 py-2.5" style={{ background: COLORS.paper }}>
                <div className="text-lg font-extrabold" style={{ color: COLORS.ink, fontFamily: "'IBM Plex Mono', monospace" }}>{userCounts[key] || 0}</div>
                <div className="text-[11px]" style={{ color: COLORS.inkSoft }}>{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Déclarations de paiement d'abonnement, envoyées par les écoles */}
      {(() => {
        const pendingSub = subDeclarations.filter((d) => d.status === "pending");
        const resolvedSub = subDeclarations.filter((d) => d.status !== "pending");
        const SubDeclCard = ({ d }) => {
          const trInfo = SUBSCRIPTION_TIERS.find((tr) => tr.key === d.tier);
          return (
            <div className="rounded-xl p-3.5" style={{ background: COLORS.paper }}>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                <div>
                  <div className="text-sm font-semibold" style={{ color: COLORS.ink }}>{d.schools?.name} <span className="font-normal" style={{ color: COLORS.inkSoft }}>({d.schools?.code})</span></div>
                  <div className="text-xs" style={{ color: COLORS.inkSoft }}>{trInfo?.name} · {new Date(d.created_at).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}</div>
                </div>
                <div className="text-sm font-bold" style={{ color: COLORS.positive, fontFamily: "'IBM Plex Mono', monospace" }}>{fmt(d.amount, "GNF")}</div>
              </div>
              {d.screenshot_url && (
                <button onClick={() => setZoomedSubImg(d.screenshot_url)} className="mb-2 block">
                  <img src={d.screenshot_url} alt="" className="h-16 rounded-lg object-cover" style={{ border: `1px solid ${COLORS.line}` }} />
                </button>
              )}
              {d.status === "pending" ? (
                <div className="flex gap-2">
                  <button onClick={() => confirmSubDeclaration(d)} disabled={subBusyId === d.id} className="text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.positive, color: "#fff" }}>
                    {subBusyId === d.id && <Loader2 className="animate-spin" size={12} />} {t("confirm_payment_button")}
                  </button>
                  <button onClick={() => rejectSubDeclaration(d)} disabled={subBusyId === d.id} className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ background: COLORS.negativeSoft, color: COLORS.negative }}>
                    {t("reject_button")}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={d.status === "confirmed" ? { background: COLORS.positiveSoft, color: COLORS.positive } : { background: COLORS.negativeSoft, color: COLORS.negative }}>
                    {d.status === "confirmed" ? `✓ ${t("declaration_status_confirmed")}` : `✕ ${t("declaration_status_rejected")}`}
                  </span>
                  <button onClick={() => deleteSubDeclaration(d.id)} style={{ color: COLORS.inkSoft }}><Trash2 size={14} /></button>
                </div>
              )}
            </div>
          );
        };
        return (
          <div className="rounded-2xl p-4 mb-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <div className="text-sm font-bold mb-3" style={{ color: COLORS.ink }}>{t("nav_subscription_declare")} ({pendingSub.length})</div>
            {subDeclarations.length === 0 ? (
              <p className="text-xs" style={{ color: COLORS.inkSoft }}>{t("no_pending_declarations")}</p>
            ) : (
              <div className="space-y-2">
                {pendingSub.map((d) => <SubDeclCard key={d.id} d={d} />)}
                {resolvedSub.slice(0, 10).map((d) => <SubDeclCard key={d.id} d={d} />)}
              </div>
            )}
          </div>
        );
      })()}

      {zoomedSubImg && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setZoomedSubImg(null)}>
          <img src={zoomedSubImg} alt="" className="max-w-full max-h-full rounded-lg" />
          <button onClick={() => setZoomedSubImg(null)} className="absolute top-4 right-4 p-2 rounded-full" style={{ background: "#fff" }}><X size={18} /></button>
        </div>
      )}

      <p className="text-xs mb-4" style={{ color: COLORS.inkSoft }}>{baseList.length} {t("schools_count")} · {t("select_school_hint")}</p>

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
              <div key={s.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${COLORS.line}`, opacity: s.hidden ? 0.55 : 1 }}>
                <button
                  onClick={() => setSelectedId(isOpen ? null : s.id)}
                  className="w-full flex items-start justify-between gap-3 px-4 py-3.5 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold flex items-start gap-1.5" style={{ color: COLORS.ink, wordBreak: "break-word" }}>
                      <span>{s.name}</span>
                      {s.hidden && <EyeOff size={13} className="shrink-0 mt-0.5" style={{ color: COLORS.inkSoft }} />}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: COLORS.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>{s.code}</div>
                  </div>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                    style={{ background: s.subscribed ? COLORS.positiveSoft : COLORS.primarySoft, color: s.subscribed ? COLORS.positive : COLORS.primary }}
                  >
                    {s.subscribed ? `${t("subscribed_tag")} · ${SUBSCRIPTION_TIERS.find((tr) => tr.key === s.subscription_tier)?.name || "?"}` : t("free_trial_tag")}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4">
                    <div className="text-xs mb-3" style={{ color: COLORS.inkSoft }}>
                      {s.subscribed ? t("active_subscription") : `${t("free_trial_started")} ${new Date(s.trial_started_at).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}`}
                    </div>
                    <button
                      onClick={() => toggleHiddenSchool(s)}
                      disabled={savingId === s.id}
                      className="text-xs font-semibold px-3 py-2 rounded-lg mb-3 flex items-center gap-1.5"
                      style={{ background: COLORS.paper, color: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}
                    >
                      {savingId === s.id && <Loader2 className="animate-spin" size={12} />}
                      {s.hidden ? <><Eye size={13} /> {t("unhide_school")}</> : <><EyeOff size={13} /> {t("hide_school")}</>}
                    </button>
                    <div className="flex flex-wrap gap-2">
                      {SUBSCRIPTION_TIERS.map((tier) => (
                        <button
                          key={tier.key}
                          onClick={() => setTier(s, tier)}
                          disabled={savingId === s.id}
                          className="text-xs font-medium px-3 py-2 rounded-lg"
                          style={s.subscribed && s.subscription_tier === tier.key ? { background: COLORS.ink, color: "#fff" } : { background: COLORS.paper, color: COLORS.ink, border: `1px solid ${COLORS.line}` }}
                        >
                          {t("activate_tier")} "{tier.name}" ({tierPriceLabel(tier, t)})
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
function GradesSecondaireView({ students, gradesSecondaire, releases, allAssignments, myUserId, classHeadTeachers, subjectsSecondaire, currency, readOnly, canPublish, staffProfiles, isHeadTeacherOf, onSave, onSetCoefficient, onToggleRelease, onPublishAll, schoolName, bulletinAppreciations, onSaveAppreciation, directorTitle, schoolInfo }) {
  const { t } = useLang();
  const [view, setView] = useState("saisie"); // saisie | bulletin
  const [saving, setSaving] = useState(null);
  const [togglingRelease, setTogglingRelease] = useState(false);
  const [coefInput, setCoefInput] = useState("");
  const [activeStudentId, setActiveStudentId] = useState(null);
  const [bulletinStudent, setBulletinStudent] = useState(null);

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
          <div className="rounded-2xl overflow-x-auto max-h-[70vh] overflow-y-auto" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: COLORS.paper }}>
                  <th className="text-left px-4 py-3 font-semibold whitespace-nowrap sticky left-0 top-0 z-20" style={{ color: COLORS.inkSoft, background: COLORS.paper }}>{t("student")}</th>
                  {isComp ? (
                    <th className="text-center px-3 py-3 font-semibold sticky top-0 z-10" style={{ color: COLORS.inkSoft, background: COLORS.paper }}>{t("composition_note")}</th>
                  ) : (
                    <>
                      <th className="text-center px-3 py-3 font-semibold sticky top-0 z-10" style={{ color: COLORS.inkSoft, background: COLORS.paper }}>{t("written")}</th>
                      <th className="text-center px-3 py-3 font-semibold sticky top-0 z-10" style={{ color: COLORS.inkSoft, background: COLORS.paper }}>{t("oral")}</th>
                      <th className="text-center px-3 py-3 font-semibold sticky top-0 z-10" style={{ color: COLORS.ink, background: COLORS.paper }}>{t("month_avg")}</th>
                    </>
                  )}
                  <th className="text-center px-3 py-3 font-semibold sticky top-0 z-10" style={{ color: COLORS.primary, background: COLORS.paper }}>{t("term_avg")}</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((s, i) => {
                  const g = getGrade(s.id, subject, month);
                  return (
                    <tr key={s.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${COLORS.line}` }}>
                      <td
                        className="px-4 py-2.5 font-medium whitespace-nowrap sticky left-0 z-10"
                        style={{
                          color: activeStudentId === s.id ? "#fff" : (s.gender === "Fille" ? COLORS.negative : COLORS.ink),
                          background: activeStudentId === s.id ? COLORS.primary : COLORS.card,
                          transition: "background 0.15s, color 0.15s",
                        }}
                      >
                        {s.full_name}
                      </td>
                      {isComp ? (
                        <td className="px-2 py-2 text-center">
                          {canEdit ? (
                            <input
                              key={`${subject}-${month}-comp`}
                              type="number"
                              defaultValue={g?.ecrit ?? ""}
                              onFocus={() => setActiveStudentId(s.id)}
                              onBlur={(e) => handleScoreChange(s.id, "ecrit", e.target.value)}
                              className="w-16 px-2 py-1.5 rounded-lg text-center outline-none text-sm"
                              style={{ ...inputStyle, opacity: saving === `${s.id}-ecrit` ? 0.5 : 1 }}
                            />
                          ) : (
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{g?.ecrit ?? "—"}</span>
                          )}
                        </td>
                      ) : (
                        <>
                          <td className="px-2 py-2 text-center">
                            {canEdit ? (
                              <input
                                key={`${subject}-${month}-ecrit`}
                                type="number"
                                defaultValue={g?.ecrit ?? ""}
                                onFocus={() => setActiveStudentId(s.id)}
                                onBlur={(e) => handleScoreChange(s.id, "ecrit", e.target.value)}
                                className="w-16 px-2 py-1.5 rounded-lg text-center outline-none text-sm"
                                style={{ ...inputStyle, opacity: saving === `${s.id}-ecrit` ? 0.5 : 1 }}
                              />
                            ) : (
                              <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{g?.ecrit ?? "—"}</span>
                            )}
                          </td>
                          <td className="px-2 py-2 text-center">
                            {canEdit ? (
                              <input
                                key={`${subject}-${month}-oral`}
                                type="number"
                                defaultValue={g?.oral ?? ""}
                                onFocus={() => setActiveStudentId(s.id)}
                                onBlur={(e) => handleScoreChange(s.id, "oral", e.target.value)}
                                className="w-16 px-2 py-1.5 rounded-lg text-center outline-none text-sm"
                                style={{ ...inputStyle, opacity: saving === `${s.id}-oral` ? 0.5 : 1 }}
                              />
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

    // Rang tenant compte des égalités (classement olympique) : deux élèves avec la même
    // moyenne partagent le même rang — ex: 1, 2, 2, 4 — pas 1, 2, 3, 4.
    const ranks = (() => {
      let currentRank = 1;
      return rows.map((row, i) => {
        if (i > 0 && row.moyenneGenerale === rows[i - 1].moyenneGenerale) return currentRank;
        currentRank = i + 1;
        return currentRank;
      });
    })();

    const release = releases.find((r) => r.class_name === className && r.term === term);
    const published = release?.published || false;

    const togglePublish = async () => {
      setTogglingRelease(true);
      await onToggleRelease(className, term, !published);
      setTogglingRelease(false);
    };

    const getHeadTeacherSignatureData = async (cName) => {
      const directeur = staffProfiles?.find((sp) => sp.role === "directeur" && !sp.hidden);
      const headEntry = classHeadTeachers.find((c) => c.class_name === cName);
      const headTeacherProfile = headEntry ? staffProfiles?.find((sp) => sp.user_id === headEntry.teacher_id) : null;
      const [directeurImg, teacherImg] = await Promise.all([
        fetchImageForExcel(directeur?.signature_url),
        fetchImageForExcel(headTeacherProfile?.signature_url),
      ]);
      return {
        directeurName: formatSignerName(directeur, t),
        directeurSignatureImg: directeurImg,
        teacherLabel: "Le professeur principal",
        teacherName: formatSignerName(headTeacherProfile, t),
        teacherSignatureImg: teacherImg,
        ville: schoolInfo?.ville,
      };
    };

    const buildBulletinWorkbook = async () => {
      const workbook = new window.ExcelJS.Workbook();
      // Rang tenant compte des égalités (classement olympique) : ex 1, 2, 2, 4.
      let currentRank = 1;
      const bulletinRanks = rows.map((row, i) => {
        if (i > 0 && row.moyenneGenerale === rows[i - 1].moyenneGenerale) return currentRank;
        currentRank = i + 1;
        return currentRank;
      });
      const headers = [t("order_number"), t("student"), ...allSubjects, t("general_average"), t("rank"), t("appreciation_col")];
      const rowsData = rows.map((row, i) => ({
        cells: [i + 1, row.student.full_name, ...row.subjectAvgs.map((sa) => (sa.avg !== null ? sa.avg.toFixed(2) : "")), row.moyenneGenerale !== null ? row.moyenneGenerale.toFixed(2) : "", bulletinRanks[i], mentionFor(row.moyenneGenerale, 10)?.fr || "—"],
        isRed: row.student.gender === "Fille",
      }));
      await addStyledSheet(workbook, {
        title: `Bulletin & Classement — ${className} · ${term}`,
        headers,
        rows: rowsData,
        nameColIndex: 2,
        alwaysRedCols: [headers.length - 2, headers.length - 1],
        schoolInfo,
        className,
        termLabel: termLabelFor(term, schoolInfo?.currentYear),
      });
      if (staffProfiles) {
        const sheet = workbook.worksheets[0];
        const sigData = await getHeadTeacherSignatureData(className);
        addSignatureFooter(workbook, sheet, sheet.rowCount, sigData);
      }
      return workbook;
    };
    const exportBulletinExcel = async () => {
      if (!window.ExcelJS) { alert("Le générateur Excel n'a pas pu se charger. Vérifie ta connexion et réessaie."); return; }
      const workbook = await buildBulletinWorkbook();
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bulletin_${className}_${term}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    };
    const [sharingBulletin, setSharingBulletin] = useState(false);
    const shareBulletinExcel = async () => {
      if (!window.ExcelJS) { alert("Le générateur Excel n'a pas pu se charger. Vérifie ta connexion et réessaie."); return; }
      setSharingBulletin(true);
      const workbook = await buildBulletinWorkbook();
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      await shareOrDownloadExcel(blob, `bulletin_${className}_${term}_${new Date().toISOString().slice(0, 10)}.xlsx`);
      setSharingBulletin(false);
    };

    const computeBulletinFor = (cName) => {
      const cSubjects = [...new Set(allAssignments.filter((a) => a.class_name === cName).map((a) => a.subject))].sort();
      const cStudents = students.filter((s) => s.class_name === cName);
      const cRows = cStudents.map((s) => {
        const subjectAvgs = cSubjects.map((subj) => ({ subject: subj, avg: subjectAverageForTerm(s.id, subj, term), coef: subjectsSecondaire.find((cs) => cs.class_name === cName && cs.subject === subj)?.coefficient || 1 }));
        const withData = subjectAvgs.filter((sa) => sa.avg !== null);
        const totalCoef = withData.reduce((sum, sa) => sum + sa.coef, 0);
        const weighted = totalCoef > 0 ? withData.reduce((sum, sa) => sum + sa.avg * sa.coef, 0) / totalCoef : null;
        return { student: s, subjectAvgs, moyenneGenerale: weighted };
      }).sort((a, b) => (b.moyenneGenerale ?? -Infinity) - (a.moyenneGenerale ?? -Infinity));
      return { cSubjects, cRows };
    };

    const buildAllBulletinsWorkbook = async () => {
      const workbook = new window.ExcelJS.Workbook();
      for (const cName of classNames) {
        const { cSubjects, cRows } = computeBulletinFor(cName);
        let currentRank = 1;
        const allBulletinRanks = cRows.map((row, i) => {
          if (i > 0 && row.moyenneGenerale === cRows[i - 1].moyenneGenerale) return currentRank;
          currentRank = i + 1;
          return currentRank;
        });
        const headers = [t("order_number"), t("student"), ...cSubjects, t("general_average"), t("rank"), t("appreciation_col")];
        const rowsData = cRows.map((row, i) => ({
          cells: [i + 1, row.student.full_name, ...row.subjectAvgs.map((sa) => (sa.avg !== null ? sa.avg.toFixed(2) : "")), row.moyenneGenerale !== null ? row.moyenneGenerale.toFixed(2) : "", allBulletinRanks[i], mentionFor(row.moyenneGenerale, 10)?.fr || "—"],
          isRed: row.student.gender === "Fille",
        }));
        await addStyledSheet(workbook, {
          title: `${cName} · ${term}`,
          headers,
          rows: rowsData,
          nameColIndex: 2,
          alwaysRedCols: [headers.length - 2, headers.length - 1],
          schoolInfo,
          className: cName,
          termLabel: termLabelFor(term, schoolInfo?.currentYear),
        });
        if (staffProfiles) {
          const sheet = workbook.worksheets[workbook.worksheets.length - 1];
          const sigData = await getHeadTeacherSignatureData(cName);
          addSignatureFooter(workbook, sheet, sheet.rowCount, sigData);
        }
      }
      return workbook;
    };
    const [exportingAllBulletin, setExportingAllBulletin] = useState(false);
    const exportAllBulletinExcel = async () => {
      if (!window.ExcelJS) { alert("Le générateur Excel n'a pas pu se charger. Vérifie ta connexion et réessaie."); return; }
      setExportingAllBulletin(true);
      const workbook = await buildAllBulletinsWorkbook();
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bulletins_toutes_classes_${term}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      setExportingAllBulletin(false);
    };
    const [sharingAllBulletin, setSharingAllBulletin] = useState(false);
    const shareAllBulletinExcel = async () => {
      if (!window.ExcelJS) { alert("Le générateur Excel n'a pas pu se charger. Vérifie ta connexion et réessaie."); return; }
      setSharingAllBulletin(true);
      const workbook = await buildAllBulletinsWorkbook();
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      await shareOrDownloadExcel(blob, `bulletins_toutes_classes_${term}_${new Date().toISOString().slice(0, 10)}.xlsx`);
      setSharingAllBulletin(false);
    };

    const [publishingAllBulletin, setPublishingAllBulletin] = useState(false);
    const publishAllBulletinsForTerm = async () => {
      setPublishingAllBulletin(true);
      await onPublishAll(classNames, term);
      setPublishingAllBulletin(false);
    };

    return (
      <>
        <div className="flex justify-end gap-2 mb-3 flex-wrap">
          <button onClick={exportBulletinExcel} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-sm" style={{ background: "#fff", color: COLORS.ink, border: `1px solid ${COLORS.line}` }}>
            <FileSpreadsheet size={16} /> {t("export_excel")}
          </button>
          {canPublish && (
            <button onClick={exportAllBulletinExcel} disabled={exportingAllBulletin} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-sm" style={{ background: "#fff", color: COLORS.ink, border: `1px solid ${COLORS.line}` }}>
              {exportingAllBulletin ? <Loader2 className="animate-spin" size={16} /> : <FileSpreadsheet size={16} />} {t("export_all_classes")}
            </button>
          )}
        </div>
        <div className="mb-5">
          <FieldLabel>{t("period_label")}</FieldLabel>
          <select value={term} onChange={(e) => setTerm(e.target.value)} className="w-full sm:w-48 px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
            {Object.keys(TERM_MONTHS).map((tm) => <option key={tm} value={tm}>{tm}</option>)}
            <option value="Annuel">{t("annual_option")}</option>
          </select>
        </div>

        {canPublish && (
          <div className="rounded-xl px-4 py-3 mb-5 flex items-center justify-between flex-wrap gap-3" style={{ background: published ? COLORS.positiveSoft : COLORS.primarySoft }}>
            <div>
              <div className="text-sm font-semibold" style={{ color: published ? COLORS.positive : COLORS.primary }}>
                {published ? t("ranking_validated") : t("ranking_not_published")}
              </div>
              <div className="text-xs mt-0.5" style={{ color: COLORS.inkSoft }}>{className} · {term}</div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={togglePublish} disabled={togglingRelease} className="text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5" style={{ background: published ? COLORS.negative : COLORS.positive, color: "#fff" }}>
                {togglingRelease && <Loader2 className="animate-spin" size={12} />}
                {published ? t("remove") : t("validate_publish")}
              </button>
              <button onClick={publishAllBulletinsForTerm} disabled={publishingAllBulletin} className="text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.ink, color: "#fff" }}>
                {publishingAllBulletin && <Loader2 className="animate-spin" size={12} />}
                {t("publish_all_classes")}
              </button>
            </div>
          </div>
        )}

        {classStudents.length === 0 || allSubjects.length === 0 ? (
          <EmptyState text={t("no_grades_yet")} />
        ) : (
          <div className="rounded-2xl overflow-x-auto" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: COLORS.paper }}>
                  <th className="text-left px-3 py-3 font-semibold" style={{ color: COLORS.inkSoft }}>{t("order_number")}</th>
                  <th className="text-left px-4 py-3 font-semibold whitespace-nowrap sticky left-0 z-10" style={{ color: COLORS.inkSoft, background: COLORS.paper }}>{t("student")}</th>
                  {allSubjects.map((subj) => (
                    <th key={subj} className="text-center px-3 py-3 font-semibold whitespace-nowrap" style={{ color: COLORS.inkSoft }}>{subj}</th>
                  ))}
                  <th className="text-center px-3 py-3 font-semibold" style={{ color: COLORS.primary }}>{t("general_average")}</th>
                  <th className="text-center px-3 py-3 font-semibold" style={{ color: COLORS.primary }}>{t("rank")}</th>
                  <th className="text-center px-3 py-3 font-semibold" style={{ color: COLORS.inkSoft }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.student.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${COLORS.line}` }}>
                    <td className="px-3 py-2.5 font-bold" style={{ color: COLORS.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium whitespace-nowrap sticky left-0 z-10" style={{ color: row.student.gender === "Fille" ? COLORS.negative : COLORS.ink, background: COLORS.card }}>{row.student.full_name}</td>
                    {row.subjectAvgs.map((sa) => (
                      <td key={sa.subject} className="px-3 py-2.5 text-center" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{sa.avg !== null ? sa.avg.toFixed(2) : "—"}</td>
                    ))}
                    <td className="px-3 py-2.5 text-center font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.primary }}>{row.moyenneGenerale !== null ? row.moyenneGenerale.toFixed(2) : "—"}</td>
                    <td className="px-3 py-2.5 text-center font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.primary }}>{ranks[i]}</td>
                    <td className="px-3 py-2.5 text-center">
                      <button onClick={() => setBulletinStudent({ row, rank: ranks[i], total: rows.length })} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1" style={{ background: COLORS.ink, color: "#fff" }}>
                        <FileText size={12} /> {t("bulletin_button")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    );
  };

  const closeBulletinModal = () => setBulletinStudent(null);
  const bulletinData = bulletinStudent
    ? (() => {
        const { row, rank } = bulletinStudent;
        const directeur = staffProfiles?.find((sp) => sp.role === "directeur" && !sp.hidden);
        const headEntry = classHeadTeachers.find((c) => c.class_name === row.student.class_name);
        const headTeacherProfile = headEntry ? staffProfiles?.find((sp) => sp.user_id === headEntry.teacher_id) : null;
        const appreciation = bulletinAppreciations?.find((a) => a.student_id === row.student.id && a.term === term)?.appreciation || "";
        return {
          student: row.student,
          subjectRows: row.subjectAvgs.map((sa) => ({ subject: sa.subject, detail: sa.avg !== null ? sa.avg.toFixed(2) : "—", moyenne: sa.avg })),
          moyenneGenerale: row.moyenneGenerale,
          rank,
          totalInClass: bulletinStudent.total,
          directeur,
          teacher: headTeacherProfile,
          appreciation,
        };
      })()
    : null;

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

      {bulletinData && (
        <StudentBulletinView
          schoolName={schoolName}
          student={bulletinData.student}
          className={bulletinData.student.class_name}
          term={term}
          schoolYear={bulletinData.student.school_year}
          subjectRows={bulletinData.subjectRows}
          moyenneGenerale={bulletinData.moyenneGenerale}
          passThreshold={10}
          rank={bulletinData.rank}
          totalInClass={bulletinData.totalInClass}
          directeur={bulletinData.directeur}
          teacher={bulletinData.teacher}
          appreciation={bulletinData.appreciation}
          canEditAppreciation={!readOnly || canPublish}
          onSaveAppreciation={async (text) => onSaveAppreciation(bulletinData.student.id, term, text)}
          directorTitle={directorTitle}
          onClose={closeBulletinModal}
        />
      )}
    </div>
  );
}

// ---------- Assignation de classe (fondateur / primaire) ----------
function PrimaryClassAssignView({ teachers, classOptions, onAssign }) {
  const { t } = useLang();
  const [savingId, setSavingId] = useState(null);
  const [localValues, setLocalValues] = useState({});

  const handleAssign = async (userId) => {
    const value = localValues[userId] ?? "";
    setSavingId(userId);
    await onAssign(userId, value.trim());
    setSavingId(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("assign_class_title")}</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>{t("assign_class_subtitle")}</p>

      {teachers.length === 0 ? (
        <EmptyState text={t("no_staff")} />
      ) : (
        <div className="space-y-3">
          {teachers.map((tch) => {
            const current = localValues[tch.user_id] ?? tch.class_name ?? "";
            return (
              <div key={tch.user_id} className="rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                <div>
                  <div className="font-semibold" style={{ color: COLORS.ink }}>{tch.full_name}</div>
                  <div className="text-xs mt-0.5" style={{ color: tch.class_name ? COLORS.inkSoft : COLORS.primary }}>
                    {tch.class_name || t("no_class_assigned_yet")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={current}
                    onChange={(e) => setLocalValues((v) => ({ ...v, [tch.user_id]: e.target.value }))}
                    className="px-3 py-2 rounded-lg outline-none text-sm"
                    style={inputStyle}
                  >
                    <option value="">{t("unassigned_class")}</option>
                    {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button
                    onClick={() => handleAssign(tch.user_id)}
                    disabled={savingId === tch.user_id}
                    className="text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5"
                    style={{ background: COLORS.primary, color: "#fff" }}
                  >
                    {savingId === tch.user_id && <Loader2 className="animate-spin" size={12} />} {t("set_button")}
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

function GradesView({ students, grades, releases, readOnly, canPublish, lockedClass, passThreshold, staffProfiles, onSave, onToggleRelease, onPublishAll, schoolName, bulletinAppreciations, onSaveAppreciation, directorTitle, schoolInfo }) {
  const { t } = useLang();
  const PASS_THRESHOLD = passThreshold ?? 10;
  const classNames = useMemo(() => [...new Set(students.map((s) => s.class_name))].sort(), [students]);
  const [className, setClassName] = useState(lockedClass || classNames[0] || "");
  const [term, setTerm] = useState("Trimestre 1");
  const [newSubject, setNewSubject] = useState("");
  const [ranked, setRankedState] = useState(false);
  const [bulletinStudent, setBulletinStudent] = useState(null);
  const [activeCell, setActiveCell] = useState({ studentId: null, subject: null });
  const tableScrollRef = useRef(null);
  useEffect(() => {
    if (!activeCell.subject || !tableScrollRef.current) return;
    const container = tableScrollRef.current;
    const th = document.getElementById(`subj-th-${activeCell.subject}`);
    if (!th) return;
    // La colonne "Élève" reste fixe (collée) à gauche — on s'assure que la matière active
    // ne se retrouve jamais partiellement cachée derrière elle pendant le défilement.
    const stickyColWidth = container.querySelector("th.sticky.left-0")?.offsetWidth || 0;
    const thLeft = th.offsetLeft;
    const thRight = thLeft + th.offsetWidth;
    if (thLeft < container.scrollLeft + stickyColWidth) {
      container.scrollTo({ left: thLeft - stickyColWidth - 8, behavior: "smooth" });
    } else if (thRight > container.scrollLeft + container.clientWidth) {
      container.scrollTo({ left: thRight - container.clientWidth + 8, behavior: "smooth" });
    }
  }, [activeCell.subject]);
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

  // Rang tenant compte des égalités (classement olympique) : deux élèves avec la même
  // moyenne partagent le même rang — ex: 1, 2, 2, 4 — pas 1, 2, 3, 4.
  const ranks = useMemo(() => {
    let currentRank = 1;
    return rows.map((row, i) => {
      if (i > 0 && row.moyenne === rows[i - 1].moyenne) return currentRank;
      currentRank = i + 1;
      return currentRank;
    });
  }, [rows]);

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

  const [publishingAll, setPublishingAll] = useState(false);
  const publishAllForTerm = async () => {
    setPublishingAll(true);
    await onPublishAll(classNames, term);
    setPublishingAll(false);
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

  const computeClassData = (cName, cTerm) => {
    const cIsAnnual = cTerm === "Annuel";
    const cStudents = students.filter((s) => s.class_name === cName);
    const cTrimGrades = grades.filter((g) => g.class_name === cName && ["Trimestre 1", "Trimestre 2", "Trimestre 3"].includes(g.term));
    let cGrades;
    if (cIsAnnual) {
      const map = {};
      cTrimGrades.forEach((g) => {
        if (g.score === null || g.score === undefined) return;
        const key = g.student_id + "|" + g.subject;
        map[key] = (map[key] || 0) + Number(g.score);
      });
      cGrades = Object.entries(map).map(([key, score]) => {
        const [student_id, subject] = key.split("|");
        return { student_id, subject, score, class_name: cName, term: "Annuel" };
      });
    } else {
      cGrades = grades.filter((g) => g.class_name === cName && g.term === cTerm);
    }
    const cSubjects = [...new Set(cGrades.map((g) => g.subject))].sort();
    const cGetScore = (studentId, subject) => cGrades.find((g) => g.student_id === studentId && g.subject === subject)?.score;

    const cRows = cStudents.map((s) => {
      const scores = cSubjects.map((subj) => cGetScore(s.id, subj)).filter((v) => v !== null && v !== undefined && v !== "");
      const total = scores.reduce((sum, v) => sum + Number(v), 0);
      const moyenne = scores.length > 0 ? total / scores.length : null;
      return { student: s, total, moyenne };
    }).sort((a, b) => (b.moyenne ?? -Infinity) - (a.moyenne ?? -Infinity));

    // Rang tenant compte des égalités (classement olympique) : ex 1, 2, 2, 4.
    let currentRank = 1;
    const cRanks = cRows.map((row, i) => {
      if (i > 0 && row.moyenne === cRows[i - 1].moyenne) return currentRank;
      currentRank = i + 1;
      return currentRank;
    });

    const byGender = (predicate) => {
      const garcons = cStudents.filter((s) => s.gender === "Garçon" && predicate(s)).length;
      const filles = cStudents.filter((s) => s.gender === "Fille" && predicate(s)).length;
      const total = cStudents.filter(predicate).length;
      return { garcons, filles, total };
    };
    const hasComposed = (s) => cGrades.some((g) => g.student_id === s.id && g.score !== null && g.score !== undefined);
    const moyenneOf = (s) => cRows.find((r) => r.student.id === s.id)?.moyenne;
    const isAdmis = (s) => { const m = moyenneOf(s); return m !== null && m !== undefined && m >= PASS_THRESHOLD; };
    const isEchoue = (s) => { const m = moyenneOf(s); return m !== null && m !== undefined && m < PASS_THRESHOLD; };
    const inscrits = byGender(() => true);
    const composes = byGender(hasComposed);
    const admis = byGender(isAdmis);
    const echoues = byGender(isEchoue);
    const pct = (part, total) => (total > 0 ? ((part / total) * 100).toFixed(1) : "—");
    const cSummaryStats = {
      inscrits, composes, admis, echoues,
      admisPctG: pct(admis.garcons, composes.garcons), admisPctF: pct(admis.filles, composes.filles), admisPctT: pct(admis.total, composes.total),
      echouePctG: pct(echoues.garcons, composes.garcons), echouePctF: pct(echoues.filles, composes.filles), echouePctT: pct(echoues.total, composes.total),
    };

    const cSubjectStats = cSubjects.map((subj) => {
      const withScore = (gender) => cStudents.filter((s) => s.gender === gender && cGetScore(s.id, subj) !== null && cGetScore(s.id, subj) !== undefined);
      const withScoreAny = cStudents.filter((s) => cGetScore(s.id, subj) !== null && cGetScore(s.id, subj) !== undefined);
      const passing = (gender) => withScore(gender).filter((s) => cGetScore(s.id, subj) >= PASS_THRESHOLD);
      const passingAny = withScoreAny.filter((s) => cGetScore(s.id, subj) >= PASS_THRESHOLD);
      const g = withScore("Garçon").length, f = withScore("Fille").length, total = withScoreAny.length;
      const pg = passing("Garçon").length, pf = passing("Fille").length, pt = passingAny.length;
      return { subject: subj, g, f, total, pg, pf, pt, pctG: pct(pg, g), pctF: pct(pf, f), pctT: pct(pt, total) };
    });

    return { cStudents, cSubjects, cGetScore, cRows, cRanks, cSummaryStats, cSubjectStats };
  };

  const buildClassSheet = async (workbook, cName, cTerm) => {
    const { cSubjects, cGetScore, cRows, cRanks, cSummaryStats, cSubjectStats } = computeClassData(cName, cTerm);
    const sheetName = cName.replace(/[\\/*?:[\]]/g, "").slice(0, 31) || "Classe";
    const sheet = workbook.addWorksheet(sheetName);
    const headerFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF20304A" } };
    const thinBorder = { top: { style: "thin", color: { argb: "FFDCD6C8" } }, left: { style: "thin", color: { argb: "FFDCD6C8" } }, bottom: { style: "thin", color: { argb: "FFDCD6C8" } }, right: { style: "thin", color: { argb: "FFDCD6C8" } } };
    const styleHeaderRow = (row) => row.eachCell((c) => { c.font = { bold: true, color: { argb: "FFFFFFFF" } }; c.fill = headerFill; c.alignment = { horizontal: "center", vertical: "middle", wrapText: true }; c.border = thinBorder; });
    const styleDataRow = (row) => row.eachCell((c) => { c.border = thinBorder; c.alignment = { horizontal: "center", vertical: "middle" }; });

    if (schoolInfo) await writeOfficialHeader(workbook, sheet, schoolInfo, cName, termLabelFor(cTerm, schoolInfo?.currentYear), 6 + cSubjects.length);

    const titleRow = sheet.addRow([`Notes — ${cName} · ${cTerm}`]);
    sheet.mergeCells(titleRow.number, 1, titleRow.number, 6 + cSubjects.length);
    titleRow.getCell(1).font = { bold: true, size: 14, color: { argb: "FF20304A" } };
    titleRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    sheet.addRow([]);

    const headerRow = sheet.addRow(["N°", "Élève", "Sexe", ...cSubjects, "Total", "Moyenne", "Rang", "Appréciation"]);
    styleHeaderRow(headerRow);
    headerRow.height = 30;
    const moyenneColIdx = 5 + cSubjects.length;
    const rangColIdx = 6 + cSubjects.length;
    const apprColIdx = 7 + cSubjects.length;
    cRows.forEach((r, i) => {
      const mention = mentionFor(r.moyenne, PASS_THRESHOLD)?.fr || "—";
      const row = sheet.addRow([i + 1, r.student.full_name, r.student.gender === "Fille" ? "F" : r.student.gender === "Garçon" ? "M" : "—", ...cSubjects.map((s) => cGetScore(r.student.id, s) ?? ""), r.total.toFixed(1), r.moyenne !== null ? r.moyenne.toFixed(2) : "", cRanks[i], mention]);
      styleDataRow(row);
      if (r.student.gender === "Fille") row.getCell(2).font = { color: { argb: "FFB23B32" } };
      row.getCell(2).alignment = { horizontal: "left", vertical: "middle" };
      row.getCell(moyenneColIdx).font = { bold: true, color: { argb: "FFB23B32" } };
      row.getCell(rangColIdx).font = { bold: true, color: { argb: "FF20304A" } };
    });

    sheet.addRow([]);
    const statsTitle = sheet.addRow(["Tableau statistique des résultats"]);
    sheet.mergeCells(statsTitle.number, 1, statsTitle.number, 7);
    statsTitle.getCell(1).font = { bold: true, size: 12, color: { argb: "FF20304A" } };
    statsTitle.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    styleHeaderRow(sheet.addRow(["", "Inscrits", "Ont composé", "Admis", "% Admis", "Échoués", "% Échoués"]));
    styleDataRow(sheet.addRow(["Garçons", cSummaryStats.inscrits.garcons, cSummaryStats.composes.garcons, cSummaryStats.admis.garcons, cSummaryStats.admisPctG, cSummaryStats.echoues.garcons, cSummaryStats.echouePctG]));
    const fillesStatsRow = sheet.addRow(["Filles", cSummaryStats.inscrits.filles, cSummaryStats.composes.filles, cSummaryStats.admis.filles, cSummaryStats.admisPctF, cSummaryStats.echoues.filles, cSummaryStats.echouePctF]);
    styleDataRow(fillesStatsRow);
    fillesStatsRow.eachCell((c) => { c.font = { color: { argb: "FFB23B32" } }; });
    const totalStatsRow = sheet.addRow(["Total", cSummaryStats.inscrits.total, cSummaryStats.composes.total, cSummaryStats.admis.total, cSummaryStats.admisPctT, cSummaryStats.echoues.total, cSummaryStats.echouePctT]);
    styleDataRow(totalStatsRow);
    totalStatsRow.eachCell((c) => { c.font = { ...(c.font || {}), bold: true }; });

    sheet.addRow([]);
    const subjTitle = sheet.addRow(["Tableau analytique des résultats"]);
    sheet.mergeCells(subjTitle.number, 1, subjTitle.number, 1 + cSubjects.length);
    subjTitle.getCell(1).font = { bold: true, size: 12, color: { argb: "FF20304A" } };
    subjTitle.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    styleHeaderRow(sheet.addRow(["", ...cSubjects]));
    styleDataRow(sheet.addRow(["Garçons", ...cSubjectStats.map((s) => `${s.pg}/${s.g} · ${s.pctG}%`)]));
    const fillesSubjRow = sheet.addRow(["Filles", ...cSubjectStats.map((s) => `${s.pf}/${s.f} · ${s.pctF}%`)]);
    styleDataRow(fillesSubjRow);
    fillesSubjRow.eachCell((c) => { c.font = { color: { argb: "FFB23B32" } }; });
    const totalSubjRow = sheet.addRow(["Total", ...cSubjectStats.map((s) => `${s.pt}/${s.total} · ${s.pctT}%`)]);
    styleDataRow(totalSubjRow);
    totalSubjRow.eachCell((c) => { c.font = { ...(c.font || {}), bold: true }; });

    sheet.columns.forEach((col, i) => { col.width = i === 0 ? 5 : i === 1 ? 26 : 14; });

    // Signatures : Directeur (gauche) + enseignant de la classe (droite)
    if (staffProfiles) {
      const directeur = staffProfiles.find((sp) => sp.role === "directeur" && !sp.hidden);
      const classTeacher = staffProfiles.find((sp) => sp.role === "enseignant" && sp.class_name === cName);
      const [directeurImg, teacherImg] = await Promise.all([
        fetchImageForExcel(directeur?.signature_url),
        fetchImageForExcel(classTeacher?.signature_url),
      ]);
      addSignatureFooter(workbook, sheet, sheet.rowCount, {
        directeurName: formatSignerName(directeur, t),
        directeurSignatureImg: directeurImg,
        teacherLabel: "L'enseignant chargé du cours",
        teacherName: formatSignerName(classTeacher, t),
        teacherSignatureImg: teacherImg,
        ville: schoolInfo?.ville,
      });
    }
  };

  const exportExcel = async () => {
    if (!window.ExcelJS) { alert("Le générateur Excel n'a pas pu se charger. Vérifie ta connexion et réessaie."); return; }
    const workbook = new window.ExcelJS.Workbook();
    await buildClassSheet(workbook, className, term);
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notes_${className}_${term}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const [sharingOne, setSharingOne] = useState(false);
  const shareExcel = async () => {
    if (!window.ExcelJS) { alert("Le générateur Excel n'a pas pu se charger. Vérifie ta connexion et réessaie."); return; }
    setSharingOne(true);
    const workbook = new window.ExcelJS.Workbook();
    await buildClassSheet(workbook, className, term);
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    await shareOrDownloadExcel(blob, `notes_${className}_${term}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setSharingOne(false);
  };

  const [exportingAll, setExportingAll] = useState(false);
  const exportAllExcel = async () => {
    if (!window.ExcelJS) { alert("Le générateur Excel n'a pas pu se charger. Vérifie ta connexion et réessaie."); return; }
    setExportingAll(true);
    const workbook = new window.ExcelJS.Workbook();
    for (const cName of classNames) { await buildClassSheet(workbook, cName, term); }
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notes_toutes_classes_${term}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    setExportingAll(false);
  };
  const [sharingAll, setSharingAll] = useState(false);
  const shareAllExcel = async () => {
    if (!window.ExcelJS) { alert("Le générateur Excel n'a pas pu se charger. Vérifie ta connexion et réessaie."); return; }
    setSharingAll(true);
    const workbook = new window.ExcelJS.Workbook();
    for (const cName of classNames) { await buildClassSheet(workbook, cName, term); }
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    await shareOrDownloadExcel(blob, `notes_toutes_classes_${term}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setSharingAll(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("nav_grades")}</h1>
        <div className="flex gap-2 flex-wrap">
          <button onClick={exportExcel} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-sm" style={{ background: "#fff", color: COLORS.ink, border: `1px solid ${COLORS.line}` }}>
            <FileSpreadsheet size={16} /> {t("export_excel")}
          </button>
          {canPublish && (
            <button onClick={exportAllExcel} disabled={exportingAll} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-sm" style={{ background: "#fff", color: COLORS.ink, border: `1px solid ${COLORS.line}` }}>
              {exportingAll ? <Loader2 className="animate-spin" size={16} /> : <FileSpreadsheet size={16} />} {t("export_all_classes")}
            </button>
          )}
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

      {canPublish && (
        <div className="rounded-xl px-4 py-3 mb-5 flex items-center justify-between flex-wrap gap-3" style={{ background: published ? COLORS.positiveSoft : COLORS.primarySoft }}>
          <div>
            <div className="text-sm font-semibold" style={{ color: published ? COLORS.positive : COLORS.primary }}>
              {published ? t("published_to_parents") : t("not_published")}
            </div>
            <div className="text-xs mt-0.5" style={{ color: COLORS.inkSoft }}>{className} · {term}</div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={togglePublish} disabled={togglingRelease} className="text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5" style={{ background: published ? COLORS.negative : COLORS.positive, color: "#fff" }}>
              {togglingRelease && <Loader2 className="animate-spin" size={12} />}
              {published ? t("remove_hide") : t("publish_to_parents")}
            </button>
            <button onClick={publishAllForTerm} disabled={publishingAll} className="text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.ink, color: "#fff" }}>
              {publishingAll && <Loader2 className="animate-spin" size={12} />}
              {t("publish_all_classes")}
            </button>
          </div>
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
        <>
          {activeCell.studentId && activeCell.subject && (
            <div
              className="fixed left-1/2 z-[60] px-3 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-sm font-semibold md:hidden"
              style={{ bottom: "max(calc(env(safe-area-inset-bottom, 0px) + 68px), 68px)", transform: "translateX(-50%)", background: COLORS.ink, color: "#fff", maxWidth: "94vw" }}
            >
              <span className="truncate" style={{ color: "#fff" }}>
                {classStudents.find((s) => s.id === activeCell.studentId)?.full_name}
              </span>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>·</span>
              <span className="truncate" style={{ color: "#FFB088" }}>{activeCell.subject}</span>
              <button
                onClick={() => {
                  const idx = classStudents.findIndex((s) => s.id === activeCell.studentId);
                  const next = classStudents[idx + 1];
                  if (!next) return;
                  setActiveCell({ studentId: next.id, subject: activeCell.subject });
                  const nextInput = document.getElementById(`cell-${next.id}-${activeCell.subject}`);
                  nextInput?.focus();
                }}
                disabled={classStudents.findIndex((s) => s.id === activeCell.studentId) >= classStudents.length - 1}
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.15)", opacity: classStudents.findIndex((s) => s.id === activeCell.studentId) >= classStudents.length - 1 ? 0.4 : 1 }}
              >
                <ArrowRight size={15} color="#fff" />
              </button>
            </div>
          )}
          <div ref={tableScrollRef} className="rounded-2xl overflow-x-auto max-h-[70vh] overflow-y-auto" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: COLORS.paper }}>
                <th className="text-left px-3 py-3 font-semibold sticky top-0 z-10" style={{ color: COLORS.inkSoft, background: COLORS.paper }}>{t("order_number")}</th>
                <th className="text-left px-4 py-3 font-semibold whitespace-nowrap sticky left-0 top-0 z-20" style={{ color: COLORS.inkSoft, background: COLORS.paper }}>{t("student")}</th>
                {subjects.map((subj) => (
                  <th
                    key={subj}
                    id={`subj-th-${subj}`}
                    className="text-center px-3 py-3 font-semibold whitespace-nowrap sticky top-0 z-10"
                    style={{
                      color: activeCell.subject === subj ? "#fff" : COLORS.inkSoft,
                      background: activeCell.subject === subj ? COLORS.primary : COLORS.paper,
                      transition: "background 0.15s, color 0.15s",
                    }}
                  >
                    {subj}
                  </th>
                ))}
                <th className="text-center px-3 py-3 font-semibold sticky top-0 z-10" style={{ color: COLORS.ink, background: COLORS.paper }}>{t("total")}</th>
                <th className="text-center px-3 py-3 font-semibold sticky top-0 z-10" style={{ color: COLORS.ink, background: COLORS.paper }}>{t("average")}</th>
                {ranked && <th className="text-center px-3 py-3 font-semibold sticky top-0 z-10" style={{ color: COLORS.primary, background: COLORS.paper }}>{t("rank")}</th>}
                <th className="text-center px-3 py-3 font-semibold sticky top-0 z-10" style={{ color: COLORS.inkSoft, background: COLORS.paper }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                return (
                <tr key={row.student.id} id={`row-${row.student.id}`} style={{ borderTop: i === 0 ? "none" : `1px solid ${COLORS.line}` }}>
                  <td className="px-3 py-2.5 font-bold" style={{ color: COLORS.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>{i + 1}</td>
                  <td
                    className="px-4 py-2.5 font-medium whitespace-nowrap sticky left-0 z-10"
                    style={{
                      color: activeCell.studentId === row.student.id ? "#fff" : (row.student.gender === "Fille" ? COLORS.negative : COLORS.ink),
                      background: activeCell.studentId === row.student.id ? COLORS.primary : COLORS.card,
                      transition: "background 0.15s, color 0.15s",
                    }}
                  >
                    {row.student.full_name}
                  </td>
                  {subjects.map((subj) => {
                    const key = `${row.student.id}-${subj}`;
                    const val = getScore(row.student.id, subj);
                    return (
                      <td key={subj} className="px-2 py-2 text-center">
                        {cellsReadOnly ? (
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{val ?? "—"}</span>
                        ) : (
                          <input
                            id={`cell-${row.student.id}-${subj}`}
                            type="number"
                            defaultValue={val ?? ""}
                            onFocus={() => setActiveCell({ studentId: row.student.id, subject: subj })}
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
                  {ranked && <td className="px-3 py-2.5 text-center font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.primary }}>{ranks[i]}</td>}
                  <td className="px-3 py-2.5 text-center">
                    <button onClick={() => setBulletinStudent({ row, rank: ranked ? ranks[i] : null })} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1" style={{ background: COLORS.ink, color: "#fff" }}>
                      <FileText size={12} /> {t("bulletin_button")}
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </>
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

      {bulletinStudent && (() => {
        const { row, rank } = bulletinStudent;
        const directeur = staffProfiles?.find((sp) => sp.role === "directeur" && !sp.hidden);
        const teacher = staffProfiles?.find((sp) => sp.role === "enseignant" && sp.class_name === row.student.class_name);
        const appreciation = bulletinAppreciations?.find((a) => a.student_id === row.student.id && a.term === term)?.appreciation || "";
        return (
          <StudentBulletinView
            schoolName={schoolName}
            student={row.student}
            className={row.student.class_name}
            term={term}
            schoolYear={row.student.school_year}
            subjectRows={subjects.map((subj) => {
              const val = getScore(row.student.id, subj);
              return { subject: subj, detail: val ?? "—", moyenne: val !== null && val !== undefined ? Number(val) : null };
            })}
            moyenneGenerale={row.moyenne}
            passThreshold={passThreshold}
            rank={rank}
            totalInClass={rows.length}
            directeur={directeur}
            teacher={teacher}
            appreciation={appreciation}
            canEditAppreciation={!readOnly || canPublish}
            onSaveAppreciation={async (text) => onSaveAppreciation(row.student.id, term, text)}
            directorTitle={directorTitle}
            onClose={() => setBulletinStudent(null)}
          />
        );
      })()}
    </div>
  );
}

// ---------- Personnel & Paie (comptable / fondateur) ----------
function StaffTrashModal({ hiddenProfiles, onRestore, onClose }) {
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [restoringId, setRestoringId] = useState(null);

  const filtered = hiddenProfiles.filter((p) => !search.trim() || p.full_name.toLowerCase().includes(search.toLowerCase()));

  const handleRestore = async (userId) => {
    setRestoringId(userId);
    await onRestore(userId);
    setRestoringId(null);
  };

  const fonctionLabel = (p) => {
    if (p.role === "directeur") return t("role_directeur");
    if (p.role === "comptable") return t("fn_comptable");
    if (p.role === "enseignant") return t("fn_enseignant");
    return p.fonction || t("fn_personnel");
  };

  return (
    <Modal title={t("staff_trash_title")} onClose={onClose}>
      <p className="text-sm mb-4" style={{ color: COLORS.inkSoft }}>{t("staff_trash_subtitle")}</p>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("search_by_name_placeholder")}
        className="w-full px-3 py-2.5 rounded-lg outline-none text-sm mb-4"
        style={inputStyle}
      />
      {filtered.length === 0 ? (
        <EmptyState text={t("staff_trash_empty")} />
      ) : (
        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {filtered.map((p) => (
            <div key={p.user_id} className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: COLORS.paper }}>
              <div>
                <div className="text-sm font-medium" style={{ color: COLORS.ink }}>{p.full_name}</div>
                <div className="text-xs" style={{ color: COLORS.inkSoft }}>{fonctionLabel(p)}</div>
              </div>
              <button
                onClick={() => handleRestore(p.user_id)}
                disabled={restoringId === p.user_id}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                style={{ background: COLORS.positive, color: "#fff" }}
              >
                {restoringId === p.user_id && <Loader2 className="animate-spin" size={11} />} {t("restore_button")}
              </button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

function StaffPaymentsView({ staffProfiles, staffPayments, currency, readOnly, canDeactivate, onSave, onToggleActive, onToggleHidden }) {
  const { t } = useLang();
  const [month, setMonth] = useState(SCHOOL_MONTHS[0]);
  const [saving, setSaving] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [showTrash, setShowTrash] = useState(false);

  const fonctionLabel = (p) => {
    if (p.role === "fondateur") return t("role_fondateur_dir");
    if (p.role === "directeur") return t("role_directeur");
    if (p.role === "comptable") return t("fn_comptable");
    if (p.role === "enseignant") return `${t("fn_enseignant")}${p.class_name ? " · " + p.class_name : ""}`;
    return p.fonction || t("fn_personnel");
  };

  const hiddenProfiles = staffProfiles.filter((p) => p.hidden);
  const visibleProfiles = staffProfiles.filter((p) => !p.hidden);

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

  const handleTrash = async (userId) => {
    setTogglingId(userId);
    await onToggleHidden(userId, true);
    setTogglingId(null);
  };

  const handleRestore = async (userId) => {
    await onToggleHidden(userId, false);
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
        {canDeactivate && hiddenProfiles.length > 0 && (
          <button onClick={() => setShowTrash(true)} className="text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.paper, color: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
            <Trash2 size={13} /> {t("staff_trash_title")} ({hiddenProfiles.length})
          </button>
        )}
      </div>
      <p className="mb-5" style={{ color: COLORS.inkSoft }}>{t("staff_salary_subtitle")}</p>

      {showTrash && (
        <StaffTrashModal hiddenProfiles={hiddenProfiles} onRestore={handleRestore} onClose={() => setShowTrash(false)} />
      )}

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
                            onClick={() => handleTrash(p.user_id)}
                            disabled={togglingId === p.user_id}
                            className="text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1"
                            style={{ background: COLORS.paper, color: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}
                          >
                            <Trash2 size={11} /> {t("move_to_trash")}
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

function ExpensesView({ expenses, staffPayments, staffProfiles, currency, readOnly, onAdd, onDelete, onValidate }) {
  const { t, lang } = useLang();
  const categoryLabel = (cat) => {
    const map = { "Salaires": t("cat_salaires"), "Factures": t("cat_factures"), "Fournitures": t("cat_fournitures"), "Crédits": t("cat_credits"), "Autres": t("cat_autres") };
    return map[cat] || cat;
  };
  // Les salaires réellement payés (depuis "Personnel") comptent comme de vraies dépenses,
  // affichés ici en lecture seule — leur vraie gestion reste dans l'écran "Personnel".
  const salaryEntries = useMemo(() => {
    return (staffPayments || [])
      .filter((sp) => Number(sp.paye) > 0)
      .map((sp) => {
        const staffName = (staffProfiles || []).find((p) => p.user_id === sp.user_id)?.full_name || "—";
        return {
          id: `salary-${sp.id}`,
          date: sp.approved_at || sp.created_at,
          category: "Salaires",
          description: `${staffName} — ${sp.month}`,
          amount: Number(sp.paye),
          validated: true,
          isSalary: true,
        };
      });
  }, [staffPayments, staffProfiles]);
  const allExpenses = useMemo(() => [...expenses, ...salaryEntries].sort((a, b) => new Date(b.date) - new Date(a.date)), [expenses, salaryEntries]);

  const total = allExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const byCategory = useMemo(() => {
    const map = {};
    allExpenses.forEach((e) => { map[e.category] = (map[e.category] || 0) + Number(e.amount); });
    return map;
  }, [allExpenses]);

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

      {allExpenses.length === 0 ? (
        <div className="rounded-2xl p-10" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}><EmptyState text={t("no_expense")} /></div>
      ) : (
        <>
          {allExpenses.filter((e) => e.category === "Crédits").length > 0 && (
            <div className="space-y-3 mb-5">
              {allExpenses.filter((e) => e.category === "Crédits").map((e) => (
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
          {allExpenses.filter((e) => e.category !== "Crédits").length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              {allExpenses.filter((e) => e.category !== "Crédits").map((e, i) => (
                <div key={e.id} className="flex items-center justify-between px-5 py-4" style={{ borderTop: i === 0 ? "none" : `1px solid ${COLORS.line}` }}>
                  <div className="min-w-0">
                    <div className="font-medium truncate" style={{ color: COLORS.ink }}>{e.description || categoryLabel(e.category)}</div>
                    <div className="text-xs flex items-center gap-1.5" style={{ color: COLORS.inkSoft }}>
                      {categoryLabel(e.category)} · {new Date(e.date).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}
                      {e.isSalary && <span className="px-1.5 py-0.5 rounded-full" style={{ background: COLORS.paper, fontSize: "10px" }}>{t("from_staff_screen")}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.negative }}>−{fmt(e.amount, currency)}</div>
                    {!e.isSalary && <button onClick={() => onDelete(e.id)} style={{ color: COLORS.inkSoft }}><Trash2 size={16} /></button>}
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

function ChildGradesBlock({ student, grades, staffProfiles, schoolName, bulletinAppreciations, directorTitle }) {
  const { t } = useLang();
  const [showBulletin, setShowBulletin] = useState(false);
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

  const directeur = staffProfiles?.find((sp) => sp.role === "directeur" && !sp.hidden);
  const teacher = staffProfiles?.find((sp) => sp.role === "enseignant" && sp.class_name === student.class_name);
  const appreciation = bulletinAppreciations?.find((a) => a.student_id === student.id && a.term === activeTerm)?.appreciation || "";

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
      <div className="space-y-1.5 mb-3">
        {childGrades.map((g) => (
          <div key={g.subject} className="flex items-center justify-between text-xs px-2.5 py-2 rounded-lg" style={{ background: COLORS.paper }}>
            <span style={{ color: COLORS.inkSoft }}>{g.subject}</span>
            <span className="font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{g.score}</span>
          </div>
        ))}
      </div>
      <button onClick={() => setShowBulletin(true)} className="w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5" style={{ background: COLORS.ink, color: "#fff" }}>
        <FileText size={14} /> {t("view_bulletin_button")}
      </button>

      {showBulletin && (
        <StudentBulletinView
          schoolName={schoolName}
          student={student}
          className={student.class_name}
          term={activeTerm}
          schoolYear={student.school_year}
          subjectRows={childGrades.map((g) => ({ subject: g.subject, detail: `${g.score}`, moyenne: Number(g.score) }))}
          moyenneGenerale={avg}
          passThreshold={5}
          rank={rang > 0 ? rang : null}
          totalInClass={totalClasse}
          directeur={directeur}
          teacher={teacher}
          appreciation={appreciation}
          canEditAppreciation={false}
          onSaveAppreciation={async () => {}}
          directorTitle={directorTitle}
          onClose={() => setShowBulletin(false)}
        />
      )}
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

function ChildDisciplineBlock({ student, disciplineNotes }) {
  const { t, lang } = useLang();
  const notes = disciplineNotes.filter((n) => n.student_id === student.id && n.shared_with_parent);
  if (notes.length === 0) return null;
  return (
    <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${COLORS.line}` }}>
      <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.inkSoft }}>{t("nav_discipline")}</div>
      <div className="space-y-2">
        {notes.map((n) => {
          const style = DISCIPLINE_TYPE_STYLES[n.type] || DISCIPLINE_TYPE_STYLES.indiscipline;
          return (
            <div key={n.id} className="rounded-lg p-2.5" style={{ background: COLORS.paper }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: style.bg, color: style.color }}>{t(style.label)}</span>
                <span className="text-xs" style={{ color: COLORS.inkSoft }}>{new Date(n.note_date).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}</span>
              </div>
              {n.note && <p className="text-sm" style={{ color: COLORS.ink }}>{n.note}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ParentChildrenView({ children, paidByStudent, currency, payments, onRelink, grades, attendance, staffProfiles, viewYear, setViewYear, availableYears, currentYear, schoolName, bulletinAppreciations, disciplineNotes, directorTitle }) {
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
            {availableYears.map((y) => <option key={y} value={y}>{y} — {t(`year_status_${yearStatusKey(y, currentYear)}`)}</option>)}
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

                <ChildGradesBlock student={c} grades={grades} staffProfiles={staffProfiles} schoolName={schoolName} bulletinAppreciations={bulletinAppreciations} directorTitle={directorTitle} />
                <AttendanceSummary student={c} attendance={attendance} />
                <ChildDisciplineBlock student={c} disciplineNotes={disciplineNotes} />

                {childPayments.length > 0 && (
                  <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${COLORS.line}` }}>
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                      <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.inkSoft }}>{t("payment_receipts")}</div>
                      {teacher && (
                        <div className="text-xs" style={{ color: COLORS.inkSoft }}>
                          {t("teacher_label")}: <span style={{ color: COLORS.ink }}>{teacher.full_name}</span>
                          {teacher.phone && (
                            <a href={`tel:${teacher.phone}`} onClick={skipUnloadGuard} className="ml-1 underline" style={{ color: COLORS.primary }}>{teacher.phone}</a>
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
function ParentPayView({ comptable, currency, schoolMomo, schoolName, children, declarations, onDeclare, onUploadScreenshot }) {
  const { t, lang } = useLang();
  const [copied, setCopied] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [studentId, setStudentId] = useState(children?.[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [referenceCode, setReferenceCode] = useState("");
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [receiptFor, setReceiptFor] = useState(null);
  const [uploadingScreenshotId, setUploadingScreenshotId] = useState(null);
  const screenshotFormRef = useRef(null);
  const screenshotRetryRefs = useRef({});

  const copyNumber = () => {
    if (!schoolMomo?.momo_number) return;
    navigator.clipboard?.writeText(schoolMomo.momo_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Toujours la version la plus fraîche de la liste, accessible depuis le setTimeout ci-dessous.
  const declarationsRef = useRef(declarations);
  declarationsRef.current = declarations;

  const submit = async () => {
    if (!studentId || !amount) return;
    setSaving(true);
    const error = await onDeclare({ student_id: studentId, amount: parseFloat(amount), reference_code: referenceCode.trim() || null });
    if (!error && screenshotFile) {
      // On récupère la déclaration qui vient d'être créée pour y attacher la capture.
      // (petite pause : le temps que la liste des déclarations se mette à jour)
      setTimeout(async () => {
        const latest = declarationsRef.current?.[0];
        if (latest) await onUploadScreenshot(latest.id, screenshotFile);
      }, 600);
    }
    setSaving(false);
    setShowForm(false);
    setAmount(""); setReferenceCode(""); setScreenshotFile(null);
  };

  const handleScreenshotForDeclaration = async (declarationId, file) => {
    if (!file) return;
    setUploadingScreenshotId(declarationId);
    await onUploadScreenshot(declarationId, file);
    setUploadingScreenshotId(null);
  };

  const STATUS_STYLES = {
    pending: { label: "declaration_status_pending", color: "#B8860B", bg: "#FFF3D6" },
    confirmed: { label: "declaration_status_confirmed", color: COLORS.positive, bg: COLORS.positiveSoft },
    rejected: { label: "declaration_status_rejected", color: COLORS.negative, bg: COLORS.negativeSoft },
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("pay_remotely_title")}</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>{t("pay_remotely_subtitle")}</p>


      {receiptFor && (
        <PaymentReceiptView
          schoolName={schoolName}
          declaration={receiptFor}
          studentName={children.find((c) => c.id === receiptFor.student_id)?.full_name || ""}
          currency={currency}
          onClose={() => setReceiptFor(null)}
        />
      )}

      {schoolMomo?.momo_number && (
        <div className="rounded-2xl p-5 mb-5" style={{ background: COLORS.primarySoft }}>
          <div className="flex items-center gap-2 mb-3">
            <Smartphone size={18} style={{ color: COLORS.primary }} />
            <span className="font-semibold" style={{ color: COLORS.primary }}>{schoolMomo.momo_provider || "Mobile Money"}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-lg mb-3" style={{ background: "#fff" }}>
            <span className="font-bold text-lg" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{schoolMomo.momo_number}</span>
            <button onClick={copyNumber} className="text-xs font-medium flex items-center gap-1" style={{ color: COLORS.primary }}><Copy size={13} /> {copied ? t("copied") : t("copy")}</button>
          </div>
          <p className="text-xs mb-3" style={{ color: COLORS.inkSoft }}>{t("momo_instructions")}</p>
          <button onClick={() => setShowForm((v) => !v)} className="w-full py-3 rounded-lg font-semibold" style={{ background: COLORS.ink, color: "#fff" }}>
            {t("declare_payment_button")}
          </button>

          {showForm && (
            <div className="mt-4 pt-4 space-y-3" style={{ borderTop: `1px solid rgba(0,0,0,0.08)` }}>
              <div>
                <FieldLabel>{t("child_label")}</FieldLabel>
                <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={{ ...inputStyle, background: "#fff" }}>
                  {children.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                </select>
              </div>
              <div>
                <FieldLabel>{t("amount_sent_label")}</FieldLabel>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={{ ...inputStyle, background: "#fff" }} />
              </div>
              <div>
                <FieldLabel>{t("momo_reference_label")}</FieldLabel>
                <input value={referenceCode} onChange={(e) => setReferenceCode(e.target.value)} placeholder={t("momo_reference_placeholder")} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={{ ...inputStyle, background: "#fff" }} />
              </div>
              <div>
                <FieldLabel>{t("payment_screenshot_label")}</FieldLabel>
                <input ref={screenshotFormRef} type="file" accept="image/*" className="hidden" onChange={(e) => { setScreenshotFile(e.target.files?.[0] || null); }} />
                <button onClick={() => screenshotFormRef.current?.click()} className="w-full px-3 py-2.5 rounded-lg text-sm flex items-center justify-center gap-1.5" style={{ background: "#fff", color: COLORS.ink, border: `1px dashed ${COLORS.line}` }}>
                  <ImageIcon size={14} /> {screenshotFile ? screenshotFile.name.slice(0, 24) : t("attach_screenshot_button")}
                </button>
                <p className="text-xs mt-1" style={{ color: COLORS.inkSoft }}>{t("payment_screenshot_hint")}</p>
              </div>
              <button onClick={submit} disabled={saving || !studentId || !amount} className="w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5" style={{ background: COLORS.positive, color: "#fff" }}>
                {saving && <Loader2 className="animate-spin" size={14} />} {t("confirm_declaration_button")}
              </button>
            </div>
          )}
        </div>
      )}

      {declarations.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3" style={{ color: COLORS.ink }}>{t("my_declarations_title")}</h2>
          <div className="space-y-2">
            {declarations.map((d) => {
              const style = STATUS_STYLES[d.status];
              return (
                <div key={d.id} className="rounded-xl p-3.5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold" style={{ color: COLORS.ink }}>{fmt(d.amount, currency)}</div>
                      <div className="text-xs" style={{ color: COLORS.inkSoft }}>{children.find((c) => c.id === d.student_id)?.full_name} · {new Date(d.created_at).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: style.bg, color: style.color }}>{t(style.label)}</span>
                      {d.status === "confirmed" && (
                        <button onClick={() => setReceiptFor(d)} className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: COLORS.ink, color: "#fff" }}>{t("view_receipt_button")}</button>
                      )}
                    </div>
                  </div>
                  {d.status === "pending" && (
                    <div className="mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${COLORS.line}` }}>
                      {d.screenshot_url ? (
                        <div className="flex items-center gap-2">
                          <img src={d.screenshot_url} alt="" className="w-10 h-10 rounded-lg object-cover" style={{ border: `1px solid ${COLORS.line}` }} />
                          <span className="text-xs" style={{ color: COLORS.positive }}>✓ {t("screenshot_attached_label")}</span>
                        </div>
                      ) : (
                        <>
                          <input ref={(el) => (screenshotRetryRefs.current[d.id] = el)} type="file" accept="image/*" className="hidden" onChange={(e) => { handleScreenshotForDeclaration(d.id, e.target.files?.[0]); e.target.value = ""; }} />
                          <button onClick={() => screenshotRetryRefs.current[d.id]?.click()} disabled={uploadingScreenshotId === d.id} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.paper, color: COLORS.ink }}>
                            {uploadingScreenshotId === d.id ? <Loader2 className="animate-spin" size={12} /> : <ImageIcon size={12} />} {t("attach_screenshot_button")}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: COLORS.inkSoft }}>{t("or_contact_accountant")}</div>
        {!comptable || !comptable.phone ? (
          <EmptyState text={t("accountant_no_phone")} />
        ) : (
          <>
            <div className="flex items-center justify-between px-4 py-3 rounded-lg mb-3" style={{ background: COLORS.paper }}>
              <span className="font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.ink }}>{comptable.phone}</span>
              <span className="text-xs" style={{ color: COLORS.inkSoft }}>{comptable.full_name}</span>
            </div>
            <a href={`tel:${comptable.phone}`} onClick={skipUnloadGuard} className="w-full py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm" style={{ background: COLORS.paper, color: COLORS.ink }}>
              {t("call_accountant")}
            </a>
          </>
        )}
      </div>
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
                {r.reply ? (
                  <div className="rounded-xl p-3 mt-3" style={{ background: COLORS.positiveSoft }}>
                    <div className="text-xs font-semibold mb-1" style={{ color: COLORS.positive }}>{t("director_reply_label")}</div>
                    <p className="text-sm" style={{ color: COLORS.ink }}>{r.reply}</p>
                  </div>
                ) : (
                  <div className="text-xs mt-2 italic" style={{ color: COLORS.inkSoft }}>{t("awaiting_reply_label")}</div>
                )}
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

function FondateurRemarksView({ remarks, parents, onDelete, onReply }) {
  const { t, lang } = useLang();
  const parentInfo = (id) => parents.find((p) => p.user_id === id);
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState(false);

  const startReply = (r) => {
    setReplyingId(r.id);
    setReplyText(r.reply || "");
  };

  const submitReply = async (id) => {
    if (!replyText.trim()) return;
    setSaving(true);
    await onReply(id, replyText.trim());
    setSaving(false);
    setReplyingId(null);
  };

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
                <p className="text-sm mb-3" style={{ color: COLORS.ink }}>{r.message}</p>

                {r.reply && replyingId !== r.id && (
                  <div className="rounded-xl p-3 mb-2" style={{ background: COLORS.primarySoft }}>
                    <div className="text-xs font-semibold mb-1" style={{ color: COLORS.primary }}>{t("your_reply_label")}</div>
                    <p className="text-sm" style={{ color: COLORS.ink }}>{r.reply}</p>
                  </div>
                )}

                {replyingId === r.id ? (
                  <div className="flex gap-2">
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={t("reply_placeholder")}
                      className="flex-1 px-3 py-2 rounded-lg outline-none text-sm"
                      style={inputStyle}
                    />
                    <button onClick={() => submitReply(r.id)} disabled={saving} className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ background: COLORS.positive, color: "#fff" }}>
                      {saving ? <Loader2 className="animate-spin" size={14} /> : t("send")}
                    </button>
                    <button onClick={() => setReplyingId(null)} className="text-xs font-semibold px-2" style={{ color: COLORS.inkSoft }}>{t("close_button")}</button>
                  </div>
                ) : (
                  <button onClick={() => startReply(r)} className="text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.paper, color: COLORS.ink }}>
                    <MessageSquare size={13} /> {r.reply ? t("edit_reply_button") : t("reply_individually_button")}
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
function StudentModal({ levels, student, existingClassNames, tuitionFees, role, tierComplete, onClose, onSave, onUpdate, onUploadPhoto }) {
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
  const [totalDueTouched, setTotalDueTouched] = useState(isEdit);
  const [isNewStudent, setIsNewStudent] = useState(false);
  // Dès qu'une classe est choisie (nouvel élève), on pré-remplit automatiquement la scolarité
  // définie par le fondateur pour cette classe — tant que le comptable n'a pas modifié la valeur.
  // Si "Nouveau venant" est coché, on utilise le tarif spécifique nouveau venant (sinon le tarif standard).
  useEffect(() => {
    if (isEdit || totalDueTouched) return;
    const fee = tuitionFees?.find((f) => f.class_name === className);
    if (!fee) return;
    const useNewAmount = isNewStudent && fee.new_student_amount !== null && fee.new_student_amount !== undefined;
    setTotalDue(String(useNewAmount ? fee.new_student_amount : fee.amount));
  }, [className, tuitionFees, isNewStudent]);
  const [parentPhone, setParentPhone] = useState(student?.parent_phone || "");
  const [gender, setGender] = useState(student?.gender || "Garçon");
  const [statutSpecial, setStatutSpecial] = useState(student?.statut_special || "");
  const [dateNaissance, setDateNaissance] = useState(student?.date_naissance || "");
  const [lieuNaissance, setLieuNaissance] = useState(student?.lieu_naissance || "");
  const [quartier, setQuartier] = useState(student?.quartier || "");
  const [nomPere, setNomPere] = useState(student?.nom_pere || "");
  const [nomMere, setNomMere] = useState(student?.nom_mere || "");
  const [hasLivret, setHasLivret] = useState(student?.has_livret || false);
  const [hasExtraitNaissance, setHasExtraitNaissance] = useState(student?.has_extrait_naissance || false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [bgReplaceEnabled, setBgReplaceEnabled] = useState(false);
  const [bgReplaceColor, setBgReplaceColor] = useState("#ffffff");
  const [bgReplaceMethod, setBgReplaceMethod] = useState("backdrop"); // "backdrop" (fond uni, rapide) ou "ai" (détection, expérimental)
  const [backdropColor, setBackdropColor] = useState("#B23B32");
  const [bgReplaceNotice, setBgReplaceNotice] = useState("");
  const [bgDebugLog, setBgDebugLog] = useState([]);
  const bgLogStep = (msg) => setBgDebugLog((prev) => [...prev.slice(-9), `${new Date().toLocaleTimeString("fr-FR")} — ${msg}`]);
  const photoInputRef = useRef(null);
  const photoCameraRef = useRef(null);
  const showFinancials = role !== "directeur";
  const submit = async () => {
    if (!fullName.trim() || !className.trim()) return;
    const payload = {
      full_name: fullName.trim(), level, class_name: className.trim(), parent_phone: parentPhone.trim() || null, gender,
      date_naissance: dateNaissance || null, lieu_naissance: lieuNaissance.trim() || null, quartier: quartier.trim() || null,
      nom_pere: nomPere.trim() || null, nom_mere: nomMere.trim() || null,
      has_livret: hasLivret, has_extrait_naissance: hasExtraitNaissance,
      statut_special: statutSpecial || null,
    };
    if (showFinancials) payload.total_due = parseFloat(totalDue) || 0;
    if (isEdit) await onUpdate(student.id, payload);
    else await onSave({ ...payload, total_due: parseFloat(totalDue) || 0 });
    onClose();
  };
  const [localPhotoUrl, setLocalPhotoUrl] = useState(student?.photo_url || "");
  const handlePhotoPick = async (file) => {
    if (!file || !isEdit) return;
    setUploadingPhoto(true);
    setBgReplaceNotice("");
    setBgDebugLog([]);
    let toUpload = file;
    if (bgReplaceEnabled) {
      if (bgReplaceMethod === "backdrop") {
        setBgReplaceNotice(t("bg_replace_processing"));
        const processed = await removeSolidBackdrop(file, backdropColor);
        toUpload = processed;
        setBgReplaceNotice(processed !== file ? t("bg_replace_done") : t("bg_replace_fallback"));
      } else {
        setBgReplaceNotice(t("bg_replace_processing"));
        const processed = await replacePhotoBackground(file, bgReplaceColor, 640, bgLogStep);
        toUpload = processed;
        setBgReplaceNotice(processed !== file ? t("bg_replace_done") : t("bg_replace_fallback"));
      }
    }
    const url = await onUploadPhoto(student.id, toUpload);
    if (url) setLocalPhotoUrl(url);
    setUploadingPhoto(false);
  };
  return (
    <Modal title={isEdit ? t("edit_student") : t("new_student")} onClose={onClose}>
      <div className="space-y-4">
        {isEdit && (
          <div>
            <FieldLabel>{t("student_photo_label")}</FieldLabel>
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { handlePhotoPick(e.target.files?.[0]); e.target.value = ""; }} />
            <input ref={photoCameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { handlePhotoPick(e.target.files?.[0]); e.target.value = ""; }} />
            <div className="rounded-xl p-3 flex items-center gap-3 mb-2" style={{ background: COLORS.paper }}>
              <div className="relative w-16 h-16 shrink-0">
                {localPhotoUrl ? (
                  <img src={localPhotoUrl} alt="" className="w-16 h-16 rounded-lg object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ background: COLORS.line }}><Users size={22} style={{ color: COLORS.inkSoft }} /></div>
                )}
                {uploadingPhoto && (
                  <div className="absolute inset-0 rounded-lg flex items-center justify-center" style={{ background: "rgba(32,48,74,0.55)" }}>
                    <Loader2 className="animate-spin" size={20} style={{ color: "#fff" }} />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <button onClick={() => photoCameraRef.current?.click()} disabled={uploadingPhoto} className="text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.ink, color: "#fff" }}>
                  {uploadingPhoto && <Loader2 className="animate-spin" size={11} />} {t("take_photo_now")}
                </button>
                <button onClick={() => photoInputRef.current?.click()} disabled={uploadingPhoto} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: "#fff", color: COLORS.ink, border: `1px solid ${COLORS.line}` }}>
                  {t("change_photo")}
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer" style={{ background: bgReplaceEnabled ? COLORS.primarySoft : COLORS.paper }}>
              <input type="checkbox" checked={bgReplaceEnabled} onChange={(e) => setBgReplaceEnabled(e.target.checked)} className="w-4 h-4" />
              <span className="text-xs font-medium flex-1" style={{ color: bgReplaceEnabled ? COLORS.primary : COLORS.ink }}>{t("bg_replace_toggle_label")}</span>
            </label>

            {bgReplaceEnabled && (
              <div className="mt-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setBgReplaceMethod("backdrop")}
                    className="rounded-lg p-2.5 text-left"
                    style={bgReplaceMethod === "backdrop" ? { background: COLORS.ink, color: "#fff" } : { background: COLORS.paper, color: COLORS.ink, border: `1px solid ${COLORS.line}` }}
                  >
                    <div className="text-xs font-bold">{t("bg_method_backdrop_title")}</div>
                    <div className="text-[10px] mt-0.5" style={{ opacity: 0.8 }}>{t("bg_method_backdrop_hint")}</div>
                  </button>
                  <button
                    onClick={() => setBgReplaceMethod("ai")}
                    className="rounded-lg p-2.5 text-left"
                    style={bgReplaceMethod === "ai" ? { background: COLORS.ink, color: "#fff" } : { background: COLORS.paper, color: COLORS.ink, border: `1px solid ${COLORS.line}` }}
                  >
                    <div className="text-xs font-bold">{t("bg_method_ai_title")}</div>
                    <div className="text-[10px] mt-0.5" style={{ opacity: 0.8 }}>{t("bg_method_ai_hint")}</div>
                  </button>
                </div>

                {bgReplaceMethod === "backdrop" ? (
                  <div>
                    <FieldLabel>{t("backdrop_color_label")}</FieldLabel>
                    <div className="flex gap-2">
                      {[
                        { color: "#B23B32", label: t("bg_color_red") },
                        { color: "#1E6091", label: t("bg_color_blue") },
                        { color: "#2F7D4F", label: t("bg_color_green") },
                      ].map((opt) => (
                        <button
                          key={opt.color}
                          onClick={() => setBackdropColor(opt.color)}
                          className="flex-1 rounded-lg p-2 flex items-center gap-1.5 justify-center text-xs font-medium"
                          style={backdropColor === opt.color ? { background: COLORS.primarySoft, color: COLORS.primary, border: `2px solid ${COLORS.primary}` } : { background: COLORS.paper, color: COLORS.ink, border: `1px solid ${COLORS.line}` }}
                        >
                          <div className="w-3.5 h-3.5 rounded-full" style={{ background: opt.color }} />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>{t("backdrop_hint")}</p>
                  </div>
                ) : (
                  <select value={bgReplaceColor} onChange={(e) => setBgReplaceColor(e.target.value)} className="w-full text-xs px-2 py-2 rounded-lg outline-none" style={inputStyle}>
                    <option value="#ffffff">{t("bg_color_white")}</option>
                    <option value="#B23B32">{t("bg_color_red")}</option>
                  </select>
                )}
              </div>
            )}
            {bgReplaceNotice && <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>{bgReplaceNotice}</p>}
            {bgReplaceEnabled && bgReplaceMethod === "ai" && <p className="text-xs mt-1" style={{ color: COLORS.inkSoft }}>{t("bg_replace_experimental_note")}</p>}
            {bgDebugLog.length > 0 && (
              <div className="mt-2 rounded-lg p-2.5" style={{ background: "#20304A" }}>
                <div className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: "#8FA3C0" }}>{t("live_log_title")}</div>
                <div className="space-y-0.5">
                  {bgDebugLog.map((line, i) => (
                    <div key={i} className="text-[10px]" style={{ color: "#E3E9F2", fontFamily: "'IBM Plex Mono', monospace" }}>{line}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
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
        {!isEdit && showFinancials && tierComplete && (
          <label className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer" style={{ background: isNewStudent ? COLORS.primarySoft : COLORS.paper }}>
            <input
              type="checkbox"
              checked={isNewStudent}
              onChange={(e) => { setIsNewStudent(e.target.checked); setTotalDueTouched(false); }}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium" style={{ color: isNewStudent ? COLORS.primary : COLORS.ink }}>{t("is_new_student_label")}</span>
          </label>
        )}
        {showFinancials && (
          <div>
            <FieldLabel>{t("total_due_label")}</FieldLabel>
            {role === "fondateur" ? (
              <>
                <input type="number" value={totalDue} onChange={(e) => { setTotalDue(e.target.value); setTotalDueTouched(true); }} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
                {!isEdit && !totalDueTouched && tuitionFees?.some((f) => f.class_name === className) && (
                  <p className="text-xs mt-1.5" style={{ color: COLORS.positive }}>{isNewStudent ? t("tuition_auto_filled_new") : t("tuition_auto_filled")}</p>
                )}
              </>
            ) : (
              <>
                <input type="number" value={totalDue} disabled className="w-full px-3 py-2.5 rounded-lg outline-none font-semibold" style={{ ...inputStyle, background: "#FFF3D6", borderColor: "#E8B84B", color: COLORS.ink, opacity: 1 }} />
                <p className="text-xs mt-1.5 font-medium" style={{ color: "#B8860B" }}>{isNewStudent ? t("tuition_locked_comptable_new") : t("tuition_locked_comptable")}</p>
              </>
            )}
          </div>
        )}
        {showFinancials && tierComplete && (
          <div>
            <FieldLabel>{t("special_status_label")}</FieldLabel>
            <select value={statutSpecial} onChange={(e) => setStatutSpecial(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
              <option value="">{t("special_status_none")}</option>
              <option value="boursier">{t("special_status_boursier")}</option>
              <option value="protege">{t("special_status_protege")}</option>
            </select>
            <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>{t("special_status_hint")}</p>
          </div>
        )}
        <div>
          <FieldLabel>{t("parent_phone_optional")}</FieldLabel>
          <input type="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="Ex: 622 00 00 00" className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
          <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>{t("parent_phone_hint2")}</p>
        </div>

        <div className="pt-2 mt-1" style={{ borderTop: `1px solid ${COLORS.line}` }}>
          <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: COLORS.inkSoft }}>{t("dossier_section_title")}</div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <FieldLabel>{t("birth_date_label")}</FieldLabel>
            <input type="date" value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
          </div>
          <div>
            <FieldLabel>{t("birth_place_label")}</FieldLabel>
            <input value={lieuNaissance} onChange={(e) => setLieuNaissance(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
          </div>
        </div>
        <div>
          <FieldLabel>{t("quartier_label")}</FieldLabel>
          <input value={quartier} onChange={(e) => setQuartier(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <FieldLabel>{t("father_name_label")}</FieldLabel>
            <input value={nomPere} onChange={(e) => setNomPere(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
          </div>
          <div>
            <FieldLabel>{t("mother_name_label")}</FieldLabel>
            <input value={nomMere} onChange={(e) => setNomMere(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer" style={{ background: hasLivret ? COLORS.positiveSoft : COLORS.paper }}>
            <input type="checkbox" checked={hasLivret} onChange={(e) => setHasLivret(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm font-medium" style={{ color: hasLivret ? COLORS.positive : COLORS.ink }}>{t("has_livret_label")}</span>
          </label>
          <label className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer" style={{ background: hasExtraitNaissance ? COLORS.positiveSoft : COLORS.paper }}>
            <input type="checkbox" checked={hasExtraitNaissance} onChange={(e) => setHasExtraitNaissance(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm font-medium" style={{ color: hasExtraitNaissance ? COLORS.positive : COLORS.ink }}>{t("has_extrait_label")}</span>
          </label>
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
          {SUBSCRIPTION_TIERS.map((tier) => (
            <div key={tier.key} className="rounded-xl p-4 flex items-center justify-between gap-3" style={{ border: `1px solid ${COLORS.line}` }}>
              <div>
                <div className="font-semibold" style={{ color: COLORS.ink }}>{tier.name}</div>
                <div className="text-xs" style={{ color: COLORS.inkSoft }}>{tier.desc}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.primary }}>{fmt(tier.price, "GNF")}</div>
                <div className="text-xs" style={{ color: COLORS.inkSoft }}>{tier.period === "year" ? t("per_year") : t("per_month")}</div>
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
function FeedbackModal({ profile, onClose }) {
  const { t } = useLang();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (rating === 0 && !message.trim()) { setError(t("feedback_empty_error")); return; }
    setSaving(true);
    setError("");
    const { error: err } = await supabase.from("app_feedback").insert({
      school_id: profile.school_id,
      user_id: profile.user_id,
      role: profile.role,
      full_name: profile.full_name,
      rating: rating || null,
      message: message.trim() || null,
    });
    if (err) setError(err.message);
    else { setSent(true); setTimeout(onClose, 1500); }
    setSaving(false);
  };

  if (sent) {
    return (
      <Modal title={t("give_feedback_menu")} onClose={onClose}>
        <div className="text-center py-6">
          <div className="text-3xl mb-2">🙏</div>
          <p className="font-semibold" style={{ color: COLORS.positive }}>{t("feedback_thanks")}</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={t("give_feedback_menu")} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm" style={{ color: COLORS.inkSoft }}>{t("feedback_subtitle")}</p>
        <div>
          <FieldLabel>{t("feedback_rating_label")}</FieldLabel>
          <div className="flex gap-1.5 mt-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1"
              >
                <Star
                  size={30}
                  fill={(hoverRating || rating) >= n ? "#F2B84B" : "none"}
                  color={(hoverRating || rating) >= n ? "#F2B84B" : COLORS.line}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel>{t("feedback_message_label")}</FieldLabel>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("feedback_message_placeholder")}
            rows={4}
            className="w-full px-3 py-2.5 rounded-lg outline-none text-sm"
            style={inputStyle}
          />
        </div>
        {error && <div className="text-sm" style={{ color: COLORS.negative }}>{error}</div>}
        <button onClick={submit} disabled={saving} className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2" style={{ background: COLORS.ink, color: "#fff" }}>
          {saving && <Loader2 className="animate-spin" size={16} />} {t("feedback_send_button")}
        </button>
      </div>
    </Modal>
  );
}

function MyProfileModal({ profile, onClose, onSave, onUploadAvatar, onUploadSignature, onUpdateEmail, onDeactivateSelf, onDeleteParentAccount }) {
  const { t } = useLang();
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [signatureUrl, setSignatureUrl] = useState(profile.signature_url || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState("");
  const [signatureUploadError, setSignatureUploadError] = useState("");
  const [lastAvatarFile, setLastAvatarFile] = useState(null);
  const [lastSignatureFile, setLastSignatureFile] = useState(null);
  const avatarInputRef = useRef(null);
  const avatarCameraRef = useRef(null);
  const signatureInputRef = useRef(null);
  const signatureCameraRef = useRef(null);
  const [avatarInputKey, setAvatarInputKey] = useState(0);
  const [avatarCameraKey, setAvatarCameraKey] = useState(0);
  const [signatureInputKey, setSignatureInputKey] = useState(0);
  const [signatureCameraKey, setSignatureCameraKey] = useState(0);
  const canSign = profile.role === "directeur" || profile.role === "enseignant";
  const [removeSignatureBg, setRemoveSignatureBg] = useState(false);
  const [civilite, setCivilite] = useState(profile.civilite || "");

  // Avertit si le téléphone a peu de mémoire vive — utile pour comprendre pourquoi une
  // photo passe "des fois oui, des fois non" plutôt que de deviner à l'aveugle.
  const lowMemoryDevice = typeof navigator !== "undefined" && navigator.deviceMemory && navigator.deviceMemory <= 3;

  // Email et suppression/désactivation du compte
  const [newEmail, setNewEmail] = useState(profile.email || "");
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailMsg, setEmailMsg] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const submitEmailChange = async () => {
    if (!newEmail.trim() || newEmail.trim() === profile.email) return;
    setSavingEmail(true);
    setEmailMsg(""); setEmailError("");
    const error = await onUpdateEmail(newEmail.trim());
    if (error) setEmailError(error.message || t("email_change_failed"));
    else setEmailMsg(t("email_change_confirm_sent"));
    setSavingEmail(false);
  };

  const confirmDeactivate = async () => {
    setDeactivating(true);
    if (profile.role === "parent") await onDeleteParentAccount();
    else await onDeactivateSelf();
    setDeactivating(false);
  };

  // Journal visible en direct — pour voir exactement où ça bloque quand "rien ne se passe"
  // (impossible à savoir autrement, puisqu'il n'y a pas d'erreur qui plante l'écran).
  const [debugLog, setDebugLog] = useState([]);
  const logStep = (msg) => setDebugLog((prev) => [...prev.slice(-9), `${new Date().toLocaleTimeString("fr-FR")} — ${msg}`]);

  // Filet de sécurité : sur certains téléphones Android, le sélecteur de galerie ne prévient
  // pas toujours l'application quand une photo est choisie (bug connu du navigateur). Quand
  // l'utilisateur revient sur l'app après avoir utilisé le sélecteur, on vérifie nous-mêmes
  // si un fichier a bien été choisi, au cas où l'événement normal n'a pas été déclenché.
  useEffect(() => {
    const checkPendingFile = () => {
      setTimeout(() => {
        if (avatarInputRef.current?.files?.length > 0 && !uploadingAvatar) {
          const file = avatarInputRef.current.files[0];
          avatarInputRef.current.value = "";
          pickAvatar(file);
        }
        if (signatureInputRef.current?.files?.length > 0 && !uploadingSignature) {
          const file = signatureInputRef.current.files[0];
          signatureInputRef.current.value = "";
          pickSignature(file);
        }
      }, 400);
    };
    window.addEventListener("focus", checkPendingFile);
    document.addEventListener("visibilitychange", checkPendingFile);
    return () => {
      window.removeEventListener("focus", checkPendingFile);
      document.removeEventListener("visibilitychange", checkPendingFile);
    };
  }, [uploadingAvatar, uploadingSignature]);

  const submit = async () => {
    setSaving(true);
    setError("");
    const err = await onSave(fullName, phone, canSign ? civilite : undefined);
    if (err) setError("Erreur : " + err.message);
    else { setSaved(true); setTimeout(onClose, 1200); }
    setSaving(false);
  };

  const avatarProcessingRef = useRef(null);
  const signatureProcessingRef = useRef(null);
  const fileSignature = (f) => (f ? `${f.name}-${f.size}-${f.lastModified}` : null);

  const pickAvatar = async (file) => {
    const sig = fileSignature(file);
    // Verrou anti-double-déclenchement : si ce même fichier est déjà en cours de traitement
    // (ou vient de l'être), on ignore l'appel en double — évite le "clignotement" observé
    // quand deux détections se déclenchent en même temps sur certains téléphones.
    if (sig && avatarProcessingRef.current === sig) return;
    avatarProcessingRef.current = sig;

    setAvatarInputKey((k) => k + 1);
    setAvatarCameraKey((k) => k + 1);
    if (!file) { setAvatarUploadError(t("no_file_detected")); return; }
    setLastAvatarFile(file);
    setAvatarUploadError("");
    setUploadingAvatar(true);
    try {
      const url = await onUploadAvatar(file);
      if (url) { setAvatarUrl(url); setLastAvatarFile(null); }
      else setAvatarUploadError(t("upload_failed_retry"));
    } catch (e) {
      setAvatarUploadError(t("upload_failed_retry"));
    } finally {
      setUploadingAvatar(false);
      setTimeout(() => { if (avatarProcessingRef.current === sig) avatarProcessingRef.current = null; }, 3000);
    }
  };

  const pickSignature = async (file) => {
    logStep(file ? `Fichier reçu : ${file.name} (${Math.round(file.size / 1024)} Ko)` : "Fonction déclenchée SANS fichier");
    const sig = fileSignature(file);
    if (sig && signatureProcessingRef.current === sig) { logStep("Ignoré (déjà en cours de traitement)"); return; }
    signatureProcessingRef.current = sig;

    setSignatureInputKey((k) => k + 1);
    setSignatureCameraKey((k) => k + 1);
    if (!file) { setSignatureUploadError(t("no_file_detected")); logStep("Aucun fichier détecté — arrêt"); return; }
    setLastSignatureFile(file);
    setSignatureUploadError("");
    setUploadingSignature(true);
    logStep(removeSignatureBg ? "Suppression du fond en cours..." : "Envoi vers le serveur en cours...");
    try {
      const url = await onUploadSignature(file, removeSignatureBg);
      if (url) { setSignatureUrl(url); setLastSignatureFile(null); logStep("✓ Envoi réussi"); }
      else { setSignatureUploadError(t("upload_failed_retry")); logStep("✗ Échec — le serveur a renvoyé une erreur"); }
    } catch (e) {
      setSignatureUploadError(t("upload_failed_retry"));
      logStep(`✗ Erreur inattendue : ${e?.message || e}`);
    } finally {
      setUploadingSignature(false);
      setTimeout(() => { if (signatureProcessingRef.current === sig) signatureProcessingRef.current = null; }, 3000);
    }
  };

  return (
    <Modal title={t("my_profile")} onClose={onClose}>
      <div className="space-y-5">
        <div className="flex flex-col items-center">
          <input key={avatarInputKey} ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { pickAvatar(e.target.files?.[0]); e.target.value = ""; }} />
          <input key={"cam" + avatarCameraKey} ref={avatarCameraRef} type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => { pickAvatar(e.target.files?.[0]); e.target.value = ""; }} />
          <button onClick={() => avatarInputRef.current?.click()} disabled={uploadingAvatar} className="relative w-20 h-20 rounded-full overflow-hidden flex items-center justify-center" style={{ background: COLORS.paper, border: `2px solid ${COLORS.line}` }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold" style={{ color: COLORS.inkSoft }}>{(fullName || "?").charAt(0).toUpperCase()}</span>
            )}
            {uploadingAvatar && <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}><Loader2 className="animate-spin text-white" size={18} /></div>}
          </button>
          <div className="flex items-center gap-3 mt-2">
            <button onClick={() => avatarInputRef.current?.click()} className="text-xs font-semibold" style={{ color: COLORS.primary }}>{t("change_photo")}</button>
            <span style={{ color: COLORS.inkSoft }}>·</span>
            <button onClick={() => avatarCameraRef.current?.click()} className="text-xs font-semibold" style={{ color: COLORS.primary }}>{t("take_photo_now")}</button>
          </div>
          {avatarUploadError && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs" style={{ color: COLORS.negative }}>{avatarUploadError}</span>
              {lastAvatarFile && (
                <button onClick={() => pickAvatar(lastAvatarFile)} disabled={uploadingAvatar} className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: COLORS.primary, color: "#fff" }}>
                  {t("retry_button")}
                </button>
              )}
            </div>
          )}
        </div>

        <div><FieldLabel>{t("full_name_label")}</FieldLabel><input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        <div>
          <FieldLabel>{t("your_phone")}</FieldLabel>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: 622 00 00 00" className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} />
          {(profile.role === "comptable" || profile.role === "enseignant") && (
            <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>{t("visible_to_parents_contact")}</p>
          )}
        </div>

        {canSign && (
          <div className="mb-1">
            <FieldLabel>{t("civilite_label")}</FieldLabel>
            <select value={civilite} onChange={(e) => setCivilite(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle}>
              <option value="">—</option>
              <option value="M.">{t("civilite_m")}</option>
              <option value="Mme">{t("civilite_mme")}</option>
            </select>
            <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>{t("civilite_hint")}</p>
          </div>
        )}

        {canSign && (
          <div>
            <FieldLabel>{t("my_signature_label")}</FieldLabel>
            <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer mb-2" style={{ background: removeSignatureBg ? COLORS.primarySoft : COLORS.paper }}>
              <input type="checkbox" checked={removeSignatureBg} onChange={(e) => setRemoveSignatureBg(e.target.checked)} className="w-4 h-4" />
              <span className="text-xs font-medium" style={{ color: removeSignatureBg ? COLORS.primary : COLORS.ink }}>{t("remove_signature_bg_label")}</span>
            </label>
            {lowMemoryDevice && (
              <p className="text-xs mb-2 px-2.5 py-1.5 rounded-lg" style={{ background: "#FFF3D6", color: "#B8860B" }}>{t("low_memory_warning")}</p>
            )}
            <input
              key={signatureInputKey}
              ref={signatureInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { logStep(`Événement "changement" déclenché (galerie) — ${e.target.files?.length || 0} fichier(s)`); pickSignature(e.target.files?.[0]); e.target.value = ""; }}
            />
            <input
              key={"cam" + signatureCameraKey}
              ref={signatureCameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => { logStep(`Événement "changement" déclenché (appareil photo) — ${e.target.files?.length || 0} fichier(s)`); pickSignature(e.target.files?.[0]); e.target.value = ""; }}
            />
            <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: COLORS.paper }}>
              {signatureUrl ? (
                <img src={signatureUrl} alt="" className="h-12 object-contain" style={{ maxWidth: 140 }} />
              ) : (
                <span className="text-xs" style={{ color: COLORS.inkSoft }}>{t("no_signature_yet")}</span>
              )}
              <div className="flex flex-col gap-1.5">
                <button onClick={() => { logStep("Bouton \"galerie\" cliqué — ouverture du sélecteur..."); signatureInputRef.current?.click(); }} disabled={uploadingSignature} className="text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.card, color: COLORS.primary, border: `1px solid ${COLORS.primary}` }}>
                  {uploadingSignature && <Loader2 className="animate-spin" size={12} />} {signatureUrl ? t("change_signature") : t("add_signature")}
                </button>
                <button onClick={() => { logStep("Bouton \"appareil photo\" cliqué — ouverture..."); signatureCameraRef.current?.click(); }} disabled={uploadingSignature} className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ background: "transparent", color: COLORS.inkSoft }}>
                  {t("take_photo_now")}
                </button>
              </div>
            </div>
            {signatureUploadError && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs" style={{ color: COLORS.negative }}>{signatureUploadError}</span>
                {lastSignatureFile && (
                  <button onClick={() => pickSignature(lastSignatureFile)} disabled={uploadingSignature} className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: COLORS.primary, color: "#fff" }}>
                    {t("retry_button")}
                  </button>
                )}
              </div>
            )}
            <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>{t("signature_hint")}</p>

            {debugLog.length > 0 && (
              <div className="mt-3 rounded-lg p-2.5" style={{ background: "#20304A" }}>
                <div className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: "#8FA3C0" }}>{t("live_log_title")}</div>
                <div className="space-y-0.5">
                  {debugLog.map((line, i) => (
                    <div key={i} className="text-[10px]" style={{ color: "#E3E9F2", fontFamily: "'IBM Plex Mono', monospace" }}>{line}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {error && <div className="text-sm" style={{ color: COLORS.negative }}>{error}</div>}
        {saved && <div className="text-sm" style={{ color: COLORS.positive }}>{t("saved_confirm")}</div>}
        <button onClick={submit} disabled={saving} className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2" style={{ background: COLORS.ink, color: "#fff" }}>
          {saving && <Loader2 className="animate-spin" size={16} />} {t("save")}
        </button>

        <div className="pt-4 mt-2" style={{ borderTop: `1px solid ${COLORS.line}` }}>
          <FieldLabel>{t("my_email_label")}</FieldLabel>
          <div className="flex gap-2">
            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="flex-1 px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
            <button onClick={submitEmailChange} disabled={savingEmail || !newEmail.trim() || newEmail.trim() === profile.email} className="text-sm font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.ink, color: "#fff" }}>
              {savingEmail && <Loader2 className="animate-spin" size={14} />} {t("update_email_button")}
            </button>
          </div>
          {emailMsg && <p className="text-xs mt-1.5" style={{ color: COLORS.positive }}>{emailMsg}</p>}
          {emailError && <p className="text-xs mt-1.5" style={{ color: COLORS.negative }}>{emailError}</p>}
          <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>{t("email_change_hint")}</p>
        </div>

        {profile.role !== "fondateur" && (
          <div className="pt-4 mt-2" style={{ borderTop: `1px solid ${COLORS.line}` }}>
            <FieldLabel>{profile.role === "parent" ? t("delete_account_title") : t("deactivate_account_title")}</FieldLabel>
            <p className="text-xs mb-2" style={{ color: COLORS.inkSoft }}>{profile.role === "parent" ? t("delete_account_hint") : t("deactivate_account_hint")}</p>
            {!showDeactivateConfirm ? (
              <button onClick={() => setShowDeactivateConfirm(true)} className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ background: COLORS.negativeSoft, color: COLORS.negative }}>
                {profile.role === "parent" ? t("delete_my_account_button") : t("deactivate_my_account_button")}
              </button>
            ) : (
              <div className="rounded-lg p-3" style={{ background: COLORS.negativeSoft }}>
                <p className="text-xs font-semibold mb-2" style={{ color: COLORS.negative }}>{profile.role === "parent" ? t("delete_confirm_question") : t("deactivate_confirm_question")}</p>
                <div className="flex gap-2">
                  <button onClick={confirmDeactivate} disabled={deactivating} className="text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.negative, color: "#fff" }}>
                    {deactivating && <Loader2 className="animate-spin" size={12} />} {profile.role === "parent" ? t("yes_delete") : t("yes_deactivate")}
                  </button>
                  <button onClick={() => setShowDeactivateConfirm(false)} className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ color: COLORS.inkSoft }}>
                    {t("cancel_button")}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

// ---------- Assistant IA (plan de leçon + questions de consolidation) ----------
function LessonPlanResult({ result, t }) {
  const [revealed, setRevealed] = useState({});
  if (!result) return null;
  return (
    <div className="space-y-5">
      {result.objectifs?.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <h2 className="font-bold mb-2" style={{ color: COLORS.ink }}>{t("objectives_title")}</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm" style={{ color: COLORS.inkSoft }}>
            {result.objectifs.map((o, i) => <li key={i}>{o}</li>)}
          </ul>
        </div>
      )}
      {result.materiel?.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <h2 className="font-bold mb-2" style={{ color: COLORS.ink }}>{t("materials_title")}</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm" style={{ color: COLORS.inkSoft }}>
            {result.materiel.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      )}
      {result.deroulement?.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <h2 className="font-bold mb-3" style={{ color: COLORS.ink }}>{t("lesson_flow_title")}</h2>
          <div className="space-y-3">
            {result.deroulement.map((step, i) => (
              <div key={i} className="pl-3" style={{ borderLeft: `3px solid ${COLORS.primary}` }}>
                <div className="text-sm font-semibold" style={{ color: COLORS.ink }}>{step.etape} {step.duree && <span className="font-normal" style={{ color: COLORS.inkSoft }}>· {step.duree}</span>}</div>
                <p className="text-sm mt-0.5" style={{ color: COLORS.inkSoft }}>{step.contenu}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {result.questions?.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <h2 className="font-bold mb-3" style={{ color: COLORS.ink }}>{t("consolidation_questions_title")}</h2>
          <div className="space-y-2.5">
            {result.questions.map((q, i) => (
              <div key={i} className="rounded-xl p-3" style={{ background: COLORS.paper }}>
                <div className="text-sm font-medium" style={{ color: COLORS.ink }}>{i + 1}. {q.question}</div>
                {revealed[i] ? (
                  <p className="text-sm mt-1.5" style={{ color: COLORS.positive }}>{q.reponse}</p>
                ) : (
                  <button onClick={() => setRevealed((r) => ({ ...r, [i]: true }))} className="text-xs font-semibold mt-1.5" style={{ color: COLORS.primary }}>
                    {t("reveal_answer")}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LessonPlannerTab({ subjectsOptions, classOptions, lang, onSaved }) {
  const { t } = useLang();
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [textbook, setTextbook] = useState("");
  const [page, setPage] = useState("");
  const [competenceSpecifique, setCompetenceSpecifique] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [historyId, setHistoryId] = useState(null);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetError, setSheetError] = useState("");
  const [sheet, setSheet] = useState(null);
  const [publishing, setPublishing] = useState(false);

  const generate = async () => {
    if (!lessonTitle.trim()) { setError(t("lesson_title_required")); return; }
    setLoading(true);
    setError("");
    setResult(null);
    setSheet(null);
    setSheetError("");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const res = await fetch("/api/generate-lesson", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject, className, lessonTitle, textbook, page, competenceSpecifique, language: lang }),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = data.details ? (typeof data.details === "string" ? data.details : JSON.stringify(data.details)) : "";
        setError(`${data.error || t("ai_generic_error")}${detail ? " — " + detail.slice(0, 400) : ""}`);
        setLoading(false);
        return;
      }
      setResult(data);
      setHistoryId(data._historyId || null);
      if (onSaved) onSaved();
    } catch (e) {
      setError(t("ai_generic_error"));
    }
    setLoading(false);
  };

  const generateSheet = async () => {
    setSheetLoading(true);
    setSheetError("");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const res = await fetch("/api/generate-revision-sheet", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject, className, lessonTitle, lessonPlan: result, historyId, language: lang }),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = data.details ? (typeof data.details === "string" ? data.details : JSON.stringify(data.details)) : "";
        setSheetError(`${data.error || t("ai_generic_error")}${detail ? " — " + detail.slice(0, 400) : ""}`);
        setSheetLoading(false);
        return;
      }
      setSheet(data);
    } catch (e) {
      setSheetError(t("ai_generic_error"));
    }
    setSheetLoading(false);
  };

  const publishSheet = async () => {
    if (!sheet) return;
    setPublishing(true);
    const { data, error } = await supabase.from("revision_sheets").update({ status: "published", published_at: new Date().toISOString() }).eq("id", sheet.id).select().maybeSingle();
    if (data) setSheet(data);
    if (error) setSheetError(error.message);
    setPublishing(false);
  };

  const unpublishSheet = async () => {
    if (!sheet) return;
    setPublishing(true);
    const { data, error } = await supabase.from("revision_sheets").update({ status: "draft" }).eq("id", sheet.id).select().maybeSingle();
    if (data) setSheet(data);
    if (error) setSheetError(error.message);
    setPublishing(false);
  };

  const discardSheet = async () => {
    if (!sheet) return;
    await supabase.from("revision_sheets").delete().eq("id", sheet.id);
    setSheet(null);
  };

  return (
    <div>
      <div className="rounded-2xl p-5 mb-6" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <FieldLabel>{t("subject_label")}</FieldLabel>
            {subjectsOptions && subjectsOptions.length > 0 ? (
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle}>
                <option value="">—</option>
                {subjectsOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : (
              <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t("subject_label")} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
            )}
          </div>
          <div>
            <FieldLabel>{t("class_label")}</FieldLabel>
            {classOptions && classOptions.length > 0 ? (
              <select value={className} onChange={(e) => setClassName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle}>
                <option value="">—</option>
                {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            ) : (
              <input value={className} onChange={(e) => setClassName(e.target.value)} placeholder={t("class_label")} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
            )}
          </div>
        </div>
        <div className="mb-3">
          <FieldLabel>{t("lesson_title_label")}</FieldLabel>
          <input value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} placeholder={t("lesson_title_placeholder")} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
        </div>
        <div className="mb-3">
          <FieldLabel>{t("competence_specifique_label")}</FieldLabel>
          <input value={competenceSpecifique} onChange={(e) => setCompetenceSpecifique(e.target.value)} placeholder={t("competence_specifique_placeholder")} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
          <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>{t("competence_specifique_hint")}</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div>
            <FieldLabel>{t("textbook_label")}</FieldLabel>
            <input value={textbook} onChange={(e) => setTextbook(e.target.value)} placeholder={t("textbook_placeholder")} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
          </div>
          <div>
            <FieldLabel>{t("page_label")}</FieldLabel>
            <input value={page} onChange={(e) => setPage(e.target.value)} placeholder="Ex: 42" className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
          </div>
        </div>
        {error && <div className="text-sm mb-3" style={{ color: COLORS.negative }}>{error}</div>}
        <button onClick={generate} disabled={loading} className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2" style={{ background: COLORS.primary, color: "#fff" }}>
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />} {loading ? t("ai_generating") : t("ai_generate_button")}
        </button>
      </div>

      <LessonPlanResult result={result} t={t} />

      {result && !sheet && (
        <div className="mt-5">
          {sheetError && <div className="text-sm mb-2" style={{ color: COLORS.negative }}>{sheetError}</div>}
          <button onClick={generateSheet} disabled={sheetLoading} className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2" style={{ background: COLORS.card, color: COLORS.primary, border: `1.5px solid ${COLORS.primary}` }}>
            {sheetLoading ? <Loader2 className="animate-spin" size={16} /> : <BookOpen size={16} />} {sheetLoading ? t("ai_generating") : t("generate_revision_sheet_button")}
          </button>
        </div>
      )}

      {sheet && (
        <div className="mt-5 rounded-2xl p-5" style={{ background: COLORS.card, border: `2px solid ${COLORS.primary}` }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold" style={{ color: COLORS.ink }}>{t("revision_sheet_title")}</h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={sheet.status === "published" ? { background: COLORS.positiveSoft, color: COLORS.positive } : { background: COLORS.primarySoft, color: COLORS.primary }}>
              {sheet.status === "published" ? t("status_published") : t("status_draft")}
            </span>
          </div>
          <p className="text-sm mb-3" style={{ color: COLORS.inkSoft }}>{sheet.content.resume}</p>
          {sheet.content.points_cles?.length > 0 && (
            <ul className="list-disc pl-5 space-y-1 text-sm mb-3" style={{ color: COLORS.inkSoft }}>
              {sheet.content.points_cles.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          )}
          {sheet.content.exercices?.length > 0 && (
            <div className="space-y-2 mb-4">
              {sheet.content.exercices.map((ex, i) => (
                <div key={i} className="rounded-lg p-2.5 text-sm" style={{ background: COLORS.paper, color: COLORS.ink }}>
                  {i + 1}. {ex.enonce}
                </div>
              ))}
            </div>
          )}
          {sheetError && <div className="text-sm mb-2" style={{ color: COLORS.negative }}>{sheetError}</div>}
          <div className="flex flex-wrap gap-2">
            {sheet.status === "draft" ? (
              <button onClick={publishSheet} disabled={publishing} className="text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5" style={{ background: COLORS.positive, color: "#fff" }}>
                {publishing && <Loader2 className="animate-spin" size={13} />} {t("publish_to_students")}
              </button>
            ) : (
              <button onClick={unpublishSheet} disabled={publishing} className="text-sm font-semibold px-4 py-2 rounded-lg" style={{ background: COLORS.paper, color: COLORS.inkSoft }}>
                {t("unpublish")}
              </button>
            )}
            <button onClick={discardSheet} className="text-sm font-semibold px-4 py-2 rounded-lg" style={{ color: COLORS.negative }}>
              {t("discard_sheet")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function RevisionSheetHistoryTab() {
  const { t, lang } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("revision_sheets").select("*").order("created_at", { ascending: false }).limit(100);
    if (data) setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const togglePublish = async (it) => {
    setBusyId(it.id);
    const newStatus = it.status === "published" ? "draft" : "published";
    const { data } = await supabase
      .from("revision_sheets")
      .update(newStatus === "published" ? { status: "published", published_at: new Date().toISOString() } : { status: "draft" })
      .eq("id", it.id)
      .select()
      .maybeSingle();
    if (data) setItems((prev) => prev.map((x) => (x.id === it.id ? data : x)));
    setBusyId(null);
  };

  const remove = async (id) => {
    await supabase.from("revision_sheets").delete().eq("id", id);
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  if (loading) return <div className="py-10 flex justify-center"><Loader2 className="animate-spin" size={22} style={{ color: COLORS.ink }} /></div>;
  if (items.length === 0) return <EmptyState text={t("no_revision_sheet_history")} />;

  return (
    <div className="space-y-2.5">
      {items.map((it) => {
        const isOpen = openId === it.id;
        return (
          <div key={it.id} className="rounded-2xl overflow-hidden" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <button onClick={() => setOpenId(isOpen ? null : it.id)} className="w-full flex items-center justify-between px-4 py-3 text-left gap-2">
              <div className="min-w-0">
                <div className="font-semibold truncate" style={{ color: COLORS.ink }}>{it.lesson_title}</div>
                <div className="text-xs mt-0.5" style={{ color: COLORS.inkSoft }}>
                  {[it.subject, it.class_name].filter(Boolean).join(" · ")} {it.class_name || it.subject ? "· " : ""}{new Date(it.created_at).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0" style={it.status === "published" ? { background: COLORS.positiveSoft, color: COLORS.positive } : { background: COLORS.primarySoft, color: COLORS.primary }}>
                {it.status === "published" ? t("status_published") : t("status_draft")}
              </span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4">
                <p className="text-sm mb-3" style={{ color: COLORS.inkSoft }}>{it.content?.resume}</p>
                {it.content?.points_cles?.length > 0 && (
                  <ul className="list-disc pl-5 space-y-1 text-sm mb-3" style={{ color: COLORS.inkSoft }}>
                    {it.content.points_cles.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                )}
                {it.content?.exercices?.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {it.content.exercices.map((ex, i) => (
                      <div key={i} className="rounded-lg p-2.5 text-sm" style={{ background: COLORS.paper, color: COLORS.ink }}>{i + 1}. {ex.enonce}</div>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => togglePublish(it)} disabled={busyId === it.id} className="text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5" style={it.status === "published" ? { background: COLORS.paper, color: COLORS.inkSoft } : { background: COLORS.positive, color: "#fff" }}>
                    {busyId === it.id && <Loader2 className="animate-spin" size={12} />} {it.status === "published" ? t("unpublish") : t("publish_to_students")}
                  </button>
                  <button onClick={() => remove(it.id)} className="text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1" style={{ color: COLORS.negative }}>
                    <Trash2 size={13} /> {t("delete_from_history")}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function LessonHistoryTab() {
  const { t, lang } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("ai_lesson_history").select("*").order("created_at", { ascending: false }).limit(100);
    if (data) setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (id) => {
    await supabase.from("ai_lesson_history").delete().eq("id", id);
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  if (loading) return <div className="py-10 flex justify-center"><Loader2 className="animate-spin" size={22} style={{ color: COLORS.ink }} /></div>;
  if (items.length === 0) return <EmptyState text={t("no_lesson_history")} />;

  return (
    <div className="space-y-2.5">
      {items.map((it) => {
        const isOpen = openId === it.id;
        return (
          <div key={it.id} className="rounded-2xl overflow-hidden" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <button onClick={() => setOpenId(isOpen ? null : it.id)} className="w-full flex items-center justify-between px-4 py-3 text-left">
              <div className="min-w-0">
                <div className="font-semibold truncate" style={{ color: COLORS.ink }}>{it.lesson_title}</div>
                <div className="text-xs mt-0.5" style={{ color: COLORS.inkSoft }}>
                  {[it.subject, it.class_name].filter(Boolean).join(" · ")} {it.class_name || it.subject ? "· " : ""}{new Date(it.created_at).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}
                </div>
              </div>
            </button>
            {isOpen && (
              <div className="px-4 pb-4">
                {it.competence_specifique && (
                  <div className="text-xs mb-3 px-3 py-2 rounded-lg" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>
                    {t("competence_specifique_label")} : {it.competence_specifique}
                  </div>
                )}
                <LessonPlanResult result={it.result} t={t} />
                <button onClick={() => remove(it.id)} className="text-xs font-semibold mt-4 flex items-center gap-1" style={{ color: COLORS.negative }}>
                  <Trash2 size={13} /> {t("delete_from_history")}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ExamResult({ result, t }) {
  const [revealed, setRevealed] = useState({});
  if (!result) return null;
  return (
    <div className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
      {result.titre_sujet && <h2 className="font-bold mb-4 text-lg" style={{ color: COLORS.ink }}>{result.titre_sujet}</h2>}
      <div className="space-y-3">
        {(result.questions || []).map((q, i) => (
          <div key={i} className="rounded-xl p-3" style={{ background: COLORS.paper }}>
            <div className="text-sm font-medium mb-1.5" style={{ color: COLORS.ink }}>{i + 1}. {q.question}</div>
            {q.type === "qcm" && q.options?.length > 0 && (
              <div className="space-y-1 mb-1.5">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="text-sm px-2 py-1 rounded" style={{ color: revealed[i] && opt === q.bonne_reponse ? COLORS.positive : COLORS.inkSoft, fontWeight: revealed[i] && opt === q.bonne_reponse ? 700 : 400 }}>
                    {String.fromCharCode(65 + oi)}. {opt}
                  </div>
                ))}
              </div>
            )}
            {revealed[i] ? (
              q.type !== "qcm" && <p className="text-sm mt-1" style={{ color: COLORS.positive }}>{q.reponse}</p>
            ) : (
              <button onClick={() => setRevealed((r) => ({ ...r, [i]: true }))} className="text-xs font-semibold" style={{ color: COLORS.primary }}>
                {t("reveal_answer")}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ExamHistoryTab() {
  const { t, lang } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("ai_exam_history").select("*").order("created_at", { ascending: false }).limit(100);
    if (data) setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (id) => {
    await supabase.from("ai_exam_history").delete().eq("id", id);
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  if (loading) return <div className="py-10 flex justify-center"><Loader2 className="animate-spin" size={22} style={{ color: COLORS.ink }} /></div>;
  if (items.length === 0) return <EmptyState text={t("no_exam_history")} />;

  return (
    <div className="space-y-2.5">
      {items.map((it) => {
        const isOpen = openId === it.id;
        const title = it.result?.titre_sujet || (it.lesson_titles || []).join(", ");
        return (
          <div key={it.id} className="rounded-2xl overflow-hidden" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
            <button onClick={() => setOpenId(isOpen ? null : it.id)} className="w-full flex items-center justify-between px-4 py-3 text-left">
              <div className="min-w-0">
                <div className="font-semibold truncate" style={{ color: COLORS.ink }}>{title}</div>
                <div className="text-xs mt-0.5" style={{ color: COLORS.inkSoft }}>
                  {[it.subject, it.class_name].filter(Boolean).join(" · ")} {it.class_name || it.subject ? "· " : ""}{new Date(it.created_at).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}
                </div>
              </div>
            </button>
            {isOpen && (
              <div className="px-4 pb-4">
                {it.lesson_titles?.length > 0 && (
                  <div className="text-xs mb-3 px-3 py-2 rounded-lg" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>
                    {t("lesson_titles_label")} : {it.lesson_titles.join(", ")}
                  </div>
                )}
                <ExamResult result={it.result} t={t} />
                <button onClick={() => remove(it.id)} className="text-xs font-semibold mt-4 flex items-center gap-1" style={{ color: COLORS.negative }}>
                  <Trash2 size={13} /> {t("delete_from_history")}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ExamComposerTab({ subjectsOptions, classOptions, lang, onSaved }) {
  const { t } = useLang();
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [titlesText, setTitlesText] = useState("");
  const [questionType, setQuestionType] = useState("mixte");
  const [nbQuestions, setNbQuestions] = useState(8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [checked, setChecked] = useState({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("ai_lesson_history").select("id, lesson_title, subject, class_name").order("created_at", { ascending: false }).limit(50);
      if (data) setHistory(data);
    })();
  }, []);

  const toggleCheck = (title) => {
    setChecked((prev) => {
      const next = { ...prev, [title]: !prev[title] };
      const selected = Object.keys(next).filter((k) => next[k]);
      setTitlesText(selected.join("\n"));
      return next;
    });
  };

  const generate = async () => {
    const titles = titlesText.split("\n").map((t) => t.trim()).filter(Boolean);
    if (titles.length === 0) { setError(t("lesson_titles_required")); return; }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const res = await fetch("/api/generate-exam", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject, className, lessonTitles: titles, questionType, nbQuestions, language: lang }),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = data.details ? (typeof data.details === "string" ? data.details : JSON.stringify(data.details)) : "";
        setError(`${data.error || t("ai_generic_error")}${detail ? " — " + detail.slice(0, 400) : ""}`);
        setLoading(false);
        return;
      }
      setResult(data);
      if (onSaved) onSaved();
    } catch (e) {
      setError(t("ai_generic_error"));
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="rounded-2xl p-5 mb-6" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <FieldLabel>{t("subject_label")}</FieldLabel>
            {subjectsOptions && subjectsOptions.length > 0 ? (
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle}>
                <option value="">—</option>
                {subjectsOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : (
              <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t("subject_label")} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
            )}
          </div>
          <div>
            <FieldLabel>{t("class_label")}</FieldLabel>
            {classOptions && classOptions.length > 0 ? (
              <select value={className} onChange={(e) => setClassName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle}>
                <option value="">—</option>
                {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            ) : (
              <input value={className} onChange={(e) => setClassName(e.target.value)} placeholder={t("class_label")} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
            )}
          </div>
        </div>

        {history.length > 0 && (
          <div className="mb-3">
            <FieldLabel>{t("pick_from_history")}</FieldLabel>
            <div className="max-h-40 overflow-y-auto rounded-lg p-2 space-y-1" style={{ border: `1px solid ${COLORS.line}` }}>
              {history.map((h) => (
                <label key={h.id} className="flex items-center gap-2 text-sm px-1.5 py-1 rounded" style={{ color: COLORS.ink }}>
                  <input type="checkbox" checked={!!checked[h.lesson_title]} onChange={() => toggleCheck(h.lesson_title)} />
                  {h.lesson_title} <span style={{ color: COLORS.inkSoft }}>{[h.subject, h.class_name].filter(Boolean).join(" · ")}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="mb-3">
          <FieldLabel>{t("lesson_titles_label")}</FieldLabel>
          <textarea value={titlesText} onChange={(e) => setTitlesText(e.target.value)} placeholder={t("lesson_titles_placeholder")} rows={4} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
          <p className="text-xs mt-1.5" style={{ color: COLORS.inkSoft }}>{t("lesson_titles_hint")}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div>
            <FieldLabel>{t("question_type_label")}</FieldLabel>
            <select value={questionType} onChange={(e) => setQuestionType(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle}>
              <option value="mixte">{t("question_type_mixte")}</option>
              <option value="qcm">{t("question_type_qcm")}</option>
              <option value="construite">{t("question_type_construite")}</option>
            </select>
          </div>
          <div>
            <FieldLabel>{t("nb_questions_label")}</FieldLabel>
            <input type="number" min={4} max={20} value={nbQuestions} onChange={(e) => setNbQuestions(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none text-sm" style={inputStyle} />
          </div>
        </div>

        {error && <div className="text-sm mb-3" style={{ color: COLORS.negative }}>{error}</div>}
        <button onClick={generate} disabled={loading} className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2" style={{ background: COLORS.primary, color: "#fff" }}>
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />} {loading ? t("ai_generating") : t("ai_generate_exam_button")}
        </button>
      </div>

      {result && <ExamResult result={result} t={t} />}
    </div>
  );
}

function ExerciseHelpTab({ lang }) {
  const { t } = useLang();
  const [file, setFile] = useState(null); // { base64, mimeType, previewUrl, name }
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (fileObj) => {
    if (!fileObj) { setError(t("no_file_detected")); return; }
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(fileObj.type)) { setError(t("exercise_bad_format")); return; }
    if (fileObj.size > 10_000_000) { setError(t("exercise_too_large")); return; }
    setError("");

    if (fileObj.type === "application/pdf") {
      if (fileObj.size > 4_000_000) { setError(t("exercise_too_large")); return; }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        setFile({ base64, mimeType: fileObj.type, previewUrl: null, name: fileObj.name });
      };
      reader.onerror = () => setError(t("exercise_bad_format"));
      reader.readAsDataURL(fileObj);
      return;
    }

    // Images : on tente de redimensionner pour accélérer l'envoi, mais avec un filet de
    // sécurité — si ça bloque plus de 8 secondes, on envoie la photo originale telle quelle
    // plutôt que de rester coincé sans rien afficher.
    let settled = false;
    const finishWithOriginal = () => {
      if (settled) return;
      settled = true;
      if (fileObj.size > 4_000_000) { setError(t("exercise_too_large")); return; }
      const reader2 = new FileReader();
      reader2.onload = () => setFile({ base64: reader2.result.split(",")[1], mimeType: fileObj.type, previewUrl: reader2.result, name: fileObj.name });
      reader2.onerror = () => setError(t("exercise_bad_format"));
      reader2.readAsDataURL(fileObj);
    };
    const safetyTimeout = setTimeout(finishWithOriginal, 8000);

    try {
      const objectUrl = URL.createObjectURL(fileObj);
      const img = new Image();
      img.onload = () => {
        if (settled) { URL.revokeObjectURL(objectUrl); return; }
        try {
          const maxDim = 1500;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            const scale = maxDim / Math.max(width, height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d").drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.72);
          clearTimeout(safetyTimeout);
          settled = true;
          URL.revokeObjectURL(objectUrl);
          setFile({ base64: compressedDataUrl.split(",")[1], mimeType: "image/jpeg", previewUrl: compressedDataUrl, name: fileObj.name });
        } catch (e) {
          URL.revokeObjectURL(objectUrl);
          finishWithOriginal();
        }
      };
      img.onerror = () => { URL.revokeObjectURL(objectUrl); finishWithOriginal(); };
      img.src = objectUrl;
    } catch (e) {
      finishWithOriginal();
    }
  };

  const generate = async () => {
    if (!file) { setError(t("exercise_file_required")); return; }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const res = await fetch("/api/assist-exercise", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ fileBase64: file.base64, mimeType: file.mimeType, instructions, language: lang }),
      });
      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        setError(res.status === 413 || res.status === 0 ? t("exercise_too_large") : t("ai_generic_error"));
        setLoading(false);
        return;
      }
      if (!res.ok) {
        const detail = data.details ? (typeof data.details === "string" ? data.details : JSON.stringify(data.details)) : "";
        setError(`${data.error || t("ai_generic_error")}${detail ? " — " + detail.slice(0, 400) : ""}`);
        setLoading(false);
        return;
      }
      setResult(data);
    } catch (e) {
      setError(t("ai_generic_error"));
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="rounded-2xl p-5 mb-6" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
        <FieldLabel>{t("exercise_upload_label")}</FieldLabel>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {!file ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-8 rounded-xl flex flex-col items-center justify-center gap-2 mb-4"
            style={{ border: `2px dashed ${COLORS.line}`, color: COLORS.inkSoft }}
          >
            <FileSpreadsheet size={24} />
            <span className="text-sm font-medium">{t("exercise_pick_file")}</span>
            <span className="text-xs">{t("exercise_pick_hint")}</span>
          </button>
        ) : (
          <div className="mb-4 rounded-xl p-3 flex items-center gap-3" style={{ background: COLORS.paper }}>
            {file.previewUrl ? (
              <img src={file.previewUrl} alt="" className="w-16 h-16 object-cover rounded-lg" />
            ) : (
              <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ background: COLORS.card }}>
                <FileSpreadsheet size={22} style={{ color: COLORS.inkSoft }} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate" style={{ color: COLORS.ink }}>{file.name}</div>
              <button onClick={() => { setFile(null); setResult(null); }} className="text-xs font-semibold mt-1" style={{ color: COLORS.negative }}>
                {t("exercise_remove_file")}
              </button>
            </div>
          </div>
        )}

        <FieldLabel>{t("exercise_instructions_label")}</FieldLabel>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder={t("exercise_instructions_placeholder")}
          rows={3}
          className="w-full px-3 py-2.5 rounded-lg outline-none text-sm mb-4"
          style={inputStyle}
        />

        {error && <div className="text-sm mb-3" style={{ color: COLORS.negative }}>{error}</div>}
        <button onClick={generate} disabled={loading || !file} className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2" style={{ background: COLORS.primary, color: "#fff", opacity: !file ? 0.6 : 1 }}>
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />} {loading ? t("ai_generating") : t("exercise_analyze_button")}
        </button>
      </div>

      {result && (
        <div className="space-y-5">
          {result.enonce_identifie && (
            <div className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <h2 className="font-bold mb-2" style={{ color: COLORS.ink }}>{t("exercise_identified_title")}</h2>
              <p className="text-sm" style={{ color: COLORS.inkSoft }}>{result.enonce_identifie}</p>
            </div>
          )}
          {result.analyse && (
            <div className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <h2 className="font-bold mb-2" style={{ color: COLORS.ink }}>{t("exercise_analysis_title")}</h2>
              <p className="text-sm" style={{ color: COLORS.inkSoft }}>{result.analyse}</p>
            </div>
          )}
          {result.etapes?.length > 0 && (
            <div className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <h2 className="font-bold mb-3" style={{ color: COLORS.ink }}>{t("exercise_steps_title")}</h2>
              <div className="space-y-3">
                {result.etapes.map((s, i) => (
                  <div key={i} className="pl-3" style={{ borderLeft: `3px solid ${COLORS.primary}` }}>
                    <div className="text-sm font-semibold" style={{ color: COLORS.ink }}>{i + 1}. {s.titre}</div>
                    <p className="text-sm mt-0.5" style={{ color: COLORS.inkSoft }}>{s.explication}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {result.reponse_finale && (
            <div className="rounded-2xl p-5" style={{ background: COLORS.positiveSoft, border: `1px solid ${COLORS.line}` }}>
              <h2 className="font-bold mb-2" style={{ color: COLORS.positive }}>{t("exercise_final_answer_title")}</h2>
              <p className="text-sm font-medium" style={{ color: COLORS.ink }}>{result.reponse_finale}</p>
            </div>
          )}
          {result.conseil_pedagogique && (
            <div className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <h2 className="font-bold mb-2" style={{ color: COLORS.ink }}>{t("exercise_tip_title")}</h2>
              <p className="text-sm" style={{ color: COLORS.inkSoft }}>{result.conseil_pedagogique}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RevisionSheetsParentView({ children }) {
  const { t, lang } = useLang();
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  const childClasses = useMemo(() => [...new Set(children.map((c) => c.class_name).filter(Boolean))], [children]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("revision_sheets").select("*").eq("status", "published").order("published_at", { ascending: false }).limit(100);
      if (data) setSheets(data);
      setLoading(false);
    })();
  }, []);

  const relevant = sheets.filter((s) => childClasses.length === 0 || childClasses.includes(s.class_name));

  if (loading) return <div className="py-10 flex justify-center"><Loader2 className="animate-spin" size={22} style={{ color: COLORS.ink }} /></div>;

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{t("nav_revision")}</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>{t("revision_parent_subtitle")}</p>

      {relevant.length === 0 ? (
        <EmptyState text={t("no_revision_sheets_yet")} />
      ) : (
        <div className="space-y-2.5">
          {relevant.map((s) => {
            const isOpen = openId === s.id;
            return (
              <div key={s.id} className="rounded-2xl overflow-hidden" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                <button onClick={() => setOpenId(isOpen ? null : s.id)} className="w-full flex items-center justify-between px-4 py-3 text-left">
                  <div className="min-w-0">
                    <div className="font-semibold truncate" style={{ color: COLORS.ink }}>{s.lesson_title}</div>
                    <div className="text-xs mt-0.5" style={{ color: COLORS.inkSoft }}>
                      {[s.subject, s.class_name].filter(Boolean).join(" · ")} · {new Date(s.published_at || s.created_at).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}
                    </div>
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4">
                    <p className="text-sm mb-3" style={{ color: COLORS.inkSoft }}>{s.content.resume}</p>
                    {s.content.points_cles?.length > 0 && (
                      <ul className="list-disc pl-5 space-y-1 text-sm mb-3" style={{ color: COLORS.inkSoft }}>
                        {s.content.points_cles.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    )}
                    {s.content.exercices?.length > 0 && (
                      <div className="space-y-2">
                        {s.content.exercices.map((ex, i) => (
                          <ExerciseRevealItem key={i} index={i} exercice={ex} t={t} />
                        ))}
                      </div>
                    )}
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

function ExerciseRevealItem({ index, exercice, t }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="rounded-xl p-3" style={{ background: COLORS.paper }}>
      <div className="text-sm font-medium" style={{ color: COLORS.ink }}>{index + 1}. {exercice.enonce}</div>
      {revealed ? (
        <p className="text-sm mt-1.5" style={{ color: COLORS.positive }}>{exercice.reponse}</p>
      ) : (
        <button onClick={() => setRevealed(true)} className="text-xs font-semibold mt-1.5" style={{ color: COLORS.primary }}>
          {t("reveal_answer")}
        </button>
      )}
    </div>
  );
}

function LessonAIView({ subjectsOptions, classOptions, lang }) {
  const { t } = useLang();
  const [tab, setTab] = useState("planifier");
  const [historyKey, setHistoryKey] = useState(0);
  const [examHistoryKey, setExamHistoryKey] = useState(0);
  const [showHistoryMenu, setShowHistoryMenu] = useState(false);

  const mainTabs = [
    ["planifier", t("ai_tab_planifier")],
    ["sujet", t("ai_tab_sujet")],
    ["exercice", t("ai_tab_exercice")],
  ];
  const historyTabs = [
    ["historique", t("ai_tab_historique")],
    ["fichesrevision", t("ai_tab_fiches_revision")],
    ["sujethistorique", t("ai_tab_sujet_historique")],
  ];
  const isHistoryTab = historyTabs.some(([key]) => key === tab);
  const activeHistoryLabel = historyTabs.find(([key]) => key === tab)?.[1];

  const selectTab = (key) => {
    setTab(key);
    setShowHistoryMenu(false);
    if (key === "historique") setHistoryKey((k) => k + 1);
    if (key === "sujethistorique") setExamHistoryKey((k) => k + 1);
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1 flex items-center gap-2" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>
        <Sparkles size={26} style={{ color: COLORS.primary }} /> {t("nav_lesson_ai")}
      </h1>
      <p className="mb-5" style={{ color: COLORS.inkSoft }}>{t("lesson_ai_subtitle")}</p>

      <div className="flex gap-2 mb-6 flex-wrap items-center">
        {mainTabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => selectTab(key)}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={tab === key ? { background: COLORS.primary, color: "#fff" } : { background: COLORS.paper, color: COLORS.inkSoft }}
          >
            {label}
          </button>
        ))}

        <div className="relative">
          <button
            onClick={() => setShowHistoryMenu((v) => !v)}
            className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5"
            style={isHistoryTab ? { background: COLORS.primary, color: "#fff" } : { background: COLORS.paper, color: COLORS.inkSoft }}
          >
            {isHistoryTab ? activeHistoryLabel : t("ai_history_group_label")}
            <ChevronDown size={14} style={{ transform: showHistoryMenu ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
          </button>
          {showHistoryMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowHistoryMenu(false)} />
              <div className="absolute top-full left-0 mt-1.5 rounded-xl overflow-hidden z-20 min-w-[200px]" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}`, boxShadow: "0 10px 30px rgba(0,0,0,0.12)" }}>
                {historyTabs.map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => selectTab(key)}
                    className="w-full text-left px-4 py-3 text-sm font-medium"
                    style={tab === key ? { background: COLORS.primarySoft, color: COLORS.primary } : { color: COLORS.ink }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {tab === "planifier" && <LessonPlannerTab subjectsOptions={subjectsOptions} classOptions={classOptions} lang={lang} onSaved={() => setHistoryKey((k) => k + 1)} />}
      {tab === "historique" && <LessonHistoryTab key={historyKey} />}
      {tab === "fichesrevision" && <RevisionSheetHistoryTab key={historyKey} />}
      {tab === "sujet" && <ExamComposerTab subjectsOptions={subjectsOptions} classOptions={classOptions} lang={lang} onSaved={() => setExamHistoryKey((k) => k + 1)} />}
      {tab === "sujethistorique" && <ExamHistoryTab key={examHistoryKey} />}
      {tab === "exercice" && <ExerciseHelpTab lang={lang} />}
    </div>
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
