export interface Todo {
  id: string | number;
  text: string;
  completed?: boolean;
}

export type TodoAction =
  | { type: "ADD_TODO"; payload: string }
  | { type: "TOGGLE_TODO"; payload: string }
  | { type: "DELETE_TODO"; payload: string | number};

export interface TodoState {
  todo: Todo[];
}
