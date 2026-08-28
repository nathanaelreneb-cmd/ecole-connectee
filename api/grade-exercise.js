// api/grade-exercise.js
// Fonction serveur Vercel : propose une note et un commentaire pour chaque question
// rédigée d'une copie d'élève, en comparant sa réponse au corrigé type. L'enseignant
// reste toujours celui qui valide (ou ajuste) la note finale — l'IA ne fait que suggérer,
// pour accélérer la correction, surtout avec de grandes classes.
//
// Notation simple, sur chaque question rédigée : 0 (faux), 0.5 (partiel), 1 (correct).

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
  if (!["enseignant", "fondateur", "directeur"].includes(profile.role)) {
    return res.status(403).json({ error: "Réservé aux enseignants, au Directeur et au Fondateur." });
  }

  const { submissionId, language } = req.body || {};
  if (!submissionId) {
    return res.status(400).json({ error: "Identifiant de copie requis." });
  }

  const { data: submission, error: subErr } = await supabase
    .from("exercise_submissions")
    .select("id, exercise_id, answers")
    .eq("id", submissionId)
    .maybeSingle();
  if (subErr || !submission) {
    return res.status(404).json({ error: "Copie introuvable." });
  }

  const { data: exercise, error: exErr } = await supabase
    .from("exercises")
    .select("id, school_id, teacher_id, questions")
    .eq("id", submission.exercise_id)
    .eq("school_id", profile.school_id)
    .maybeSingle();
  if (exErr || !exercise) {
    return res.status(404).json({ error: "Exercice introuvable." });
  }
  if (profile.role === "enseignant" && exercise.teacher_id !== userData.user.id) {
    return res.status(403).json({ error: "Cet exercice appartient à un autre enseignant." });
  }

  const questions = exercise.questions || [];
  const answers = submission.answers || {};

  const toGrade = questions
    .map((q, i) => ({ index: i, ...q }))
    .filter((q) => q.type === "redige" && answers[q.index] !== undefined && String(answers[q.index]).trim() !== "");

  if (toGrade.length === 0) {
    return res.status(200).json({ suggestions: {} });
  }

  const lang = language === "en" ? "en" : "fr";

  const systemPrompt =
    lang === "en"
      ? `You are helping a teacher in Guinea (West Africa) quickly pre-grade a student's written answers, by comparing each answer to the model answer ("corrige_type"). For each question, give a score of 0 (wrong/off-topic), 0.5 (partially correct, missing key elements), or 1 (correct, matches the substance of the model answer — exact wording is not required). Also give one short, encouraging, specific feedback sentence explaining the score. This is only a SUGGESTION for the teacher, who will review and can change it.`
      : `Tu aides un enseignant en Guinée (Afrique de l'Ouest) à précorriger rapidement les réponses rédigées d'un élève, en comparant chaque réponse au corrigé type ("corrige_type"). Pour chaque question, donne une note de 0 (faux/hors sujet), 0.5 (partiellement correct, éléments clés manquants), ou 1 (correct, correspond au fond du corrigé type — la formulation exacte n'est pas exigée). Donne aussi une phrase de commentaire courte, encourageante et précise expliquant la note. Ce n'est qu'une SUGGESTION pour l'enseignant, qui relira et pourra la modifier.`;

  const userPrompt = toGrade
    .map(
      (q) =>
        `${lang === "en" ? "Question" : "Question"} ${q.index + 1}: ${q.enonce}\n${lang === "en" ? "Model answer" : "Corrigé type"}: ${q.corrige_type}\n${lang === "en" ? "Student's answer" : "Réponse de l'élève"}: ${answers[q.index]}`
    )
    .join("\n\n");

  const responseSchema = {
    type: "OBJECT",
    properties: {
      corrections: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            question_index: { type: "INTEGER" },
            score: { type: "NUMBER" },
            feedback: { type: "STRING" },
          },
          required: ["question_index", "score", "feedback"],
        },
      },
    },
    required: ["corrections"],
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
        headers: {
          "content-type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2000,
          system:
            systemPrompt +
            (lang === "en"
              ? '\n\nRespond ONLY with valid JSON (no markdown fences): {"corrections":[{"question_index":0,"score":1,"feedback":"..."}]}'
              : '\n\nRéponds UNIQUEMENT avec un JSON valide (sans balises markdown) : {"corrections":[{"question_index":0,"score":1,"feedback":"..."}]}'),
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

    const suggestions = {};
    (parsed.corrections || []).forEach((c) => {
      suggestions[c.question_index] = { score: c.score, feedback: c.feedback };
    });

    return res.status(200).json({ suggestions });
  } catch (e) {
    return res.status(500).json({ error: "Erreur serveur : " + (e.message || String(e)) });
  }
}
