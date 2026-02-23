// src/services/students.service.js
import http from "./http";

export const StudentsService = {
  // ✅ Backend espera: firstName, lastName, nationality, identity
  list: (params = {}) =>
    http.get("/api/students", {
      params: {
        firstName: params.firstName ?? undefined,
        lastName: params.lastName ?? undefined,
        nationality: params.nationality ?? undefined,
        identity: params.identity ?? undefined,
        limit: params.limit ?? 100,
        skip: params.skip ?? 0,
      },
    }),

  getById: (id) => http.get(`/api/students/${id}`),

  // ✅ Backend StudentCreate: firstName, lastName, birthDate(date), nationality, identity
  create: (data) =>
    http.post("/api/students", {
      firstName: data.firstName,
      lastName: data.lastName,
      birthDate: data.birthDate, // "YYYY-MM-DD"
      nationality: data.nationality, // ISO3
      ...(data.identity ? { identity: data.identity } : {}),
    }),

  remove: (id) => http.delete(`/api/students/${id}`),

  history: (studentId) => http.get(`/api/students/${studentId}/history`),

  linkInstitution: (studentId, { institution_id, start, end }) =>
    http.post(`/api/students/${studentId}/institution`, null, {
      params: {
        institution_id,
        start,
        end: end ?? undefined,
      },
    }),

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