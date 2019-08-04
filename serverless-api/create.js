import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.tableName,
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      noteId: uuid.v1(),
      sequence: data.sequence,
      lang1_title: data.lang1_title || null,
      lang1_content: data.lang1_content || null,
      lang2_title: data.lang2_title || null,
      lang2_content: data.lang2_content || null,
      lang1: data.lang1,
      lang2: data.lang2,
      attachment1: data.attachment1,
      attachment2: data.attachment2,
      noteNumber: data.noteNumber,
      createdAt: Date.now(),
      isShared: data.isShared
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (e) {
    return failure({ status: false });
  }
}
