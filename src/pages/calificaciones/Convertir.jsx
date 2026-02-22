import { useEffect, useState } from "react";
import { GradesService } from "../../services/students.service";

const SYSTEMS = ["UK", "US", "DE", "AR"];

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

export default function ConvertirCalificacion() {
  const [grades, setGrades] = useState([]);
  const [gradeId, setGradeId] = useState("");
  const [toSystem, setToSystem] = useState("AR");
  const [version, setVersion] = useState("v1.0");
  const [authority, setAuthority] = useState("SA-MoE");
  const [method, setMethod] = useState("demo-table");

  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const list = await GradesService.list();
      setGrades(list);
      setGradeId(list[0]?.id || "");
    } catch (e) {
      setError(e.message || "Error cargando calificaciones");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onConvert() {
    setError("");
    setResult(null);
    if (!gradeId) return setError("Seleccioná una calificación.");

    try {
      setWorking(true);
      const conv = await GradesService.convert({
        gradeId,
        toSystem,
        ruleContext: { version, authority, method },
      });
      setResult(conv);
      await load();
    } catch (e) {
      setError(e.message || "No se pudo convertir");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div>
      <h1>Convertir calificación</h1>

      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: "tomato" }}>{error}</p>}

      {!loading && (
        <div style={{ display: "grid", gap: 14, maxWidth: 900 }}>
          <section style={{ border: "1px solid #222", borderRadius: 14, padding: 14, background: "#0f0f0f" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
              <label>
                Calificación a convertir
                <select style={inputStyle()} value={gradeId} onChange={(e) => setGradeId(e.target.value)}>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.id} — {g.student?.id} — {g.originalGrade?.system} {String(g.originalGrade?.value)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Sistema destino
                <select style={inputStyle()} value={toSystem} onChange={(e) => setToSystem(e.target.value)}>
                  {SYSTEMS.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 10 }}>
              <label>
                Regla versión
                <input style={inputStyle()} value={version} onChange={(e) => setVersion(e.target.value)} />
              </label>
              <label>
                Autoridad
                <input style={inputStyle()} value={authority} onChange={(e) => setAuthority(e.target.value)} />
              </label>
              <label>
                Método
                <input style={inputStyle()} value={method} onChange={(e) => setMethod(e.target.value)} />
              </label>
            </div>

            <div style={{ marginTop: 12 }}>
              <button onClick={onConvert} disabled={working}>
                {working ? "Convirtiendo..." : "Convertir"}
              </button>
            </div>
          </section>

          {result && (
            <section style={{ border: "1px solid #222", borderRadius: 14, padding: 14, background: "#0f0f0f" }}>
              <h3 style={{ marginTop: 0 }}>Resultado</h3>
              <pre style={{ margin: 0, fontSize: 12, whiteSpace: "pre-wrap" }}>
{JSON.stringify(result, null, 2)}
              </pre>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
