import { useState } from "react";
import { InstitutionsService } from "../../services/institutions.service";
import { useNavigate } from "react-router-dom";
import "../../styles/instituciones.css";

export default function CrearInstitucion() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [country, setCountry] = useState("ARG");
  const [address, setAddress] = useState("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Nombre obligatorio.");
    if (!country.trim()) return setError("País obligatorio (ej: ARG).");
    if (!address.trim()) return setError("Dirección obligatoria.");

    try {
      setSaving(true);

      await InstitutionsService.create({
        name: name.trim(),
        country: country.trim(),
        address: address.trim(),
      });

      nav("/instituciones/consultar");
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
      <h1 className="pageTitle">Crear institución</h1>

      {error && <p className="errorText">{error}</p>}

      <div className="card">
        <form onSubmit={onSubmit} className="form">
          <label className="label">
            Nombre
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <label className="label">
            País (ISO, ej: ARG)
            <input className="input" value={country} onChange={(e) => setCountry(e.target.value)} />
          </label>

          <label className="label">
            Dirección
            <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
          </label>

          <div className="actions">
            <button className="btn btnPrimary" disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </button>

            <button className="btn" type="button" disabled={saving} onClick={() => nav("/instituciones/consultar")}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}