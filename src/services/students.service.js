import http from "./http";

export const StudentsService = {
  // Backend espera first_name, last_name, nationality, identity
  list: (params = {}) =>
    http.get("/api/students", {
      params: {
        first_name: params.first_name ?? undefined,
        last_name: params.last_name ?? undefined, // el back lo usa como like
        nationality: params.nationality ?? undefined,
        identity: params.identity ?? undefined,
        limit: params.limit ?? 100,
        skip: params.skip ?? 0,
      },
    }),

  getById: (id) => http.get(`/api/students/${id}`),

  create: (data) =>
    http.post("/api/students", {
      firstName: data.firstName,
      lastName: data.lastName,
      birthDate: data.birthDate,
      nationality: data.nationality,
      ...(data.identity ? { identity: data.identity } : {}),
    }),

  // (ya no lo usás en UI, pero lo dejo por si lo necesitás)
  remove: (id) => http.delete(`/api/students/${id}`),

  // ✅ Historial (si lo usás en HistorialAcademico real)
  history: (studentId) => http.get(`/api/students/${studentId}/history`),

  // ✅ Asociar institución al alumno
  // POST /students/{student_id}/institution?institution_id=...&start=...&end=...
  linkInstitution: (studentId, { institution_id, start, end }) =>
    http.post(`/api/students/${studentId}/institution`, null, {
      params: {
        institution_id,
        start,
        end: end ?? undefined,
      },
    }),

  // ✅ Asociar materia cursada (en Neo4j) con nota y fechas
  // POST /students/{student_id}/subject?subject_id=...&start=...&grade=...&end=...
  linkSubject: (studentId, { subject_id, start, grade, end }) =>
    http.post(`/api/students/${studentId}/subject`, null, {
      params: {
        subject_id,
        start,
        grade,
        end: end ?? undefined,
      },
    }),
};