# !/bin/bash

if ! [ -n "$SESSION_SECRET" ]; then
  echo "SESSION_SECERT is required"
  exit 1
fi

export REGION="ap-northeast-1"
export ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
export VPC_ID=$(aws cloudformation list-exports --query "Exports[?Name==\`TetrisVpc-VpcId\`].Value" --no-paginate --output text)

cd cdk/backend

npm run deploy