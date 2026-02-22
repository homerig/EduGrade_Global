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

export default function ReporteDistribucion() {
  const [year, setYear] = useState(2026);
  const [system, setSystem] = useState("AR");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true);
    setError("");
    try {
      const data = await GradesService.reportDistribution({ year: Number(year), system });
      setRows(data);
    } catch (e) {
      setError(e.message || "Error generando reporte");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Reportes: Distribución</h1>
      <p style={{ opacity: 0.8 }}>Distribución (demo) por categorías. Luego será analítica real.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, maxWidth: 700 }}>
        <label>
          Año
          <input style={inputStyle()} type="number" value={year} onChange={(e) => setYear(e.target.value)} />
        </label>
        <label>
          Sistema base
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
        <div style={{ marginTop: 14, display: "grid", gap: 10, maxWidth: 600 }}>
          {rows.map((r) => (
            <div key={r.bucket} style={{ border: "1px solid #222", borderRadius: 12, padding: 12, background: "#0f0f0f" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{r.bucket}</strong>
                <span>{r.value}%</span>
              </div>
              <div style={{ height: 10, background: "#111", borderRadius: 999, marginTop: 8, border: "1px solid #222" }}>
                <div style={{ width: `${r.value}%`, height: "100%", borderRadius: 999, background: "#444" }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
