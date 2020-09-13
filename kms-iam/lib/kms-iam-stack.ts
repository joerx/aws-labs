import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as kms from "@aws-cdk/aws-kms";
import * as ec2 from "@aws-cdk/aws-ec2";
import { CfnOutput } from "@aws-cdk/core";

export class KmsIamStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, "DefaultVpc", { isDefault: true });

    const keyRole = new iam.Role(this, "KeyUsageRole", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    });

    const ec2Instance = new ec2.Instance(this, "MyKmsInstance", {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL),
      machineImage: ec2.MachineImage.latestAmazonLinux(),
      vpc: vpc,
      role: keyRole,
      allowAllOutbound: true,
      keyName: "yodo-air",
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });

    ec2Instance.connections.allowFrom(ec2.Peer.anyIpv4(), ec2.Port.tcp(22));

    const key = new kms.Key(this, "MyKmsKey", {
      alias: "example/MyKmsKey",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      trustAccountIdentities: true,
    });

    key.grantEncryptDecrypt(keyRole);

    new CfnOutput(this, "KeyIdOutput", {
      value: key.keyId,
    });

    new CfnOutput(this, "KeyUsageRoleOutput", {
      value: keyRole.roleName,
    });

    new CfnOutput(this, "InstanceIpOutput", {
      value: ec2Instance.instancePublicIp,
    });
  }
}
