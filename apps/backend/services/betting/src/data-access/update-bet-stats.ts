import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { BET_STATS_TABLE_NAME } from "../foundation/runtime";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function updateOrCreateBetStats(userId: string, betAmount: number, profit: number) {
  try {
    const updateParams: UpdateCommandInput = {
      TableName: BET_STATS_TABLE_NAME,
      Key: { userId },
      UpdateExpression:
        "SET totalBet = if_not_exists(totalBet, :zero) + :betAmount, totalProfit = if_not_exists(totalProfit, :zero) + :profit",
      ExpressionAttributeValues: {
        ":betAmount": betAmount,
        ":profit": profit,
        ":zero": 0,
      },
      ReturnValues: "ALL_NEW",
    };

    const { Attributes } = await docClient.send(new UpdateCommand(updateParams));
    console.log("Updated/Created item:", Attributes);
    return Attributes;
  } catch (error) {
    console.error("Error updating/creating bet stats:", error);
    throw error;
  }
}
