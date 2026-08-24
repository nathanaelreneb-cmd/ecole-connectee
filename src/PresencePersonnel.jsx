import React, { useState, useEffect } from "react";
import { CheckCircle2, LogOut, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "./lib/supabase";

// Distance en mètres entre deux points GPS (formule de Haversine)
function distanceMetres(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Récupère la position GPS actuelle du téléphone (une seule mesure, pas de suivi continu)
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("La géolocalisation n'est pas disponible sur cet appareil."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });
}

/**
 * Composant à placer sur le tableau de bord enseignant.
 * Props :
 *  - school : { id, latitude, longitude, rayon_metres }
 *  - userId : profile.user_id de l'enseignant connecté
 *  - onCheckedIn : callback optionnel une fois pointé (pour débloquer le reste de l'app)
 */
export default function PresencePersonnel({ school, userId, onCheckedIn }) {
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("presence_personnel")
        .select("*")
        .eq("user_id", userId)
        .eq("school_id", school.id)
        .eq("date", today)
        .maybeSingle();
      setTodayRecord(data || null);
      if (data?.heure_arrivee && onCheckedIn) onCheckedIn();
    };
    load();
  }, [userId, school.id, today]);

  const handlePointage = async (type) => {
    // type: 'arrivee' | 'depart'
    setError("");
    if (!school.latitude || !school.longitude) {
      setError(
        "Les coordonnées GPS de l'école n'ont pas encore été configurées dans Réglages de l'école."
      );
      return;
    }
    setLoading(true);
    try {
      const position = await getCurrentPosition();
      const dist = distanceMetres(
        position.coords.latitude,
        position.coords.longitude,
        school.latitude,
        school.longitude
      );
      const rayon = school.rayon_metres || 200;

      if (dist > rayon) {
        setError(
          `Vous semblez être à ${Math.round(dist)} m de l'école (rayon autorisé : ${rayon} m). Rapprochez-vous et réessayez.`
        );
        setLoading(false);
        return;
      }

      const nowIso = new Date().toISOString();

      if (type === "arrivee") {
        const { data, error: err } = await supabase
          .from("presence_personnel")
          .upsert(
            {
              school_id: school.id,
              user_id: userId,
              date: today,
              heure_arrivee: nowIso,
              distance_arrivee_m: Math.round(dist),
            },
            { onConflict: "user_id,date,school_id" }
          )
          .select()
          .maybeSingle();
        if (err) throw err;
        setTodayRecord(data);
        if (onCheckedIn) onCheckedIn();
      } else {
        const { data, error: err } = await supabase
          .from("presence_personnel")
          .update({ heure_depart: nowIso, distance_depart_m: Math.round(dist) })
          .eq("user_id", userId)
          .eq("school_id", school.id)
          .eq("date", today)
          .select()
          .maybeSingle();
        if (err) throw err;
        setTodayRecord(data);
      }
    } catch (e) {
      if (e.code === 1) {
        setError("Autorisation de localisation refusée. Active-la dans les réglages de ton téléphone.");
      } else {
        setError(e.message || "Une erreur est survenue.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (todayRecord?.heure_depart) {
    return (
      <div className="p-4 rounded-xl bg-green-50 text-green-700 text-sm flex items-center gap-2">
        <CheckCircle2 size={18} />
        Journée terminée — arrivée {new Date(todayRecord.heure_arrivee).toLocaleTimeString()}, départ{" "}
        {new Date(todayRecord.heure_depart).toLocaleTimeString()}.
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border space-y-3">
      {!todayRecord?.heure_arrivee ? (
        <button
          onClick={() => handlePointage("arrivee")}
          disabled={loading}
          className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 bg-orange-600 text-white"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
          Je suis arrivé(e)
        </button>
      ) : (
        <>
          <div className="text-sm text-green-700 flex items-center gap-2">
            <CheckCircle2 size={16} />
            Arrivée enregistrée à {new Date(todayRecord.heure_arrivee).toLocaleTimeString()}
          </div>
          <button
            onClick={() => handlePointage("depart")}
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 bg-gray-800 text-white"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <LogOut size={16} />}
            Je pars
          </button>
        </>
      )}
      {error && (
        <div className="text-sm text-red-600 flex items-start gap-2">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}
    </div>
  );
}
