#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TetrisFrontendStack } from '../lib/stack';

const app = new cdk.App();
new TetrisFrontendStack(app, 'TetrisFrontend');
app.synth()