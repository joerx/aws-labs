#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { CodedeployLabStack } from "../lib/codedeploy-lab-stack";
import * as dotenv from "dotenv";

dotenv.config();

const app = new cdk.App();
new CodedeployLabStack(app, "CodedeployLabStack", {
  sshKeyName: process.env.SSH_KEY_NAME || "",
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
