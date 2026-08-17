// api/assist-exercise.js
// Fonction serveur Vercel : un enseignant envoie la photo ou le PDF d'un exercice,
// l'IA l'analyse et propose une explication étape par étape pour l'aider à le traiter.
//
// Même bascule automatique de fournisseur que les autres fonctions IA.
// Variables d'environnement : identiques à generate-lesson.js.
//
// ⚠️ Limite pratique : les fichiers volumineux (PDF de plusieurs pages, photo très haute
// résolution) peuvent dépasser la limite de taille des fonctions Vercel (~4.5 Mo). Conseille
// à l'enseignant de prendre une photo nette d'UN exercice à la fois plutôt qu'un PDF entier.

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
  const { fileBase64, mimeType, instructions, language } = req.body || {};
  if (!fileBase64 || !mimeType) {
    return res.status(400).json({ error: "Aucun fichier reçu." });
  }
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!allowedMimeTypes.includes(mimeType)) {
    return res.status(400).json({ error: "Format non supporté. Utilise une photo (JPEG/PNG) ou un PDF." });
  }
  // Sécurité basique : limiter la taille du base64 reçu (~6 Mo décodé max)
  if (fileBase64.length > 8_000_000) {
    return res.status(413).json({ error: "Fichier trop volumineux. Essaie une photo plus légère ou une seule page." });
  }

  const lang = language === "en" ? "en" : "fr";

  const systemPrompt =
    lang === "en"
      ? `You are an experienced teacher in Guinea, West Africa, helping a colleague treat a specific exercise from a photo or document they send you. Explain clearly and pedagogically, step by step, as if guiding a fellow teacher preparing to present the correction in class. Respond ONLY with valid JSON, no markdown code fences, no commentary outside the JSON.`
      : `Tu es un enseignant expérimenté en Guinée (Afrique de l'Ouest) qui aide un collègue à traiter un exercice précis à partir d'une photo ou d'un document qu'il t'envoie. Explique clairement et pédagogiquement, étape par étape, comme pour guider un collègue qui va présenter la correction en classe. Réponds UNIQUEMENT avec un JSON valide, sans balises markdown, sans commentaire en dehors du JSON.`;

  const jsonShape = `{
  "enonce_identifie": "...",
  "analyse": "...",
  "etapes": [
    { "titre": "...", "explication": "..." }
  ],
  "reponse_finale": "...",
  "conseil_pedagogique": "..."
}`;

  const userPromptText = `
${lang === "en" ? "Additional instructions from the teacher" : "Instructions supplémentaires de l'enseignant"}: ${instructions || "—"}

${
  lang === "en"
    ? `Look at the attached exercise, identify the question(s), and produce a step-by-step treatment. Return ONLY this JSON shape:\n${jsonShape}`
    : `Regarde l'exercice joint, identifie la ou les questions, et produis un traitement étape par étape. Réponds UNIQUEMENT avec ce format JSON :\n${jsonShape}`
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
      const contentBlock =
        mimeType === "application/pdf"
          ? { type: "document", source: { type: "base64", media_type: mimeType, data: fileBase64 } }
          : { type: "image", source: { type: "base64", media_type: mimeType, data: fileBase64 } };

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
          messages: [{ role: "user", content: [contentBlock, { type: "text", text: userPromptText }] }],
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
            contents: [
              {
                role: "user",
                parts: [{ inlineData: { mimeType, data: fileBase64 } }, { text: userPromptText }],
              },
            ],
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

    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: "Erreur serveur : " + (e.message || String(e)) });
  }
}
