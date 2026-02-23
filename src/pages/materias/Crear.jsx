import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/ui.css";

import { SubjectsService } from "../../services/subjects.service";
import { InstitutionsService } from "../../services/institutions.service";

export default function CrearMateria() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [institutionMongoId, setInstitutionMongoId] = useState("");

  const [institutions, setInstitutions] = useState([]);
  const [loadingInst, setLoadingInst] = useState(true);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoadingInst(true);

        // OJO: InstitutionsService.list devuelve una Promise de axios -> {data,...}
        const res = await InstitutionsService.list({ limit: 200, skip: 0 });
        const data = res.data;

        // dependiendo tu backend, puede venir:
        // A) data = array
        // B) data.items = array
        const list = Array.isArray(data) ? data : (data?.items ?? []);

        if (!mounted) return;

        setInstitutions(list);

        // autoselecciona la primera si hay
        if (list.length > 0) {
          setInstitutionMongoId(list[0]._id); // si tu backend usa "id", cambiá a list[0].id
        }
      } catch (e) {
        if (!mounted) return;
        setError(
          e?.response?.data?.detail ||
            e?.message ||
            "No se pudieron cargar instituciones."
        );
      } finally {
        if (mounted) setLoadingInst(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Nombre obligatorio.");
    if (!institutionMongoId) return setError("Institución obligatoria.");

    try {
      setSaving(true);

      await SubjectsService.createForInstitution(institutionMongoId, {
        name: name.trim(),
      });

      nav("/materias/consultar");
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "No se pudo crear la materia."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <h1 className="pageTitle">Crear materia</h1>
      {error && <p className="errorText">{error}</p>}

      <div className="card">
        <form onSubmit={onSubmit} className="form">
          <label className="label">
            Nombre
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="label">
            Institución
            <select
              className="input"
              value={institutionMongoId}
              onChange={(e) => setInstitutionMongoId(e.target.value)}
              disabled={loadingInst || institutions.length === 0}
            >
              {institutions.length === 0 ? (
                <option value="">
                  {loadingInst ? "Cargando..." : "No hay instituciones"}
                </option>
              ) : (
                institutions.map((inst) => (
                  <option key={inst._id} value={inst._id}>
                    {inst.name}
                  </option>
                ))
              )}
            </select>
          </label>

          <div className="actions">
            <button className="btn btnPrimary" disabled={saving || loadingInst}>
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button
              className="btn"
              type="button"
              disabled={saving}
              onClick={() => nav("/materias/consultar")}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}