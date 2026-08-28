// api/generate-revision-sheet.js
// Fonction serveur Vercel : transforme un plan de leçon (déjà généré pour l'enseignant)
// en fiche de révision simple pour les élèves, sauvegardée en BROUILLON.
// L'enseignant doit explicitement "publier" la fiche (via une simple mise à jour de
// la ligne dans revision_sheets) avant qu'elle ne soit visible des parents/élèves.
//
// Les exercices sont maintenant des questions à choix multiples (QCM) : l'élève clique
// directement sur une réponse et voit immédiatement si c'est correct, au lieu d'un simple
// bouton "révéler la réponse".
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
  if (profile.role !== "enseignant" && profile.role !== "fondateur") {
    return res.status(403).json({ error: "Réservé aux enseignants et fondateurs." });
  }

  const { subject, className, lessonTitle, lessonPlan, historyId, language } = req.body || {};
  if (!lessonTitle || !String(lessonTitle).trim()) {
    return res.status(400).json({ error: "Le titre de la leçon est requis." });
  }
  if (!lessonPlan || typeof lessonPlan !== "object") {
    return res.status(400).json({ error: "Le plan de leçon est requis (génère d'abord la leçon)." });
  }

  const lang = language === "en" ? "en" : "fr";

  const systemPrompt =
    lang === "en"
      ? `You turn a teacher's lesson plan into a simple revision sheet directly readable by a student in Guinea, West Africa.

CRITICAL — LEVEL ADAPTATION: The class level given (e.g. "CP1", "CM2", "5ème année", "3ème", "Terminale") tells you EXACTLY who is going to read this sheet — write it as if you were speaking directly to a student of that precise age and level, not a generic student. For young children, use very short sentences, familiar everyday examples, and simple encouraging words. For older secondary students, you can use more precise vocabulary and slightly more developed reasoning, while staying clear and student-friendly. Never write generic content that could apply to any class — the language and depth must feel exactly right for that specific level.

Respond ONLY with valid JSON, no markdown code fences, no commentary outside the JSON.`
      : `Tu transformes un plan de leçon d'enseignant en une fiche de révision simple, directement lisible par un élève de Guinée (Afrique de l'Ouest).

IMPORTANT — ADAPTATION AU NIVEAU : la classe indiquée (par exemple "CP1", "CM2", "5ème année", "3ème", "Terminale") te dit EXACTEMENT qui va lire cette fiche — écris-la comme si tu t'adressais directement à un élève de cet âge et de ce niveau précis, pas à un élève générique. Pour un jeune enfant, utilise des phrases très courtes, des exemples familiers du quotidien, des mots simples et encourageants. Pour un élève plus avancé du secondaire, tu peux utiliser un vocabulaire plus précis et un raisonnement un peu plus développé, tout en restant clair et accessible. N'écris jamais un contenu générique valable pour n'importe quelle classe — le langage et la profondeur doivent correspondre exactement à ce niveau précis.

Réponds UNIQUEMENT avec un JSON valide, sans balises markdown, sans commentaire en dehors du JSON.`;

  const jsonShape = `{
  "resume": "...",
  "points_cles": ["point clé 1", "point clé 2"],
  "exercices": [
    { "enonce": "...", "choix": ["option A", "option B", "option C"], "bonne_reponse_index": 0 }
  ]
}`;

  // Le plan de leçon source contient son propre champ "questions" au format
  // { question, reponse } (réponse libre, pour l'enseignant). On le retire avant de l'envoyer
  // à l'IA ici, sinon elle a tendance à copier ce format au lieu de produire des choix multiples.
  const { questions: _ignoredQuestions, ...lessonPlanForPrompt } = lessonPlan;

  const userPrompt = `
${lang === "en" ? "Subject" : "Matière"}: ${subject || "—"}
${lang === "en" ? "Class" : "Classe"}: ${className || "—"}
${lang === "en" ? "Lesson title" : "Titre de la leçon"}: ${lessonTitle}

${lang === "en" ? "Teacher's lesson plan (source material)" : "Plan de leçon de l'enseignant (matière première)"}:
${JSON.stringify(lessonPlanForPrompt).slice(0, 6000)}

${
  lang === "en"
    ? `Produce a short, friendly revision sheet with a summary, 3-6 key points to remember, and 3-5 multiple-choice practice questions. For each question, give exactly 3 or 4 answer choices in the "choix" array, with only ONE correct answer. "bonne_reponse_index" is the zero-based position of the correct answer inside "choix". Vary the position of the correct answer across questions (don't always put it first). Wrong choices should be plausible, not silly or obviously wrong. IMPORTANT: your "exercices" MUST use exactly this "choix" / "bonne_reponse_index" structure — never a plain "reponse" text field, even if the source material above uses a different format for its own questions. Return ONLY this JSON shape:\\n${jsonShape}`
    : `Produis une fiche de révision courte et amicale avec un résumé, 3 à 6 points clés à retenir, et 3 à 5 questions à choix multiples. Pour chaque question, donne exactement 3 ou 4 propositions dans le tableau "choix", avec une seule bonne réponse. "bonne_reponse_index" est la position (à partir de 0) de la bonne réponse dans "choix". Varie la position de la bonne réponse d'une question à l'autre (ne la mets pas toujours en premier). Les mauvaises réponses doivent être plausibles, pas absurdes ou trop faciles à écarter. IMPORTANT : tes "exercices" DOIVENT utiliser exactement cette structure "choix" / "bonne_reponse_index" — jamais un simple champ texte "reponse", même si la matière première ci-dessus utilise un format différent pour ses propres questions. Réponds UNIQUEMENT avec ce format JSON :\\n${jsonShape}`
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
            generationConfig: {
              maxOutputTokens: 2000,
              // On FORCE la structure de sortie (plutôt que de compter uniquement sur les
              // instructions en langage naturel) : Gemini ne peut plus renvoyer un simple champ
              // "reponse" texte libre, "choix" + "bonne_reponse_index" sont obligatoires.
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  resume: { type: "STRING" },
                  points_cles: { type: "ARRAY", items: { type: "STRING" } },
                  exercices: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        enonce: { type: "STRING" },
                        choix: { type: "ARRAY", items: { type: "STRING" } },
                        bonne_reponse_index: { type: "INTEGER" },
                      },
                      required: ["enonce", "choix", "bonne_reponse_index"],
                    },
                  },
                },
                required: ["resume", "points_cles", "exercices"],
              },
            },
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

    // Sauvegarde en BROUILLON (jamais publié directement)
    const { data: savedRow, error: insertError } = await supabase
      .from("revision_sheets")
      .insert({
        school_id: profile.school_id,
        teacher_id: userData.user.id,
        lesson_history_id: historyId || null,
        subject: subject || null,
        class_name: className || null,
        lesson_title: lessonTitle,
        content: parsed,
        status: "draft",
      })
      .select()
      .maybeSingle();

    if (insertError || !savedRow) {
      return res.status(500).json({ error: "Fiche générée mais non sauvegardée : " + (insertError?.message || "erreur inconnue") });
    }

    return res.status(200).json(savedRow);
  } catch (e) {
    return res.status(500).json({ error: "Erreur serveur : " + (e.message || String(e)) });
  }
}
