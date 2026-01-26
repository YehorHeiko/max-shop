// app.tsx (весь код в одном файле для демонстрации; в реальном проекте разделить на файлы)

import React, { createContext, useContext, useReducer, lazy, Suspense, useMemo, ReactNode } from "react";

// Типы
export type TabType = "first" | "second" | "third";

export enum Status {
  New = "NEW",
  Paid = "PAID",
  Canceled = "CANCELLED",
}

export type Order = {
  id: number;
  customerName: string;
  status: Status;
  money: number;
};

export type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  age: number;
};

// Контекст с reducer
type State = {
  activeTab: TabType;
  todos: Todo[];
  queryTodo: string;
  orders: Order[];
  queryOrder: string;
  filterOrder: Status | "ALL";
  count: number;
};

type Action =
  | { type: "SET_ACTIVE_TAB"; payload: TabType }
  | { type: "SET_TODOS"; payload: Todo[] }
  | { type: "SET_QUERY_TODO"; payload: string }
  | { type: "SET_ORDERS"; payload: Order[] }
  | { type: "SET_QUERY_ORDER"; payload: string }
  | { type: "SET_FILTER_ORDER"; payload: Status | "ALL" }
  | { type: "SET_COUNT"; payload: number };

const initialState: State = {
  activeTab: "first",
  todos: [
    { id: 1, title: "Elon Musk", completed: true },
    { id: 2, title: "John Doe", completed: true },
    { id: 3, title: "Alex Smith", completed: false },
    { id: 4, title: "Jane Doe", completed: false },
    { id: 5, title: "Bob Wilson", completed: true },
  ],
  queryTodo: "",
  orders: [
    { id: 1, customerName: "Elon Musk", status: Status.New, money: 2 },
    { id: 2, customerName: "John Doe", status: Status.Canceled, money: 3 },
    { id: 3, customerName: "Alex Smith", status: Status.Paid, money: 44 },
  ],
  queryOrder: "",
  filterOrder: "ALL",
  count: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };
    case "SET_TODOS":
      return { ...state, todos: action.payload };
    case "SET_QUERY_TODO":
      return { ...state, queryTodo: action.payload };
    case "SET_ORDERS":
      return { ...state, orders: action.payload };
    case "SET_QUERY_ORDER":
      return { ...state, queryOrder: action.payload };
    case "SET_FILTER_ORDER":
      return { ...state, filterOrder: action.payload };
    case "SET_COUNT":
      return { ...state, count: action.payload };
    default:
      return state;
  }
}

const MainContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export const MainProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <MainContext.Provider value={{ state, dispatch }}>
      {children}
    </MainContext.Provider>
  );
};

export const useMainContext = () => {
  const context = useContext(MainContext);
  if (!context) throw new Error("useMainContext must be used within MainProvider");
  return context;
};

// Хуки
const TABS = {
  first: {
    label: "First Heavy Components",
    component: lazy(() => import("./components/HeavyComponent")), // Предполагаем пути
  },
  second: {
    label: "Second Heavy Components",
    component: lazy(() => import("./components/Reports")),
  },
  third: {
    label: "Third Heavy Components",
    component: lazy(() => import("./components/TodoItem")),
  },
} as const;

export const useRenderComponents = () => {
  const { state, dispatch } = useMainContext();

  const setActiveTab = (tab: TabType) => {
    dispatch({ type: "SET_ACTIVE_TAB", payload: tab });
  };

  const renderActiveComponent = () => {
    const tabConfig = TABS[state.activeTab];
    if (!tabConfig) return <div>Tab not found</div>;

    const Component = tabConfig.component;
    return (
      <Suspense fallback={<div>Loading {tabConfig.label}...</div>}>
        <Component />
      </Suspense>
    );
  };

  return { activeTab: state.activeTab, setActiveTab, renderActiveComponent };
};

export const useTodo = () => {
  const { state, dispatch } = useMainContext();

  const filteredTodos = useMemo(() => {
    return state.todos.filter(todo =>
      todo.title.toLowerCase().includes(state.queryTodo.toLowerCase())
    );
  }, [state.todos, state.queryTodo]);

  const addTodo = (title: string) => {
    const newTodo: Todo = {
      id: Date.now(),
      title,
      completed: false,
    };
    dispatch({ type: "SET_TODOS", payload: [...state.todos, newTodo] });
  };

  const toggleTodo = (id: number) => {
    const updated = state.todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    dispatch({ type: "SET_TODOS", payload: updated });
  };

  const deleteTodo = (id: number) => {
    dispatch({ type: "SET_TODOS", payload: state.todos.filter(todo => todo.id !== id) });
  };

  return {
    todos: filteredTodos,
    query: state.queryTodo,
    setQuery: (query: string) => dispatch({ type: "SET_QUERY_TODO", payload: query }),
    addTodo,
    toggleTodo,
    deleteTodo,
  };
};

