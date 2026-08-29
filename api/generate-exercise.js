// api/generate-exercise.js
// Fonction serveur Vercel : génère un exercice (QCM et/ou questions rédigées) avec son
// corrigé type, à partir soit du texte du cahier de texte, soit d'une photo de page de manuel.
// Réservé aux enseignants (et fondateur/directeur), pour le secondaire.
//
// Même bascule automatique de fournisseur IA que les autres fonctions (Gemini gratuit
// en priorité, Anthropic si configuré).

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
  if (!["enseignant", "fondateur", "directeur"].includes(profile.role)) {
    return res.status(403).json({ error: "Réservé aux enseignants, au Directeur et au Fondateur." });
  }

  const {
    subject,
    className,
    title,
    sourceType, // "journal" | "photo"
    sourceText, // contenu du cahier de texte (si sourceType === "journal")
    sourceImageBase64, // photo de page de manuel encodée en base64 (si sourceType === "photo"), sans le préfixe data:...
    sourceImageMimeType, // ex: "image/jpeg"
    questionMode, // "qcm" | "redige" | "mixte"
    questionCount, // nombre de questions souhaité (par défaut 5)
    language,
  } = req.body || {};

  if (!subject || !className) {
    return res.status(400).json({ error: "Matière et classe sont requises." });
  }
  if (sourceType === "journal" && (!sourceText || !String(sourceText).trim())) {
    return res.status(400).json({ error: "Le contenu du cahier de texte est requis pour cette source." });
  }
  if (sourceType === "photo" && !sourceImageBase64) {
    return res.status(400).json({ error: "La photo de la page de manuel est requise pour cette source." });
  }

  const lang = language === "en" ? "en" : "fr";
  const mode = ["qcm", "redige", "mixte"].includes(questionMode) ? questionMode : "mixte";
  const count = Math.min(Math.max(parseInt(questionCount, 10) || 5, 1), 15);

  const modeInstructionFr = {
    qcm: "Toutes les questions doivent être des QCM (choix multiples).",
    redige: "Toutes les questions doivent être des questions rédigées (réponse écrite libre par l'élève).",
    mixte: "Mélange des questions QCM (choix multiples) et des questions rédigées (réponse écrite libre).",
  }[mode];
  const modeInstructionEn = {
    qcm: "All questions must be multiple-choice (QCM).",
    redige: "All questions must be open-ended (free written answer from the student).",
    mixte: "Mix multiple-choice (QCM) questions and open-ended written questions.",
  }[mode];

  const systemPrompt =
    lang === "en"
      ? `You create a graded exercise for a secondary school student in Guinea, West Africa, strictly based on the source material provided (either a teacher's class-journal entry describing what was actually taught, or a photographed textbook page). Never invent content beyond what the source material supports. Write at a level appropriate for the given class (e.g. "6ème", "3ème", "Terminale"). For every question, always provide a model correct answer ("corrige_type") to help the teacher grade quickly — a short, clear explanation of what a full-credit answer should contain.`
      : `Tu crées un exercice noté pour un élève du secondaire en Guinée (Afrique de l'Ouest), strictement basé sur la matière première fournie (soit une entrée de cahier de texte décrivant ce qui a réellement été enseigné, soit une photo d'une page de manuel). N'invente jamais un contenu qui dépasse ce que permet la matière première. Écris à un niveau adapté à la classe donnée (par exemple "6ème", "3ème", "Terminale"). Pour chaque question, fournis toujours un corrigé type ("corrige_type") pour aider l'enseignant à corriger rapidement — une explication courte et claire de ce que doit contenir une réponse qui mérite la note maximale.`;

  const userPromptParts = [];
  userPromptParts.push(
    lang === "en"
      ? `Subject: ${subject}\nClass: ${className}\nExercise title: ${title || "—"}\nNumber of questions: ${count}\n${modeInstructionEn}`
      : `Matière : ${subject}\nClasse : ${className}\nTitre de l'exercice : ${title || "—"}\nNombre de questions : ${count}\n${modeInstructionFr}`
  );
  if (sourceType === "journal") {
    userPromptParts.push(
      (lang === "en" ? "Source material (class journal entry):\n" : "Matière première (entrée du cahier de texte) :\n") + String(sourceText).slice(0, 4000)
    );
  } else {
    userPromptParts.push(
      lang === "en"
        ? "Source material: the attached photo of a textbook page. Base every question strictly on what is visible in this image."
        : "Matière première : la photo jointe d'une page de manuel. Base chaque question strictement sur ce qui est visible sur cette image."
    );
  }
  const userPrompt = userPromptParts.join("\n\n");

  const responseSchema = {
    type: "OBJECT",
    properties: {
      questions: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            type: { type: "STRING", enum: ["qcm", "redige"] },
            enonce: { type: "STRING" },
            choix: { type: "ARRAY", items: { type: "STRING" } },
            bonne_reponse_index: { type: "INTEGER" },
            corrige_type: { type: "STRING" },
          },
          required: ["type", "enonce", "corrige_type"],
        },
      },
    },
    required: ["questions"],
  };

  const extractJson = (rawText) => {
    const cleaned = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    return JSON.parse(cleaned);
  };

  try {
    let rawText;

    if (anthropicKey) {
      const content = [{ type: "text", text: userPrompt }];
      if (sourceType === "photo") {
        content.unshift({
          type: "image",
          source: { type: "base64", media_type: sourceImageMimeType || "image/jpeg", data: sourceImageBase64 },
        });
      }
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
          system: systemPrompt + (lang === "en" ? "\n\nRespond ONLY with valid JSON matching this shape (no markdown fences): {\"questions\":[{\"type\":\"qcm|redige\",\"enonce\":\"...\",\"choix\":[\"...\"],\"bonne_reponse_index\":0,\"corrige_type\":\"...\"}]}" : "\n\nRéponds UNIQUEMENT avec un JSON valide suivant ce format (sans balises markdown) : {\"questions\":[{\"type\":\"qcm|redige\",\"enonce\":\"...\",\"choix\":[\"...\"],\"bonne_reponse_index\":0,\"corrige_type\":\"...\"}]}"),
          messages: [{ role: "user", content }],
        }),
      });
      if (!response.ok) {
        const errText = await response.text();
        return res.status(502).json({ error: "Erreur de l'API Anthropic.", details: errText });
      }
      const data = await response.json();
      rawText = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    } else {
      const parts = [{ text: userPrompt }];
      if (sourceType === "photo") {
        parts.unshift({ inlineData: { mimeType: sourceImageMimeType || "image/jpeg", data: sourceImageBase64 } });
      }
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;
      let response = await fetchWithRetry(
        geminiUrl,
        {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": geminiKey },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts }],
            generationConfig: {
              maxOutputTokens: 3000,
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

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      return res.status(502).json({ error: "L'IA n'a produit aucune question, réessaie." });
    }

    // Sauvegarde en BROUILLON : l'enseignant relit et ajuste avant de publier à sa classe.
    const { data: savedRow, error: insertError } = await supabase
      .from("exercises")
      .insert({
        school_id: profile.school_id,
        teacher_id: userData.user.id,
        class_name: className,
        subject,
        title: title && String(title).trim() ? title : `${subject} — ${new Date().toLocaleDateString("fr-FR")}`,
        source_type: sourceType,
        source_text: sourceType === "journal" ? sourceText : null,
        source_image_url: null,
        questions: parsed.questions,
        status: "draft",
      })
      .select()
      .maybeSingle();

    if (insertError || !savedRow) {
      return res.status(500).json({ error: "Exercice généré mais non sauvegardé : " + (insertError?.message || "erreur inconnue") });
    }

    return res.status(200).json(savedRow);
  } catch (e) {
    return res.status(500).json({ error: "Erreur serveur : " + (e.message || String(e)) });
  }
}
