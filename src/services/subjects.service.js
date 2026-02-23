import http from "./http";

export const SubjectsService = {
  // GET /api/institutions/{institutionMongoId}/subjects
  listByInstitution: (institutionMongoId) =>
    http.get(`/api/institutions/${institutionMongoId}/subjects`),

  // POST /api/institutions/{institutionMongoId}/subjects?name=...
  createForInstitution: (institutionMongoId, data) =>
    http.post(
      `/api/institutions/${institutionMongoId}/subjects`,
      null,
      { params: { name: data.name } }
    ),
};