# !/bin/bash

export SESSION_SECRET=$1
export ACCOUNT_ID=$2
export REGION=$3
export VPC_ID=$4

cd cdk/backend

npm run deploy