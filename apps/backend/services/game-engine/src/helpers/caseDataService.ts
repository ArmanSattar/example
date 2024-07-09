import { ICase } from "@solspin/game-engine-types";

import { mockCase } from "../__mock__/case_pot_of_gold.mock";

export const getCase = async (caseName: string): Promise<ICase | null> => {
  try {
    return mockCase["name"] === caseName ? mockCase : null;
  } catch (error) {
    console.error("Error reading case data:", error);
    throw new Error("Could not read case data");
  }
};

export const getAllCases = async (): Promise<Array<ICase>> => {
  try {
    return [mockCase];
  } catch (error) {
    console.error("Error reading all cases:", error);
    throw new Error("Could not read all cases");
  }
};
