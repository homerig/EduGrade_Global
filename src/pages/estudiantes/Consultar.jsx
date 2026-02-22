import { useEffect, useState } from "react";
import { StudentsService } from "../../services/students.service";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/ui.css";

export default function ConsultarEstudiantes() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filtros (opcionales)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nationality, setNationality] = useState("");
  const [identity, setIdentity] = useState("");

  async function load(custom = {}) {
    try {
      setError("");
      setLoading(true);

      const res = await StudentsService.list({
        firstName: firstName || undefined,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <label className="label">
            First name
            <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </label>

          <label className="label">
            Last name (like)
            <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </label>

          <label className="label">
            Nationality
            <input
              className="input"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              placeholder="Ej: ARG"
            />
          </label>

          <label className="label">
            Identity (requiere nationality)
            <input className="input" value={identity} onChange={(e) => setIdentity(e.target.value)} />
          </label>

          <div className="actions">
            <button className="btn btnPrimary" disabled={loading}>
              {loading ? "Buscando..." : "Buscar"}
            </button>

            <button
              className="btn"
              type="button"
              disabled={loading}
              onClick={() => {
                setFirstName("");
                setLastName("");
                setNationality("");
                setIdentity("");
                load({
                  firstName: undefined,
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
                          // ruta de tu screen de agregar nota (la que ya armamos)
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