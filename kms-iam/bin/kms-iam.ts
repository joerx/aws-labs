#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { KmsIamStack } from "../lib/kms-iam-stack";

const app = new cdk.App();
new KmsIamStack(app, "KmsIamStack", {
  env: {
    account: "468871832330",
    region: "ap-southeast-1",
  },
});
