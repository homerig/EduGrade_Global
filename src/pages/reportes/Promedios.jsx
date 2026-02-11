import { useState } from "react";
import { GradesService } from "../../services/students.service";

function inputStyle() {
  return {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #333",
    background: "#111",
    color: "inherit",
  };
}

export default function ReportePromedios() {
  const [year, setYear] = useState(2026);
  const [system, setSystem] = useState("AR");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true);
    setError("");
    try {
      const data = await GradesService.reportAverages({ year: Number(year), system });
      setRows(data);
    } catch (e) {
      setError(e.message || "Error generando reporte");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Reportes: Promedios</h1>
      <p style={{ opacity: 0.8 }}>Promedios por región (demo). Luego se conectará a la API real.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, maxWidth: 700 }}>
        <label>
          Año
          <input style={inputStyle()} type="number" value={year} onChange={(e) => setYear(e.target.value)} />
        </label>
        <label>
          Sistema base (normalizado)
          <select style={inputStyle()} value={system} onChange={(e) => setSystem(e.target.value)}>
            {["UK", "US", "DE", "AR"].map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </label>
        <div style={{ display: "flex", alignItems: "end" }}>
          <button onClick={run} disabled={loading}>
            {loading ? "Generando..." : "Generar"}
          </button>
        </div>
      </div>

      {error && <p style={{ color: "tomato" }}>{error}</p>}

      {rows.length > 0 && (
        <div style={{ overflowX: "auto", marginTop: 14 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", maxWidth: 900 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #333" }}>Región</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #333" }}>Promedio</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #333" }}>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.dimension}>
                  <td style={{ padding: 8, borderBottom: "1px solid #222" }}>{r.dimension}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #222" }}>{r.average}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #222" }}>{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
