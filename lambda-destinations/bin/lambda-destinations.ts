#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { LambdaDestinationsStack } from "../lib/lambda-destinations-stack";

const app = new cdk.App();
new LambdaDestinationsStack(app, "LambdaDestinationsStack", {
  env: {
    region: "ap-southeast-1",
  },
});
