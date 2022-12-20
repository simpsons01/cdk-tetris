import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
import EcsFargateService from '../components/EcsFargateService';

const containerName = "private_api_service"

interface TetrisPrivateServiceProps extends cdk.StackProps {

}

export class TetrisPrivateService extends cdk.Stack {

  public vpcEndPointService: cdk.aws_ec2.VpcEndpointService
  
  constructor(scope: Construct, id: string, props: TetrisPrivateServiceProps) {
    super(scope, id, props);

    const containerRepository = ecr.Repository.fromRepositoryName(
      this, 
      "ContainerRepositoryForPrivateService", 
      "tetris"
    )

    const vpc = ec2.Vpc.fromLookup(this, "PrivateServiceVpc", { vpcId: process.env.PRIVATE_SERVICE_VPC_ID });

    const privateServiceSecurityGroup = new ec2.SecurityGroup(this, "PrivateServiceSecurityGroup", {
      vpc, 
      allowAllOutbound: true
    })

    privateServiceSecurityGroup.addIngressRule(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(8080))
    
    const privateApiService = new EcsFargateService(this, "PrivateServiceApi", {
      containerRepo: containerRepository,
      vpc,
      container: {
        name: containerName,
        imageTag: `${containerName}_v1.0`,
        taskDef: {
          memoryLimitMiB: 512,
          cpu: 256,
        },
        portMapping: [{
          protocol: ecs.Protocol.TCP,
          containerPort: 8080
        }],
        environment: {
          REDIS_HOST_URL: cdk.Fn.importValue("TetrisRedisCluster-RedisClusterAddress"),
          REDIS_HOST_PORT:"6379",
          JWT_SECRET: process.env.JWT_SECRET as string
        }
      },
      fargateService: {
        securityGroups: [
          privateServiceSecurityGroup
        ]
      }
    })

    const networkLoadBalancer = new elbv2.NetworkLoadBalancer(this, 'PrivateServiceNLB', { vpc });

    const listener = networkLoadBalancer.addListener('PrivateServiceNLbListener', { port: 8080 });

    listener.addTargets("PrivateServiceNLbListenerAddTargets", {
      port: 8080,
      healthCheck: {
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        port: '8080',
      },
      targets: [
        privateApiService.service.loadBalancerTarget({
          containerName,
          containerPort: 8080
        })
      ],
    })

   this.vpcEndPointService = new ec2.VpcEndpointService(this, 'PrivateServiceEndpointService', {
      vpcEndpointServiceLoadBalancers: [networkLoadBalancer],
      acceptanceRequired: true,
      allowedPrincipals: [
        new iam.ArnPrincipal(`arn:aws:iam::${process.env.ACCOUNT_ID}:root`)
      ]
    });
  }
}