// api/generate-exam.js
// Fonction serveur Vercel : compose un sujet d'évaluation (QCM + réponses construites)
// à partir d'une liste de titres de leçons déjà enseignées.
//
// Même bascule automatique de fournisseur IA que generate-lesson.js.
// Variables d'environnement requises : identiques à generate-lesson.js.

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
    .select("role, active")
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
  const { subject, className, lessonTitles, questionType, nbQuestions, language } = req.body || {};
  const titles = Array.isArray(lessonTitles) ? lessonTitles.filter((t) => t && String(t).trim()) : [];
  if (titles.length === 0) {
    return res.status(400).json({ error: "Donne au moins un titre de leçon." });
  }

  const lang = language === "en" ? "en" : "fr";
  const type = ["qcm", "construite", "mixte"].includes(questionType) ? questionType : "mixte";
  const count = Math.min(Math.max(parseInt(nbQuestions, 10) || 8, 4), 20);

  const systemPrompt =
    lang === "en"
      ? `You are an experienced teacher in Guinea, West Africa, composing a written test ("sujet de composition") covering several lessons already taught. Respond ONLY with valid JSON, no markdown code fences, no commentary outside the JSON.`
      : `Tu es un enseignant expérimenté en Guinée (Afrique de l'Ouest) qui compose un sujet de composition couvrant plusieurs leçons déjà enseignées. Réponds UNIQUEMENT avec un JSON valide, sans balises markdown, sans commentaire en dehors du JSON.`;

  const typeInstruction =
    type === "qcm"
      ? (lang === "en" ? "All questions must be multiple-choice (type: \"qcm\") with 3 to 4 options each." : "Toutes les questions doivent être à choix multiple (type: \"qcm\") avec 3 à 4 options chacune.")
      : type === "construite"
      ? (lang === "en" ? "All questions must be short constructed-answer questions (type: \"construite\")." : "Toutes les questions doivent être à réponse construite courte (type: \"construite\").")
      : (lang === "en" ? "Mix both multiple-choice (type: \"qcm\") and short constructed-answer (type: \"construite\") questions, roughly half and half." : "Mélange des questions à choix multiple (type: \"qcm\") et des questions à réponse construite courte (type: \"construite\"), environ moitié-moitié.");

  const jsonShape = `{
  "titre_sujet": "...",
  "questions": [
    { "type": "qcm", "question": "...", "options": ["...", "...", "..."], "bonne_reponse": "..." },
    { "type": "construite", "question": "...", "reponse": "..." }
  ]
}`;

  const userPrompt = `
${lang === "en" ? "Subject" : "Matière"}: ${subject || "—"}
${lang === "en" ? "Class" : "Classe"}: ${className || "—"}
${lang === "en" ? "Lessons covered" : "Leçons couvertes"}: ${titles.map((t, i) => `${i + 1}. ${t}`).join(" | ")}
${lang === "en" ? "Number of questions" : "Nombre de questions"}: ${count}

${typeInstruction}
${
  lang === "en"
    ? `Return ONLY this JSON shape (for "qcm" items, "bonne_reponse" must exactly match one of the "options"):\n${jsonShape}`
    : `Réponds UNIQUEMENT avec ce format JSON (pour les items "qcm", "bonne_reponse" doit correspondre exactement à une des "options") :\n${jsonShape}`
}
`.trim();

  const extractJson = (rawText) => {
    const cleaned = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    return JSON.parse(cleaned);
  };

  try {
    let rawText;

    if (anthropicKey) {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2500,
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
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent`,
        {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": geminiKey },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            generationConfig: { maxOutputTokens: 2500 },
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

    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: "Erreur serveur : " + (e.message || String(e)) });
  }
}
