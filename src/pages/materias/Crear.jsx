import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/ui.css";
import { SubjectsService } from "../../services/subjects.service";
import { LEVELS } from "../../constants/levels";

export default function CrearMateria() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [level, setLevel] = useState("19"); // default undergraduate
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Nombre obligatorio.");
    if (!level.trim()) return setError("Level obligatorio.");

    try {
      setSaving(true);

      await SubjectsService.create({
        name: name.trim(),
        level: level, // string id del catálogo
      });

      nav("/materias/consultar");
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        err?.message ||
        "No se pudo crear la materia."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <h1 className="pageTitle">Crear materia</h1>
      {error && <p className="errorText">{error}</p>}

      <div className="card">
        <form onSubmit={onSubmit} className="form">
          <label className="label">
            Nombre
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="label">
            Nivel académico
            <select
              className="input"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              {LEVELS.map((lvl) => (
                <option key={lvl.value} value={lvl.value}>
                  {lvl.label}
                </option>
              ))}
            </select>
          </label>

          <div className="actions">
            <button className="btn btnPrimary" disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button
              className="btn"
              type="button"
              disabled={saving}
              onClick={() => nav("/materias/consultar")}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}