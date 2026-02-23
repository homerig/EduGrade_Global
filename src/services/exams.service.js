import http from "./http";

export const ExamServices = {
  createExam: (payload) =>
    http.post("/api/exams", payload),
};