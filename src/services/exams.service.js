import http from "./http";

export const ExamServices = {
  // GET /api/exams?subjectId=...&studentId=...&institutionId=...&fromDate=...&toDate=...&limit=...&skip=...
  list: (params = {}) =>
    http.get("/api/exams", {
      params: {
        subjectId: params.subjectId,
        studentId: params.studentId,
        institutionId: params.institutionId,
        fromDate: params.fromDate,
        toDate: params.toDate,
        limit: params.limit ?? 50,
        skip: params.skip ?? 0,
        // opcional (si existe conversión)
        targetSystem: params.targetSystem ?? undefined,
      },
    }),

  createExam: (payload) => http.post("/api/exams", payload),
};