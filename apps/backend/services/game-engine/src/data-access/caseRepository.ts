import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { CaseDoesNotExistError } from "@solspin/errors"; // Update with actual path
import { BaseCase, BaseCaseItem, CaseType } from "@solspin/game-engine-types";
import { CASES_TABLE_NAME } from "../foundation/runtime";
import fs from "fs";

const client = new DynamoDBClient({ region: "eu-west-2" });
const ddbDocClient = DynamoDBDocumentClient.from(client);

// Method to add a new case
export const addCase = async (
  caseName: string,
  casePrice: number,
  caseType: CaseType,
  imageUrl: string,
  items: BaseCaseItem[],
  itemPrefixSums: Array<number>,
  caseId: string,
  tag: string
): Promise<void> => {
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
    tag: tag,
  };

  const params = {
    TableName: CASES_TABLE_NAME,
    Item: newCase,
  };

  await ddbDocClient.send(new PutCommand(params));
};

// Method to retrieve a case by ID
export const getCase = async (caseId: string): Promise<BaseCase> => {
  const params = {
    TableName: CASES_TABLE_NAME,
    Key: {
      id: caseId,
    },
  };

  const result = await ddbDocClient.send(new GetCommand(params));

  if (!result.Item || Object.keys(result.Item).length === 0) {
    throw new CaseDoesNotExistError(caseId);
  }

  return result.Item as BaseCase;
};

// Method to list all cases (overview)
export const listCases = async (): Promise<BaseCase[]> => {
  const params = {
    TableName: CASES_TABLE_NAME,
  };

  const result = await ddbDocClient.send(new ScanCommand(params));
  return result.Items as BaseCase[];
};

// Method to initialize database with mock data
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Read the JSON file
    const casesContent = fs.readFileSync("src/data/cases.json", "utf-8");
    const casesData = JSON.parse(casesContent) as BaseCase[];
    console.log(casesData);
    // Loop through each case in the JSON data
    for (const caseData of casesData) {
      // Add the case to the database
      await addCase(
        caseData.name,
        caseData.price,
        caseData.type as CaseType,
        caseData.imagePath,
        caseData.items,
        caseData.itemPrefixSums,
        caseData.id,
        caseData.tag
      );
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};
