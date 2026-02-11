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

function pillStyle() {
  return { padding: "4px 10px", borderRadius: 999, border: "1px solid #333", fontSize: 12 };
}

export default function VerTrayectoria() {
  const [studentId, setStudentId] = useState("S-1");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  async function onSearch() {
    setLoading(true);
    setError("");
    setItems([]);
    try {
      const list = await GradesService.trajectoryByStudent(studentId.trim());
      setItems(list);
    } catch (e) {
      setError(e.message || "Error consultando trayectoria");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Trayectoria académica</h1>
      <p style={{ opacity: 0.8 }}>Consulta por estudiante e incluye conversiones registradas (append-only).</p>

      <div style={{ display: "flex", gap: 10, alignItems: "center", maxWidth: 520 }}>
        <input style={inputStyle()} value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="Ej: S-1" />
        <button onClick={onSearch} disabled={loading}>
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {error && <p style={{ color: "tomato" }}>{error}</p>}

      <div style={{ marginTop: 14, display: "grid", gap: 12, maxWidth: 980 }}>
        {!loading && items.length === 0 && (
          <div style={{ opacity: 0.7 }}>No hay registros para ese estudiante.</div>
        )}

        {items.map((g) => (
          <div key={g.id} style={{ border: "1px solid #222", borderRadius: 14, padding: 14, background: "#0f0f0f" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 800 }}>
                  {g.student?.nombre} ({g.student?.id})
                </div>
                <div style={{ opacity: 0.8 }}>
                  {g.institution?.nombre} — {g.subject?.nombre} — {g.academic?.year} — {g.academic?.countrySystem}
                </div>
              </div>
              <div style={{ textAlign: "right", opacity: 0.75 }}>
                <div>{g.id}</div>
                <div style={{ fontSize: 12 }}>{new Date(g.createdAt).toLocaleString()}</div>
              </div>
            </div>

            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={pillStyle()}>
                Original: {g.originalGrade?.system} {String(g.originalGrade?.value)}
              </span>
              <span style={pillStyle()}>
                Eval: {g.evaluation?.type} ({g.evaluation?.modality})
              </span>
              <span style={pillStyle()}>
                Auditor: {g.auditorUser}
              </span>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Conversiones</div>

              {(g.conversions?.length ?? 0) === 0 ? (
                <div style={{ opacity: 0.7 }}>Sin conversiones.</div>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {g.conversions.map((c) => (
                    <div key={c.id} style={{ border: "1px solid #222", borderRadius: 12, padding: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ fontWeight: 700 }}>
                          → {c.toSystem}: {JSON.stringify(c.result)}
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.75 }}>
                          {new Date(c.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                        Regla: {c.rule?.authority} / {c.rule?.version} / {c.rule?.method}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
