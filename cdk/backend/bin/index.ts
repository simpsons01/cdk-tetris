#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TetrisPublicService, TetrisPrivateService  } from '../lib/stacks';

const app = new cdk.App();
const tetrisPrivateService = new TetrisPrivateService(app, 'TetrisBackendPrivateService', {
  env: {
    account: process.env.ACCOUNT_ID, 
    region: process.env.REGION
  }
});
const tetrisPublicService = new TetrisPublicService(app, 'TetrisBackendPublicService', {
  vpcEndPointServiceName: tetrisPrivateService.vpcEndPointService.vpcEndpointServiceName,
  env: {
    account: process.env.ACCOUNT_ID, 
    region: process.env.REGION
  }
});
app.synth()