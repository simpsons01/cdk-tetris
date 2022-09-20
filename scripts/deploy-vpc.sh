# !/bin/bash

aws cloudformation create-stack --stack-name TetrisVpc --template-body file://cloudformation/vpc.json