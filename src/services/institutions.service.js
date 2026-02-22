import * as mock from "../api/institutions.mock";

export const InstitutionsService = {
  list: mock.listInstitutions,
  create: mock.createInstitution,
  update: mock.updateInstitution,
  remove: mock.deleteInstitution,
};
