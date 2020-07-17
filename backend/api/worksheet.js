'use strict';

const AWS = require('aws-sdk');
const uuid = require('uuid');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { WORKSHEETS_TABLE } = process.env;

const createResponse = (statusCode, body = '', headers = {}) => {
  const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
  };

  return {
    statusCode,
    body: body,
    headers: { ...CORS_HEADERS, ...headers },
  };
};

module.exports.list = async () => {
  const scanOutput = await dynamoDb.scan({
    TableName: WORKSHEETS_TABLE,
    ProjectionExpression: 'id, sheetName',
  }).promise();

  return createResponse(200, JSON.stringify({ worksheets: scanOutput.Items }));
};

module.exports.get = async event => {
  const result = await dynamoDb.get({
    TableName: WORKSHEETS_TABLE,
    Key: {
      id: event.pathParameters.id,
    },
  }).promise();

  if (!result.Item) {
    return createResponse(404);
  }

  return createResponse(200, JSON.stringify({ worksheet: result.Item }));
};

module.exports.create = async event => {
  const requestBody = JSON.parse(event.body);
  const now = Date.now();
  const worksheetDetails = {
    id: uuid.v1(),
    sheetName: requestBody.sheetName,
    contents: createEmptyWorksheet(10, 10),
    createdAt: now,
    updatedAt: now,
  };

  await dynamoDb.put({
    TableName: WORKSHEETS_TABLE,
    Item: worksheetDetails,
  }).promise();

  return createResponse(200, JSON.stringify({ worksheet: worksheetDetails }));
};

module.exports.update = async event => {
  return createResponse(200, JSON.stringify({ worksheet: result.Item }));
};

function createEmptyWorksheet (rows, columns) {
  const emptyArray = Array(columns).fill(null);

  return Array(rows).fill(emptyArray);
}
