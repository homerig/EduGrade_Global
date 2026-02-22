import http from "./http";

export const InstitutionsService = {
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

  getById: (id) => http.get(`/api/institutions/${id}`),

  create: (data) =>
    http.post("/api/institutions", {
      name: data.name,
      country: data.country,
      address: data.address,
    }),

  
};