import http from "./http";

export const SubjectsService = {
  list: (params) => http.get("/api/subjects", { params }),

  getById: (id) => http.get(`/api/subjects/${id}`),

  create: (data) => http.post("/api/subjects", data),

  update: (id, data) => http.put(`/api/subjects/${id}`, data),

  remove: (id) => http.delete(`/api/subjects/${id}`),
};