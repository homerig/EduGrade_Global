// src/pages/estudiantes/Historial.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import "../../styles/ui.css";
import { COUNTRIES } from "../../constants/countries";
import { HistoryService } from "../../services/history.service";
import { ExamServices } from "../../services/exams.service";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function HistorialAcademico() {
  const { id } = useParams();
  const location = useLocation();

  // ✅ Si venís desde la tabla, recibís nombre y apellido por state
  const studentFromState = location.state?.student;
  const studentName = useMemo(() => {
    const fn = studentFromState?.firstName?.trim();
    const ln = studentFromState?.lastName?.trim();
    const full = [fn, ln].filter(Boolean).join(" ");
    return full || null;
  }, [studentFromState]);

  // ✅ selector: ORIGINAL + sistemas (system code)
  // system ahora vale: "ORIGINAL" | "ARG_1_10" | "USA_GPA_0_4" | "DEU_1_6_INVERTED" | "ZA" | etc.
  const [system, setSystem] = useState("ORIGINAL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [history, setHistory] = useState(null);

  const [openKey, setOpenKey] = useState(null);
  const [examsByKey, setExamsByKey] = useState({});

  // Meta del sistema seleccionado (flag/label)
  const selectedCountryMeta = useMemo(() => {
    if (system === "ORIGINAL") return null;
    return COUNTRIES.find((x) => x.system === system) ?? null;
  }, [system]);

  // ✅ targetSystem REAL para backend:
  // - ORIGINAL => no se manda
  // - resto => system code (ARG_1_10 / DEU_... / ZA / etc.)
  const targetSystem = useMemo(() => {
    if (system === "ORIGINAL") return null;
    return system;
  }, [system]);

  // 1) Cargar history real (servicio)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setError("");
        setLoading(true);

        console.log("[HISTORY] load studentId:", id);
        const res = await HistoryService.get(id);
        console.log("[HISTORY] response:", res?.data);

        if (!alive) return;
        setHistory(res?.data ?? null);
      } catch (err) {
        if (!alive) return;

        console.log("[HISTORY] error:", err);

        const msg =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "No se pudo cargar el historial.";

        setError(msg);
        setHistory(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  // 2) Cambio de sistema => limpiar cache + cerrar materia
  useEffect(() => {
    setExamsByKey({});
    setOpenKey(null);
  }, [system]);

  // Normalizar years
  const years = useMemo(() => {
    const arr = history?.years;
    return Array.isArray(arr) ? arr.slice().sort((a, b) => (b.year ?? 0) - (a.year ?? 0)) : [];
  }, [history]);

  // 3) Abrir materia => pedir exams si no está cacheado
  async function onToggleSubject({ key, subject, institutionId }) {
    const isOpen = openKey === key;
    if (isOpen) {
      setOpenKey(null);
      return;
    }

    setOpenKey(key);

    if (examsByKey[key]?.data || examsByKey[key]?.loading) return;

    const fromDate = subject.fromDate;
    const toDate = subject.toDate ?? todayISO();

    setExamsByKey((prev) => ({
      ...prev,
      [key]: { loading: true, error: "", data: null },
    }));

    try {
      const params = {
        studentId: id,
        subjectId: subject.subjectId,
        institutionId,
        fromDate,
        toDate,
        ...(targetSystem ? { targetSystem } : {}), // ✅ system code o nada
      };

      console.log("[EXAMS] request params:", params);

      const res = await ExamServices.list(params);
      const data = res?.data;

      console.log("[EXAMS] response:", data);

      setExamsByKey((prev) => ({
        ...prev,
        [key]: {
          loading: false,
          error: "",
          data: Array.isArray(data) ? data : [],
        },
      }));
    } catch (err) {
      console.log("[EXAMS] error:", err);

      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Error al cargar exámenes.";

      setExamsByKey((prev) => ({
        ...prev,
        [key]: { loading: false, error: msg, data: [] },
      }));
    }
  }

  return (
    <div className="page">
      <div className="pageHeaderRow">
        <div>
          <h1 className="pageTitle">Historial académico</h1>

          <div className="mutedText">
            Alumno: <b>{studentName ?? id}</b>
          </div>
        </div>

        {/* selector arriba derecha: ORIGINAL + sistemas */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
          <div className="countryPill">
            <div className="countryLeft">
              {selectedCountryMeta?.flag && (
                <img className="countryFlag" src={selectedCountryMeta.flag} alt={selectedCountryMeta.label} />
              )}
            </div>

            <select
              className="countrySelect"
              value={system}
              onChange={(e) => setSystem(e.target.value)}
              aria-label="Seleccionar sistema de notas"
            >
              <option value="ORIGINAL">Original (sin conversión)</option>

              {COUNTRIES.map((c) => (
                <option key={c.system} value={c.system}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && <p className="errorText">{error}</p>}

      {loading ? (
        <div className="card">
          <p>Cargando...</p>
        </div>
      ) : years.length === 0 ? (
        <div className="card">
          <p>Sin historial académico cargado.</p>
        </div>
      ) : (
        <div className="academicBoard">
          {years.map((y) => (
            <div key={y.year} className="yearSection">
              <div className="yearBox">{y.year}</div>

              <div className="yearRight">
                {(y.institutions ?? []).map((inst) => (
                  <div key={inst.institutionId} style={{ marginBottom: 14 }}>
                    <div className="institutionName" style={{ marginBottom: 8 }}>
                      {inst.name}
                    </div>

                    {(inst.subjects ?? []).length === 0 ? (
                      <div className="mutedText">Sin materias cargadas en este año.</div>
                    ) : (
                      (inst.subjects ?? []).map((subj) => {
                        const fromDate = subj.fromDate;
                        const toDateKey = subj.toDate ?? "OPEN";
                        const key = `${y.year}|${inst.institutionId}|${subj.subjectId}|${fromDate}|${toDateKey}|${system}`;
                        const isOpen = openKey === key;
                        const examsState = examsByKey[key];

                        return (
                          <div key={key}>
                            <div className="subjectRow">
                              <button
                                type="button"
                                className="subjectToggle"
                                onClick={() =>
                                  onToggleSubject({
                                    key,
                                    subject: subj,
                                    institutionId: inst.institutionId,
                                  })
                                }
                                title={isOpen ? "Ocultar detalles" : "Ver detalles"}
                              >
                                <span className="subjectName">{subj.name}</span>
                                <span className="rowChevron" aria-hidden="true">
                                  {isOpen ? "▴" : "▾"}
                                </span>
                              </button>

                              <div className="mutedText" style={{ justifySelf: "end" }}>
                                {subj.fromDate} → {subj.toDate ?? "Actual"}
                              </div>

                              <div />
                            </div>

                            {isOpen && (
                              <div className="subjectDetails">
                                <div className="detailsGrid">
                                  <div>
                                    <div className="detailsLabel">Sistema</div>
                                    <div className="detailsValue">
                                      {system === "ORIGINAL" ? "Original" : selectedCountryMeta?.label ?? system}
                                    </div>
                                  </div>

                                  <div>
                                    <div className="detailsLabel">Período</div>
                                    <div className="detailsValue">
                                      {subj.fromDate} → {subj.toDate ?? todayISO()}
                                    </div>
                                  </div>
                                </div>

                                <div className="detailsLabel" style={{ marginTop: 10 }}>
                                  Evaluaciones
                                </div>

                                {examsState?.loading ? (
                                  <div className="detailsValue">Cargando evaluaciones...</div>
                                ) : examsState?.error ? (
                                  <div className="detailsValue" style={{ color: "var(--danger, #c00)" }}>
                                    {examsState.error}
                                  </div>
                                ) : (examsState?.data ?? []).length === 0 ? (
                                  <div className="detailsValue">Sin evaluaciones registradas.</div>
                                ) : (
                                  <table className="detailsTable">
                                    <thead>
                                      <tr>
                                        <th>Instancia</th>
                                        <th>Nota</th>
                                        <th>Fecha</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {examsState.data.map((ex, i) => (
                                        <tr key={ex.id ?? ex._id ?? `${subj.subjectId}-${i}`}>
                                          <td>{ex.stage ?? ex.name ?? ex.type ?? "—"}</td>

                                          {/* ✅ si el backend devuelve displayValue, usalo */}
                                          <td>{ex.displayValue ?? ex.value ?? ex.score ?? "—"}</td>

                                          <td>{ex.date ?? ex.takenAt ?? ex.createdAt ?? "—"}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}