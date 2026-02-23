import http from "./http";

export const OptionsService = {
  listGrade: () =>
    http.get("/api/options/grade", {
      params: {
        only_values: true,
      },
    }),

  listSystem: () =>
    http.get("/api/options/system", {
      params: {
        only_values: true,
      },
    }),
};