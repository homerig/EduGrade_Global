import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import "../../styles/ui.css";
import { COUNTRIES } from "../../constants/countries";

// ✅ mock con datos extra (parciales, nivel, cierre)
async function fetchTranscriptMock(studentId, countryIso3) {
  const bonus = countryIso3 === "USA" ? 1 : 0;

  return [
    {
      year: 2024,
      items: [
        {
          subjectId: "MAT-2024",
          subject: "MATEMÁTICA",
          institution: "UADE",
          finalGrade: String(8 + bonus),
          level: "Undergraduate",
          closedAt: "2024-12-10",
          partials: [
            { name: "Parcial 1", grade: "7", date: "2024-05-10" },
            { name: "Parcial 2", grade: "8", date: "2024-09-02" },
          ],
        },
        {
          subjectId: "LEN-2024",
          subject: "LENGUA",
          institution: "UBA",
          finalGrade: "5",
          level: "Undergraduate",
          closedAt: "2024-11-25",
          partials: [
            { name: "Parcial 1", grade: "4", date: "2024-06-12" },
            { name: "Parcial 2", grade: "6", date: "2024-10-01" },
          ],
        },
      ],
    },
    {
      year: 2023,
      items: [
        {
          subjectId: "FIS-2023",
          subject: "FÍSICA",
          institution: "UADE",
          finalGrade: "7",
          level: "Undergraduate",
          closedAt: "2023-12-05",
          partials: [{ name: "Parcial 1", grade: "6", date: "2023-06-08" }],
        },
      ],
    },
  ];
}

export default function HistorialAcademico() {
  const { id } = useParams();
  const location = useLocation();

  // ✅ Si venís desde la tabla, recibís nombre y apellido por state
  const studentFromState = location.state?.student;
  const studentName = useMemo(() => {
    const fn = studentFromState?.firstName?.trim();
    const ln = studentFromState?.lastName?.trim();
    const full = [fn, ln].filter(Boolean).join(" ");
    return full || null;
  }, [studentFromState]);

  const [country, setCountry] = useState("ZAF");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeline, setTimeline] = useState([]);

  // ✅ Estado de expansión por materia
  const [openKey, setOpenKey] = useState(null); // solo 1 abierta. Si querés múltiples, lo hacemos con Set.

  const countryMeta = useMemo(() => {
    return COUNTRIES.find((x) => x.iso3 === country) ?? null;
  }, [country]);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setError("");
        setLoading(true);

        const data = await fetchTranscriptMock(id, country);

        if (!alive) return;
        setTimeline(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!alive) return;
        const msg =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "No se pudo cargar el historial.";
        setError(msg);
        setTimeline([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [id, country]);

  return (
    <div className="page">
      <div className="pageHeaderRow">
        <div>
          <h1 className="pageTitle">Historial académico</h1>

          <div className="mutedText">
            Alumno: <b>{studentName ?? id}</b>
          </div>
        </div>

        {/* selector arriba derecha */}
        <div className="countryPill">
          <div className="countryLeft">
            {countryMeta?.flag && (
              <img className="countryFlag" src={countryMeta.flag} alt={countryMeta.label} />
            )}
            {/* Si preferís no repetir el texto, podés dejar solo la bandera */}
            {/* <span className="code">{countryMeta?.label ?? country}</span> */}
          </div>

          <select
            className="countrySelect"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            aria-label="Seleccionar país"
          >
            {COUNTRIES.map((c) => (
              <option key={c.iso3} value={c.iso3}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="errorText">{error}</p>}

      {loading ? (
        <div className="card">
          <p>Cargando...</p>
        </div>
      ) : timeline.length === 0 ? (
        <div className="card">
          <p>Sin historial académico cargado.</p>
        </div>
      ) : (
        <div className="academicBoard">
          {timeline
            .slice()
            .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
            .map((block) => (
              <div key={block.year} className="yearSection">
                <div className="yearBox">{block.year}</div>

                <div className="yearRight">
                  {(block.items ?? []).map((row, idx) => {
                    const key = row.subjectId ?? `${block.year}-${idx}`;
                    const isOpen = openKey === key;

                    return (
                      <div key={key}>
                        <div className="subjectRow">
                          {/* ✅ Columna materia + flecha clickeable */}
                          <button
                            type="button"
                            className="subjectToggle"
                            onClick={() => setOpenKey(isOpen ? null : key)}
                            title={isOpen ? "Ocultar detalles" : "Ver detalles"}
                          >
                            <span className="subjectName">{row.subject}</span>
                            <span className="rowChevron" aria-hidden="true">
                              {isOpen ? "▴" : "▾"}
                            </span>
                          </button>

                          <div className="institutionName">{row.institution}</div>

                          <div className="finalGrade">
                            <span className="finalLabel">NOTA FINAL:</span>
                            <span className="finalValue">{row.finalGrade}</span>
                          </div>

                          {/* columna vacía para mantener grid prolijo (antes era chevron) */}
                          <div />
                        </div>

                        {isOpen && (
                          <div className="subjectDetails">
                            <div className="detailsGrid">
                              <div>
                                <div className="detailsLabel">Nivel</div>
                                <div className="detailsValue">{row.level ?? "-"}</div>
                              </div>

                              <div>
                                <div className="detailsLabel">Cierre</div>
                                <div className="detailsValue">{row.closedAt ?? "-"}</div>
                              </div>
                            </div>

                            <div className="detailsLabel" style={{ marginTop: 10 }}>
                              Parciales
                            </div>

                            {(row.partials ?? []).length === 0 ? (
                              <div className="detailsValue">Sin parciales.</div>
                            ) : (
                              <table className="detailsTable">
                                <thead>
                                  <tr>
                                    <th>Instancia</th>
                                    <th>Nota</th>
                                    <th>Fecha</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {row.partials.map((p, i) => (
                                    <tr key={i}>
                                      <td>{p.name}</td>
                                      <td>{p.grade}</td>
                                      <td>{p.date}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}