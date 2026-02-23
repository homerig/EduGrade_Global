import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../../styles/ui.css";
import { InstitutionsService } from "../../services/institutions.service";
import { StudentsService } from "../../services/students.service";

function normalizeList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

export default function EstudianteInstituciones() {
  const { id: studentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const studentFromState = location.state?.student;
  const studentLabel = useMemo(() => {
    const fn = studentFromState?.firstName?.trim();
    const ln = studentFromState?.lastName?.trim();
    return [fn, ln].filter(Boolean).join(" ") || studentId;
  }, [studentFromState, studentId]);

  // ✅ Ahora linked es REL: { institution, startDate, endDate }
  const [linked, setLinked] = useState([]);
  const [all, setAll] = useState([]);

  const [institutionId, setInstitutionId] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      setLoading(true);

      const [linkedRes, allRes] = await Promise.all([
        InstitutionsService.listByStudent(studentId),
        InstitutionsService.list({ limit: 200, skip: 0 }),
      ]);

      // linkedRes -> array de RELS
      const linkedList = normalizeList(linkedRes?.data);
      const allList = normalizeList(allRes?.data);

      setLinked(linkedList);
      setAll(allList);
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || "No se pudo cargar.");
      setLinked([]);
      setAll([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  // ✅ IDs de instituciones asociadas ahora viven en rel.institution._id
  const linkedIds = useMemo(() => {
    return new Set(
      (linked ?? [])
        .map((rel) => rel?.institution?._id ?? rel?.institution?.id)
        .filter(Boolean)
    );
  }, [linked]);

  // ✅ disponibles = todas menos las ya asociadas
  const available = useMemo(() => {
    return (all ?? []).filter((inst) => !linkedIds.has(inst?._id ?? inst?.id));
  }, [all, linkedIds]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!institutionId) return setError("Seleccioná una institución.");
    if (!start) return setError("Seleccioná fecha de inicio (start).");

    try {
      setSaving(true);
      setError("");

      await StudentsService.linkInstitution(studentId, {
        institution_id: institutionId,
        start,
        end: end || undefined,
      });

      setInstitutionId("");
      setStart("");
      setEnd("");
      await load();
    } catch (e2) {
      setError(
        e2?.response?.data?.detail ||
        e2?.response?.data?.message ||
        e2?.message ||
        "No se pudo asociar."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="pageHeaderRow">
        <div>
          <h1 className="pageTitle">Instituciones del alumno</h1>
          <div className="mutedText">
            Alumno: <b>{studentLabel}</b>
          </div>
        </div>

        <div className="actions">
          <button className="btn" type="button" onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>
      </div>

      {error && <p className="errorText">{error}</p>}

      <div className="card" style={{ marginBottom: 14 }}>
        <h3 style={{ marginTop: 0 }}>Asociadas</h3>

        {loading ? (
          <p>Cargando...</p>
        ) : linked.length === 0 ? (
          <p className="mutedText">No hay instituciones asociadas.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th className="th">Nombre</th>
                <th className="th">País</th>
                <th className="th">Dirección</th>
                <th className="th">Start</th>
                <th className="th">End</th>
              </tr>
            </thead>
            <tbody>
              {linked.map((rel) => {
                const inst = rel?.institution || {};
                return (
                  <tr key={inst._id ?? inst.id} className="tr">
                    <td className="td">{inst.name ?? "-"}</td>
                    <td className="td">{inst.country ?? "-"}</td>
                    <td className="td">{inst.address ?? "-"}</td>
                    <td className="td">{rel?.startDate ?? "-"}</td>
                    <td className="td">{rel?.endDate ?? "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Asociar nueva</h3>

        <form className="form" onSubmit={onSubmit}>
          <label className="label">
            Institución
            <select
              className="input"
              value={institutionId}
              onChange={(e) => setInstitutionId(e.target.value)}
              disabled={loading}
            >
              <option value="">{loading ? "Cargando..." : "Seleccionar"}</option>
              {available.map((i) => (
                <option key={i._id ?? i.id} value={i._id ?? i.id}>
                  {i.name ?? "(Sin nombre)"}
                </option>
              ))}
            </select>
          </label>

          <label className="label">
            Start
            <input
              className="input"
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>

          <label className="label">
            End (opcional)
            <input
              className="input"
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>

          <div className="actions">
            <button className="btn btnPrimary" disabled={saving}>
              {saving ? "Guardando..." : "Asociar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}