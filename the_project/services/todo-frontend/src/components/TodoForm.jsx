import React from 'react'

const MAX_LENGTH = 140

function TodoForm({ input, onInput, onSubmit }) {
  const handleChange = (e) => {
    if (e.target.value.length <= MAX_LENGTH) {
      onInput(e.target.value)
    }
  }

  const isDisabled = input.length === 0 || input.length > MAX_LENGTH

  return (
    <div className="todo-section">
      <form onSubmit={onSubmit} className="todo-form">
        <label htmlFor="todo-input">What needs to be done?</label>
        <div className="input-group">
          <input
            id="todo-input"
            type="text"
            value={input}
            onChange={handleChange}
            placeholder="Enter a new todo..."
            maxLength={MAX_LENGTH}
            className="form-input"
          />
          <button type="submit" disabled={isDisabled} className="submit-btn">
            Send
          </button>
        </div>
        <div className="char-counter">
          {input.length}/{MAX_LENGTH}
        </div>
      </form>
    </div>
  )
}

export default TodoForm