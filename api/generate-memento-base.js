// api/generate-memento-base.js
// Fonction serveur Vercel : le Fondateur ou le Directeur peut générer directement un contenu
// de référence (résumé + points clés + questions) pour une classe/matière, MÊME SI aucun
// enseignant n'a encore créé de plan de leçon. Ce contenu est publié immédiatement (visible
// des élèves) et vient enrichir le Mémento de la matière, à côté de ce que les enseignants
// ajouteront ensuite.
//
// Même bascule automatique de fournisseur IA (Gemini gratuit, Anthropic si configuré) que
// les autres fonctions, avec sortie structurée forcée pour éviter les réponses illisibles.

import { createClient } from "@supabase/supabase-js";

// Nouvelle tentative automatique en cas de surcharge temporaire de Gemini (429/503) —
// évite d'afficher une erreur pour un simple pic de trafic passager.
async function fetchWithRetry(url, options, retries = 2) {
  let response = await fetch(url, options);
  if ((response.status === 429 || response.status === 503) && retries > 0) {
    await new Promise((r) => setTimeout(r, 1500));
    return fetchWithRetry(url, options, retries - 1);
  }
  return response;
}

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
  if (!["fondateur", "directeur"].includes(profile.role)) {
    return res.status(403).json({ error: "Réservé au Fondateur et au Directeur." });
  }

  const { subject, className, language } = req.body || {};
  if (!subject || !className) {
    return res.status(400).json({ error: "Matière et classe sont requises." });
  }

  const lang = language === "en" ? "en" : "fr";
  const classNameStr = String(className).toLowerCase();
  const isLikelySecondaire = /(\bème\b|coll[eè]ge|lyc[eé]e|termin|3\s*e|6\s*e|seconde|premi[eè]re)/i.test(classNameStr);

  const systemPrompt =
    lang === "en"
      ? `You are an experienced teacher in Guinea, West Africa, writing a general reference revision sheet for a subject and class level, covering the kind of content typically expected at this stage of the national curriculum — since no specific lesson plan was provided, rely on your general knowledge of what students at this level usually study in this subject. Be honest in scope: keep it general and foundational, not tied to one specific lesson. Write clearly, adapted to the exact class level given (vocabulary, sentence complexity, depth). ${isLikelySecondaire ? "This is a SECONDARY class: be reasonably thorough." : "This is an ELEMENTARY/kindergarten class: keep it simple, concrete, playful."} Respond ONLY with valid JSON, no markdown fences.`
      : `Tu es un enseignant expérimenté en Guinée (Afrique de l'Ouest), qui rédige une fiche de révision générale de référence pour une matière et un niveau de classe, couvrant le type de contenu généralement attendu à ce stade du programme national — puisqu'aucun plan de leçon précis n'a été fourni, appuie-toi sur ta connaissance générale de ce que les élèves de ce niveau étudient habituellement dans cette matière. Reste honnête sur la portée : garde un contenu général et fondamental, pas lié à une leçon précise. Écris clairement, adapté exactement au niveau de classe donné (vocabulaire, complexité des phrases, profondeur). ${isLikelySecondaire ? "C'est une classe du SECONDAIRE : sois raisonnablement approfondi." : "C'est une classe du PRIMAIRE/maternelle : reste simple, concret, ludique."} Réponds UNIQUEMENT avec un JSON valide, sans balises markdown.`;

  const jsonShape = `{
  "titre": "Titre général de ce contenu de référence",
  "resume": "...",
  "points_cles": ["point clé 1", "point clé 2"],
  "exercices": [
    { "enonce": "...", "choix": ["option A", "option B", "option C"], "bonne_reponse_index": 0 }
  ]
}`;

  const userPrompt =
    lang === "en"
      ? `Subject: ${subject}\nClass: ${className}\n\nProduce a general foundational revision sheet: a summary, 4-8 key points, and 4-6 multiple-choice questions (exactly 3-4 choices each, one correct, vary the correct position). Return ONLY this JSON shape:\n${jsonShape}`
      : `Matière : ${subject}\nClasse : ${className}\n\nProduis une fiche de révision générale et fondamentale : un résumé, 4 à 8 points clés, et 4 à 6 questions à choix multiples (exactement 3 à 4 choix chacune, une seule bonne réponse, position variée). Réponds UNIQUEMENT avec ce format JSON :\n${jsonShape}`;

  const responseSchema = {
    type: "OBJECT",
    properties: {
      titre: { type: "STRING" },
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
    required: ["titre", "resume", "points_cles", "exercices"],
  };

  const extractJson = (rawText) => {
    const cleaned = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    return JSON.parse(cleaned);
  };

  try {
    let rawText;

    if (anthropicKey) {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": anthropicKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2000,
          system: systemPrompt + (lang === "en" ? "\n\nRespond ONLY with valid JSON matching: " + jsonShape : "\n\nRéponds UNIQUEMENT avec un JSON valide correspondant à : " + jsonShape),
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
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;
      const response = await fetchWithRetry(geminiUrl, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": geminiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: { maxOutputTokens: 2000, responseMimeType: "application/json", responseSchema },
        }),
      });
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

    // Publié directement (pas de brouillon) : le Fondateur/Directeur le crée en connaissance
    // de cause pour qu'il soit immédiatement visible des élèves.
    const { data: savedRow, error: insertError } = await supabase
      .from("revision_sheets")
      .insert({
        school_id: profile.school_id,
        teacher_id: userData.user.id,
        subject,
        class_name: className,
        lesson_title: parsed.titre || `${subject} — ${lang === "en" ? "General reference" : "Contenu de référence"}`,
        content: { resume: parsed.resume, points_cles: parsed.points_cles, exercices: parsed.exercices },
        status: "published",
        published_at: new Date().toISOString(),
        is_baseline: true,
      })
      .select()
      .maybeSingle();

    if (insertError || !savedRow) {
      return res.status(500).json({ error: "Contenu généré mais non sauvegardé : " + (insertError?.message || "erreur inconnue") });
    }

    return res.status(200).json(savedRow);
  } catch (e) {
    return res.status(500).json({ error: "Erreur serveur : " + (e.message || String(e)) });
  }
}
