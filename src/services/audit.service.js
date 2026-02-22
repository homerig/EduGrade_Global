import http from "./http";

export const AuditService = {
  byDay: (day, limit = 200) => http.get(`/audit/days/${day}`, { params: { limit } }),
  byEntity: (entityType, entityId, limit = 50) =>
    http.get(`/audit/entities/${entityType}/${entityId}`, { params: { limit } }),
  byRequest: (requestId, limit = 200) => http.get(`/audit/requests/${requestId}`, { params: { limit } }),
};