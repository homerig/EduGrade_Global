import { useState } from "react";
import { StudentsService } from "../../services/students.service";
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

export default function CrearEstudiante() {
  const nav = useNavigate();
  const [id, setId] = useState("S-");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!id.trim() || id.trim() === "S-") return setError("ID inválido (ej: S-3).");
    if (!nombre.trim()) return setError("Nombre obligatorio.");
    if (!email.trim() || !email.includes("@")) return setError("Email inválido.");

    try {
      setSaving(true);
      await StudentsService.create({ id: id.trim(), nombre: nombre.trim(), email: email.trim() });
      nav("/estudiantes/consultar");
    } catch (err) {
      setError(err.message || "No se pudo crear.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1>Crear estudiante</h1>
      {error && <p style={{ color: "tomato" }}>{error}</p>}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
        <label>Student ID<input style={inputStyle()} value={id} onChange={(e) => setId(e.target.value)} /></label>
        <label>Nombre<input style={inputStyle()} value={nombre} onChange={(e) => setNombre(e.target.value)} /></label>
        <label>Email<input style={inputStyle()} value={email} onChange={(e) => setEmail(e.target.value)} /></label>

        <div style={{ display: "flex", gap: 10 }}>
          <button disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
          <button type="button" disabled={saving} onClick={() => nav("/estudiantes/consultar")}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
