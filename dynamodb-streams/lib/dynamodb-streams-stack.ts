import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as sqs from "@aws-cdk/aws-sqs";
import * as lambda from "@aws-cdk/aws-lambda";
import * as path from "path";
import { SqsDlq, DynamoEventSource } from "@aws-cdk/aws-lambda-event-sources";

export class DynamodbStreamsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB table
    const table = new dynamodb.Table(this, "Table", {
      tableName: "StreamTestTable",
      partitionKey: {
        name: "OrderId",
        type: dynamodb.AttributeType.STRING,
      },
      stream: dynamodb.StreamViewType.NEW_IMAGE,
    });

    // SQS DLQ
    const dlq = new sqs.Queue(this, "DeadLetterQueue");

    // Lambda function
    const fn = new lambda.Function(this, "MyFunction", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda")),
    });

    // Attach EventSource
    fn.addEventSource(
      new DynamoEventSource(table, {
        startingPosition: lambda.StartingPosition.TRIM_HORIZON,
        batchSize: 5,
        bisectBatchOnError: true,
        onFailure: new SqsDlq(dlq),
        retryAttempts: 3,
      })
    );
  }
}
