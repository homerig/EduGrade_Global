import http from "./http";

export const SubjectsService = {
  // GET /api/institutions/{institutionMongoId}/subjects
  listByInstitution: (institutionMongoId) =>
    http.get(`/api/institutions/${institutionMongoId}/subjects`),

  // POST /api/institutions/{institution_id}/subjects
  // body esperado por tu endpoint: { name }
  createForInstitution: (institutionMongoId, data) =>
    http.post(`/api/institutions/${institutionMongoId}/subjects`, {
      name: data.name,
    }),
};