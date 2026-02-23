import { useEffect, useMemo, useState } from "react";
import "../../styles/ui.css";
import { DashboardServices } from "../../services/dashboard.services";
import { OptionsService } from "../../services/options.service";
import { InstitutionsService } from "../../services/institutions.service";

function normalizeCountriesPayload(payload) {
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

function normalizeList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

function parseMaxFromDisplaySystem(displaySystem) {
  // ejemplo: "ARG_1_10" -> 10
  const s = String(displaySystem ?? "");
  const parts = s.split("_");
  const maybeMax = parts[parts.length - 1];
  const max = Number(maybeMax);
  return Number.isFinite(max) && max > 0 ? max : null;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function DashboardReportes() {
  // filtros
  const [country, setCountry] = useState(""); // requerido por API
  const [institutionId, setInstitutionId] = useState(""); // opcional
  const [targetSystem, setTargetSystem] = useState(""); // opcional (si vacío -> undefined)

  // data
  const [summary, setSummary] = useState(null); // response de /api/dashboard
  const [subjects, setSubjects] = useState([]); // subjects[] de /api/dashboard/subjects

  // options
  const [countries, setCountries] = useState([]);
  const [institutions, setInstitutions] = useState([]);

  // ui state
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [error, setError] = useState("");
  const [sortByAvgDesc, setSortByAvgDesc] = useState(true);

  const countryLabelByIso3 = useMemo(() => {
    const m = new Map();
    for (const c of countries) m.set(c.iso3, c.name);
    return m;
  }, [countries]);

  const selectedCountryLabel = useMemo(() => {
    if (!country) return "";
    const name = countryLabelByIso3.get(country);
    return name ? `${country} - ${name}` : country;
  }, [country, countryLabelByIso3]);

  // Cargar países + instituciones
  useEffect(() => {
    async function loadOptions() {
      try {
        const [countriesRes, instRes] = await Promise.all([
          OptionsService.listCountries(),
          InstitutionsService.list(),
        ]);

        const cData = countriesRes?.data;
        const cPayload = Array.isArray(cData) ? cData : cData?.items ?? cData;
        setCountries(
          normalizeCountriesPayload(cPayload).sort((a, b) => a.iso3.localeCompare(b.iso3))
        );

        const instList = normalizeList(instRes?.data);
        setInstitutions(instList);
      } catch {
        // si falla options, no rompemos; solo queda vacío
        setCountries([]);
        setInstitutions([]);
      }
    }
    loadOptions();
  }, []);

  // cargar summary cuando cambia country/inst/target
  useEffect(() => {
    async function loadSummary() {
      if (!country) {
        setSummary(null);
        setSubjects([]);
        return;
      }

      try {
        setError("");
        setLoading(true);

        const res = await DashboardServices.get({
          country,
          institutionId: institutionId || undefined,
          targetSystem: targetSystem || undefined,
        });

        setSummary(res?.data ?? null);
      } catch (e) {
        setSummary(null);
        setSubjects([]);
        setError(
          e?.response?.data?.detail ||
          e?.response?.data?.message ||
          e?.message ||
          "No se pudo cargar el dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, [country, institutionId, targetSystem]);

  // cargar subjects cuando hay institutionId
  useEffect(() => {
    async function loadSubjects() {
      if (!country || !institutionId) {
        setSubjects([]);
        return;
      }

      try {
        setLoadingSubjects(true);
        setError("");

        const res = await DashboardServices.getBySubjects({
          country,
          institutionId,
          targetSystem: targetSystem || undefined,
        });

        const list = res?.data?.subjects ?? [];
        setSubjects(Array.isArray(list) ? list : []);
      } catch (e) {
        setSubjects([]);
        setError(
          e?.response?.data?.detail ||
          e?.response?.data?.message ||
          e?.message ||
          "No se pudo cargar el desglose por materias."
        );
      } finally {
        setLoadingSubjects(false);
      }
    }

    loadSubjects();
  }, [country, institutionId, targetSystem]);

  const maxScale = useMemo(() => {
    return parseMaxFromDisplaySystem(summary?.displaySystem);
  }, [summary]);

  const percent = useMemo(() => {
    // preferimos displayValue si es numérico (porque está en targetSystem), fallback averageZA
    const dv = Number(summary?.displayValue);
    const base = Number.isFinite(dv) ? dv : Number(summary?.averageZA);
    if (!Number.isFinite(base) || !maxScale) return null;
    return clamp((base / maxScale) * 100, 0, 100);
  }, [summary, maxScale]);

  const sortedSubjects = useMemo(() => {
    const arr = [...(subjects ?? [])];
    arr.sort((a, b) => {
      const av = Number(a?.displayValue ?? a?.averageZA ?? 0);
      const bv = Number(b?.displayValue ?? b?.averageZA ?? 0);
      return sortByAvgDesc ? bv - av : av - bv;
    });
    return arr;
  }, [subjects, sortByAvgDesc]);

  return (
    <div className="page dashboardPage">
      <h1 className="pageTitle">Dashboard Académico</h1>

      {/* FILTROS (estilo similar a otras pantallas) */}
      <div className="card dashboardFilters" style={{ marginBottom: 14 }}>
        <div className="filtersGrid">
          <label className="label">
            País
            <select
              className="input"
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setInstitutionId("");
              }}
            >
              <option value="">Seleccionar</option>
              {countries.map((c) => (
                <option key={c.iso3} value={c.iso3}>
                  {c.iso3} - {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="label">
            Institución (opcional)
            <select
              className="input"
              value={institutionId}
              onChange={(e) => setInstitutionId(e.target.value)}
              disabled={!country}
            >
              <option value="">{!country ? "Elegí país primero" : "Todas (promedio país)"}</option>
              {institutions.map((i) => (
                <option key={i._id ?? i.id} value={i._id ?? i.id}>
                  {i.name ?? "(Sin nombre)"}
                </option>
              ))}
            </select>
          </label>

          <label className="label">
            targetSystem (opcional)
            <input
              className="input"
              value={targetSystem}
              onChange={(e) => setTargetSystem(e.target.value)}
              placeholder="Ej: ARG_1_10"
              disabled={!country}
            />
          </label>
        </div>

        <div className="actions" style={{ marginTop: 12 }}>
          <button
            className="btn"
            type="button"
            onClick={() => {
              setCountry("");
              setInstitutionId("");
              setTargetSystem("");
              setSummary(null);
              setSubjects([]);
              setError("");
            }}
            disabled={loading || loadingSubjects}
          >
            Limpiar
          </button>
        </div>
      </div>

      {error && <p className="errorText">{error}</p>}

      {!country ? (
        <div className="card">
          <p className="mutedText" style={{ margin: 0 }}>
            Seleccioná un <b>país</b> para ver el promedio en su sistema objetivo (targetSystem).
          </p>
        </div>
      ) : loading ? (
        <div className="card">Cargando métricas...</div>
      ) : !summary ? (
        <div className="card">Sin datos para los filtros seleccionados.</div>
      ) : (
        <>
          {/* HEADER RESUMEN */}
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="dashboardHeader">
              <div>
                <div className="mutedText">Contexto</div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>
                  {selectedCountryLabel}
                  {institutionId ? " · Institución" : " · Promedio país"}
                </div>
                <div className="mutedText">
                  Sistema: <b>{summary.displaySystem ?? "—"}</b>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div className="mutedText">Promedio (en sistema objetivo)</div>
                <div className="dashboardBigValue">
                  {summary.displayValue ?? "—"}
                </div>
              </div>
            </div>

            {/* “Gauge” simple con barra */}
            <div style={{ marginTop: 12 }}>
              <div className="dashboardBarRow">
                <div className="mutedText">Progreso</div>
                <div className="mutedText">
                  {maxScale ? `0 – ${maxScale}` : "Escala desconocida"}
                </div>
              </div>

              <div className="barTrack" aria-label="Average progress">
                <div
                  className="barFill"
                  style={{ width: percent == null ? "0%" : `${percent}%` }}
                />
              </div>
            </div>
          </div>

          {/* KPI GRID */}
          <div className="kpiGrid" style={{ marginBottom: 14 }}>
            <div className="kpiCard">
              <div className="kpiTitle">Exámenes leídos</div>
              <div className="kpiValue">{summary.examsRead ?? 0}</div>
            </div>

            <div className="kpiCard">
              <div className="kpiTitle">Usados en promedio</div>
              <div className="kpiValue">{summary.examsUsedInAverage ?? 0}</div>
            </div>

            <div className="kpiCard">
              <div className="kpiTitle">Promedio ZA (raw)</div>
              <div className="kpiValue">{summary.averageZA ?? "—"}</div>
            </div>
          </div>

          {/* SUBJECTS */}
          <div className="card">
            <div className="dashboardSectionHeader">
              <h3 style={{ margin: 0 }}>Desglose por materias</h3>

              <div className="actions" style={{ margin: 0 }}>
                <button
                  className="btn"
                  type="button"
                  onClick={() => setSortByAvgDesc((v) => !v)}
                  disabled={!institutionId || loadingSubjects}
                  title="Ordenar por promedio"
                >
                  Orden: {sortByAvgDesc ? "Mayor → Menor" : "Menor → Mayor"}
                </button>
              </div>
            </div>

            {!institutionId ? (
              <p className="mutedText" style={{ marginTop: 10 }}>
                Seleccioná una <b>institución</b> para ver el detalle por materias.
              </p>
            ) : loadingSubjects ? (
              <p style={{ marginTop: 10 }}>Cargando materias...</p>
            ) : sortedSubjects.length === 0 ? (
              <p className="mutedText" style={{ marginTop: 10 }}>
                No hay materias para esta institución.
              </p>
            ) : (
              <table className="table" style={{ marginTop: 10 }}>
                <thead>
                  <tr>
                    <th className="th">Materia</th>
                    <th className="th">Promedio</th>
                    <th className="th">Exámenes</th>
                    <th className="th">Visual</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSubjects.map((s) => {
                    const sMax = parseMaxFromDisplaySystem(s.displaySystem) || maxScale;
                    const sValNum = Number(s.displayValue);
                    const sVal = Number.isFinite(sValNum) ? sValNum : Number(s.averageZA);
                    const sPct =
                      sMax && Number.isFinite(sVal) ? clamp((sVal / sMax) * 100, 0, 100) : 0;

                    return (
                      <tr key={s.subjectId} className="tr">
                        <td className="td">{s.subjectName ?? "(Sin nombre)"}</td>
                        <td className="td">
                          <b>{s.displayValue ?? "—"}</b>{" "}
                          <span className="mutedText">
                            {s.displaySystem ? `(${s.displaySystem})` : ""}
                          </span>
                        </td>
                        <td className="td">
                          {s.examsUsedInAverage ?? 0}/{s.examsRead ?? 0}
                        </td>
                        <td className="td" style={{ minWidth: 180 }}>
                          <div className="barTrack" style={{ height: 10 }}>
                            <div className="barFill" style={{ width: `${sPct}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}