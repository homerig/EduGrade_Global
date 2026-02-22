import { useState } from "react";
import "../../styles/ui.css";

export default function AgregarCalificacion() {
  const [studentId, setStudentId] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [subject, setSubject] = useState("");
  const [institution, setInstitution] = useState("");
  const [finalGrade, setFinalGrade] = useState("");

  function onSubmit(e) {
    e.preventDefault();

    // Más adelante conectamos el POST real.
    alert(
      `Demo: guardar calificación\nAlumno: ${studentId}\nAño: ${year}\nMateria: ${subject}\nInstitución: ${institution}\nNota: ${finalGrade}`
    );
  }

  return (
    <div className="page">
      <h1 className="pageTitle">Agregar calificación</h1>

      <div className="card">
        <form className="form" onSubmit={onSubmit}>
          <label className="label">
            Student ID
            <input className="input" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
          </label>

          <label className="label">
            Año
            <input className="input" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          </label>

          <label className="label">
            Materia
            <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </label>

          <label className="label">
            Institución
            <input className="input" value={institution} onChange={(e) => setInstitution(e.target.value)} />
          </label>

          <label className="label">
            Nota final
            <input className="input" value={finalGrade} onChange={(e) => setFinalGrade(e.target.value)} />
          </label>

          <div className="actions">
            <button className="btn btnPrimary">Guardar</button>
            <button
              className="btn"
              type="button"
              onClick={() => {
                setStudentId("");
                setYear(new Date().getFullYear());
                setSubject("");
                setInstitution("");
                setFinalGrade("");
              }}
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}