import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../../styles/ui.css";
import { InstitutionsService } from "../../services/institutions.service";
import { SubjectsService } from "../../services/subjects.service";
import { OptionsService } from "../../services/options.service";
import { StudentsService } from "../../services/students.service";
import { ExamServices } from "../../services/exams.service";

function uid() {
  return Math.random().toString(16).slice(2);
}

function toISODate(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseISODate(iso) {
  const [y, m, d] = String(iso || "").split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function normalizeList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

function makeInstance() {
  return {
    id: uid(),
    name: "",
    type: "",
    value: "",
    grade: "",
    system: "",
    date: "",
  };
}

function isTouched(it) {
  return Boolean(
    String(it?.name || "").trim() ||
    String(it?.type || "").trim() ||
    String(it?.value || "").trim() ||
    String(it?.grade || "").trim() ||
    String(it?.system || "").trim() ||
    String(it?.date || "").trim()
  );
}

function isRowComplete(r) {
  return Boolean(
    String(r?.name || "").trim() &&
    String(r?.type || "").trim() &&
    String(r?.value || "").trim() &&
    String(r?.grade || "").trim() &&
    String(r?.system || "").trim() &&
    String(r?.date || "").trim()
  );
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

  // instituciones rel
  const [institutionRels, setInstitutionRels] = useState([]);
  const [institutionId, setInstitutionId] = useState("");
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);

  // materias
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // inicio/fin materia
  const [subjectStart, setSubjectStart] = useState(""); // requerido
  const [subjectEnd, setSubjectEnd] = useState(""); // opcional

  // options
  const [gradeOptions, setGradeOptions] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(false);

  const [systemOptions, setSystemOptions] = useState([]);
  const [loadingSystems, setLoadingSystems] = useState(false);

  // filas
  const [instances, setInstances] = useState([makeInstance()]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const noInstitutions =
    !loadingInstitutions &&
    Array.isArray(institutionRels) &&
    institutionRels.length === 0;

  const selectedInstitutionRel = useMemo(() => {
    return (
      institutionRels.find((r) => r?.institution?._id === institutionId) || null
    );
  }, [institutionRels, institutionId]);

  const selectedInstitution = selectedInstitutionRel?.institution || null;
  const institutionCountry = selectedInstitution?.country || "";

  // límites por relación institución (para start/end de materia)
  const relMinDate = useMemo(() => selectedInstitutionRel?.startDate || "", [
    selectedInstitutionRel,
  ]);

  const relMaxDate = useMemo(
    () => selectedInstitutionRel?.endDate || toISODate(new Date()),
    [selectedInstitutionRel]
  );

  // “vara” para fechas en filas (exams)
  const examMinDate = subjectStart || "";
  const examMaxDate = subjectEnd || toISODate(new Date());

  // bloqueo si alguna fila está tocada
  const lockHeaderFields = useMemo(
    () => instances.some(isTouched),
    [instances]
  );

  // ✅ Guardar habilitado solo si:
  // - institutionId + subjectId + subjectStart
  // - existe al menos 1 fila completa
  const hasCompleteRow = useMemo(
    () => instances.some(isRowComplete),
    [instances]
  );

  const canSave = useMemo(() => {
    if (saving || noInstitutions) return false;
    if (!studentId) return false;
    if (!institutionId) return false;
    if (!subjectId) return false;
    if (!subjectStart) return false;
    return hasCompleteRow;
  }, [
    saving,
    noInstitutions,
    studentId,
    institutionId,
    subjectId,
    subjectStart,
    hasCompleteRow,
  ]);

  // 1) load institutions
  useEffect(() => {
    let alive = true;

    async function loadInstitutions() {
      try {
        setError("");
        setLoadingInstitutions(true);

        const res = await InstitutionsService.listByStudent(studentId);
        const list = normalizeList(res?.data);

        if (!alive) return;
        setInstitutionRels(list);

        if (list.length === 0) {
          setInstitutionId("");
          setSubjects([]);
          setSubjectId("");
          setSubjectStart("");
          setSubjectEnd("");
        }
      } catch (e) {
        if (!alive) return;
        setInstitutionRels([]);
        setInstitutionId("");
        setSubjects([]);
        setSubjectId("");
        setSubjectStart("");
        setSubjectEnd("");
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

  // 2) load subjects by institution
  useEffect(() => {
    let alive = true;

    async function loadSubjects() {
      if (!institutionId) {
        setSubjects([]);
        setSubjectId("");
        setSubjectStart("");
        setSubjectEnd("");
        return;
      }

      try {
        setError("");
        setLoadingSubjects(true);

        const res = await SubjectsService.listByInstitution(institutionId);
        const normalized = normalizeList(res?.data);

        if (!alive) return;

        const filtered = normalized.filter(
          (s) => !s.institutionMongoId || s.institutionMongoId === institutionId
        );

        setSubjects(filtered);
        setSubjectId("");
        setSubjectStart("");
        setSubjectEnd("");
      } catch (e) {
        if (!alive) return;
        setSubjects([]);
        setSubjectId("");
        setSubjectStart("");
        setSubjectEnd("");
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

  // 3) load grade options (object map)
  useEffect(() => {
    let alive = true;

    async function loadGrades() {
      try {
        setLoadingGrades(true);
        const res = await OptionsService.listGrade();
        if (!alive) return;

        const data = res?.data ?? {};
        const normalized = Object.entries(data).map(([key, label]) => ({
          value: String(key),
          label: String(label),
        }));
        normalized.sort((a, b) => Number(a.value) - Number(b.value));
        setGradeOptions(normalized);
      } catch (e) {
        if (!alive) return;
        setGradeOptions([]);
        setError(
          e?.response?.data?.detail ||
          e?.response?.data?.message ||
          e?.message ||
          "No se pudieron cargar las opciones de grade."
        );
      } finally {
        if (alive) setLoadingGrades(false);
      }
    }

    loadGrades();
    return () => {
      alive = false;
    };
  }, []);

  // 4) load systems by country
  useEffect(() => {
    let alive = true;

    async function loadSystems() {
      if (!institutionCountry) {
        setSystemOptions([]);
        setInstances((prev) => prev.map((x) => ({ ...x, system: "" })));
        return;
      }

      try {
        setLoadingSystems(true);
        const res = await OptionsService.listSystem();
        if (!alive) return;

        const data = res?.data ?? {};
        const arr = Array.isArray(data[institutionCountry])
          ? data[institutionCountry]
          : [];

        const normalized = arr.map((sys) => ({
          value: String(sys),
          label: String(sys),
        }));

        setSystemOptions(normalized);

        const allowed = new Set(normalized.map((x) => x.value));
        setInstances((prev) =>
          prev.map((x) =>
            x.system && !allowed.has(x.system) ? { ...x, system: "" } : x
          )
        );
      } catch (e) {
        if (!alive) return;
        setSystemOptions([]);
        setError(
          e?.response?.data?.detail ||
          e?.response?.data?.message ||
          e?.message ||
          "No se pudieron cargar las opciones de system."
        );
      } finally {
        if (alive) setLoadingSystems(false);
      }
    }

    loadSystems();
    return () => {
      alive = false;
    };
  }, [institutionCountry]);

  function addInstance() {
    setInstances((prev) => [...prev, makeInstance()]);
  }

  // X: elimina fila; si es la única, blanquea todo
  function removeInstance(iid) {
    setInstances((prev) => {
      if (prev.length <= 1) {
        setInstitutionId("");
        setSubjects([]);
        setSubjectId("");
        setSubjectStart("");
        setSubjectEnd("");
        setError("");
        return [makeInstance()];
      }
      return prev.filter((x) => x.id !== iid);
    });
  }

  function updateInstance(iid, patch) {
    setInstances((prev) =>
      prev.map((x) => (x.id === iid ? { ...x, ...patch } : x))
    );
  }

  function validateSubjectDates() {
    if (!subjectStart) return "Seleccioná el inicio de la materia.";

    const relMin = relMinDate ? parseISODate(relMinDate) : null;
    const relMax = relMaxDate ? parseISODate(relMaxDate) : null;

    const s = parseISODate(subjectStart);
    if (!s) return "Inicio de la materia inválido.";

    if (relMin && s < relMin)
      return "El inicio de la materia no puede ser anterior al inicio de la institución.";
    if (relMax && s > relMax)
      return "El inicio de la materia no puede ser posterior al fin de la institución.";

    if (subjectEnd) {
      const e = parseISODate(subjectEnd);
      if (!e) return "Fin de la materia inválido.";
      if (e < s) return "El fin de la materia no puede ser anterior al inicio.";

      if (relMin && e < relMin)
        return "El fin de la materia no puede ser anterior al inicio de la institución.";
      if (relMax && e > relMax)
        return "El fin de la materia no puede ser posterior al fin de la institución.";
    }

    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();

    if (!studentId) return setError("Falta studentId en la URL.");
    if (noInstitutions)
      return setError("No se puede asignar una nota sin una institución asociada.");
    if (!institutionId) return setError("Seleccioná una institución.");
    if (!subjectId) return setError("Seleccioná una materia.");

    const subjectDatesErr = validateSubjectDates();
    if (subjectDatesErr) return setError(subjectDatesErr);

    const country = institutionCountry || "";

    const cleaned = instances.map((x) => ({
      name: String(x.name || "").trim(),
      type: String(x.type || "").trim(),
      value: String(x.value || "").trim(),
      grade: String(x.grade || "").trim(),
      system: String(x.system || "").trim(),
      date: String(x.date || "").trim(),
    }));

    const firstInvalid = cleaned.find(
      (x) => !x.name || !x.type || !x.value || !x.grade || !x.system || !x.date
    );
    if (firstInvalid) {
      return setError(
        "Completá todos los campos de cada fila: name, type, value, grade, system y date."
      );
    }

    // validar fechas filas por rango de materia
    const min = examMinDate ? parseISODate(examMinDate) : null;
    const max = examMaxDate ? parseISODate(examMaxDate) : null;

    const outOfRange = cleaned.find((x) => {
      const d = parseISODate(x.date);
      if (!d) return true;
      if (min && d < min) return true;
      if (max && d > max) return true;
      return false;
    });

    if (outOfRange) {
      return setError("Hay fechas fuera del rango permitido por Inicio/Fin de la materia.");
    }

    setSaving(true);
    setError("");

    try {
      // 1) linkSubject por grade único
      const uniqueGrades = Array.from(new Set(cleaned.map((x) => x.grade)));
      for (const g of uniqueGrades) {
        console.log("Linking subject with grade =>", {
          studentId,
          subjectId,
          grade: g,
        });
        await StudentsService.linkSubject(studentId, {
          subject_id: subjectId,
          start: subjectStart,
          grade: g,
          end: subjectEnd || undefined,
        });
      }
      console.log(cleaned);
      for (const x of cleaned) {
        const payload = {
          subjectId,
          studentId,
          institutionId,
          name: x.name,
          system: x.system,   // 👈 acá debería ser ARG_1_10, etc.
          type: x.type,
          country,
          grade: x.grade,
          date: x.date,
          value: x.value,
        };

        console.log("createExam payload =>", payload);

        await ExamServices.createExam(payload);
      }

      navigate(`/estudiantes/${studentId}/historial`, {
        state: { student: studentFromState },
      });
    } catch (err) {
      console.error("SAVE ERROR =>", err);
      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        JSON.stringify(err?.response?.data || {}, null, 2) ||
        err?.message ||
        "No se pudo guardar. Intentá nuevamente."
      );
    } finally {
      setSaving(false);
    }
  }

  const disableAll = saving || noInstitutions;
  const disableHeader = disableAll || lockHeaderFields;

  return (
    <div className="page">
      <div className="pageHeaderRow">
        <div>
          <h1 className="pageTitle">Agregar nota</h1>
          <div className="mutedText" style={{ color: "#111" }}>
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

      {noInstitutions && (
        <div
          className="card"
          style={{
            marginBottom: 12,
            width: "100%",
            maxWidth: 1400,
            marginInline: "auto",
          }}
        >
          <p className="errorText" style={{ margin: 0 }}>
            No se puede asignar una nota sin una institución asociada. Asociá al
            alumno a una institución y volvé a intentar.
          </p>
        </div>
      )}

      <div
        className="card"
        style={{ width: "100%", maxWidth: 1600, margin: "0 auto" }}
      >
        <form className="form" onSubmit={onSubmit}>
          <label className="label">
            Institución (solo asociadas)
            <select
              className="input"
              value={institutionId}
              onChange={(e) => {
                setInstitutionId(e.target.value);
                setInstances((prev) =>
                  prev.map((x) => ({ ...x, system: "", date: "" }))
                );
                setSubjects([]);
                setSubjectId("");
                setSubjectStart("");
                setSubjectEnd("");
              }}
              disabled={loadingInstitutions || disableHeader}
            >
              <option value="">
                {loadingInstitutions
                  ? "Cargando..."
                  : noInstitutions
                    ? "Sin instituciones asociadas"
                    : "Seleccionar institución"}
              </option>

              {institutionRels.map((rel) => (
                <option
                  key={rel?.institution?._id}
                  value={rel?.institution?._id}
                >
                  {rel?.institution?.name ?? "(Sin nombre)"}
                </option>
              ))}
            </select>
          </label>

          <label className="label">
            Materia (según institución)
            <select
              className="input"
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setSubjectStart("");
                setSubjectEnd("");
              }}
              disabled={disableHeader || !institutionId || loadingSubjects}
            >
              <option value="">
                {noInstitutions
                  ? "No disponible sin institución"
                  : !institutionId
                    ? "Elegí una institución primero"
                    : loadingSubjects
                      ? "Cargando..."
                      : subjects.length === 0
                        ? "No hay materias para esta institución"
                        : "Seleccionar materia"}
              </option>

              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name ?? "(Sin nombre)"}
                </option>
              ))}
            </select>
          </label>

          {/* Inicio/Fin materia */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(240px, 1fr) minmax(240px, 1fr)",
              gap: 12,
              marginTop: 8,
            }}
          >
            <label className="label" style={{ marginBottom: 0 }}>
              Inicio de la materia
              <input
                className="input inputDate"
                type="date"
                value={subjectStart}
                onChange={(e) => setSubjectStart(e.target.value)}
                disabled={disableHeader || !subjectId}
                min={relMinDate || undefined}
                max={relMaxDate || undefined}
                style={{ width: "100%" }}
              />
            </label>

            <label className="label" style={{ marginBottom: 0 }}>
              Fin de la materia (opcional)
              <input
                className="input inputDate"
                type="date"
                value={subjectEnd}
                onChange={(e) => setSubjectEnd(e.target.value)}
                disabled={disableHeader || !subjectId}
                min={subjectStart || relMinDate || undefined}
                max={relMaxDate || undefined}
                style={{ width: "100%" }}
              />
            </label>
          </div>

          <div style={{ marginTop: 14, overflowX: "auto" }}>
            <div className="detailsLabel" style={{ marginBottom: 8 }}>
              Instancias
            </div>

            {instances.map((it, idx) => (
              <div
                key={it.id}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "minmax(240px, 2.2fr) minmax(200px, 1.6fr) minmax(140px, 1fr) minmax(240px, 1.8fr) minmax(220px, 1.6fr) minmax(200px, 1.4fr) auto",
                  gap: 12,
                  alignItems: "end",
                  marginBottom: 12,
                  opacity: disableAll ? 0.6 : 1,
                  minWidth: 1150,
                }}
              >
                <label className="label" style={{ marginBottom: 0 }}>
                  Nombre
                  <input
                    className="input"
                    value={it.name}
                    onChange={(e) =>
                      updateInstance(it.id, { name: e.target.value })
                    }
                    placeholder={`Instancia ${idx + 1}`}
                    disabled={disableAll}
                    style={{ width: "100%" }}
                  />
                </label>

                <label className="label" style={{ marginBottom: 0 }}>
                  Tipo
                  <input
                    className="input"
                    value={it.type}
                    onChange={(e) =>
                      updateInstance(it.id, { type: e.target.value })
                    }
                    placeholder="Ej: PRESENTACION"
                    disabled={disableAll}
                    style={{ width: "100%" }}
                  />
                </label>

                <label className="label" style={{ marginBottom: 0 }}>
                  Value
                  <input
                    className="input"
                    value={it.value}
                    onChange={(e) =>
                      updateInstance(it.id, { value: e.target.value })
                    }
                    placeholder="Ej: 10"
                    disabled={disableAll}
                    style={{ width: "100%" }}
                  />
                </label>

                <label className="label" style={{ marginBottom: 0 }}>
                  Grade
                  <select
                    className="input"
                    value={it.grade}
                    onChange={(e) =>
                      updateInstance(it.id, { grade: e.target.value })
                    }
                    disabled={
                      disableAll || loadingGrades || gradeOptions.length === 0
                    }
                    style={{ width: "100%" }}
                  >
                    <option value="">
                      {loadingGrades
                        ? "Cargando..."
                        : gradeOptions.length === 0
                          ? "Sin opciones"
                          : "Seleccionar"}
                    </option>
                    {gradeOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="label" style={{ marginBottom: 0 }}>
                  System
                  <select
                    className="input"
                    value={it.system}
                    onChange={(e) =>
                      updateInstance(it.id, { system: e.target.value })
                    }
                    disabled={
                      disableAll ||
                      !institutionId ||
                      loadingSystems ||
                      systemOptions.length === 0
                    }
                    style={{ width: "100%" }}
                  >
                    <option value="">
                      {!institutionId
                        ? "Elegí institución"
                        : loadingSystems
                          ? "Cargando..."
                          : systemOptions.length === 0
                            ? "Sin opciones"
                            : "Seleccionar"}
                    </option>
                    {systemOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="label" style={{ marginBottom: 0 }}>
                  Fecha
                  <input
                    className="input inputDate"
                    type="date"
                    value={it.date}
                    onChange={(e) =>
                      updateInstance(it.id, { date: e.target.value })
                    }
                    disabled={disableAll || !subjectStart}
                    min={examMinDate || undefined}
                    max={examMaxDate || undefined}
                    style={{ width: "100%" }}
                  />
                </label>

                <button
                  className="btn"
                  type="button"
                  onClick={() => removeInstance(it.id)}
                  disabled={disableAll}
                  title={instances.length <= 1 ? "Blanquea todo" : "Eliminar fila"}
                  style={{ height: 40 }}
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              className="btn"
              type="button"
              onClick={addInstance}
              disabled={disableAll}
            >
              + Agregar fila
            </button>
          </div>

          <div className="actions" style={{ marginTop: 12 }}>
            <button
              className="btn btnPrimary"
              disabled={!canSave}
              title={
                !canSave
                  ? "Completá al menos 1 fila para habilitar Guardar"
                  : undefined
              }
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>

            <button
              className="btn"
              type="button"
              disabled={saving}
              onClick={() => {
                setInstitutionId("");
                setSubjectId("");
                setSubjects([]);
                setSubjectStart("");
                setSubjectEnd("");
                setInstances([makeInstance()]);
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