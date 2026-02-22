import http from "./http";

export const AuditService = {
  byEntity: (entityType, entityId, limit = 50) =>
    http.get(`/audit/entities/${entityType}/${entityId}`, { params: { limit } }),

  byDay: (day, limit = 200) =>
    http.get(`/audit/days/${day}`, { params: { limit } }),

  byRequest: (requestId, limit = 200) =>
    http.get(`/audit/requests/${requestId}`, { params: { limit } }),
  
  recent: (days = 7, limit = 15) =>
    http.get(`/audit/recent`, { params: { days, limit } }),
};