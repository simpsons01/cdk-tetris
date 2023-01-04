import * as cdk from "aws-cdk-lib";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { Construct } from "constructs";
import EcsFargateService from "./components/EcsFargateService";

const apiServiceContainerName = "public_api_service"

const connectServiceContainerName = "connect_service"

interface TetrisBackendProps extends cdk.StackProps {
}

export default class extends cdk.Stack {
  
  constructor(scope: Construct, id: string, props: TetrisBackendProps) {
    super(scope, id, props);

    const containerRepository = ecr.Repository.fromRepositoryName(
      this, 
      "ContainerRepositoryForPublicService",
      "tetris"
    )

    const vpc = ec2.Vpc.fromLookup(this, "PublicServiceVpc", { vpcId: process.env.PUBLIC_SERVICE_VPC_ID });

    const interfaceVpcEndPointSecurityGroup = new ec2.SecurityGroup(this, "InterfaceVpcEndPointSecurityGroup", {
      vpc, 
      allowAllOutbound: true
    })

    interfaceVpcEndPointSecurityGroup.addIngressRule(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(80))


    const alb = new elbv2.ApplicationLoadBalancer(this, "PublicServiceALB", {
      vpc,
      internetFacing: true
    });

    const albListener = alb.addListener("PublicServiceALBPublicListener", { 
      open: true,
      certificates: [
        {
          certificateArn :"arn:aws:acm:ap-northeast-1:171191418924:certificate/e00ff89c-4748-437a-8c90-4a4bddbfb04f"
        }
      ],
      protocol: elbv2.ApplicationProtocol.HTTPS
    });

    const publicApiService = new EcsFargateService(this, "PublicServiceApiService", {
      containerRepo: containerRepository,
      vpc,
      container: {
        name: apiServiceContainerName,
        imageTag: `${apiServiceContainerName}_v0.01`,
        taskDef: {
          memoryLimitMiB: 512,
          cpu: 256,
        },
        portMapping: [{
          protocol: ecs.Protocol.TCP,
          containerPort: 8080
        }],
        environment: {
          ALLOW_ORIGIN: `https://www.old-school-tetris-battle.com`,  
          DOMAIN: ".old-school-tetris-battle.com",
          REDIS_HOST_URL: cdk.Fn.importValue("TetrisCacheCluster-CacheClusterAddress"),
          REDIS_HOST_PORT:"6379",
          JWT_SECRET: process.env.JWT_SECRET as string
        }
      },
      fargateService: {
        assignPublicIp: true,
        vpcSubnets: {
          subnetType: ec2.SubnetType.PUBLIC
        }
      }
    })

    const publicApiServiceTargetGroup = new elbv2.ApplicationTargetGroup(this, "PublicServiceApiServiceTargetGroup", {
      port: 80,
      vpc,
      healthCheck: {
        interval: cdk.Duration.seconds(60),
        path: "/health-check",
        timeout: cdk.Duration.seconds(5),
      },
      targets: [
        publicApiService.service.loadBalancerTarget({
          containerName: apiServiceContainerName,
          containerPort: 8080
        })
      ],
    })

    albListener.addAction("PublicServiceApiServiceRedirect", {
      action: elbv2.ListenerAction.forward([publicApiServiceTargetGroup])
    })

    const connectService = new EcsFargateService(this, "PublicServiceConnectService", {
      containerRepo: containerRepository,
      vpc,
      container: {
        name: connectServiceContainerName,
        imageTag: `${connectServiceContainerName}_v0.04`,
        taskDef: {
          memoryLimitMiB: 512,
          cpu: 256,
        },
        portMapping: [{
          protocol: ecs.Protocol.TCP,
          containerPort: 8080
        }],
        environment: {
          ALLOW_ORIGIN: `https://www.old-school-tetris-battle.com`,  
          DOMAIN: ".old-school-tetris-battle.com",
          REDIS_HOST_URL: cdk.Fn.importValue("TetrisCacheCluster-CacheClusterAddress"),
          REDIS_HOST_PORT:"6379",
          JWT_SECRET: process.env.JWT_SECRET as string
        }
      },
      fargateService: {
        assignPublicIp: true,
        vpcSubnets: {
          subnetType: ec2.SubnetType.PUBLIC
        }
      }
    })

    const connectServiceTargetGroup = new elbv2.ApplicationTargetGroup(this, "PublicServiceConnectServiceTargetGroup", {
      port: 80,
      vpc,
      healthCheck: {
        interval: cdk.Duration.seconds(60),
        path: "/connect/health-check",
        timeout: cdk.Duration.seconds(5),
      },
      targets: [
        connectService.service.loadBalancerTarget({
          containerName: "connect_service",
          containerPort: 8080
        })
      ],
    })

    albListener.addAction("PublicServiceConnectServiceRedirect", {
      priority: 1,
      conditions: [
        elbv2.ListenerCondition.pathPatterns([ "/connect/*" ])
      ],
      action: elbv2.ListenerAction.forward([connectServiceTargetGroup])
    })
  }
}