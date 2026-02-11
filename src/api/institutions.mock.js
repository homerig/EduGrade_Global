let institutions = [
  { id: "I-1", nombre: "Cape Town College", region: "Western Cape" },
  { id: "I-2", nombre: "Johannesburg Institute", region: "Gauteng" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function listInstitutions() {
  await sleep(200);
  return [...institutions];
}

export async function createInstitution(i) {
  await sleep(200);
  institutions = [i, ...institutions];
  return i;
}

export async function updateInstitution(id, patch) {
  await sleep(200);
  institutions = institutions.map((x) => (x.id === id ? { ...x, ...patch } : x));
  return true;
}

export async function deleteInstitution(id) {
  await sleep(200);
  institutions = institutions.filter((x) => x.id !== id);
  return true;
}
