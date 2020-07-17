'use strict';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
};

module.exports.list = async event => {
  return {
    statusCode: 200,
    headers: { ...CORS_HEADERS },
    body: JSON.stringify({ worksheets: [] }),
  };
};

module.exports.get = async event => {
  return {
    statusCode: 200,
    headers: { ...CORS_HEADERS },
    body: JSON.stringify({ worksheet: {} }),
  };
};

module.exports.create = async event => {
  return {
    statusCode: 200,
    headers: { ...CORS_HEADERS },
    body: JSON.stringify({ worksheet: {} }),
  };
};

module.exports.update = async event => {
  return {
    statusCode: 200,
    headers: { ...CORS_HEADERS },
    body: JSON.stringify({ worksheet: {} }),
  };
};
