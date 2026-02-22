import * as mock from "../api/students.mock";

export const StudentsService = {
  list: mock.listStudents,
  create: mock.createStudent,
  update: mock.updateStudent,
  remove: mock.deleteStudent,
};
