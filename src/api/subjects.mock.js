let subjects = [
  { id: "MATH-01", nombre: "Mathematics" },
  { id: "ENG-01", nombre: "English" },
  { id: "HIST-01", nombre: "History" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function listSubjects() {
  await sleep(200);
  return [...subjects];
}

export async function createSubject(s) {
  await sleep(200);
  subjects = [s, ...subjects];
  return s;
}

export async function updateSubject(id, patch) {
  await sleep(200);
  subjects = subjects.map((x) => (x.id === id ? { ...x, ...patch } : x));
  return true;
}

export async function deleteSubject(id) {
  await sleep(200);
  subjects = subjects.filter((x) => x.id !== id);
  return true;
}
