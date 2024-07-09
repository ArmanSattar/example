import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { CaseType } from "../foundation/caseType";
import { randomUUID } from "crypto";
import { CaseDoesNotExistError, EnvironmentVariableError } from "@solspin/errors"; // Update with actual path
import { mockCase } from "../__mock__/case_pot_of_gold.mock";
import { BaseCase, BaseCaseItem } from "@solspin/game-engine-types";

const client = new DynamoDBClient({ region: "eu-west-2" });
const ddbDocClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME || process.env.CASES_TABLE_NAME || "cases";

if (!tableName) {
  throw new EnvironmentVariableError("TABLE_NAME");
}

// Helper method to calculate item prefix sums based on probabilities
const calculateItemPrefixSums = (items: BaseCaseItem[]): number[] => {
  const prefixSums: number[] = [];
  let sum = 0;
  const maxRange = 99999;

  items.forEach((item) => {
    sum += item.chance * maxRange;
    prefixSums.push(Math.floor(sum));
  });

  return prefixSums;
};

// Method to add a new case
export const addCase = async (
  caseName: string,
  casePrice: number,
  caseType: CaseType,
  imageUrl: string,
  items: BaseCaseItem[],
  itemPrefixSums: Array<number>
): Promise<void> => {
  const caseId = randomUUID();

  const newCase: BaseCase = {
    type: caseType,
    name: caseName,
    price: casePrice,
    id: caseId,
    imagePath: imageUrl,
    items: items,
    itemPrefixSums: itemPrefixSums,
    highestPrice: Math.max(...items.map((item) => item.price)),
    lowestPrice: Math.min(...items.map((item) => item.price)),
    rarity: items[0].rarity,
    tag: "Hot",
  };

  const params = {
    TableName: tableName,
    Item: newCase,
  };

  await ddbDocClient.send(new PutCommand(params));
};

// Method to retrieve a case by ID
export const getCase = async (caseId: string): Promise<BaseCase> => {
  const params = {
    TableName: tableName,
    Key: {
      id: caseId,
    },
  };

  const result = await ddbDocClient.send(new GetCommand(params));

  console.log(result.Item);

  if (!result.Item || Object.keys(result.Item).length === 0) {
    throw new CaseDoesNotExistError(caseId);
  }

  return result.Item as BaseCase;
};

// Method to list all cases (overview)
export const listCases = async (): Promise<BaseCase[]> => {
  const params = {
    TableName: tableName,
  };

  const result = await ddbDocClient.send(new ScanCommand(params));
  return result.Items as BaseCase[];
};

// Method to initialize database with mock data
export const initializeDatabase = async (): Promise<void> => {
  await addCase(
    mockCase.name,
    mockCase.price,
    CaseType.CSGO,
    mockCase.imagePath,
    mockCase.items,
    mockCase.itemPrefixSums
  );
};
