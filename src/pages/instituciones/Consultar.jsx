import { useEffect, useState } from "react";
import { InstitutionsService } from "../../services/institutions.service";
import { Link } from "react-router-dom";

export default function ConsultarInstituciones() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setItems(await InstitutionsService.list());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function onDelete(id) {
    if (!confirm(`¿Eliminar institución ${id}?`)) return;
    await InstitutionsService.remove(id);
    await load();
  }

  return (
    <div>
      <h1>Instituciones</h1>
      <div style={{ marginBottom: 12 }}>
        <Link to="/instituciones/crear">+ Crear institución</Link>
      </div>

      {loading ? <p>Cargando...</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse", maxWidth: 900 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #333" }}>ID</th>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #333" }}>Nombre</th>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #333" }}>Región</th>
              <th style={{ padding: 8, borderBottom: "1px solid #333" }} />
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td style={{ padding: 8, borderBottom: "1px solid #222" }}>{i.id}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #222" }}>{i.nombre}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #222" }}>{i.region}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #222", textAlign: "right" }}>
                  <button onClick={() => onDelete(i.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="4" style={{ padding: 8, opacity: 0.7 }}>Sin instituciones.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}
