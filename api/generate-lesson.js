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

// Nouvelle tentative automatique en cas de surcharge temporaire de Gemini (429/503) —
// évite d'afficher une erreur à l'enseignant pour un simple pic de trafic passager.
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

  // Détection simple du secondaire à partir du nom de classe fourni par l'app
  // (ex: "6ème année", "3ème", "Terminale", "Tle D"...), pour demander un contenu
  // nettement plus détaillé (propriétés, prérequis) qu'au primaire.
  const classNameStr = String(className || "").toLowerCase();
  const isLikelySecondaire = /(\bème\b|\be\b|coll[eè]ge|lyc[eé]e|termin|3\s*e|6\s*e|seconde|premi[eè]re)/i.test(classNameStr);

  const systemPrompt =
    lang === "en"
      ? `You are an experienced teaching assistant helping a teacher in Guinea, West Africa, prepare a class lesson, following the competency-based approach ("approche par compétences") used in Guinea's official curriculum brochures. Always answer in clear, practical English suited for a classroom teacher. If a specific competency is given, make sure the objectives directly serve it.

CRITICAL — LEVEL ADAPTATION: The class level given (e.g. "CP1", "CM2", "5ème année", "3ème", "Terminale") is not just a label — you must write the ENTIRE lesson (objectives, content, examples, vocabulary difficulty, sentence complexity) exactly as a real teacher would deliver it to students of that precise level. A lesson for young children must use very short sentences, concrete everyday examples, and simple words. A lesson for older secondary students can use more abstract reasoning and technical vocabulary appropriate to that level. Never write a generic, one-size-fits-all lesson — imagine you are standing in front of that exact class right now.

${isLikelySecondaire
  ? `This is a SECONDARY school class (collège/lycée). The lesson must be substantially more thorough than an elementary one: include full "prerequis" (prerequisite knowledge the student needs), and at least one to three "proprietes" entries — each a fully-stated rule/property/theorem/definition, written out completely (not just named), together with one worked example showing it applied step by step. Do not skip this depth just to save space.`
  : `This is an ELEMENTARY/kindergarten class. Keep "prerequis" and "proprietes" simple or omit them if not relevant — favor concrete, playful, age-appropriate explanations instead.`}

Respond ONLY with valid JSON, no markdown code fences, no commentary outside the JSON.`
      : `Tu es un assistant pédagogique expérimenté qui aide un enseignant en Guinée (Afrique de l'Ouest) à préparer un cours, en suivant l'approche par compétences utilisée dans les brochures-programmes officielles guinéennes. Réponds toujours en français clair et pratique, adapté à un enseignant de terrain. Si une compétence spécifique est fournie, assure-toi que les objectifs de la leçon servent directement cette compétence.

IMPORTANT — ADAPTATION AU NIVEAU : la classe indiquée (par exemple "CP1", "CM2", "5ème année", "3ème", "Terminale") n'est pas qu'une étiquette — tu dois rédiger TOUTE la leçon (objectifs, contenu, exemples, difficulté du vocabulaire, complexité des phrases) exactement comme un vrai enseignant la donnerait devant des élèves de ce niveau précis. Une leçon pour de jeunes enfants doit utiliser des phrases très courtes, des exemples concrets du quotidien, des mots simples. Une leçon pour des élèves plus avancés du secondaire peut utiliser un raisonnement plus abstrait et un vocabulaire technique adapté à ce niveau. N'écris jamais une leçon générique valable pour n'importe quelle classe — imagine que tu es toi-même devant cette classe précise, maintenant.

${isLikelySecondaire
  ? `Cette classe est du SECONDAIRE (collège/lycée). La leçon doit être nettement plus détaillée qu'au primaire : inclue des "prerequis" complets (ce que l'élève doit déjà savoir) et au moins une à trois "proprietes" — chacune étant une règle/propriété/théorème/définition ÉNONCÉE EN ENTIER (pas juste nommée), accompagnée d'un exemple travaillé montrant son application étape par étape. Ne raccourcis pas cette partie pour gagner de la place.`
  : `Cette classe est du PRIMAIRE/maternelle. Garde "prerequis" et "proprietes" simples, ou omets-les si non pertinents — privilégie des explications concrètes, ludiques, adaptées à l'âge.`}

Réponds UNIQUEMENT avec un JSON valide, sans balises markdown, sans commentaire en dehors du JSON.`;

  const jsonShape = `{
  "objectifs": ["objectif 1", "objectif 2"],
  "prerequis": ["prérequis 1", "prérequis 2"],
  "materiel": ["matériel 1", "matériel 2"],
  "proprietes": [
    { "titre": "Nom de la propriété/règle/théorème", "enonce": "Énoncé complet et rigoureux", "exemple": "Exemple travaillé, étape par étape" }
  ],
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

  const responseSchema = {
    type: "OBJECT",
    properties: {
      objectifs: { type: "ARRAY", items: { type: "STRING" } },
      prerequis: { type: "ARRAY", items: { type: "STRING" } },
      materiel: { type: "ARRAY", items: { type: "STRING" } },
      proprietes: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            titre: { type: "STRING" },
            enonce: { type: "STRING" },
            exemple: { type: "STRING" },
          },
          required: ["titre", "enonce"],
        },
      },
      deroulement: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            etape: { type: "STRING" },
            duree: { type: "STRING" },
            contenu: { type: "STRING" },
          },
          required: ["etape", "contenu"],
        },
      },
      questions: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            question: { type: "STRING" },
            reponse: { type: "STRING" },
          },
          required: ["question", "reponse"],
        },
      },
    },
    required: ["objectifs", "materiel", "deroulement", "questions"],
  };

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
          max_tokens: 3000,
          system:
            systemPrompt +
            (lang === "en"
              ? "\n\nRespond ONLY with valid JSON (no markdown fences) matching exactly this shape (fields may be empty arrays but must be present): " + jsonShape
              : "\n\nRéponds UNIQUEMENT avec un JSON valide (sans balises markdown) correspondant exactement à ce format (les champs peuvent être des tableaux vides mais doivent être présents) : " + jsonShape),
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
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent`;
      let response = await fetchWithRetry(
        geminiUrl,
        {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": geminiKey },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            generationConfig: {
              maxOutputTokens: 3000,
              // On FORCE la structure de sortie : évite les réponses mal formées
              // ("réponse illisible, réessaie") qui arrivaient sans cette contrainte.
              responseMimeType: "application/json",
              responseSchema,
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