export const useComponentOrder = () => {
  const { state, dispatch } = useMainContext();

  const filteredOrders = useMemo(() => {
    return state.orders.filter(order => {
      const matchesFilter = state.filterOrder === "ALL" || order.status === state.filterOrder;
      const matchesQuery = order.customerName.toLowerCase().includes(state.queryOrder.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [state.orders, state.filterOrder, state.queryOrder]);

  const stats = useMemo(() => ({
    count: filteredOrders.length,
    countMain: state.orders.length,
  }), [filteredOrders.length, state.orders.length]);

  return {
    orders: filteredOrders,
    query: state.queryOrder,
    filter: state.filterOrder,
    count: state.count,
    stats,
    setQuery: (query: string) => dispatch({ type: "SET_QUERY_ORDER", payload: query }),
    setFilter: (filter: Status | "ALL") => dispatch({ type: "SET_FILTER_ORDER", payload: filter }),
    setCount: (count: number) => dispatch({ type: "SET_COUNT", payload: count }),
  };
};

// Компоненты
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong. Please reload.</div>;
    }
    return this.props.children;
  }
}

const ComponentsLoading: React.FC = () => {
  const { activeTab, setActiveTab, renderActiveComponent } = useRenderComponents();

  return (
    <>
      <div>
        {(Object.keys(TABS) as TabType[]).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}>
            {TABS[tab].label}
          </button>
        ))}
      </div>
      <div>{renderActiveComponent()}</div>
    </>
  );
};

interface ListOfTodoProps {
  todos: Todo[];
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
}

const ListOfTodo: React.FC<ListOfTodoProps> = ({ todos, onDelete, onToggle }) => {
  return (
    <>
      {todos.map((todo) => (
        <div key={todo.id}>
          <p>{todo.title} - {todo.completed ? "Done" : "Pending"}</p>
          <button onClick={() => onDelete(todo.id)}>Delete</button>
          <button onClick={() => onToggle(todo.id)}>Toggle</button>
        </div>
      ))}
    </>
  );
};

const ListOfUsers = React.memo<User[]>(({ users }) => {
  return (
    <>
      {users.map((user) => (
        <div key={user.id}>
          <p>{user.name}</p>
          <p>{user.email}</p>
          <p>{user.age}</p>
        </div>
      ))}
    </>
  );
});

const ComponentOrders: React.FC = () => {
  const { orders, query, filter, count, stats, setQuery, setFilter, setCount } = useComponentOrder();

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name"
      />
      <select value={filter} onChange={(e) => setFilter(e.target.value as Status | "ALL")}>
        <option value="ALL">All</option>
        <option value={Status.New}>New</option>
        <option value={Status.Paid}>Paid</option>
        <option value={Status.Canceled}>Canceled</option>
      </select>
      <button onClick={() => setCount(count + 1)}>Increment - {count}</button>
      <div>
        {orders.map((order) => (
          <div key={order.id} style={{ display: "flex", gap: "24px" }}>
            <p>{order.customerName}</p>
            <p>{order.money}</p>
            <small>{order.status}</small>
          </div>
        ))}
        <div>
          <p>Filtered Count: {stats.count}</p>
          <p>Total Count: {stats.countMain}</p>
        </div>
      </div>
    </div>
  );
};

const ComponentTodos: React.FC = () => {
  const { todos, query, setQuery, addTodo, toggleTodo, deleteTodo } = useTodo();

  return (
    <>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search todos"
      />
      <button onClick={() => addTodo(query)}>Add New TODO</button>
      <ListOfTodo todos={todos} onDelete={deleteTodo} onToggle={toggleTodo} />
    </>
  );
};

const Home: React.FC = () => {
  const USERS: User[] = [
    { id: "p1", name: "Kevin", email: "123@gmail.com", age: 43 },
    { id: "p2", name: "Alex", email: "313@gmail.com", age: 11 },
    { id: "p3", name: "Jone", email: "223@gmail.com", age: 12 },
  ];

  return (
    <ErrorBoundary>
      <ComponentsLoading />
      <ComponentOrders />
      <ComponentTodos />
      <ListOfUsers users={USERS} />
    </ErrorBoundary>
  );
};

function App() {
  return (
    <MainProvider>
      <Home />
    </MainProvider>
  );
}

export default App;