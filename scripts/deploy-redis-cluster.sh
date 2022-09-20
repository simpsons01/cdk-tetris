# !/bin/bash

aws cloudformation create-stack --stack-name TetrisRedisCluster --template-body file://cloudformation/redis-cluster.json