const { DynamoDB, Lambda } = require('aws-sdk');

exports.handler = async function(event) {
  console.log('request:', JSON.stringify(event, undefined, 2));

  // Create AWS SDK clients
  const dynamo = new DynamoDB();
  const lambda = new Lambda();

  // update Dynamo entry "path" with hits++
  await dynamo.updateItem({
    TableName: process.env.HITS_TABLE_NAME,
    Key: { path: { S: event.path } },
    UpdateExpression: 'ADD hits :incr',
    ExpressionAttributeValues: { ':incr': { N: '1' } }
  }).promise();

  // call downstream function and capture response
  const resp = await lambda.invoke({
    FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,
    Payload: JSON.stringify(event)
  }).promise();

  consple.log('downstream response:', JSON.stringify(resp, undefined, 2));

  // return response back to upstream caller
  return JSON.parse(resp.Payload);
}
