import { useEffect, useState } from "react";
import { SubjectsService } from "../../services/subjects.service";
import { Link } from "react-router-dom";

export default function ConsultarMaterias() {
  const [items, setItems] = useState([]);

  async function load() {
    setItems(await SubjectsService.list());
  }

  useEffect(() => { load(); }, []);

  async function onDelete(id) {
    if (!confirm(`¿Eliminar materia ${id}?`)) return;
    await SubjectsService.remove(id);
    await load();
  }

  return (
    <div>
      <h1>Materias</h1>
      <div style={{ marginBottom: 12 }}>
        <Link to="/materias/crear">+ Crear materia</Link>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", maxWidth: 900 }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #333" }}>ID</th>
            <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #333" }}>Nombre</th>
            <th style={{ padding: 8, borderBottom: "1px solid #333" }} />
          </tr>
        </thead>
        <tbody>
          {items.map((m) => (
            <tr key={m.id}>
              <td style={{ padding: 8, borderBottom: "1px solid #222" }}>{m.id}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #222" }}>{m.nombre}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #222", textAlign: "right" }}>
                <button onClick={() => onDelete(m.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan="3" style={{ padding: 8, opacity: 0.7 }}>Sin materias.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
