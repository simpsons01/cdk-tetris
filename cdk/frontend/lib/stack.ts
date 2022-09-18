import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfrontOrigins from "aws-cdk-lib/aws-cloudfront-origins";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import { Construct } from "constructs";

export class TetrisFrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "Bucket")

    const certificate = acm.Certificate.fromCertificateArn(this, "Certificate",
      "arn:aws:acm:us-east-1:171191418924:certificate/9d333406-31ca-4f1a-8fd0-de28a2fdd15b"
    )

    const cloudfrontDistribution = new cloudfront.Distribution(this, "CloudfrontDistribution", {
      defaultBehavior: { 
        origin: new cloudfrontOrigins.S3Origin(bucket) 
      },
      domainNames: ["www.old-school-tetris-battle.com"],
      certificate,
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html"
        }
      ]
    });
    
    new cdk.CfnOutput(this, "OutputForCloudfrontDistributionDomain", {
      exportName: "TetrisFrontend-CdnDomain",
      value: cloudfrontDistribution.domainName
    })
  }
}