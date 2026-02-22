import { useEffect, useState } from "react";
import { StudentsService } from "../../services/students.service";
import { Link } from "react-router-dom";

export default function ConsultarEstudiantes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await StudentsService.list();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function onDelete(id) {
    if (!confirm(`¿Eliminar estudiante ${id}?`)) return;
    await StudentsService.remove(id);
    await load();
  }

  return (
    <div>
      <h1>Estudiantes</h1>
      <div style={{ marginBottom: 12 }}>
        <Link to="/estudiantes/crear">+ Crear estudiante</Link>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", maxWidth: 900 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #333" }}>ID</th>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #333" }}>Nombre</th>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #333" }}>Email</th>
              <th style={{ padding: 8, borderBottom: "1px solid #333" }} />
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id}>
                <td style={{ padding: 8, borderBottom: "1px solid #222" }}>{s.id}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #222" }}>{s.nombre}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #222" }}>{s.email}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #222", textAlign: "right" }}>
                  <button onClick={() => onDelete(s.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan="4" style={{ padding: 8, opacity: 0.7 }}>Sin estudiantes.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
