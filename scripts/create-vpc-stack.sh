# !/bin/bash

STACK_NAME=TetrisVpc

FILE_PATH=cloudformation/vpc.json

aws cloudformation create-stack --stack-name $STACK_NAME --template-body file://$FILE_PATH