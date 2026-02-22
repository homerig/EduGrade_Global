import { useEffect, useState } from "react";
import "../../styles/ui.css";

// 🔹 MOCK — después lo reemplazamos por fetch real
async function fetchAnalytics(filters) {
  return {
    summary: {
      average: 7.4,
      approvalRate: 0.82,
      totalGrades: 1280,
    },
    byCountry: [
      { country: "ARG", average: 7.6, approvalRate: 0.85 },
      { country: "USA", average: 7.1, approvalRate: 0.79 },
      { country: "DEU", average: 6.9, approvalRate: 0.74 },
    ],
    byLevel: [
      { level: "Undergraduate", average: 7.3 },
      { level: "Graduate", average: 8.1 },
    ],
  };
}

export default function DashboardReportes() {
  const [year, setYear] = useState("ALL");
  const [country, setCountry] = useState("ALL");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetchAnalytics({ year, country });
      setData(res);
      setLoading(false);
    }
    load();
  }, [year, country]);

  return (
    <div className="page">
      <h1 className="pageTitle">Dashboard Académico</h1>

      {/* FILTROS */}
      <div className="card filtersRow">
        <label>
          Año
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="ALL">Todos</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </label>

        <label>
          País
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="ALL">Todos</option>
            <option value="ARG">Argentina</option>
            <option value="USA">Estados Unidos</option>
            <option value="DEU">Alemania</option>
          </select>
        </label>
      </div>

      {loading ? (
        <div className="card">Cargando métricas...</div>
      ) : (
        <>
          {/* KPI CARDS */}
          <div className="kpiGrid">
            <div className="kpiCard">
              <div className="kpiTitle">Promedio General</div>
              <div className="kpiValue">{data.summary.average}</div>
            </div>

            <div className="kpiCard">
              <div className="kpiTitle">Tasa de Aprobación</div>
              <div className="kpiValue">
                {(data.summary.approvalRate * 100).toFixed(1)}%
              </div>
            </div>

            <div className="kpiCard">
              <div className="kpiTitle">Total Evaluaciones</div>
              <div className="kpiValue">{data.summary.totalGrades}</div>
            </div>
          </div>

          {/* PROMEDIO POR PAÍS */}
          <div className="card">
            <h3>Promedio por País</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>País</th>
                  <th>Promedio</th>
                  <th>% Aprobación</th>
                </tr>
              </thead>
              <tbody>
                {data.byCountry.map((c) => (
                  <tr key={c.country}>
                    <td>{c.country}</td>
                    <td>{c.average}</td>
                    <td>{(c.approvalRate * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PROMEDIO POR NIVEL */}
          <div className="card">
            <h3>Promedio por Nivel Académico</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Nivel</th>
                  <th>Promedio</th>
                </tr>
              </thead>
              <tbody>
                {data.byLevel.map((l) => (
                  <tr key={l.level}>
                    <td>{l.level}</td>
                    <td>{l.average}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}