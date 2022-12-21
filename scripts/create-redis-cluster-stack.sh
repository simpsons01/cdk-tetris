# !/bin/bash

STACK_NAME=TetrisRedisCluster

FILE_PATH=cloudformation/redis-cluster.json

aws cloudformation create-stack --stack-name $STACK_NAME --template-body file://$FILE_PATH