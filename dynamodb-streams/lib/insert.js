const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const random_name = require("node-random-name");

const awsOptions = {
  region: "ap-southeast-1",
};

const tableName = "StreamTestTable";

// const dynamoDB = new AWS.DynamoDB(awsOptions);

var docClient = new AWS.DynamoDB.DocumentClient(awsOptions);

async function insertData(tableName) {
  await docClient
    .put({
      TableName: tableName,
      Item: {
        OrderId: uuidv4(),
        FullName: random_name(),
        LineItems: [
          {
            ItemName: "A thing",
            Price: Math.round(Math.random() * 10000) / 100,
          },
          {
            ItemName: "Another thing",
            Price: Math.round(Math.random() * 10000) / 100,
          },
        ],
      },
    })
    .promise();
}

insertData(tableName).catch((e) => console.error(e));
