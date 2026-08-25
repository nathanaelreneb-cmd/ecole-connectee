// api/generate-quiz.js
// Fonction serveur Vercel : transforme une fiche de révision déjà PUBLIÉE
// en quiz à choix multiples (QCM) pour que l'élève puisse s'auto-évaluer.
// Le quiz est stocké directement sur la ligne revision_sheets (colonne quiz),
// généré une seule fois puis réutilisé — pas besoin de le régénérer à chaque lecture.
//
// Même bascule automatique de fournisseur que les autres fonctions IA.

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
    .select("role, active, school_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return res.status(403).json({ error: "Profil introuvable." });
  }
  if (!profile.active) {
    return res.status(403).json({ error: "Compte non actif." });
  }
  // Le quiz peut être demandé par l'enseignant/fondateur (à la publication)
  // ou déclenché automatiquement à la première lecture côté parent — donc pas
  // de restriction de rôle ici, seulement l'appartenance à la bonne école (vérifiée
  // ci-dessous via la fiche elle-même) et un compte actif.

  const { sheetId, language } = req.body || {};
  if (!sheetId) {
    return res.status(400).json({ error: "L'identifiant de la fiche de révision est requis." });
  }

  // On récupère la fiche, et on vérifie qu'elle appartient bien à l'école du compte connecté
  // (la policy RLS de revision_sheets le garantit déjà, mais on double-vérifie ici).
  const { data: sheet, error: sheetError } = await supabase
    .from("revision_sheets")
    .select("*")
    .eq("id", sheetId)
    .eq("school_id", profile.school_id)
    .maybeSingle();

  if (sheetError || !sheet) {
    return res.status(404).json({ error: "Fiche de révision introuvable." });
  }
  if (sheet.status !== "published") {
    return res.status(403).json({ error: "Cette fiche n'est pas encore publiée." });
  }

  // Si un quiz existe déjà pour cette fiche, on le renvoie tel quel (pas de régénération inutile)
  if (sheet.quiz && Array.isArray(sheet.quiz.questions) && sheet.quiz.questions.length > 0) {
    return res.status(200).json(sheet);
  }

  const lang = language === "en" ? "en" : "fr";

  const systemPrompt =
    lang === "en"
      ? `You turn a student revision sheet into a short multiple-choice quiz (QCM) for a student in Guinea, West Africa.

CRITICAL — LEVEL ADAPTATION: the class level given (e.g. "CP1", "CM2", "5ème année", "3ème", "Terminale") tells you EXACTLY who is going to answer this quiz — write questions and answer options in language exactly suited to a student of that precise age and level. For young children, use very short, simple, concrete questions. For older secondary students, questions can be more precise.

Each question must have exactly 4 answer options, with exactly one correct option. Base every question strictly on the content of the revision sheet provided — never invent facts outside it.

Respond ONLY with valid JSON, no markdown code fences, no commentary outside the JSON.`
      : `Tu transformes une fiche de révision élève en un court quiz à choix multiples (QCM) pour un élève de Guinée (Afrique de l'Ouest).

IMPORTANT — ADAPTATION AU NIVEAU : la classe indiquée (par exemple "CP1", "CM2", "5ème année", "3ème", "Terminale") te dit EXACTEMENT qui va répondre à ce quiz — rédige les questions et les options de réponse dans un langage exactement adapté à cet âge et à ce niveau précis. Pour un jeune enfant, des questions très courtes, simples et concrètes. Pour un élève plus avancé, des questions plus précises.

Chaque question doit avoir exactement 4 options de réponse, dont une seule correcte. Base chaque question strictement sur le contenu de la fiche de révision fournie — n'invente jamais de fait en dehors de celle-ci.

Réponds UNIQUEMENT avec un JSON valide, sans balises markdown, sans commentaire en dehors du JSON.`;

  const jsonShape = `{
  "questions": [
    {
      "question": "...",
      "options": ["option A", "option B", "option C", "option D"],
      "correct_index": 0
    }
  ]
}`;

  const userPrompt = `
${lang === "en" ? "Subject" : "Matière"}: ${sheet.subject || "—"}
${lang === "en" ? "Class" : "Classe"}: ${sheet.class_name || "—"}
${lang === "en" ? "Lesson title" : "Titre de la leçon"}: ${sheet.lesson_title}

${lang === "en" ? "Revision sheet content (source material)" : "Contenu de la fiche de révision (matière première)"}:
${JSON.stringify(sheet.content).slice(0, 6000)}

${
  lang === "en"
    ? `Produce 5 multiple-choice questions covering the key points of this sheet. Return ONLY this JSON shape:\n${jsonShape}`
    : `Produis 5 questions à choix multiples couvrant les points clés de cette fiche. Réponds UNIQUEMENT avec ce format JSON :\n${jsonShape}`
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
          max_tokens: 1500,
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
            generationConfig: { maxOutputTokens: 1500 },
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

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      return res.status(502).json({ error: "Le quiz généré est vide, réessaie." });
    }

    const { data: updatedRow, error: updateError } = await supabase
      .from("revision_sheets")
      .update({ quiz: parsed })
      .eq("id", sheet.id)
      .select()
      .maybeSingle();

    if (updateError || !updatedRow) {
      return res.status(500).json({ error: "Quiz généré mais non sauvegardé : " + (updateError?.message || "erreur inconnue") });
    }

    return res.status(200).json(updatedRow);
  } catch (e) {
    return res.status(500).json({ error: "Erreur serveur : " + (e.message || String(e)) });
  }
}
