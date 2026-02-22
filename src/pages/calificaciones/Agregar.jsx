import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../../styles/ui.css";
import { InstitutionsService } from "../../services/institutions.service";
import { SubjectsService } from "../../services/subjects.service";

function uid() {
  return Math.random().toString(16).slice(2);
}

export default function Agregar() {
  const { id: studentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const studentFromState = location.state?.student;
  const studentLabel = useMemo(() => {
    const fn = studentFromState?.firstName?.trim();
    const ln = studentFromState?.lastName?.trim();
    return [fn, ln].filter(Boolean).join(" ") || studentId;
  }, [studentFromState, studentId]);

  const [year, setYear] = useState(new Date().getFullYear());

  // ✅ instituciones (solo las asociadas al alumno)
  const [institutions, setInstitutions] = useState([]);
  const [institutionId, setInstitutionId] = useState("");
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);

  // ✅ materias según institución
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // ✅ evaluaciones dinámicas
  const [assessments, setAssessments] = useState([
    { id: uid(), name: "Examen 1", grade: "", date: "" },
  ]);

  const [finalGrade, setFinalGrade] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 1) cargar instituciones del alumno
  useEffect(() => {
    let alive = true;

    async function loadInstitutions() {
      try {
        setError("");
        setLoadingInstitutions(true);

        const res = await InstitutionsService.listByStudent(studentId);
        const list = res?.data ?? [];

        if (!alive) return;
        setInstitutions(Array.isArray(list) ? list : list?.items ?? []);
      } catch (e) {
        if (!alive) return;
        setInstitutions([]);
        setError(
          e?.response?.data?.detail ||
            e?.response?.data?.message ||
            e?.message ||
            "No se pudieron cargar las instituciones del alumno."
        );
      } finally {
        if (alive) setLoadingInstitutions(false);
      }
    }

    if (studentId) loadInstitutions();

    return () => {
      alive = false;
    };
  }, [studentId]);

  // 2) cargar materias cuando elijo institución
  useEffect(() => {
    let alive = true;

    async function loadSubjects() {
      if (!institutionId) {
        setSubjects([]);
        setSubjectId("");
        return;
      }

      try {
        setError("");
        setLoadingSubjects(true);

        // GET /api/institutions/{institutionMongoId}/subjects
        const res = await SubjectsService.listByInstitution(institutionId);
        const list = res?.data ?? [];

        if (!alive) return;
        setSubjects(Array.isArray(list) ? list : list?.items ?? []);
        setSubjectId("");
      } catch (e) {
        if (!alive) return;
        setSubjects([]);
        setSubjectId("");
        setError(
          e?.response?.data?.detail ||
            e?.response?.data?.message ||
            e?.message ||
            "No se pudieron cargar las materias."
        );
      } finally {
        if (alive) setLoadingSubjects(false);
      }
    }

    loadSubjects();
    return () => {
      alive = false;
    };
  }, [institutionId]);

  function addAssessment() {
    setAssessments((prev) => {
      const n = prev.length + 1;
      return [...prev, { id: uid(), name: `Examen ${n}`, grade: "", date: "" }];
    });
  }

  function removeAssessment(aid) {
    setAssessments((prev) => prev.filter((x) => x.id !== aid));
  }

  function updateAssessment(aid, patch) {
    setAssessments((prev) =>
      prev.map((x) => (x.id === aid ? { ...x, ...patch } : x))
    );
  }

  function onSubmit(e) {
    e.preventDefault();

    if (!studentId) return setError("Falta studentId en la URL.");
    if (!institutionId) return setError("Seleccioná una institución.");
    if (!subjectId) return setError("Seleccioná una materia.");

    // demo payload (después lo conectamos al POST real)
    const payload = {
      studentId,
      year,
      institutionId,
      subjectId,
      assessments: assessments
        .map((a) => ({
          name: String(a.name || "").trim(),
          grade: String(a.grade || "").trim(),
          date: a.date || null,
        }))
        .filter((a) => a.name),
      finalGrade: String(finalGrade || "").trim(),
    };

    setSaving(true);
    setError("");

    // ✅ Demo: luego reemplazamos por POST real
    setTimeout(() => {
      alert("Demo: guardar nota\n" + JSON.stringify(payload, null, 2));

      setSaving(false);

      // volver al historial
      navigate(`/estudiantes/${studentId}/historial`, {
        state: { student: studentFromState },
      });
    }, 200);
  }

  return (
    <div className="page">
      <div className="pageHeaderRow">
        <div>
          <h1 className="pageTitle">Agregar nota</h1>
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

      <div className="card">
        <form className="form" onSubmit={onSubmit}>
          <label className="label">
            Año
            <input
              className="input"
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </label>

          <label className="label">
            Institución (solo asociadas)
            <select
              className="input"
              value={institutionId}
              onChange={(e) => setInstitutionId(e.target.value)}
              disabled={loadingInstitutions}
            >
              <option value="">
                {loadingInstitutions
                  ? "Cargando..."
                  : institutions.length === 0
                  ? "Este alumno no tiene instituciones asociadas"
                  : "Seleccionar institución"}
              </option>

              {institutions.map((i) => (
                <option key={i._id ?? i.id} value={i._id ?? i.id}>
                  {i.name ?? i.nombre ?? "(Sin nombre)"}
                </option>
              ))}
            </select>
          </label>

          <label className="label">
            Materia (según institución)
            <select
              className="input"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              disabled={!institutionId || loadingSubjects}
            >
              <option value="">
                {!institutionId
                  ? "Elegí una institución primero"
                  : loadingSubjects
                  ? "Cargando..."
                  : subjects.length === 0
                  ? "No hay materias para esta institución"
                  : "Seleccionar materia"}
              </option>

              {subjects.map((s) => (
                <option key={s._id ?? s.id} value={s._id ?? s.id}>
                  {s.name ?? s.nombre ?? "(Sin nombre)"}
                </option>
              ))}
            </select>
          </label>

          <div style={{ marginTop: 10 }}>
            <div className="detailsLabel" style={{ marginBottom: 8 }}>
              Evaluaciones
            </div>

            {assessments.map((a, idx) => (
              <div
                key={a.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 0.5fr 0.8fr auto",
                  gap: 10,
                  alignItems: "end",
                  marginBottom: 10,
                }}
              >
                <label className="label" style={{ marginBottom: 0 }}>
                  Instancia
                  <input
                    className="input"
                    value={a.name}
                    onChange={(e) =>
                      updateAssessment(a.id, { name: e.target.value })
                    }
                    placeholder={`Examen ${idx + 1}`}
                  />
                </label>

                <label className="label" style={{ marginBottom: 0 }}>
                  Nota
                  <input
                    className="input"
                    value={a.grade}
                    onChange={(e) =>
                      updateAssessment(a.id, { grade: e.target.value })
                    }
                    placeholder="Ej: 8"
                  />
                </label>

                <label className="label" style={{ marginBottom: 0 }}>
                  Fecha
                  <input
                    className="input"
                    type="date"
                    value={a.date}
                    onChange={(e) =>
                      updateAssessment(a.id, { date: e.target.value })
                    }
                  />
                </label>

                <button
                  className="btn"
                  type="button"
                  onClick={() => removeAssessment(a.id)}
                  disabled={assessments.length <= 1}
                  title={
                    assessments.length <= 1
                      ? "Debe haber al menos 1 evaluación"
                      : "Eliminar"
                  }
                >
                  ✕
                </button>
              </div>
            ))}

            <button className="btn" type="button" onClick={addAssessment}>
              + Agregar examen
            </button>
          </div>

          <label className="label" style={{ marginTop: 10 }}>
            Nota final
            <input
              className="input"
              value={finalGrade}
              onChange={(e) => setFinalGrade(e.target.value)}
              placeholder="Ej: 9"
            />
          </label>

          <div className="actions">
            <button className="btn btnPrimary" disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </button>

            <button
              className="btn"
              type="button"
              onClick={() => {
                setYear(new Date().getFullYear());
                setInstitutionId("");
                setSubjectId("");
                setAssessments([{ id: uid(), name: "Examen 1", grade: "", date: "" }]);
                setFinalGrade("");
                setError("");
              }}
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}