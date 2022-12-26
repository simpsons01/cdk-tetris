# !/bin/bash

STACK_NAME=TetrisRedisCluster

FILE_PATH=cloudformation/redis-cluster.json

aws cloudformation deploy --stack-name $STACK_NAME --template-file $FILE_PATH