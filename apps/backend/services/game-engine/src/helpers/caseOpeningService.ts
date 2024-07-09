import { generateRollValue, determineItem } from "./caseItemDeterminationService";
import { ICase, ICaseItem } from "@solspin/game-engine-types";

export const handleSpin = async (
  caseModel: ICase,
  serverSeed: string,
  clientSeed: string
): Promise<ICaseItem | null> => {
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

const performSpin = (caseModel: ICase, serverSeed: string, clientSeed: string): ICaseItem => {
  const rollValue = generateRollValue(serverSeed, clientSeed);
  console.log("Roll value is: ", rollValue);
  const rewardItem = determineItem(rollValue, caseModel);
  return rewardItem;
};
