# !/bin/bash

STACK_NAME=TetrisRedisCluster

aws cloudformation delete-stack --stack-name $STACK_NAME