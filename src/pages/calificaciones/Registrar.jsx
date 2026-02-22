import { useMemo, useState } from "react";
import { GradesService } from "../../services/students.service";
import { useNavigate } from "react-router-dom";

const SYSTEMS = ["UK", "US", "DE", "AR"];
const LEVELS = ["Obligatorio", "Post-obligatorio"];
const EVAL_TYPES = ["Parcial", "Final", "Extraordinaria", "Recuperatorio"];
const UK_SCALES = ["GCSE", "A-Levels"];

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

export default function RegistrarCalificacion() {
  const nav = useNavigate();

  // Identidad / contexto
  const [studentId, setStudentId] = useState("S-1");
  const [studentName, setStudentName] = useState("Alice Mokoena");
  const [instId, setInstId] = useState("I-1");
  const [instName, setInstName] = useState("Cape Town College");
  const [region, setRegion] = useState("Western Cape");
  const [subjectId, setSubjectId] = useState("MATH-01");
  const [subjectName, setSubjectName] = useState("Mathematics");

  const [year, setYear] = useState(2026);
  const [level, setLevel] = useState("Post-obligatorio");
  const [system, setSystem] = useState("UK");

  const [evalType, setEvalType] = useState("Final");
  const [evalModality, setEvalModality] = useState("Exam"); // UK: coursework/exam etc.
  const [auditorUser, setAuditorUser] = useState("system.demo");

  // Nota original (dinámica por sistema)
  const [ukScale, setUkScale] = useState("A-Levels");
  const [ukValue, setUkValue] = useState("A*");
  const [ukCoursework, setUkCoursework] = useState("A");
  const [ukExam, setUkExam] = useState("A*");

  const [usLetter, setUsLetter] = useState("A");
  const [usGpa, setUsGpa] = useState(3.8);
  const [usCredits, setUsCredits] = useState(4);
  const [usWeighted, setUsWeighted] = useState(false);

  const [deValue, setDeValue] = useState(1.3);
  const [deLevelNote, setDeLevelNote] = useState("Bundesweit");

  const [arValue, setArValue] = useState(9);
  const [arInstance, setArInstance] = useState("Regular"); // dic/feb etc.

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const originalGrade = useMemo(() => {
    if (system === "UK") {
      return {
        system: "UK",
        scale: ukScale,
        value: ukValue.trim(),
        components: { coursework: ukCoursework.trim(), exam: ukExam.trim() },
      };
    }
    if (system === "US") {
      return {
        system: "US",
        scale: "Letter + GPA",
        value: usLetter.trim(),
        gpa: Number(usGpa),
        credits: Number(usCredits),
        weighted: Boolean(usWeighted),
      };
    }
    if (system === "DE") {
      return {
        system: "DE",
        scale: "1.0 - 6.0 (inversa)",
        value: Number(deValue),
        context: deLevelNote.trim(),
      };
    }
    return {
      system: "AR",
      scale: "1 - 10",
      value: Number(arValue),
      instance: arInstance.trim(),
      approved: Number(arValue) >= 4,
    };
  }, [system, ukScale, ukValue, ukCoursework, ukExam, usLetter, usGpa, usCredits, usWeighted, deValue, deLevelNote, arValue, arInstance]);

  function validate() {
    if (!studentId.trim()) return "Student ID es obligatorio.";
    if (!studentName.trim()) return "Nombre de estudiante es obligatorio.";
    if (!instId.trim() || !instName.trim()) return "Institución (id + nombre) es obligatoria.";
    if (!subjectId.trim() || !subjectName.trim()) return "Materia (id + nombre) es obligatoria.";
    if (!String(year).trim()) return "Año lectivo es obligatorio.";

    if (system === "UK") {
      if (!ukValue.trim()) return "UK: value (A*, A, B...) es obligatorio.";
    }
    if (system === "US") {
      if (!usLetter.trim()) return "US: letter grade es obligatorio.";
      if (Number(usGpa) < 0 || Number(usGpa) > 4) return "US: GPA debe estar entre 0.0 y 4.0";
    }
    if (system === "DE") {
      if (Number(deValue) < 1 || Number(deValue) > 6) return "DE: debe estar entre 1.0 y 6.0";
    }
    if (system === "AR") {
      if (Number(arValue) < 1 || Number(arValue) > 10) return "AR: debe estar entre 1 y 10";
    }
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    const msg = validate();
    if (msg) return setError(msg);

    const payload = {
      auditorUser,
      student: { id: studentId.trim(), nombre: studentName.trim() },
      institution: { id: instId.trim(), nombre: instName.trim(), region: region.trim() },
      subject: { id: subjectId.trim(), nombre: subjectName.trim() },
      academic: { year: Number(year), level, countrySystem: system },
      evaluation: { type: evalType, modality: evalModality },
      originalGrade,
    };

    try {
      setSaving(true);
      await GradesService.create(payload);
      nav("/trayectorias", { replace: false });
    } catch (err) {
      setError(err.message || "No se pudo registrar la calificación.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1>Registrar calificación (original)</h1>
      <p style={{ opacity: 0.8 }}>
        Se guarda la nota original sin sobrescribir. Conversión y auditoría se agregan como registros nuevos.
      </p>

      {error && <p style={{ color: "tomato" }}>{error}</p>}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 16, maxWidth: 980 }}>
        <section style={{ border: "1px solid #222", borderRadius: 14, padding: 14, background: "#0f0f0f" }}>
          <h3 style={{ marginTop: 0 }}>Identidad</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label>
              Student ID
              <input style={inputStyle()} value={studentId} onChange={(e) => setStudentId(e.target.value)} />
            </label>
            <label>
              Nombre estudiante
              <input style={inputStyle()} value={studentName} onChange={(e) => setStudentName(e.target.value)} />
            </label>

            <label>
              Institución ID
              <input style={inputStyle()} value={instId} onChange={(e) => setInstId(e.target.value)} />
            </label>
            <label>
              Institución nombre
              <input style={inputStyle()} value={instName} onChange={(e) => setInstName(e.target.value)} />
            </label>

            <label>
              Región
              <input style={inputStyle()} value={region} onChange={(e) => setRegion(e.target.value)} />
            </label>
            <div />

            <label>
              Materia ID
              <input style={inputStyle()} value={subjectId} onChange={(e) => setSubjectId(e.target.value)} />
            </label>
            <label>
              Materia nombre
              <input style={inputStyle()} value={subjectName} onChange={(e) => setSubjectName(e.target.value)} />
            </label>
          </div>
        </section>

        <section style={{ border: "1px solid #222", borderRadius: 14, padding: 14, background: "#0f0f0f" }}>
          <h3 style={{ marginTop: 0 }}>Contexto académico</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <label>
              Año lectivo
              <input style={inputStyle()} type="number" value={year} onChange={(e) => setYear(e.target.value)} />
            </label>

            <label>
              Nivel
              <select style={inputStyle()} value={level} onChange={(e) => setLevel(e.target.value)}>
                {LEVELS.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </label>

            <label>
              Sistema origen
              <select style={inputStyle()} value={system} onChange={(e) => setSystem(e.target.value)}>
                {SYSTEMS.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </label>

            <label>
              Tipo evaluación
              <select style={inputStyle()} value={evalType} onChange={(e) => setEvalType(e.target.value)}>
                {EVAL_TYPES.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </label>

            <label>
              Modalidad
              <input style={inputStyle()} value={evalModality} onChange={(e) => setEvalModality(e.target.value)} placeholder="Exam / Coursework / Continua..." />
            </label>

            <label>
              Usuario auditor (simulado)
              <input style={inputStyle()} value={auditorUser} onChange={(e) => setAuditorUser(e.target.value)} />
            </label>
          </div>
        </section>

        <section style={{ border: "1px solid #222", borderRadius: 14, padding: 14, background: "#0f0f0f" }}>
          <h3 style={{ marginTop: 0 }}>Calificación original (según sistema)</h3>

          {system === "UK" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <label>
                Escala
                <select style={inputStyle()} value={ukScale} onChange={(e) => setUkScale(e.target.value)}>
                  {UK_SCALES.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </label>
              <label>
                Nota (A*, A, B...)
                <input style={inputStyle()} value={ukValue} onChange={(e) => setUkValue(e.target.value)} />
              </label>
              <div />

              <label>
                Coursework
                <input style={inputStyle()} value={ukCoursework} onChange={(e) => setUkCoursework(e.target.value)} />
              </label>
              <label>
                Exam
                <input style={inputStyle()} value={ukExam} onChange={(e) => setUkExam(e.target.value)} />
              </label>
            </div>
          )}

          {system === "US" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <label>
                Letter grade (A-F)
                <input style={inputStyle()} value={usLetter} onChange={(e) => setUsLetter(e.target.value)} />
              </label>
              <label>
                GPA (0.0 - 4.0)
                <input style={inputStyle()} type="number" step="0.1" value={usGpa} onChange={(e) => setUsGpa(e.target.value)} />
              </label>
              <label>
                Créditos
                <input style={inputStyle()} type="number" value={usCredits} onChange={(e) => setUsCredits(e.target.value)} />
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="checkbox" checked={usWeighted} onChange={(e) => setUsWeighted(e.target.checked)} />
                Weighted GPA
              </label>
            </div>
          )}

          {system === "DE" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
              <label>
                Nota (1.0 - 6.0)
                <input style={inputStyle()} type="number" step="0.1" value={deValue} onChange={(e) => setDeValue(e.target.value)} />
              </label>
              <label>
                Contexto (nivel / bundesweit / etc.)
                <input style={inputStyle()} value={deLevelNote} onChange={(e) => setDeLevelNote(e.target.value)} />
              </label>
            </div>
          )}

          {system === "AR" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
              <label>
                Nota (1 - 10)
                <input style={inputStyle()} type="number" value={arValue} onChange={(e) => setArValue(e.target.value)} />
              </label>
              <label>
                Instancia (Regular / Diciembre / Febrero)
                <input style={inputStyle()} value={arInstance} onChange={(e) => setArInstance(e.target.value)} />
              </label>
            </div>
          )}

          <div style={{ marginTop: 14, padding: 12, border: "1px solid #222", borderRadius: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Preview payload (original)</div>
            <pre style={{ margin: 0, fontSize: 12, opacity: 0.85, whiteSpace: "pre-wrap" }}>
{JSON.stringify(originalGrade, null, 2)}
            </pre>
          </div>
        </section>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" disabled={saving}>
            {saving ? "Registrando..." : "Registrar (append-only)"}
          </button>
          <button type="button" onClick={() => nav("/")} disabled={saving}>
            Volver
          </button>
        </div>
      </form>
    </div>
  );
}
