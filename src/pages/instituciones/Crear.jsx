import { useState } from "react";
import { InstitutionsService } from "../../services/institutions.service";
import { useNavigate } from "react-router-dom";

function inputStyle() {
  return {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #333",
    background: "#111",
    color: "inherit",
  };
}

export default function CrearInstitucion() {
  const nav = useNavigate();
  const [id, setId] = useState("I-");
  const [nombre, setNombre] = useState("");
  const [region, setRegion] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!id.trim() || id.trim() === "I-") return setError("ID inválido (ej: I-3).");
    if (!nombre.trim()) return setError("Nombre obligatorio.");
    if (!region.trim()) return setError("Región obligatoria.");

    try {
      setSaving(true);
      await InstitutionsService.create({ id: id.trim(), nombre: nombre.trim(), region: region.trim() });
      nav("/instituciones/consultar");
    } catch (err) {
      setError(err.message || "No se pudo crear.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1>Crear institución</h1>
      {error && <p style={{ color: "tomato" }}>{error}</p>}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
        <label>ID<input style={inputStyle()} value={id} onChange={(e) => setId(e.target.value)} /></label>
        <label>Nombre<input style={inputStyle()} value={nombre} onChange={(e) => setNombre(e.target.value)} /></label>
        <label>Región<input style={inputStyle()} value={region} onChange={(e) => setRegion(e.target.value)} /></label>

        <div style={{ display: "flex", gap: 10 }}>
          <button disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
          <button type="button" disabled={saving} onClick={() => nav("/instituciones/consultar")}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
