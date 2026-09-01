import { useRef, useState } from "react";
import { supabase } from "../lib/supabase";

export default function SignaturePad({ disciplineNoteId, onSigned }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e) => {
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDraw = () => setIsDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const submit = async () => {
    if (!hasSignature) return;
    setLoading(true);
    setError(null);

    const signatureData = canvasRef.current.toDataURL("image/png");

    const { error: rpcError } = await supabase.rpc("signer_billet", {
      p_discipline_note_id: disciplineNoteId,
      p_signature_data: signatureData,
    });

    setLoading(false);

    if (rpcError) {
      setError("Erreur lors de l'enregistrement. Réessayez.");
      return;
    }
    onSigned();
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-gray-600">Signez avec votre doigt ci-dessous :</p>
      <canvas
        ref={canvasRef}
        width={320}
        height={150}
        className="border border-gray-300 rounded-lg bg-white touch-none"
        onPointerDown={startDraw}
        onPointerMove={draw}
        onPointerUp={stopDraw}
        onPointerLeave={stopDraw}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button onClick={clear} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700">
          Effacer
        </button>
        <button
          onClick={submit}
          disabled={!hasSignature || loading}
          className="flex-1 py-2 rounded-lg bg-green-600 text-white disabled:opacity-50"
        >
          {loading ? "Envoi..." : "Valider la signature"}
        </button>
      </div>
    </div>
  );
    }
