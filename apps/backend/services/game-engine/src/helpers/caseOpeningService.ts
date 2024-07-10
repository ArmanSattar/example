import { determineItem, generateRollValue } from "./caseItemDeterminationService";
import { BaseCase, BaseCaseItem } from "@solspin/game-engine-types";
import { SpinResult } from "@solspin/game-engine-types";
export const handleSpin = async (
  caseModel: BaseCase,
  serverSeed: string,
  clientSeed: string
): Promise<SpinResult | null> => {
  if (!caseModel || !serverSeed || !clientSeed) {
    throw new Error("caseId, serverSeed, or clientSeed is missing");
  }

  try {
    const spinResult = performSpin(caseModel, serverSeed, clientSeed);

    return spinResult;
  } catch (error) {
    console.error("Error in spin:", error);
    throw new Error("Internal Server Error");
  }
};

const performSpin = (caseModel: BaseCase, serverSeed: string, clientSeed: string): SpinResult => {
  const rollValue = generateRollValue(serverSeed, clientSeed);
  const rewardItem = determineItem(rollValue, caseModel);
  return { rewardItem, rollValue };
};
