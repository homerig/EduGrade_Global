import http from "./http";

export const EquivalencesService = {
  get: (subjectId, levelStage) =>
    http.get(`/api/equivalences/${subjectId}`, { params: { levelStage } }),

  create: (data) =>
    http.post("/api/equivalences", {
      fromSubjectId: data.fromSubjectId,
      toSubjectId: data.toSubjectId,
      levelStage: data.levelStage,
    }),

  remove: (subjectId, levelStage) =>
    http.delete(`/api/equivalences/${subjectId}`, { params: { levelStage } }),
};