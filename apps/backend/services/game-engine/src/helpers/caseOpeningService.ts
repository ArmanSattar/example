import { determineItem, generateRollValue } from "./caseItemDeterminationService";
import { BaseCase, BaseCaseItem } from "@solspin/game-engine-types";

export const handleSpin = async (
  caseModel: BaseCase,
  serverSeed: string,
  clientSeed: string
): Promise<BaseCaseItem | null> => {
  if (!caseModel || !serverSeed || !clientSeed) {
    throw new Error("caseId, serverSeed, or clientSeed is missing");
  }

  try {
    const rewardItem = performSpin(caseModel, serverSeed, clientSeed);

    return rewardItem;
  } catch (error) {
    console.error("Error in spin:", error);
    throw new Error("Internal Server Error");
  }
};

const performSpin = (caseModel: BaseCase, serverSeed: string, clientSeed: string): BaseCaseItem => {
  const rollValue = generateRollValue(serverSeed, clientSeed);
  console.log("Roll value is: ", rollValue);
  const rewardItem = determineItem(rollValue, caseModel);
  return rewardItem;
};
