import { useEffect, useMemo, useState } from "react";
import { StudentsService } from "../../services/students.service";
import { OptionsService } from "../../services/options.service";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/ui.css";

export default function ConsultarEstudiantes() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filtros
  const [lastName, setLastName] = useState("");
  const [nationality, setNationality] = useState(""); // ISO3
  const [identity, setIdentity] = useState("");

  // countries options
  const [countries, setCountries] = useState([]); // [{ iso3, name }]
  const [loadingCountries, setLoadingCountries] = useState(false);

  function normalizeCountriesPayload(payload) {
    // soporta:
    // 1) objeto: { "country-ARG": "Argentina", ... }
    // 2) array: [{ key: "country-ARG", value: "Argentina" }, ...]
    // 3) array: ["country-ARG", ...] (poco probable, pero lo toleramos)
    if (!payload) return [];

    // caso 1: objeto key->value
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

    // caso 2/3: array
    if (Array.isArray(payload)) {
      return payload
        .map((row) => {
          if (row && typeof row === "object") {
            const k = row.key ?? row.k ?? row.code ?? row.iso3 ?? "";
            const v = row.value ?? row.v ?? row.name ?? "";
            const iso3 = String(k).replace(/^country-/, "").trim();
            const name = String(v).trim();
            if (!iso3 || !name) return null;
            return { iso3, name };
          }
          // string
          const iso3 = String(row).replace(/^country-/, "").trim();
          if (!iso3) return null;
          return { iso3, name: iso3 };
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
      // algunos backends envían { items: {...} } o { items: [...] }
      const payload = Array.isArray(data) ? data : data?.items ?? data;

      const normalized = normalizeCountriesPayload(payload)
        .sort((a, b) => a.iso3.localeCompare(b.iso3));

      setCountries(normalized);
    } catch (err) {
      // si falla, no rompemos la pantalla: solo dejamos el select vacío
      setCountries([]);
    } finally {
      setLoadingCountries(false);
    }
  }

  async function load(custom = {}) {
    try {
      setError("");
      setLoading(true);

      const res = await StudentsService.list({
        lastName: lastName || undefined,
        nationality: nationality || undefined,
        identity: identity || undefined,
        limit: 100,
        skip: 0,
        ...custom,
      });

      const data = res.data;
      const list = Array.isArray(data) ? data : data?.items ?? [];
      setItems(list);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "No se pudieron cargar los estudiantes.";
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    loadCountries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // identity requiere nationality: si se borra nationality, limpiamos identity
  useEffect(() => {
    if (!nationality && identity) setIdentity("");
  }, [nationality, identity]);

  const countryOptions = useMemo(() => countries, [countries]);

  return (
    <div className="page">
      <h1 className="pageTitle">Estudiantes</h1>

      <div className="topBar">
        <Link className="linkPrimary" to="/estudiantes/crear">
          + Crear estudiante
        </Link>
      </div>

      {error && <p className="errorText">{error}</p>}

      <div className="card" style={{ marginBottom: 14 }}>
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
        >
          {/* layout columnar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 12,
              alignItems: "end",
            }}
          >
            <label className="label">
              Last name (like)
              <input
                className="input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
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

                {countryOptions.map((c) => (
                  <option key={c.iso3} value={c.iso3}>
                    {c.iso3} - {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="label">
              Identity (requiere country)
              <input
                className="input"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                disabled={!nationality}
                placeholder={!nationality ? "Seleccioná country primero" : ""}
              />
            </label>
          </div>

          <div className="actions" style={{ marginTop: 12 }}>
            <button className="btn btnPrimary" disabled={loading}>
              {loading ? "Buscando..." : "Buscar"}
            </button>

            <button
              className="btn"
              type="button"
              disabled={loading}
              onClick={() => {
                setLastName("");
                setNationality("");
                setIdentity("");
                load({
                  lastName: undefined,
                  nationality: undefined,
                  identity: undefined,
                });
              }}
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th className="th">First name</th>
                <th className="th">Last name</th>
                <th className="th">Nationality</th>
                <th className="th">Birth date</th>
                <th className="th" style={{ textAlign: "right" }}>
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {items.map((s) => (
                <tr
                  className="tr clickableRow"
                  key={s._id}
                  onClick={() => {
                    const selectedText = window.getSelection()?.toString();
                    if (selectedText) return;

                    navigate(`/estudiantes/${s._id}/historial`, {
                      state: { student: { firstName: s.firstName, lastName: s.lastName } },
                    });
                  }}
                  title="Ver historial académico"
                >
                  <td className="td">{s.firstName ?? "-"}</td>
                  <td className="td">{s.lastName ?? "-"}</td>
                  <td className="td">{s.nationality ?? "-"}</td>
                  <td className="td">{s.birthDate ?? "-"}</td>

                  <td className="td" style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 8 }}>
                      <button
                        className="btn btnPrimary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/estudiantes/${s._id}/calificaciones/agregar`, {
                            state: { student: { firstName: s.firstName, lastName: s.lastName } },
                          });
                        }}
                      >
                        Agregar nota
                      </button>

                      <button
                        className="btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/estudiantes/${s._id}/instituciones`, {
                            state: { student: { firstName: s.firstName, lastName: s.lastName } },
                          });
                        }}
                      >
                        Instituciones
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td className="td emptyRow" colSpan={5}>
                    Sin estudiantes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}