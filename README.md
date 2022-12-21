## DEPLOY STACK ORDER

```
bash scripts/create-vpc-stack.sh

bash scripts/create-redis-cluster-stack.sh

bash scripts/create-socket-io-adapter-redis-cluster-stack.sh

bash scripts/create-backend-stack.sh

bash scripts/create-frontend-stack.sh
```