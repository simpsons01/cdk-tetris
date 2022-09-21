import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';

export class TetrisBackend extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const containerRepository = ecr.Repository.fromRepositoryName(this, "Repository", "tetris")

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      memoryLimitMiB: 512,
      cpu: 256,
    });

    const WebContainer = taskDefinition.addContainer('web', {
      image: ecs.ContainerImage.fromEcrRepository(containerRepository, "web_v0.8"),
      logging: ecs.LogDriver.awsLogs({ streamPrefix: "web" }),
      environment: {
        SESSION_SECRET: process.env.SESSION_SECRET as string,
        ALLOW_ORIGIN: `https://www.old-school-tetris-battle.com`,
        DOMAIN: ".old-school-tetris-battle.com",
        REDIS_HOST_URL: cdk.Fn.importValue("TetrisRedisCluster-RedisClusterAddress"),
        REDIS_HOST_PORT:"6379",
      }
    })
    
    WebContainer.addPortMappings({
      protocol: ecs.Protocol.TCP,
      containerPort: 8181
    })


    const vpc = ec2.Vpc.fromLookup(this, "FromVpc", { vpcId: process.env.VPC_ID });
    
    const cluster = new ecs.Cluster(this, 'Cluster', { vpc });

    const service = new ecs.FargateService(this, "Service", {
      cluster,
      taskDefinition,
      assignPublicIp: true,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC
      }
    });
    
    const lb = new elbv2.ApplicationLoadBalancer(this, 'LB', {
      vpc,
      internetFacing: true
    });

    const listener = lb.addListener('PublicListener', { 
      open: true,
      certificates: [
        {
          certificateArn :"arn:aws:acm:ap-northeast-1:171191418924:certificate/e00ff89c-4748-437a-8c90-4a4bddbfb04f"
        }
      ],
      protocol: elbv2.ApplicationProtocol.HTTPS
    });
    
    listener.addTargets('ECS', {
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [
        service.loadBalancerTarget({
          containerName: 'web',
          containerPort: 8181
        })
      ],
      healthCheck: {
        interval: cdk.Duration.seconds(60),
        path: "/health-check",
        timeout: cdk.Duration.seconds(5),
      }
    });
  }
}