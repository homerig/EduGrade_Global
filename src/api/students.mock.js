let students = [
  { id: "S-1", nombre: "Alice Mokoena", email: "alice@mail.com" },
  { id: "S-2", nombre: "Bob Nkosi", email: "bob@mail.com" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function listStudents() {
  await sleep(200);
  return [...students];
}

export async function createStudent(s) {
  await sleep(200);
  students = [s, ...students];
  return s;
}

export async function updateStudent(id, patch) {
  await sleep(200);
  students = students.map((x) => (x.id === id ? { ...x, ...patch } : x));
  return true;
}

export async function deleteStudent(id) {
  await sleep(200);
  students = students.filter((x) => x.id !== id);
  return true;
}
