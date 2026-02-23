import http from "./http";

export const DashboardServices = {
  // GET /api/dashboard?country=...&institutionId=...&targetSystem=...
  // - Si pasás solo country => promedio país
  // - Si pasás country + institutionId => promedio institución
  get: (params = {}) =>
    http.get("/api/dashboard", {
      params: {
        country: params.country, // requerido
        institutionId: params.institutionId ?? undefined, // opcional
        targetSystem: params.targetSystem ?? undefined, // opcional
      },
    }),

  // GET /api/dashboard/subjects?country=...&institutionId=...&targetSystem=...
  // - institutionId es requerido para breakdown por materias
  getBySubjects: (params = {}) =>
    http.get("/api/dashboard/subjects", {
      params: {
        country: params.country, // requerido
        institutionId: params.institutionId, // requerido
        targetSystem: params.targetSystem ?? undefined, // opcional
      },
    }),
};