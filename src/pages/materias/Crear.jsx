import { useState } from "react";
import { SubjectsService } from "../../services/subjects.service";
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

export default function CrearMateria() {
  const nav = useNavigate();
  const [id, setId] = useState("");
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!id.trim()) return setError("ID obligatorio (ej: PHY-01).");
    if (!nombre.trim()) return setError("Nombre obligatorio.");

    await SubjectsService.create({ id: id.trim(), nombre: nombre.trim() });
    nav("/materias/consultar");
  }

  return (
    <div>
      <h1>Crear materia</h1>
      {error && <p style={{ color: "tomato" }}>{error}</p>}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
        <label>ID<input style={inputStyle()} value={id} onChange={(e) => setId(e.target.value)} /></label>
        <label>Nombre<input style={inputStyle()} value={nombre} onChange={(e) => setNombre(e.target.value)} /></label>

        <div style={{ display: "flex", gap: 10 }}>
          <button>Guardar</button>
          <button type="button" onClick={() => nav("/materias/consultar")}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
