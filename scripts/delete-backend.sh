# !/bin/bash

export ACCOUNT_ID=$1
export REGION=$2

cd cdk/backend

npm run destroy