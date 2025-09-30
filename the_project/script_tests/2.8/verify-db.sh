
# Get the environment variables from the todo-backend pod
DB_HOST=$(kubectl exec deployment/todo-backend-dep -n project -- sh -c 'echo $DB_HOST')
DB_PORT=$(kubectl exec deployment/todo-backend-dep -n project -- sh -c 'echo $DB_PORT')
DB_USER=$(kubectl exec deployment/todo-backend-dep -n project -- sh -c 'echo $DB_USER')
DB_PASSWORD=$(kubectl exec deployment/todo-backend-dep -n project -- sh -c 'echo $DB_PASSWORD')
DB_NAME=$(kubectl exec deployment/todo-backend-dep -n project -- sh -c 'echo $DB_NAME')

# Run the temporary pod
echo "Run the temporary pod"
kubectl run  -it --rm  --restart=Never --image postgres psql-for-debugging -n project --   sh -c "PGPASSWORD='$DB_PASSWORD' PAGER=cat psql -q -h '$DB_HOST' -p '$DB_PORT' -U '$DB_USER' -d '$DB_NAME' -c 'SELECT * FROM todos;' -v ON_ERROR_STOP=1"


echo ""
