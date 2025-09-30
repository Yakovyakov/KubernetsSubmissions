# Restart todo-backend pod
echo "Restart todo-backend pod"
kubectl delete pod -l app=todo-backend -n project
kubectl wait --for=condition=ready pod -l app=todo-backend -n project --timeout=120s
sleep 5
echo ""
# Todos should persist after restart
echo "Todos should persist after restart"
curl http://project.local:8081/api/todo-service/todos
echo ""
# Restart PostgreSQL pod
echo ""
echo "Restart PostgreSQL pod"

kubectl delete pod -l app=postgres -n project
echo ""
# Wait for restart and verify data persistence
kubectl wait --for=condition=ready pod -l app=postgres -n project --timeout=120s

kubectl delete pod -l app=todo-backend -n project
kubectl wait --for=condition=ready pod -l app=todo-backend -n project --timeout=120s
sleep 5
echo ""
# Todos should persist after restart
echo "Todos should persist after restart"

curl http://project.local:8081/api/todo-service/todos
echo ""
