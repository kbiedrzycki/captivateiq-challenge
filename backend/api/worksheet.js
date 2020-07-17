'use strict';

const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

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
    TableName: process.env.WORKSHEETS_TABLE,
    ProjectionExpression: 'id, sheetName',
  }).promise();

  return createResponse(200, JSON.stringify({ worksheets: scanOutput.Items }));
};

module.exports.get = async event => {
  const result = await dynamoDb.get({
    TableName: process.env.WORKSHEETS_TABLE,
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
  return createResponse(200, JSON.stringify({ worksheet: result.Item }));
};

module.exports.update = async event => {
  return createResponse(200, JSON.stringify({ worksheet: result.Item }));
};
