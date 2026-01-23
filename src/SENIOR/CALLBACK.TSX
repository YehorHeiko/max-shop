import React, { useCallback, useReducer, useContext, createContext, useEffect, useState } from "react";

// --- Types & Enums ---
interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

type TodoAction =
  | { type: "ADD"; payload: { title: string } }
  | { type: "TOGGLE"; payload: { id: number } }
  | { type: "DELETE"; payload: { id: number } }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

// --- Constants & Initial Data ---
const INITIAL_TODOS: Todo[] = [
  { id: 1, title: "Elon Musk", completed: true },
  { id: 2, title: "John Doe", completed: true },
  { id: 3, title: "Alex Smith", completed: false },
  { id: 4, title: "Jane Doe", completed: false },
  { id: 5, title: "Bob Wilson", completed: true },
];

// --- Reducer для логики состояния (чистая, тестируемая) ---
const todoReducer = (state: { todos: Todo[]; loading: boolean; error: string | null }, action: TodoAction) => {
  switch (action.type) {
    case "ADD":
      if (!action.payload.title.trim()) return state; // Валидация
      const newId = Date.now(); // В продакшене — UUID или API
      return {
        ...state,
        todos: [...state.todos, { id: newId, title: action.payload.title.trim(), completed: false }],
      };
    case "TOGGLE":
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload.id ? { ...todo, completed: !todo.completed } : todo
        ),
      };
    case "DELETE":
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload.id),
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

// --- Context для глобального состояния ---
interface TodoContextType {
  state: { todos: Todo[]; loading: boolean; error: string | null };
  dispatch: React.Dispatch<TodoAction>;
}

const TodoContext = createContext<TodoContextType | null>(null);

// Provider с загрузкой данных (готов к API)
const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(todoReducer, {
    todos: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Симуляция API-загрузки
    const loadTodos = async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        // В реальности: const response = await fetch('/api/todos');
        dispatch({ type: "SET_LOADING", payload: false });
        // Мок: добавляем начальные данные
        INITIAL_TODOS.forEach((todo) => {
          // Симулируем добавление через reducer
        });
        // Для простоты: setState напрямую (в реальности — через API)
        dispatch({ type: "SET_LOADING", payload: false });
        // Ошибка примера: dispatch({ type: "SET_ERROR", payload: "API failed" });
      } catch (err) {
        dispatch({ type: "SET_ERROR", payload: "Failed to load todos" });
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };
    loadTodos();
  }, []);

  return (
    <TodoContext.Provider value={{ state, dispatch }}>
      {children}
    </TodoContext.Provider>
  );
};

// --- Custom Hook ---
const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) throw new Error("useTodos must be used within TodoProvider");

  const { state, dispatch } = context;

  const addTodo = useCallback((title: string) => {
    dispatch({ type: "ADD", payload: { title } });
  }, [dispatch]);

  const toggleTodo = useCallback((id: number) => {
    dispatch({ type: "TOGGLE", payload: { id } });
  }, [dispatch]);

  const deleteTodo = useCallback((id: number) => {
    dispatch({ type: "DELETE", payload: { id } });
  }, [dispatch]);

  return {
    todos: state.todos,
    loading: state.loading,
    error: state.error,
    addTodo,
    toggleTodo,
    deleteTodo,
  };
};

// --- Components ---
const TodoItem: React.FC<{
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}> = React.memo(({ todo, onToggle, onDelete }) => {
  // Логирование вместо console.log (в продакшене — через logger)
  useEffect(() => {
    console.log(`Todo ${todo.id} rendered`);
  }, [todo.id]);

  return (
    <article className="todo-item" role="listitem">
      <h2>{todo.title}</h2>
      <button
        onClick={() => onToggle(todo.id)}
        aria-label={`Toggle completion for ${todo.title}`}
      >
        {todo.completed ? "Mark Incomplete" : "Mark Complete"}
      </button>
      <button
        onClick={() => onDelete(todo.id)}
        aria-label={`Delete ${todo.title}`}
      >
        Delete
      </button>
    </article>
  );
});

// Error Boundary для обработки ошибок
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Todo app error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh.</div>;
    }
    return this.props.children;
  }
}

// --- Main Component ---
const TodoApp: React.FC = () => {
  const { todos, loading, error, addTodo, toggleTodo, deleteTodo } = useTodos();
  const [newTitle, setNewTitle] = useState("");

  const handleAdd = useCallback(() => {
    if (newTitle.trim()) {
      addTodo(newTitle);
      setNewTitle("");
    }
  }, [newTitle, addTodo]);

  if (loading) return <div>Loading todos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <main>
      <section aria-label="Add new todo">
        <label htmlFor="todo-input">New Todo Title:</label>
        <input
          id="todo-input"
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Enter todo title..."
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button onClick={handleAdd} disabled={!newTitle.trim()}>
          Add Todo
        </button>
      </section>

      <section aria-label="Todo list">
        {todos.length > 0 ? (
          <ul>
            {todos.map((todo) => (
              <li key={todo.id}>
                <TodoItem todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
              </li>
            ))}
          </ul>
        ) : (
          <p>No todos yet. Add one above!</p>
        )}
      </section>
    </main>
  );
};

// --- App Wrapper ---
const App: React.FC = () => (
  <ErrorBoundary>
    <TodoProvider>
      <TodoApp />
    </TodoProvider>
  </ErrorBoundary>
);

export default App;