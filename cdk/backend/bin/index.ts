#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import TetrisBackendStack from '../lib/stacks';

const app = new cdk.App();
new TetrisBackendStack(app, 'TetrisBackend', {
  env: {
    account: process.env.ACCOUNT_ID, 
    region: process.env.REGION
  }
});
app.synth()