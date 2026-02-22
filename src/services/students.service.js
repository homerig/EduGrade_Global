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
      // identity es opcional (solo si lo usás)
      ...(data.identity ? { identity: data.identity } : {}),
    }),

  remove: (id) => http.delete(`/api/students/${id}`),
};