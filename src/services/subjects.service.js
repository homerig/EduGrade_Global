import http from "./http";

export const SubjectsService = {
  list: (params = {}) => http.get("/api/subjects", { params }),
  getById: (id) => http.get(`/api/subjects/${id}`),
  create: (data) => http.post("/api/subjects", data),
  remove: (id) => http.delete(`/api/subjects/${id}`),
};