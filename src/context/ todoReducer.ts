export const TodoReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TODO":
        return {...state, todo: [...state.todo, {id: Math.random(), text: action.payload}] }
    case "DELETE_TODO":
        return {...state,  todo: state.todo.filter((i) => i.id !== action.payload)}
    default:
        return state
  }
}

