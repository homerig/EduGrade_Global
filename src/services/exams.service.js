// src/services/exams.service.js
import http from "./http";

export const ExamsService = {
  list(params) {
    return http.get("/api/exams", { params });
  },
};