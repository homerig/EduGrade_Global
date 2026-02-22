import { useEffect, useState } from "react";
import { InstitutionsService } from "../../services/institutions.service";
import { SubjectsService } from "../../services/subjects.service";
import "../../styles/ui.css";

export default function ConsultarMaterias() {
  const [institutions, setInstitutions] = useState([]);
  const [institutionId, setInstitutionId] = useState("");
  const [items, setItems] = useState([]);
  const [loadingInst, setLoadingInst] = useState(true);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [error, setError] = useState("");

  async function loadInstitutions() {
    try {
      setError("");
      setLoadingInst(true);

      const res = await InstitutionsService.list({ limit: 200, skip: 0 });
      const data = res.data;
      const list = Array.isArray(data) ? data : data?.items ?? [];

      setInstitutions(list);

      // auto-select la primera
      const firstId = list?.[0]?._id ?? list?.[0]?.id ?? "";
      setInstitutionId(firstId);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "No se pudieron cargar las instituciones."
      );
      setInstitutions([]);
      setInstitutionId("");
    } finally {
      setLoadingInst(false);
    }
  }

  async function loadSubjectsFor(institutionMongoId) {
    if (!institutionMongoId) {
      setItems([]);
      return;
    }

    try {
      setError("");
      setLoadingSubs(true);

      const res = await SubjectsService.listByInstitution(institutionMongoId);
      const data = res.data;
      const list = Array.isArray(data) ? data : data?.items ?? [];

      setItems(list);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "No se pudieron cargar las materias."
      );
      setItems([]);
    } finally {
      setLoadingSubs(false);
    }
  }

  useEffect(() => {
    loadInstitutions();
  }, []);

  useEffect(() => {
    loadSubjectsFor(institutionId);
  }, [institutionId]);

  return (
    <div className="page">
      <h1 className="pageTitle">Materias</h1>

      {error && <p className="errorText">{error}</p>}

      <div className="card" style={{ marginBottom: 12 }}>
        {loadingInst ? (
          <p>Cargando instituciones...</p>
        ) : (
          <label className="label">
            Institución
            <select
              className="input"
              value={institutionId}
              onChange={(e) => setInstitutionId(e.target.value)}
            >
              {institutions.map((inst) => {
                const id = inst._id ?? inst.id;
                const name = inst.name ?? inst.nombre ?? id;
                return (
                  <option key={id} value={id}>
                    {name}
                  </option>
                );
              })}
            </select>
          </label>
        )}
      </div>

      <div className="card">
        {loadingSubs ? (
          <p>Cargando materias...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th className="th">ID</th>
                <th className="th">Nombre</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr className="tr" key={m.id ?? m._id}>
                  <td className="td">{m.id ?? m._id}</td>
                  <td className="td">{m.name ?? m.nombre ?? "-"}</td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td className="td emptyRow" colSpan={2}>
                    Sin materias para esta institución.
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