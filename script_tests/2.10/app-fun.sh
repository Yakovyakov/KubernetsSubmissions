echo  ""
# Create a new todo
echo "Create a new todo"
curl -X POST http://project.local:8081/api/todo-service/todos \
  -H "Content-Type: application/json" \
  -d '{"text": "Learn Kubernetes with PostgreSQL"}'

echo ""
sleep 2
# Test 140-character limit validation
echo "Test 140-character limit validation"
curl -X POST http://project.local:8081/api/todo-service/todos \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a very long todo text that exceeds the 140 character limit that we have set for our todo application to ensure that todos remain concise and manageable for users"}'

echo ""
sleep 2
# Test empty TODO validation
echo "Test empty TODO validation"
curl -X POST http://project.local:8081/api/todo-service/todos \
  -H "Content-Type: application/json" \
  -d '{"text": ""}'

echo ""
