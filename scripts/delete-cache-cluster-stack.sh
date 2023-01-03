# !/bin/bash

STACK_NAME=TetrisCacheCluster

aws cloudformation delete-stack --stack-name $STACK_NAME