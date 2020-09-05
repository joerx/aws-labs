import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as destinations from "@aws-cdk/aws-lambda-destinations";
import * as sns from "@aws-cdk/aws-sns";
import * as path from "path";

export class LambdaDestinationsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const snsTopic = new sns.Topic(this, "SuccessTopic");

    const errorFn = new lambda.Function(this, "ErrorHandler", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda/error-handler")),
    });

    const errorDst = new destinations.LambdaDestination(errorFn);
    const successDst = new destinations.SnsDestination(snsTopic);

    const myFn = new lambda.Function(this, "MyFunction", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda/my-function")),
      onFailure: errorDst,
      onSuccess: successDst,
    });

    new cdk.CfnOutput(this, "MyFunctionName", {
      value: myFn.functionName,
    });

    new cdk.CfnOutput(this, "ErrorHandlerFn", {
      value: errorFn.functionName,
    });

    new cdk.CfnOutput(this, "TopicName", {
      value: snsTopic.topicName,
    });
  }
}
