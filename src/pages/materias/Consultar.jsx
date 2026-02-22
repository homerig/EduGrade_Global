import { useEffect, useState } from "react";
import { SubjectsService } from "../../services/subjects.service";
import { Link } from "react-router-dom";
import "../../styles/ui.css";

export default function ConsultarMaterias() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      setLoading(true);

      const res = await SubjectsService.list();
      const data = res.data;
      const list = Array.isArray(data) ? data : data?.items ?? [];

      setItems(list);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "No se pudieron cargar las materias.";
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onDelete(id) {
    if (!confirm(`¿Eliminar materia ${id}?`)) return;

    try {
      await SubjectsService.remove(id);
      await load();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo eliminar.";
      alert(msg);
    }
  }

  return (
    <div className="page">
      <h1 className="pageTitle">Materias</h1>

      <div className="topBar">
        <Link className="linkPrimary" to="/materias/crear">
          + Crear materia
        </Link>
      </div>

      {error && <p className="errorText">{error}</p>}

      <div className="card">
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th className="th">ID</th>
                <th className="th">Nombre</th>
                <th className="th" style={{ textAlign: "right" }} />
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr className="tr" key={m._id ?? m.id}>
                  <td className="td">{m._id ?? m.id}</td>
                  <td className="td">{m.name ?? m.nombre ?? "-"}</td>
                  <td className="td" style={{ textAlign: "right" }}>
                    <button className="btn btnDanger" onClick={() => onDelete(m._id ?? m.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td className="td emptyRow" colSpan={3}>
                    Sin materias.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}