const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const random_name = require("node-random-name");

const awsOptions = {
  region: "ap-southeast-1",
};

const dynamoDB = new AWS.DynamoDB(awsOptions);

const milliseconds = 60 * 1000;

const ttlMinutes = 60;

async function createTableIfNotExist(tableName) {
  const res = await dynamoDB.listTables().promise();

  if (res.TableNames.find((item) => item === tableName)) {
    console.log(`Table ${tableName} exists, moving on`);
    return;
  }

  console.log(`Creating table ${tableName}`);

  await dynamoDB
    .createTable({
      TableName: tableName,
      KeySchema: [
        {
          AttributeName: "UserName",
          KeyType: "HASH",
        },
        {
          AttributeName: "SessionId",
          KeyType: "RANGE",
        },
      ],
      AttributeDefinitions: [
        {
          AttributeName: "UserName",
          AttributeType: "S",
        },
        {
          AttributeName: "SessionId",
          AttributeType: "S",
        },
      ],
      BillingMode: "PAY_PER_REQUEST",
    })
    .promise();

  await dynamoDB
    .waitFor("tableExists", {
      TableName: tableName,
    })
    .promise();

  await dynamoDB
    .updateTimeToLive({
      TableName: tableName,
      TimeToLiveSpecification: {
        AttributeName: "ExpirationDate",
        Enabled: true,
      },
    })
    .promise();
}

async function insertData(tableName, numRecords) {
  await Promise.all(
    [...Array(10).keys()].map((i) =>
      dynamoDB
        .putItem({
          TableName: tableName,
          Item: {
            UserName: { S: random_name() },
            SessionId: { S: uuidv4() },
            ExpirationDate: { N: `${Date.now() + ttlMinutes * milliseconds}` },
          },
        })
        .promise()
    )
  );
}

async function main() {
  const tableName = "MyUserSessions";
  await createTableIfNotExist(tableName);
  await insertData(tableName, 10);
}

main().catch((e) => console.error(e));
