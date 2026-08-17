// api/generate-lesson.js
// Fonction serveur Vercel : appelle une IA de façon sécurisée pour générer
// un plan de leçon + questions de consolidation.
//
// ⚙️ BASCULE AUTOMATIQUE ENTRE FOURNISSEURS :
// - Si GEMINI_API_KEY est défini (et pas ANTHROPIC_API_KEY) -> utilise Google Gemini (GRATUIT, sans carte)
// - Si ANTHROPIC_API_KEY est défini -> utilise Claude (Anthropic) automatiquement, sans toucher au code
//
// Variables d'environnement (Vercel > Settings > Environment Variables) :
//   MAINTENANT (gratuit)  : GEMINI_API_KEY
//   PLUS TARD (payant)    : ANTHROPIC_API_KEY  (remplace/complète GEMINI_API_KEY quand tu es prêt)
//   TOUJOURS REQUIS       : SUPABASE_URL, SUPABASE_ANON_KEY

import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée." });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!anthropicKey && !geminiKey) {
    return res.status(500).json({ error: "Aucune clé IA configurée côté serveur (GEMINI_API_KEY ou ANTHROPIC_API_KEY)." });
  }

  // ---------- 1. Vérifier que la personne qui appelle est bien un enseignant ou fondateur actif ----------
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return res.status(401).json({ error: "Non authentifié." });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: "Configuration Supabase manquante côté serveur." });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ error: "Session invalide." });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, active, full_name, school_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return res.status(403).json({ error: "Profil introuvable." });
  }
  if (!profile.active) {
    return res.status(403).json({ error: "Compte non actif." });
  }
  if (profile.role !== "enseignant" && profile.role !== "fondateur") {
    return res.status(403).json({ error: "Réservé aux enseignants et fondateurs." });
  }

  // ---------- 2. Valider les données envoyées ----------
  const { subject, className, lessonTitle, textbook, page, competenceSpecifique, language } = req.body || {};
  if (!lessonTitle || !String(lessonTitle).trim()) {
    return res.status(400).json({ error: "Le titre de la leçon est requis." });
  }

  const lang = language === "en" ? "en" : "fr";

  const systemPrompt =
    lang === "en"
      ? `You are an experienced teaching assistant helping a teacher in Guinea, West Africa, prepare a class lesson, following the competency-based approach ("approche par compétences") used in Guinea's official curriculum brochures. Always answer in clear, practical English suited for a classroom teacher. If a specific competency is given, make sure the objectives directly serve it. Respond ONLY with valid JSON, no markdown code fences, no commentary outside the JSON.`
      : `Tu es un assistant pédagogique expérimenté qui aide un enseignant en Guinée (Afrique de l'Ouest) à préparer un cours, en suivant l'approche par compétences utilisée dans les brochures-programmes officielles guinéennes. Réponds toujours en français clair et pratique, adapté à un enseignant de terrain. Si une compétence spécifique est fournie, assure-toi que les objectifs de la leçon servent directement cette compétence. Réponds UNIQUEMENT avec un JSON valide, sans balises markdown, sans commentaire en dehors du JSON.`;

  const jsonShape = `{
  "objectifs": ["objectif 1", "objectif 2"],
  "materiel": ["matériel 1", "matériel 2"],
  "deroulement": [
    { "etape": "Introduction", "duree": "5 min", "contenu": "..." },
    { "etape": "Développement", "duree": "20 min", "contenu": "..." },
    { "etape": "Conclusion", "duree": "10 min", "contenu": "..." }
  ],
  "questions": [
    { "question": "...", "reponse": "..." }
  ]
}`;

  const userPrompt = `
${lang === "en" ? "Subject" : "Matière"}: ${subject || "—"}
${lang === "en" ? "Class" : "Classe"}: ${className || "—"}
${lang === "en" ? "Lesson title" : "Titre de la leçon"}: ${lessonTitle}
${lang === "en" ? "Textbook" : "Manuel/livre"}: ${textbook || "—"}
${lang === "en" ? "Page" : "Page"}: ${page || "—"}
${lang === "en" ? "Specific competency (curriculum)" : "Compétence spécifique (brochure-programme)"}: ${competenceSpecifique || "—"}

${
  lang === "en"
    ? `Produce a ready-to-use lesson plan and at least 5 short-answer consolidation questions with their correct answers. Return ONLY this JSON shape:\n${jsonShape}`
    : `Produis un plan de leçon prêt à utiliser et au moins 5 questions de consolidation à réponse courte, avec leur bonne réponse. Réponds UNIQUEMENT avec ce format JSON :\n${jsonShape}`
}
`.trim();

  const extractJson = (rawText) => {
    const cleaned = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    return JSON.parse(cleaned);
  };

  try {
    let rawText;

    if (anthropicKey) {
      // ---------- Fournisseur : Anthropic (Claude) ----------
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2000,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });
      if (!response.ok) {
        const errText = await response.text();
        return res.status(502).json({ error: "Erreur de l'API Anthropic.", details: errText });
      }
      const data = await response.json();
      rawText = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    } else {
      // ---------- Fournisseur : Google Gemini (gratuit, sans carte) ----------
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent`,
        {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": geminiKey },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            generationConfig: { maxOutputTokens: 2000 },
          }),
        }
      );
      if (!response.ok) {
        const errText = await response.text();
        return res.status(502).json({ error: "Erreur de l'API Gemini.", details: errText });
      }
      const data = await response.json();
      rawText = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("\n").trim();
    }

    let parsed;
    try {
      parsed = extractJson(rawText);
    } catch (e) {
      return res.status(502).json({ error: "Réponse IA illisible, réessaie.", raw: rawText });
    }

    // ---------- 3. Sauvegarder dans l'historique (best-effort, n'empêche pas la réponse si ça échoue) ----------
    let historyId = null;
    try {
      const { data: savedRow } = await supabase
        .from("ai_lesson_history")
        .insert({
          school_id: profile.school_id,
          teacher_id: userData.user.id,
          subject: subject || null,
          class_name: className || null,
          lesson_title: lessonTitle,
          textbook: textbook || null,
          page: page || null,
          competence_specifique: competenceSpecifique || null,
          result: parsed,
        })
        .select("id")
        .maybeSingle();
      if (savedRow) historyId = savedRow.id;
    } catch (e) {
      // On ignore silencieusement une erreur de sauvegarde : la génération reste utile même sans historique.
    }

    return res.status(200).json({ ...parsed, _historyId: historyId });
  } catch (e) {
    return res.status(500).json({ error: "Erreur serveur : " + (e.message || String(e)) });
  }
}
