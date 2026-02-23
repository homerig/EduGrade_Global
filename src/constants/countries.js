import ARG from "../assets/ARG.jpg";
import DEU from "../assets/DEU.png";
import GBR from "../assets/GBR.jpg";
import USA from "../assets/USA.png";
import ZAF from "../assets/ZAF.jpg";

export const COUNTRIES = [
  // 🇦🇷 Argentina
  {
    iso3: "ARG",
    system: "ARG_1_10",
    nationality: "Argentina",
    label: "Argentina — Sistema 1 a 10",
    flag: ARG,
  },

  // 🇩🇪 Alemania
  {
    iso3: "DEU",
    system: "DEU_1_6_INVERTED",
    nationality: "Alemania",
    label: "Alemania — Sistema 1 a 6 (invertido)",
    flag: DEU,
  },

  // 🇺🇸 Estados Unidos (dos sistemas)
  {
    iso3: "USA",
    system: "USA_GPA_0_4",
    nationality: "Estados Unidos",
    label: "Estados Unidos — GPA 0–4",
    flag: USA,
  },
  {
    iso3: "USA",
    system: "USA_LETTER_A_F",
    nationality: "Estados Unidos",
    label: "Estados Unidos — Letras A–F",
    flag: USA,
  },

  // 🇬🇧 Reino Unido (tres sistemas)
  {
    iso3: "GBR",
    system: "GBR_ALEVEL",
    nationality: "Reino Unido",
    label: "Reino Unido — A-Level",
    flag: GBR,
  },
  {
    iso3: "GBR",
    system: "GBR_GCSE",
    nationality: "Reino Unido",
    label: "Reino Unido — GCSE",
    flag: GBR,
  },
  {
    iso3: "GBR",
    system: "GBR_ASTAR_F",
    nationality: "Reino Unido",
    label: "Reino Unido — A*–F",
    flag: GBR,
  },

  // 🇿🇦 Sudáfrica (si solo mostrás ZA como vista canónica)
  {
    iso3: "ZAF",
    system: "ZA",
    nationality: "South African",
    label: "Sudáfrica — Escala canónica (ZA)",
    flag: ZAF,
  },
];