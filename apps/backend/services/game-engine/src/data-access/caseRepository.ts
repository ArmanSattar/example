import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { ICaseItem, ICase } from "@solspin/game-engine-types";
import { randomUUID } from "crypto";
import { CaseDoesNotExistError, EnvironmentVariableError, FetchCasesError } from "@solspin/errors"; // Update with actual path
import { mockCase } from "../__mock__/case_pot_of_gold.mock";

const client = new DynamoDBClient({ region: "eu-west-2" });
const ddbDocClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME || process.env.CASES_TABLE_NAME || "cases";

if (!tableName) {
  throw new EnvironmentVariableError("TABLE_NAME");
}

// Helper method to calculate item prefix sums based on probabilities
const calculateItemPrefixSums = (items: ICaseItem[]): number[] => {
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
  name: string,
  price: number,
  rarity: string,
  highestPrice: number,
  lowestPrice: number,
  tag: string,
  image: string,
  items: ICaseItem[],
  itemPrefixSums: Array<number>
): Promise<void> => {
  const caseId = randomUUID();
  const newCase: ICase = {
    id: caseId,
    name: name,
    price: price,
    rarity: rarity,
    highestPrice: highestPrice,
    lowestPrice: lowestPrice,
    tag: tag,
    image: image,
    items: items,
    itemPrefixSums,
  };

  const params = {
    TableName: tableName,
    Item: newCase,
  };

  await ddbDocClient.send(new PutCommand(params));
};

// Method to retrieve a case by ID
export const getCase = async (caseId: string): Promise<ICase> => {
  const params = {
    TableName: tableName,
    Key: {
      caseId: caseId,
    },
  };

  const result = await ddbDocClient.send(new GetCommand(params));

  if (!result.Item || Object.keys(result.Item).length === 0) {
    throw new CaseDoesNotExistError(caseId);
  }

  return result.Item as ICase;
};

// Method to list all cases (overview)
export const listCases = async (): Promise<ICase[]> => {
  const params = {
    TableName: tableName,
  };

  const result = await ddbDocClient.send(new ScanCommand(params));
  return result.Items as ICase[];
};

// Method to initialize database with mock data
export const initializeDatabase = async (): Promise<void> => {
  await addCase(
    mockCase.name,
    mockCase.price,
    mockCase.rarity,
    mockCase.highestPrice,
    mockCase.lowestPrice,
    mockCase.tag,
    mockCase.image,
    mockCase.items,
    mockCase.itemPrefixSums
  );
};
