import { Construct } from 'constructs';
import * as cdk from "aws-cdk-lib"
import * as ecs from 'aws-cdk-lib/aws-ecs';

interface IEcsFargateServiceProps {
  containerRepo: cdk.aws_ecr.IRepository
  vpc: cdk.aws_ec2.IVpc
  container: {
    name: string
    imageTag: string
    portMapping: Array<cdk.aws_ecs.PortMapping>
    taskDef: cdk.aws_ecs.FargateTaskDefinitionProps
    environment: {
      [key: string]: string
    },
  }
  fargateService: Omit<cdk.aws_ecs.FargateServiceProps, "cluster" | "taskDefinition">
}


class EcsFargateService extends Construct {
  cluster: cdk.aws_ecs.Cluster
  service: cdk.aws_ecs.FargateService

  constructor(scope: Construct, id: string, props: IEcsFargateServiceProps) {
    super(scope, id)
    
    const fargateTaskDefinition = new ecs.FargateTaskDefinition(
      scope, 
      `${id}FargateTaskDef`, 
      props.container.taskDef
    );

    fargateTaskDefinition.addContainer(props.container.name, {
      image: ecs.ContainerImage.fromEcrRepository(props.containerRepo, props.container.imageTag),
      logging: ecs.LogDriver.awsLogs({ streamPrefix: props.container.name }),
      environment: props.container.environment,
      portMappings: props.container.portMapping
    })

    this.cluster = new ecs.Cluster(scope, `${id}Cluster`, { vpc: props.vpc });

    this.service = new ecs.FargateService(scope, `${id}FargateServiceService`, {
      cluster: this.cluster,
      taskDefinition: fargateTaskDefinition,
      ...props.fargateService
    });
  }
}

export default EcsFargateService