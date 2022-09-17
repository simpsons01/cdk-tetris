# !/bin/bash

export SESSION_SECRET=$1
export ACCOUNT_ID=$2
export REGION=$3

cd cdk/backend

npm run deploy