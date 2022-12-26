# !/bin/bash

STACK_NAME=TetrisRedisCluster

FILE_PATH=cloudformation/redis-cluster.json

STACK_INFO=$(aws cloudformation describe-stacks --query "Stacks[?Name==$STACK_NAME]")

if [[ $STACK_INFO =~ "\[\]" ]]; then
 aws cloudformation create-stack --stack-name $STACK_NAME --template-body file://$FILE_PATH
else
 aws cloudformation update-stack --stack-name $STACK_NAME --template-body file://$FILE_PATH
fi