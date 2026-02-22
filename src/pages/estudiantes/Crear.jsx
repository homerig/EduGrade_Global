import { useState } from "react";
import { StudentsService } from "../../services/students.service";
import { useNavigate } from "react-router-dom";
import "../../styles/ui.css";

export default function CrearEstudiante() {
  const nav = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState(""); // YYYY-MM-DD
  const [nationality, setNationality] = useState("Argentina");
  const [identity, setIdentity] = useState(""); // opcional

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!firstName.trim()) return setError("First name obligatorio.");
    if (!lastName.trim()) return setError("Last name obligatorio.");
    if (!birthDate.trim()) return setError("Birth date obligatorio (YYYY-MM-DD).");
    if (!nationality.trim()) return setError("Nationality obligatorio.");

    try {
      setSaving(true);

      await StudentsService.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthDate: birthDate.trim(),
        nationality: nationality.trim(),
        identity: identity.trim() || undefined,
      });

      nav("/estudiantes/consultar");
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo crear.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <h1 className="pageTitle">Crear estudiante</h1>
      {error && <p className="errorText">{error}</p>}

      <div className="card">
        <form onSubmit={onSubmit} className="form">
          <label className="label">
            First name
            <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </label>

          <label className="label">
            Last name
            <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </label>

          <label className="label">
            Birth date (YYYY-MM-DD)
            <input className="input" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </label>

          <label className="label">
            Nationality
            <input className="input" value={nationality} onChange={(e) => setNationality(e.target.value)} />
          </label>

          <label className="label">
            Identity (opcional)
            <input className="input" value={identity} onChange={(e) => setIdentity(e.target.value)} />
          </label>

          <div className="actions">
            <button className="btn btnPrimary" disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button className="btn" type="button" disabled={saving} onClick={() => nav("/estudiantes/consultar")}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}