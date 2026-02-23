// src/services/history.service.js
import http from "./http"; // ✅ IMPORTANTE: este path es relativo a /services

export const HistoryService = {
  get(studentId) {
    return http.get(`/api/students/${studentId}/history`);
  },
};