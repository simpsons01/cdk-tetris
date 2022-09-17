import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';

export class TetrisFrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "Bucket")

    const cloudfrontDistribution = new cloudfront.Distribution(this, 'CloudfrontDistribution', {
      defaultBehavior: { 
        origin: new cloudfrontOrigins.S3Origin(bucket) 
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html'
        }
      ]
    });
    
    new cdk.CfnOutput(this, "OutputForCloudfrontDistributionDomain", {
      exportName: "TetrisFrontend-CdnDomain",
      value: cloudfrontDistribution.domainName
    })
  }
}