import { useEffect, useMemo, useState } from "react";
import { InstitutionsService } from "../../services/institutions.service";
import { SubjectsService } from "../../services/subjects.service";
import { EquivalencesService } from "../../services/equivalences.service";
import { LEVELS } from "../../constants/levels";
import "../../styles/ui.css";

export default function ConsultarMaterias() {
  const [institutions, setInstitutions] = useState([]);
  const [institutionId, setInstitutionId] = useState("");
  const [items, setItems] = useState([]);

  // ✅ NUEVO: todas las materias de todas las instituciones
  const [allSubjects, setAllSubjects] = useState([]);
  const [loadingAllSubs, setLoadingAllSubs] = useState(false);

  const [loadingInst, setLoadingInst] = useState(true);
  const [loadingSubs, setLoadingSubs] = useState(false);

  const [error, setError] = useState("");

  // levelStage (global)
  const [levelStage, setLevelStage] = useState("19");

  // desplegable
  const [expandedId, setExpandedId] = useState(null);

  // cache equivalencias: key = `${subjectId}|${levelStage}`
  const [equivCache, setEquivCache] = useState({});
  const [equivLoadingKey, setEquivLoadingKey] = useState("");
  const [equivError, setEquivError] = useState("");

  // select para agregar equivalencia
  const [toSubjectId, setToSubjectId] = useState("");

  // ✅ NUEVO: toast
  const [toast, setToast] = useState("");

  function showToast(msg) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 1800);
  }

  // ✅ NUEVO: helper para invalidar cache
  function invalidateEquiv(subjectId) {
    if (!subjectId) return;
    const key = `${subjectId}|${levelStage}`;
    setEquivCache((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  }

  // ✅ NUEVO: map de idInstitucion -> nombre (para el select global)
  const instNameById = useMemo(() => {
    const m = new Map();
    institutions.forEach((i) => {
      const id = i._id ?? i.id;
      const name = i.name ?? i.nombre ?? "";
      if (id) m.set(id, name);
    });
    return m;
  }, [institutions]);

  async function loadAllSubjects(allInstitutions) {
    try {
      setLoadingAllSubs(true);

      const responses = await Promise.all(
        allInstitutions.map((inst) => {
          const id = inst._id ?? inst.id;
          return SubjectsService.listByInstitution(id);
        })
      );

      const merged = responses
        .flatMap((r) =>
          Array.isArray(r.data) ? r.data : (r.data?.items ?? [])
        )
        .map((s) => ({
          id: s.id ?? s._id,
          name: s.name ?? s.nombre ?? "-",
          institutionMongoId: s.institutionMongoId,
        }))
        .filter((s) => s.id);

      setAllSubjects(merged);
    } catch (e) {
      console.error("No se pudieron cargar todas las materias", e);
      setAllSubjects([]);
    } finally {
      setLoadingAllSubs(false);
    }
  }

  async function loadInstitutions() {
    try {
      setError("");
      setLoadingInst(true);

      const res = await InstitutionsService.list({ limit: 200, skip: 0 });
      const data = res.data;
      const list = Array.isArray(data) ? data : data?.items ?? [];

      setInstitutions(list);

      // ✅ cargar todas las materias (todas las instituciones)
      await loadAllSubjects(list);

      // auto-select la primera
      const firstId = list?.[0]?._id ?? list?.[0]?.id ?? "";
      setInstitutionId(firstId);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "No se pudieron cargar las instituciones."
      );
      setInstitutions([]);
      setInstitutionId("");
      setAllSubjects([]);
    } finally {
      setLoadingInst(false);
    }
  }

  async function loadSubjectsFor(institutionMongoId) {
    if (!institutionMongoId) {
      setItems([]);
      return;
    }

    try {
      setError("");
      setLoadingSubs(true);

      const res = await SubjectsService.listByInstitution(institutionMongoId);
      const data = res.data;
      const list = Array.isArray(data) ? data : data?.items ?? [];

      setItems(list);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "No se pudieron cargar las materias."
      );
      setItems([]);
    } finally {
      setLoadingSubs(false);
    }
  }

  useEffect(() => {
    loadInstitutions();
  }, []);

  useEffect(() => {
    loadSubjectsFor(institutionId);

    // cuando cambia institución, cerramos panel y reseteamos equivalencias UI
    setExpandedId(null);
    setToSubjectId("");
    setEquivError("");
  }, [institutionId]);

  useEffect(() => {
    // cuando cambia levelStage, cerramos panel (para evitar confusión)
    setExpandedId(null);
    setToSubjectId("");
    setEquivError("");
  }, [levelStage]);

  // ✅ ahora el select usa TODAS las materias del sistema (no solo items)
  const optionsForAdd = useMemo(() => {
    if (!expandedId) return [];
    return allSubjects.filter((s) => s.id !== expandedId);
  }, [allSubjects, expandedId]);

  async function loadEquivalences(subjectId) {
    setEquivError("");
    const key = `${subjectId}|${levelStage}`;

    if (equivCache[key]) return;

    try {
      setEquivLoadingKey(key);
      const res = await EquivalencesService.get(subjectId, levelStage);
      setEquivCache((prev) => ({ ...prev, [key]: res.data }));
    } catch (err) {
      setEquivError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "No se pudieron cargar equivalencias."
      );
    } finally {
      setEquivLoadingKey("");
    }
  }

  async function toggleRow(subjectId) {
    if (expandedId === subjectId) {
      setExpandedId(null);
      setToSubjectId("");
      setEquivError("");
      return;
    }
    setExpandedId(subjectId);
    setToSubjectId("");
    await loadEquivalences(subjectId);
  }

  function getOthersEquivalences(subjectId) {
    const key = `${subjectId}|${levelStage}`;
    const data = equivCache[key];
    const list = data?.equivalences ?? [];
    return list.filter((x) => x.id !== subjectId);
  }

  async function onAddEquivalence(fromId) {
    setEquivError("");

    if (!toSubjectId) return setEquivError("Elegí una materia para agregar.");
    if (toSubjectId === fromId)
      return setEquivError("No podés equivalerla consigo misma.");

    // evitar duplicados (UI)
    const current = getOthersEquivalences(fromId);
    if (current.some((x) => x.id === toSubjectId)) {
      return setEquivError("Esa equivalencia ya existe para este levelStage.");
    }

    try {
      await EquivalencesService.create({
        fromSubjectId: fromId,
        toSubjectId,
        levelStage,
      });

      // ✅ refresh real:
      // invalidar cache de ambos (from y to) para que se refleje sin recargar página
      invalidateEquiv(fromId);
      invalidateEquiv(toSubjectId);

      // recargar panel abierto
      await loadEquivalences(fromId);

      setToSubjectId("");
      showToast("Equivalencia actualizada ✅");
    } catch (err) {
      setEquivError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "No se pudo crear la equivalencia."
      );
    }
  }

  async function onRemoveFromCycle(subjectId) {
    setEquivError("");
    try {
      await EquivalencesService.remove(subjectId, levelStage);

      // ✅ refresh real:
      invalidateEquiv(subjectId);
      await loadEquivalences(subjectId);

      showToast("Materia quitada del ciclo ✅");
    } catch (err) {
      setEquivError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "No se pudo quitar del ciclo."
      );
    }
  }

  return (
    <div className="page">
      <h1 className="pageTitle">Materias</h1>

      {/* ✅ Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(0,0,0,0.75)",
            color: "#fff",
            zIndex: 9999,
            fontSize: 14,
          }}
        >
          {toast}
        </div>
      )}

      {error && <p className="errorText">{error}</p>}
      {equivError && <p className="errorText">{equivError}</p>}

      <div className="card" style={{ marginBottom: 12 }}>
        {loadingInst ? (
          <p>Cargando instituciones...</p>
        ) : (
          <>
            <label className="label">
              Institución
              <select
                className="input"
                value={institutionId}
                onChange={(e) => setInstitutionId(e.target.value)}
              >
                {institutions.map((inst) => {
                  const id = inst._id ?? inst.id;
                  const name = inst.name ?? inst.nombre ?? id;
                  return (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </label>

            <label className="label">
              Nivel (levelStage)
              <select
                className="input"
                value={levelStage}
                onChange={(e) => setLevelStage(e.target.value)}
              >
                {LEVELS.map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>
                    {lvl.label}
                  </option>
                ))}
              </select>
            </label>

            {/* opcional, info de carga global */}
            {loadingAllSubs && (
              <p style={{ margin: "8px 0 0", opacity: 0.8 }}>
                Cargando materias globales...
              </p>
            )}
          </>
        )}
      </div>

      <div className="card">
        {loadingSubs ? (
          <p>Cargando materias...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th className="th" style={{ width: 48 }}></th>
                <th className="th">Nombre</th>
              </tr>
            </thead>

            <tbody>
              {items.map((m) => {
                const subjectId = m.id ?? m._id;
                const name = m.name ?? m.nombre ?? "-";
                const open = expandedId === subjectId;

                const key = `${subjectId}|${levelStage}`;
                const isLoadingEquiv = equivLoadingKey === key;

                const others = open ? getOthersEquivalences(subjectId) : [];

                return (
                  <FragmentRow
                    key={subjectId}
                    subjectId={subjectId}
                    name={name}
                    open={open}
                    onToggle={() => toggleRow(subjectId)}
                    isLoadingEquiv={isLoadingEquiv}
                    others={others}
                    optionsForAdd={optionsForAdd}
                    toSubjectId={toSubjectId}
                    setToSubjectId={setToSubjectId}
                    onAdd={() => onAddEquivalence(subjectId)}
                    onRemove={() => onRemoveFromCycle(subjectId)}
                    instNameById={instNameById}
                  />
                );
              })}

              {items.length === 0 && (
                <tr>
                  <td className="td emptyRow" colSpan={2}>
                    Sin materias para esta institución.
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

// --- Componente interno para no ensuciar el render ---
function FragmentRow({
  subjectId,
  name,
  open,
  onToggle,
  isLoadingEquiv,
  others,
  optionsForAdd,
  toSubjectId,
  setToSubjectId,
  onAdd,
  onRemove,
  instNameById,
}) {
  return (
    <>
      <tr className="tr" onClick={onToggle} style={{ cursor: "pointer" }}>
        <td className="td" style={{ textAlign: "center", opacity: 0.9 }}>
          {open ? "▼" : "▶"}
        </td>
        <td className="td">{name}</td>
      </tr>

      {open && (
        <tr className="tr">
          <td className="td" colSpan={2}>
            {isLoadingEquiv ? (
              <p style={{ margin: 0 }}>Cargando equivalencias...</p>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    alignItems: "end",
                  }}
                >
                  <label className="label" style={{ flex: "1 1 320px" }}>
                    Agregar equivalencia con:
                    <select
                      className="input"
                      value={toSubjectId}
                      onChange={(e) => setToSubjectId(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="">Seleccioná una materia</option>

                      {optionsForAdd.map((opt) => {
                        const id = opt.id ?? opt._id;
                        const nm = opt.name ?? opt.nombre ?? id;
                        const instName =
                          instNameById.get(opt.institutionMongoId) ||
                          opt.institutionMongoId ||
                          "";
                        return (
                          <option key={id} value={id}>
                            {nm} {instName ? `— ${instName}` : ""}
                          </option>
                        );
                      })}
                    </select>
                  </label>

                  <button
                    className="btn btnPrimary"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAdd();
                    }}
                  >
                    Agregar
                  </button>

                  <button
                    className="btn"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove();
                    }}
                    title="Saca esta materia del ciclo de equivalencias (si existe)"
                  >
                    Quitar del ciclo
                  </button>
                </div>

                <div>
                  <div style={{ opacity: 0.85, marginBottom: 6 }}>
                    Equivalencias ({others.length})
                  </div>

                  {others.length === 0 ? (
                    <p style={{ margin: 0, opacity: 0.75 }}>
                      No tiene equivalencias para este levelStage.
                    </p>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {others.map((eq) => (
                        <li key={eq.id} style={{ margin: "6px 0" }}>
                          {eq.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}