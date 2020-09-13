import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as KmsIam from '../lib/kms-iam-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new KmsIam.KmsIamStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
