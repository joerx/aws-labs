import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as CodedeployLab from '../lib/codedeploy-lab-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new CodedeployLab.CodedeployLabStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
