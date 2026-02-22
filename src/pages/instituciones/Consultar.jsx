import { useEffect, useState } from "react";
import { InstitutionsService } from "../../services/institutions.service";
import { Link } from "react-router-dom";
import "../../styles/instituciones.css";

export default function ConsultarInstituciones() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      setLoading(true);

      const res = await InstitutionsService.list({ limit: 100, skip: 0 });
      const data = res.data;
      const list = Array.isArray(data) ? data : data?.items ?? [];

      setItems(list);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "No se pudieron cargar las instituciones.";
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
    if (!confirm(`¿Eliminar institución ${id}?`)) return;

    try {
      await InstitutionsService.remove(id);
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
      <h1 className="pageTitle">Instituciones</h1>

      <div className="topBar">
        <Link className="linkPrimary" to="/instituciones/crear">
          + Crear institución
        </Link>
      </div>

      {error && <p className="errorText">{error}</p>}

      <div className="card tableWrap">
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th className="th">ID</th>
                <th className="th">Nombre</th>
                <th className="th">País</th>
                <th className="th">Dirección</th>
                <th className="th" style={{ textAlign: "right" }} />
              </tr>
            </thead>

            <tbody>
              {items.map((i) => (
                <tr className="tr" key={i._id}>
                  <td className="td">{i._id}</td>
                  <td className="td">{i.name}</td>
                  <td className="td">{i.country}</td>
                  <td className="td">{i.address}</td>
                  <td className="td" style={{ textAlign: "right" }}>
                    <button className="btn btnDanger" onClick={() => onDelete(i._id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td className="td emptyRow" colSpan={5}>
                    Sin instituciones.
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