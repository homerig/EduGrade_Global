import * as mock from "../api/subjects.mock";

export const SubjectsService = {
  list: mock.listSubjects,
  create: mock.createSubject,
  update: mock.updateSubject,
  remove: mock.deleteSubject,
};
