#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TetrisBackend } from '../lib/stack';

const app = new cdk.App();
new TetrisBackend(app, 'TetrisBackend', {
  env: {
    account: process.env.ACCOUNT_ID, 
    region: process.env.REGION
  }
});
app.synth()