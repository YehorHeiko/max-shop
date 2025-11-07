import type { TodoAction, TodoState } from "../types/todo";

export const TodoReducer = (state: TodoState, action : TodoAction): TodoState => {
  switch (action.type) {
    case "ADD_TODO":
      if (!action.payload) return state;
      return {
        ...state,
        todo: [...state.todo, { id: Math.random(), text: action.payload }],
      };
    case "DELETE_TODO":
      if (!action.payload) return state;
      return {
        ...state,
        todo: state.todo.filter((i) => i.id !== action.payload),
      };
    default:
      return state;
  }
};
