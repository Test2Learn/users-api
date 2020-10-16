const ApiBuilder = require('claudia-api-builder'),
  AWS = require('aws-sdk');
var api = new ApiBuilder(),
  dynamoDb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = 'ttl-users-dev';

api.post(
  '/users',
  function (request) {
    var params = {
      TableName: TABLE_NAME,
      Item: {
        id: request.body.id,
        accepted_terms: request.body.accepted_terms,
        version: request.body.version,
        date: request.body.date,
      },
    };
    return dynamoDb.put(params).promise(); // returns dynamo result
  },
  { success: 201 }
); // returns HTTP status 201 - Created if successful

api.get('/users', function (request) {
  // GET all users
  return dynamoDb
    .scan({ TableName: TABLE_NAME })
    .promise()
    .then((response) => response.Items);
});

api.get('/users/{id}', function (request) {
  // GET a user
  const id = request.pathParams.id;
  const params = {
    TableName: TABLE_NAME,
    Key: {
      id: id,
    },
  };

  return dynamoDb
    .get(params)
    .promise()
    .then((response) => response.Item);
});

api.put('/users/{id}', function (request) {
  // GET a user
  const id = request.pathParams.id;
  const params = {
    TableName: TABLE_NAME,
    Key: {
      id: id,
    },
    ExpressionAttributeValues: {
      ':x': request.queryString.accepted_terms,
    },
    UpdateExpression: 'set accepted_terms = :x',
  };

  return dynamoDb
    .update(params)
    .promise()
    .then((response) => {
      return response.Item;
    });
});

module.exports = api;
