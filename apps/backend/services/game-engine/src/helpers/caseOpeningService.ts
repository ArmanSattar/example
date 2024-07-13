import { determineItem, generateRollValue } from "./caseItemDeterminationService";
import { BaseCase, BaseCaseItem } from "@solspin/game-engine-types";
import { SpinResult } from "@solspin/game-engine-types";
export const handleSpin = async (
  caseModel: BaseCase,
  serverSeed: string,
  clientSeed: string,
  spins: number
): Promise<SpinResult[] | null> => {
  if (!caseModel || !serverSeed || !clientSeed) {
    throw new Error("caseId, serverSeed, or clientSeed is missing");
  }

  try {
    let spinResults: SpinResult[] = [];
    for (let nonce = 1; nonce <= spins; nonce += 1) {
      const spinResult = performSpin(caseModel, serverSeed, clientSeed, nonce);

      spinResults.push(spinResult);
    }

    return spinResults;
  } catch (error) {
    console.error("Error in spin:", error);
    throw new Error("Internal Server Error");
  }
};

const performSpin = (
  caseModel: BaseCase,
  serverSeed: string,
  clientSeed: string,
  nonce: number
): SpinResult => {
  const rollValue = generateRollValue(serverSeed, clientSeed, nonce);
  const rewardItem = determineItem(rollValue, caseModel);
  return { rewardItem, rollValue };
};
