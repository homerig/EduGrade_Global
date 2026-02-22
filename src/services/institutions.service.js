import http from "./http";

export const InstitutionsService = {
  // GET /api/institutions?name=&country=&address=&limit=&skip=
  list: (params = {}) =>
    http.get("/api/institutions", {
      params: {
        name: params.name ?? undefined,
        country: params.country ?? undefined,
        address: params.address ?? undefined,
        limit: params.limit ?? 50,
        skip: params.skip ?? 0,
      },
    }),

  // GET /api/institutions/:id
  getById: (id) => http.get(`/api/institutions/${id}`),

  // POST /api/institutions
  // body: { name, country, address }
  create: (data) =>
    http.post("/api/institutions", {
      name: data.name,
      country: data.country,
      address: data.address,
    }),

  // DELETE /api/institutions/:id
  remove: (id) => http.delete(`/api/institutions/${id}`),
};