# !/bin/bash

export ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
export REGION="ap-northeast-1"

cd cdk/backend

npm run destroy