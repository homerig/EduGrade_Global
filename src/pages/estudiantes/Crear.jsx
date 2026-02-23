import { useState } from "react";
import { StudentsService } from "../../services/students.service";
import { useNavigate } from "react-router-dom";
import "../../styles/ui.css";
import { COUNTRIES } from "../../constants/countries";

export default function CrearEstudiante() {
  const nav = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [nationality, setNationality] = useState("ZAF");
  const [identity, setIdentity] = useState("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const fn = firstName.trim();
    const ln = lastName.trim();
    const bd = birthDate.trim();
    const nat = nationality.trim();
    const idn = identity.trim();

    if (!fn) return setError("First name obligatorio.");
    if (!ln) return setError("Last name obligatorio.");
    if (!bd) return setError("Birth date obligatorio (YYYY-MM-DD).");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(bd)) {
      return setError("Birth date debe ser YYYY-MM-DD (ej: 2002-07-15).");
    }
    if (!nat) return setError("Nationality obligatoria.");

    const payload = {
      firstName: fn,
      lastName: ln,
      birthDate: bd,
      nationality: nat,
      identity: idn || undefined,
    };

    console.log("[CREATE STUDENT] payload:", payload);

    try {
      setSaving(true);

      const res = await StudentsService.create(payload);

      console.log("[CREATE STUDENT] OK", res?.status, res?.data);

      // ✅ Volver a la lista (ruta existe en tu App.jsx)
      nav("/estudiantes/consultar");
    } catch (err) {
      console.log("[CREATE STUDENT] ERROR", err?.response?.status, err?.response?.data, err);

      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo crear.";

      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
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
            <input
              className="input"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              placeholder="YYYY-MM-DD"
            />
          </label>

          <label className="label">
            Nationality
            <select className="input" value={nationality} onChange={(e) => setNationality(e.target.value)}>
              {COUNTRIES.map((c) => (
                <option key={c.iso3} value={c.iso3}>
                  {c.label}
                </option>
              ))}
            </select>
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