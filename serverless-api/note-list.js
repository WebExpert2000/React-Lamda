import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
  let isShared;
  let params = {
    TableName: process.env.tableName
  };

  if (event.queryStringParameters && event.queryStringParameters.isShared) {
    isShared = stringToBoolean(event.queryStringParameters.isShared);
    params = {
      ...params,
      FilterExpression: "#isShared = :isShared",
      ExpressionAttributeNames: {
        "#isShared": "isShared",
      },
      ExpressionAttributeValues: { ":isShared": isShared }
    };
  }

  try {
    const result = await dynamoDbLib.call("scan", params);
    // Return the matching list of items in response body
    return success(result.Items.sort((item1, item2) => item2.createdAt - item1.createdAt));
  } catch (e) {
    console.log(e);
    return failure({ status: false });
  }
}

function stringToBoolean(variable) {
  switch (variable.toLowerCase().trim()) {
    case "true":
    case "yes":
    case "1":
      return true;
    case "false":
    case "no":
    case "0":
    case null:
      return false;
    default:
      return Boolean(variable);
  }
}
