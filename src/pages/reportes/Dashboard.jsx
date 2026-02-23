import { useEffect, useMemo, useState } from "react";
import "../../styles/ui.css";
import { DashboardServices } from "../../services/dashboard.services";
import { OptionsService } from "../../services/options.service";
import { InstitutionsService } from "../../services/institutions.service";

function normalizeList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

function normalizeKeyValueOptions(payload) {
  // soporta objeto key->value o array {key,value}
  if (!payload) return [];

  if (typeof payload === "object" && !Array.isArray(payload)) {
    return Object.entries(payload).map(([key, value]) => ({
      key: String(key),
      value: String(value ?? key),
    }));
  }

  if (Array.isArray(payload)) {
    return payload
      .map((row) => {
        if (!row || typeof row !== "object") return null;
        const k = row.key ?? row.k ?? row.code ?? "";
        const v = row.value ?? row.v ?? row.name ?? k;
        if (!k) return null;
        return { key: String(k), value: String(v) };
      })
      .filter(Boolean);
  }

  return [];
}

export default function DashboardReportes() {
  const [country, setCountry] = useState(""); // ISO3
  const [institutionId, setInstitutionId] = useState("");

  // 🔹 siempre hay un targetSystem (default ZA, pero se ajusta al país)
  const [targetSystem, setTargetSystem] = useState("ZA");

  const [summary, setSummary] = useState(null);
  const [subjects, setSubjects] = useState([]);

  const [countries, setCountries] = useState([]);

  // instituciones DEPENDEN de country
  const [institutions, setInstitutions] = useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);

  // systems DEPENDEN de country (response = { ISO3: [systems...] })
  const [systemsByCountry, setSystemsByCountry] = useState({});
  const [loadingSystems, setLoadingSystems] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [error, setError] = useState("");
  const [sortByAvgDesc, setSortByAvgDesc] = useState(true);

  // ===== LOAD COUNTRIES + SYSTEMS MAP (una vez) =====
  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingSystems(true);

        const [countriesRes, sysRes] = await Promise.all([
          OptionsService.listCountries(),
          OptionsService.listSystem(), // <- devuelve { GBR: [...], USA: [...], ... }
        ]);

        // countries
        const cData = countriesRes?.data;
        const cPayload = Array.isArray(cData) ? cData : cData?.items ?? cData;

        const normalizedCountries = normalizeKeyValueOptions(cPayload).map((c) => ({
          iso3: c.key.replace(/^country-/, ""),
          name: c.value,
        }));
        setCountries(normalizedCountries);

        // systems
        const sysData = sysRes?.data?.items ?? sysRes?.data ?? {};
        // sysData esperado: { "ARG": ["ARG_1_10"], "ZAF": ["ZA"], ... }
        setSystemsByCountry(sysData && typeof sysData === "object" ? sysData : {});
      } catch {
        setCountries([]);
        setSystemsByCountry({});
      } finally {
        setLoadingSystems(false);
      }
    }

    loadOptions();
  }, []);

  // ===== LOAD INSTITUTIONS BY COUNTRY (cada vez que cambia country) =====
  useEffect(() => {
    async function loadInstitutionsByCountry() {
      setInstitutions([]);
      setInstitutionId(""); // ✅ reset al cambiar país
      setSubjects([]); // ✅ no tiene sentido mantener materias de otra institución

      if (!country) return;

      try {
        setLoadingInstitutions(true);

        // ✅ intentamos pasar country al backend
        const res = await InstitutionsService.list({
          country,
        });

        const list = normalizeList(res?.data);

        // por si el backend no filtra, filtramos nosotros cuando exista i.country
        const filtered = (list ?? []).filter((i) => {
          const c = (i?.country ?? "").toString().trim();
          return !c ? true : c === country;
        });

        setInstitutions(filtered);
      } catch {
        // fallback: cargar todo y filtrar local (si el backend no soporta param)
        try {
          const res2 = await InstitutionsService.list({ limit: 500, skip: 0 });
          const list2 = normalizeList(res2?.data);
          const filtered2 = (list2 ?? []).filter((i) => (i?.country ?? "") === country);
          setInstitutions(filtered2);
        } catch {
          setInstitutions([]);
        }
      } finally {
        setLoadingInstitutions(false);
      }
    }

    loadInstitutionsByCountry();
  }, [country]);

  // ===== SYSTEMS DISPONIBLES SEGÚN COUNTRY =====
  const systemsForSelectedCountry = useMemo(() => {
    if (!country) return [];
    const arr = systemsByCountry?.[country];
    return Array.isArray(arr) ? arr : [];
  }, [systemsByCountry, country]);

  // ===== DEFAULT TARGET SYSTEM al cambiar country/systems =====
  useEffect(() => {
    if (!country) {
      setTargetSystem("ZA");
      return;
    }

    const sys = systemsForSelectedCountry;

    if (sys.length === 0) {
      // si no hay sistemas para ese país, dejamos ZA (igual la API recibirá algo válido si backend lo acepta)
      setTargetSystem("ZA");
      return;
    }

    // ✅ regla: ZA por default para ZAF; sino primer sistema disponible
    if (country === "ZAF" && sys.includes("ZA")) {
      setTargetSystem("ZA");
      return;
    }

    setTargetSystem(sys[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, systemsForSelectedCountry.join("|")]);

  // ===== LOAD SUMMARY =====
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
          country, // requerido
          institutionId: institutionId || undefined,
          targetSystem, // siempre seteado
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

  // ===== LOAD SUBJECTS =====
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
          targetSystem,
        });

        const list = res?.data?.subjects ?? [];
        setSubjects(Array.isArray(list) ? list : []);
      } catch (e) {
        setSubjects([]);
        setError(
          e?.response?.data?.detail ||
          e?.response?.data?.message ||
          e?.message ||
          "No se pudo cargar materias."
        );
      } finally {
        setLoadingSubjects(false);
      }
    }

    loadSubjects();
  }, [country, institutionId, targetSystem]);

  const sortedSubjects = useMemo(() => {
    const arr = [...subjects];
    arr.sort((a, b) => {
      const av = Number(a?.displayValue ?? 0);
      const bv = Number(b?.displayValue ?? 0);
      return sortByAvgDesc ? bv - av : av - bv;
    });
    return arr;
  }, [subjects, sortByAvgDesc]);

  return (
    <div className="page dashboardPage">
      <h1 className="pageTitle">Dashboard Académico</h1>

      {/* FILTROS */}
      <div className="card dashboardFilters" style={{ marginBottom: 14 }}>
        <div className="filtersGrid">
          <label className="label">
            País
            <select
              className="input"
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                // el reset de institutionId lo hace el effect de institutions
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
            Institución
            <select
              className="input"
              value={institutionId}
              onChange={(e) => setInstitutionId(e.target.value)}
              disabled={!country || loadingInstitutions}
            >
              <option value="">
                {!country
                  ? "Elegí país primero"
                  : loadingInstitutions
                    ? "Cargando instituciones..."
                    : "Promedio país"}
              </option>

              {institutions.map((i) => (
                <option key={i._id ?? i.id} value={i._id ?? i.id}>
                  {i.name ?? "(Sin nombre)"}
                </option>
              ))}
            </select>
          </label>

          <label className="label">
            Sistema de calificación
            <select
              className="input"
              value={targetSystem}
              onChange={(e) => setTargetSystem(e.target.value)}
              disabled={!country || loadingSystems || systemsForSelectedCountry.length === 0}
            >
              {!country ? (
                <option value="ZA">Elegí país primero</option>
              ) : loadingSystems ? (
                <option value={targetSystem}>Cargando sistemas...</option>
              ) : systemsForSelectedCountry.length === 0 ? (
                <option value={targetSystem}>Sin sistemas para {country}</option>
              ) : (
                // ✅ response: { ISO3: [ "ARG_1_10", ... ] }
                systemsForSelectedCountry.map((sys) => (
                  <option key={sys} value={sys}>
                    {sys}
                  </option>
                ))
              )}
            </select>
          </label>
        </div>

        <div className="actions" style={{ marginTop: 12 }}>
          <button
            className="btn"
            type="button"
            onClick={() => {
              setCountry("");
              setInstitutionId("");
              setTargetSystem("ZA");
              setSummary(null);
              setSubjects([]);
              setError("");
              setInstitutions([]);
            }}
            disabled={loading || loadingSubjects || loadingInstitutions}
          >
            Limpiar
          </button>
        </div>
      </div>

      {error && <p className="errorText">{error}</p>}

      {!country ? (
        <div className="card">Seleccioná un país para visualizar métricas.</div>
      ) : loading ? (
        <div className="card">Cargando métricas...</div>
      ) : !summary ? (
        <div className="card">Sin datos disponibles.</div>
      ) : (
        <>
          {/* HEADER RESUMEN */}
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="dashboardHeader">
              <div>
                <div className="mutedText">Sistema de calificación</div>
                <div style={{ fontWeight: 700 }}>{summary.displaySystem}</div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div className="mutedText">Promedio</div>
                <div className="dashboardBigValue">{summary.displayValue}</div>
              </div>
            </div>
          </div>

          {/* KPI */}
          <div className="kpiGrid" style={{ marginBottom: 14 }}>
            <div className="kpiCard">
              <div className="kpiTitle">Exámenes leídos</div>
              <div className="kpiValue">{summary.examsRead}</div>
            </div>

            <div className="kpiCard">
              <div className="kpiTitle">Usados en promedio</div>
              <div className="kpiValue">{summary.examsUsedInAverage}</div>
            </div>

            <div className="kpiCard">
              <div className="kpiTitle">Promedio ZA</div>
              <div className="kpiValue">{summary.averageZA}</div>
            </div>
          </div>

          {/* SUBJECTS */}
          <div className="card">
            <div className="dashboardSectionHeader">
              <h3 style={{ margin: 0 }}>Desglose por materias</h3>

              <button
                className="btn"
                type="button"
                onClick={() => setSortByAvgDesc((v) => !v)}
                disabled={!institutionId || loadingSubjects}
              >
                Orden: {sortByAvgDesc ? "Mayor → Menor" : "Menor → Mayor"}
              </button>
            </div>

            {!institutionId ? (
              <p className="mutedText" style={{ marginTop: 10 }}>
                Seleccioná una institución para ver materias.
              </p>
            ) : loadingSubjects ? (
              <p style={{ marginTop: 10 }}>Cargando materias...</p>
            ) : sortedSubjects.length === 0 ? (
              <p className="mutedText" style={{ marginTop: 10 }}>
                No hay materias disponibles.
              </p>
            ) : (
              <table className="table" style={{ marginTop: 10 }}>
                <thead>
                  <tr>
                    <th className="th">Materia</th>
                    <th className="th">Promedio</th>
                    <th className="th">Exámenes</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSubjects.map((s) => (
                    <tr key={s.subjectId}>
                      <td className="td">{s.subjectName}</td>
                      <td className="td">
                        <b>{s.displayValue}</b>
                      </td>
                      <td className="td">
                        {s.examsUsedInAverage}/{s.examsRead}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}