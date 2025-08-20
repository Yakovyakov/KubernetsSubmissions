// src/components/TodoList.jsx
import React from 'react'

function TodoList({ todos }) {
  return (
    <div className="todo-list">
      <h3>Todos:</h3>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </div>
  )
}

export default TodoList