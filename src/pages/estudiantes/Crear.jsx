import { useEffect, useMemo, useState } from "react";
import { StudentsService } from "../../services/students.service";
import { OptionsService } from "../../services/options.service";
import { useNavigate } from "react-router-dom";
import "../../styles/ui.css";

export default function CrearEstudiante() {
  const nav = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState(""); // YYYY-MM-DD (date input)
  const [nationality, setNationality] = useState(""); // ISO3
  const [identity, setIdentity] = useState("");

  const [countries, setCountries] = useState([]); // [{ iso3, name }]
  const [loadingCountries, setLoadingCountries] = useState(false);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const todayISO = useMemo(() => {
    // YYYY-MM-DD local
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  function normalizeCountriesPayload(payload) {
    // soporta:
    // 1) objeto: { "country-ARG": "Argentina", ... }
    // 2) array: [{ key: "country-ARG", value: "Argentina" }, ...]
    if (!payload) return [];

    if (typeof payload === "object" && !Array.isArray(payload)) {
      return Object.entries(payload)
        .map(([key, value]) => {
          const iso3 = String(key).replace(/^country-/, "").trim();
          const name = String(value ?? "").trim();
          if (!iso3 || !name) return null;
          return { iso3, name };
        })
        .filter(Boolean);
    }

    if (Array.isArray(payload)) {
      return payload
        .map((row) => {
          if (!row || typeof row !== "object") return null;
          const k = row.key ?? row.k ?? row.code ?? row.iso3 ?? "";
          const v = row.value ?? row.v ?? row.name ?? "";
          const iso3 = String(k).replace(/^country-/, "").trim();
          const name = String(v).trim();
          if (!iso3 || !name) return null;
          return { iso3, name };
        })
        .filter(Boolean);
    }

    return [];
  }

  async function loadCountries() {
    try {
      setLoadingCountries(true);
      const res = await OptionsService.listCountries();

      const data = res?.data;
      const payload = Array.isArray(data) ? data : data?.items ?? data;

      const normalized = normalizeCountriesPayload(payload).sort((a, b) => a.iso3.localeCompare(b.iso3));
      setCountries(normalized);

      // si querés setear un default (ej ZAF) cuando exista:
      // if (!nationality && normalized.some(c => c.iso3 === "ZAF")) setNationality("ZAF");
    } catch (err) {
      setCountries([]);
    } finally {
      setLoadingCountries(false);
    }
  }

  useEffect(() => {
    loadCountries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (!bd) return setError("Birth date obligatoria.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(bd)) {
      return setError("Birth date debe ser YYYY-MM-DD.");
    }
    if (bd > todayISO) return setError("Birth date no puede ser una fecha futura.");
    if (!nat) return setError("Country obligatoria.");

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
            Birth date
            <input
              className="input"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={todayISO}
            />
          </label>

          <label className="label">
            Country
            <select
              className="input"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              disabled={loadingCountries}
            >
              <option value="">
                {loadingCountries ? "Cargando países..." : "Seleccionar país"}
              </option>

              {countries.map((c) => (
                <option key={c.iso3} value={c.iso3}>
                  {c.iso3} - {c.name}
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