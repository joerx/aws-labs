import * as ec2 from "@aws-cdk/aws-ec2";
import { Bucket } from "@aws-cdk/aws-s3";
import * as iam from "@aws-cdk/aws-iam";
import * as cdk from "@aws-cdk/core";
import { StackProps, Tag, Tags } from "@aws-cdk/core";

export interface CodedeployLabStackProps extends StackProps {
  sshKeyName: string;
}

export class CodedeployLabStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: CodedeployLabStackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, "DefaultVpc", {
      isDefault: true,
    });

    const bucket = new Bucket(this, "Bucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const instanceRole = new iam.Role(this, "InstanceRole", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    });
    bucket.grantReadWrite(instanceRole);

    const codeDeployServiceRole = new iam.Role(this, "CodeDeployServiceRole", {
      assumedBy: new iam.ServicePrincipal("codedeploy.amazonaws.com"),
    });
    codeDeployServiceRole.addManagedPolicy(
      iam.ManagedPolicy.fromManagedPolicyArn(this, "CdRole", "arn:aws:iam::aws:policy/service-role/AWSCodeDeployRole")
    );

    // TODO: init script, install CD agent
    const instance = new ec2.Instance(this, "Instance", {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL),
      machineImage: ec2.MachineImage.latestAmazonLinux(),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      keyName: props.sshKeyName,
      role: instanceRole,
    });

    Tags.of(instance).add("AppName", "mywebapp"); // used for codedeploy

    instance.connections.allowFromAnyIpv4(ec2.Port.tcp(22));
    instance.connections.allowFromAnyIpv4(ec2.Port.tcp(80));

    new cdk.CfnOutput(this, "BucketNameOutput", {
      value: bucket.bucketName,
    });

    new cdk.CfnOutput(this, "InstancePublicIpOutput", {
      value: instance.instancePublicIp,
    });

    new cdk.CfnOutput(this, "InstanceIdOutput", {
      value: instance.instanceId,
    });

    new cdk.CfnOutput(this, "CodeDeployServiceRoleOutput", {
      value: codeDeployServiceRole.roleName,
    });
  }
}
