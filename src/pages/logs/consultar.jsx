import { useEffect, useState } from "react";
import { AuditService } from "../../services/audit.service";
import "../../styles/ui.css";

export default function ConsultarLogs() {
  const [mode, setMode] = useState("recent"); // recent | day | entity | request

  const [days, setDays] = useState(7);
  const [limit, setLimit] = useState(15);

  const [day, setDay] = useState("");
  const [entityType, setEntityType] = useState("Student");
  const [entityId, setEntityId] = useState("");
  const [requestId, setRequestId] = useState("");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadRecent() {
    try {
      setError("");
      setLoading(true);
      const res = await AuditService.recent(days, limit);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || "No se pudieron cargar los logs.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // ✅ default: última semana, limit 15
    loadRecent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSearch(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      let res;
      if (mode === "recent") {
        res = await AuditService.recent(days, limit);
      } else if (mode === "day") {
        if (!day.trim()) throw new Error("Ingresá un día (YYYY-MM-DD).");
        res = await AuditService.byDay(day.trim(), limit);
      } else if (mode === "entity") {
        if (!entityType.trim()) throw new Error("Ingresá entityType.");
        if (!entityId.trim()) throw new Error("Ingresá entityId.");
        res = await AuditService.byEntity(entityType.trim(), entityId.trim(), limit);
      } else {
        if (!requestId.trim()) throw new Error("Ingresá requestId (UUID).");
        res = await AuditService.byRequest(requestId.trim(), limit);
      }

      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || "No se pudieron cargar los logs.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1 className="pageTitle">Logs</h1>
      {error && <p className="errorText">{error}</p>}

      <div className="card" style={{ marginBottom: 14 }}>
        <form onSubmit={onSearch} className="form">
          <label className="label">
            Filtro
            <select className="input" value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="recent">Última semana</option>
              <option value="day">Por día</option>
              <option value="entity">Por entidad</option>
              <option value="request">Por request</option>
            </select>
          </label>

          <label className="label">
            Limit
            <input
              className="input"
              type="number"
              min="1"
              max="500"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value || 15))}
            />
          </label>

          {mode === "recent" && (
            <label className="label">
              Días hacia atrás
              <input
                className="input"
                type="number"
                min="1"
                max="60"
                value={days}
                onChange={(e) => setDays(Number(e.target.value || 7))}
              />
            </label>
          )}

          {mode === "day" && (
            <label className="label">
              Día (YYYY-MM-DD)
              <input className="input" value={day} onChange={(e) => setDay(e.target.value)} />
            </label>
          )}

          {mode === "entity" && (
            <>
              <label className="label">
                Entity type
                <input className="input" value={entityType} onChange={(e) => setEntityType(e.target.value)} />
              </label>
              <label className="label">
                Entity id
                <input className="input" value={entityId} onChange={(e) => setEntityId(e.target.value)} />
              </label>
            </>
          )}

          {mode === "request" && (
            <label className="label">
              Request id (UUID)
              <input className="input" value={requestId} onChange={(e) => setRequestId(e.target.value)} />
            </label>
          )}

          <div className="actions">
            <button className="btn btnPrimary" disabled={loading}>
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th className="th">ts</th>
                <th className="th">operation</th>
                <th className="th">db</th>
                <th className="th">entity_type</th>
                <th className="th">entity_id</th>
                <th className="th">status</th>
                <th className="th">request_id</th>
                <th className="th">user_name</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r, idx) => (
                <tr className="tr" key={`${r.request_id ?? "x"}-${idx}`}>
                  <td className="td">{r.ts ?? "-"}</td>
                  <td className="td">{r.operation ?? "-"}</td>
                  <td className="td">{r.db ?? "-"}</td>
                  <td className="td">{r.entity_type ?? "-"}</td>
                  <td className="td mono">{r.entity_id ?? "-"}</td>
                  <td className="td">{r.status ?? "-"}</td>
                  <td className="td mono">{r.request_id ?? "-"}</td>
                  <td className="td">{r.user_name ?? "-"}</td>
                </tr>
              ))}

              {!loading && items.length === 0 && (
                <tr>
                  <td className="td emptyRow" colSpan={8}>
                    Sin resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && <p style={{ marginTop: 12 }}>Cargando...</p>}
      </div>
    </div>
  );
}