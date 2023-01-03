# !/bin/bash

STACK_NAME=TetrisCacheCluster

FILE_PATH=cloudformation/cache-cluster.json

aws cloudformation deploy --stack-name $STACK_NAME --template-file $FILE_PATH