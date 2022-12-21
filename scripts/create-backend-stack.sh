# !/bin/bash


export JWT_SECRET=$1

if [ -z "$JWT_SECRET" ]; then
  echo "JWT_SECRET is required"
  exit 1
fi

export REGION="ap-northeast-1"
export ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
export PUBLIC_SERVICE_VPC_ID=$(aws cloudformation list-exports --query "Exports[?Name==\`TetrisVpc-PublicServiceVpcId\`].Value" --no-paginate --output text)
export PRIVATE_SERVICE_VPC_ID=$(aws cloudformation list-exports --query "Exports[?Name==\`TetrisVpc-PrivateServiceVpcId\`].Value" --no-paginate --output text)

cd cdk/backend

npm run deploy