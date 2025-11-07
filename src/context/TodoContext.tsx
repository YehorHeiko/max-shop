import { createContext, useContext, useReducer, type ReactNode } from "react";
import { TodoReducer } from "./ todoReducer";
import type { TodoAction, TodoState } from "../types/todo";

type TodoContextType = {
  state: TodoState; // Типизируем state
  dispatch: React.Dispatch<TodoAction>; // Тип диспатча
};

interface TodoProviderProps {
  children: ReactNode;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error("useTodo must be used within a TodoProvider");
  }
  return context;
};

const initialState = { todo: [] };

export const TodoProvider: React.FC<TodoProviderProps> = ({ children }) => {
  //   const [todo, setTodo] = useState<string[]>([]);
  const [state, dispatch] = useReducer(TodoReducer, initialState);

  return (
    <TodoContext.Provider value={{ state, dispatch }}>
      {children}
    </TodoContext.Provider>
  );
};
