# Get all todos (should be empty initially)
echo "Get all todos"
curl http://project.local:8081/api/todo-service/todos

echo  ""
# Create a new todo
echo "Create a new todo"
curl -X POST http://project.local:8081/api/todo-service/todos \
  -H "Content-Type: application/json" \
  -d '{"text": "Learn Kubernetes with PostgreSQL"}'

echo ""
# Verify todo was created
echo "Verify todo was created"

curl http://project.local:8081/api/todo-service/todos
echo ""

# Test 140-character limit validation
echo "Test 140-character limit validation"
curl -X POST http://project.local:8081/api/todo-service/todos \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a very long todo text that exceeds the 140 character limit that we have set for our todo application to ensure that todos remain concise and manageable for users"}'

echo ""
