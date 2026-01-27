import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  Suspense,
  lazy,
  ReactNode,
} from "react";

/* =======================
     TYPES
  ======================= */

type TabType = "first" | "second" | "third";

enum Status {
  New = "NEW",
  Paid = "PAID",
  Canceled = "CANCELLED",
}

type Order = {
  id: number;
  customerName: string;
  status: Status;
  money: number;
};

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

type User = {
  id: string;
  name: string;
  email: string;
  age: number;
};

/* =======================
     STATIC DATA
  ======================= */

const INITIAL_TODOS: Todo[] = [
  { id: 1, title: "Elon Musk", completed: true },
  { id: 2, title: "John Doe", completed: true },
  { id: 3, title: "Alex Smith", completed: false },
  { id: 4, title: "Jane Doe", completed: false },
  { id: 5, title: "Bob Wilson", completed: true },
];

const INITIAL_ORDERS: Order[] = [
  { id: 1, customerName: "Elon Musk", status: Status.New, money: 2 },
  { id: 2, customerName: "John Doe", status: Status.Canceled, money: 3 },
  { id: 3, customerName: "Alex Smith", status: Status.Paid, money: 44 },
];

/* =======================
     TABS CONFIG
  ======================= */

const TABS: Record<
  TabType,
  { label: string; component: React.LazyExoticComponent<React.FC> }
> = {
  first: {
    label: "Heavy Component",
    component: lazy(() => import("./components/HeavyComponent")),
  },
  second: {
    label: "Reports",
    component: lazy(() => import("./components/Reports")),
  },
  third: {
    label: "Todo Item",
    component: lazy(() => import("./components/TodoItem")),
  },
};

/* =======================
     STATE
  ======================= */

type State = {
  activeTab: TabType;
  todos: Todo[];
  todoQuery: string;
  orders: Order[];
  orderQuery: string;
  orderFilter: Status | "ALL";
  count: number;
};

type Action =
  | { type: "SET_ACTIVE_TAB"; payload: TabType }
  | { type: "SET_TODOS"; payload: Todo[] }
  | { type: "SET_TODO_QUERY"; payload: string }
  | { type: "SET_ORDERS"; payload: Order[] }
  | { type: "SET_ORDER_QUERY"; payload: string }
  | { type: "SET_ORDER_FILTER"; payload: Status | "ALL" }
  | { type: "SET_COUNT"; payload: number };

const initialState: State = {
  activeTab: "first",
  todos: INITIAL_TODOS,
  todoQuery: "",
  orders: INITIAL_ORDERS,
  orderQuery: "",
  orderFilter: "ALL",
  count: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };

    case "SET_TODOS":
      return { ...state, todos: action.payload };

    case "SET_TODO_QUERY":
      return { ...state, todoQuery: action.payload };

    case "SET_ORDERS":
      return { ...state, orders: action.payload };

    case "SET_ORDER_QUERY":
      return { ...state, orderQuery: action.payload };

    case "SET_ORDER_FILTER":
      return { ...state, orderFilter: action.payload };

    case "SET_COUNT":
      return { ...state, count: action.payload };

    default:
      return state;
  }
}

/* =======================
     CONTEXT
  ======================= */

type Store = {
  state: State;
  dispatch: React.Dispatch<Action>;
};

const StoreContext = createContext<Store | null>(null);

const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
};

const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
};

/* =======================
     SELECTORS
  ======================= */

const selectFilteredTodos = (state: State) => {
  const q = state.todoQuery.toLowerCase();
  return state.todos.filter((t) => t.title.toLowerCase().includes(q));
};

const selectFilteredOrders = (state: State) => {
  const q = state.orderQuery.toLowerCase();
  return state.orders.filter((o) => {
    const matchesFilter =
      state.orderFilter === "ALL" || o.status === state.orderFilter;
    const matchesQuery = o.customerName.toLowerCase().includes(q);

    return matchesFilter && matchesQuery;
  });
};

const selectOrderStats = (state: State) => {
  const filtered = selectFilteredOrders(state);
  return {
    count: filtered.length,
    countMain: state.orders.length,
  };
};

/* =======================
     VIEW-MODEL HOOKS
  ======================= */

const useTabsVM = () => {
  const { state, dispatch } = useStore();

  const setActiveTab = (tab: TabType) =>
    dispatch({ type: "SET_ACTIVE_TAB", payload: tab });

  const renderActiveComponent = () => {
    const config = TABS[state.activeTab];
    const Component = config.component;

    return (
      <Suspense fallback={<div>Loading {config.label}...</div>}>
        <Component />
      </Suspense>
    );
  };

  return { activeTab: state.activeTab, setActiveTab, renderActiveComponent };
};

const useTodosVM = () => {
  const { state, dispatch } = useStore();

  const todos = useMemo(
    () => selectFilteredTodos(state),
    [state.todos, state.todoQuery]
  );

  const setQuery = (q: string) =>
    dispatch({ type: "SET_TODO_QUERY", payload: q });

  const addTodo = (title: string) => {
    if (!title.trim()) return;

    const newTodo: Todo = {
      id: Date.now(),
      title,
      completed: false,
    };

    dispatch({
      type: "SET_TODOS",
      payload: [...state.todos, newTodo],
    });
  };

  const toggleTodo = (id: number) => {
    dispatch({
      type: "SET_TODOS",
      payload: state.todos.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    });
  };

  const deleteTodo = (id: number) => {
    dispatch({
      type: "SET_TODOS",
      payload: state.todos.filter((t) => t.id !== id),
    });
  };

  return {
    todos,
    query: state.todoQuery,
    setQuery,
    addTodo,
    toggleTodo,
    deleteTodo,
  };
};

const useOrdersVM = () => {
  const { state, dispatch } = useStore();

  const orders = useMemo(
    () => selectFilteredOrders(state),
    [state.orders, state.orderFilter, state.orderQuery]
  );

  const stats = useMemo(
    () => selectOrderStats(state),
    [state.orders, state.orderFilter, state.orderQuery]
  );

  return {
    orders,
    query: state.orderQuery,
    filter: state.orderFilter,
    count: state.count,
    stats,
    setQuery: (q: string) => dispatch({ type: "SET_ORDER_QUERY", payload: q }),
    setFilter: (f: Status | "ALL") =>
      dispatch({ type: "SET_ORDER_FILTER", payload: f }),
    setCount: (c: number) => dispatch({ type: "SET_COUNT", payload: c }),
  };
};

/* =======================
     UI COMPONENTS
  ======================= */

const ComponentsLoading: React.FC = () => {
  const { setActiveTab, renderActiveComponent } = useTabsVM();

  return (
    <>
      <div>
        {(Object.keys(TABS) as TabType[]).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}>
            {TABS[tab].label}
          </button>
        ))}
      </div>
      {renderActiveComponent()}
    </>
  );
};

const ComponentTodos: React.FC = () => {
  const { todos, query, setQuery, addTodo, toggleTodo, deleteTodo } =
    useTodosVM();

  return (
    <>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search todos"
      />
      <button onClick={() => addTodo(query)}>Add Todo</button>

      {todos.map((t) => (
        <div key={t.id}>
          <span>
            {t.title} — {t.completed ? "Done" : "Pending"}
          </span>
          <button onClick={() => toggleTodo(t.id)}>Toggle</button>
          <button onClick={() => deleteTodo(t.id)}>Delete</button>
        </div>
      ))}
    </>
  );
};

const ComponentOrders: React.FC = () => {
  const { orders, query, filter, count, stats, setQuery, setFilter, setCount } =
    useOrdersVM();

  return (
    <>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search orders"
      />
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value as Status | "ALL")}
      >
        <option value="ALL">All</option>
        <option value={Status.New}>New</option>
        <option value={Status.Paid}>Paid</option>
        <option value={Status.Canceled}>Canceled</option>
      </select>

      <button onClick={() => setCount(count + 1)}>Increment — {count}</button>

      {orders.map((o) => (
        <div key={o.id}>
          <span>{o.customerName}</span>
          <span> — {o.money}</span>
          <span> — {o.status}</span>
        </div>
      ))}

      <div>
        {stats.count} / {stats.countMain}
      </div>
    </>
  );
};

const ListOfUsers = React.memo<{ users: User[] }>(({ users }) => (
  <>
    {users.map((u) => (
      <div key={u.id}>
        <p>{u.name}</p>
        <p>{u.email}</p>
        <p>{u.age}</p>
      </div>
    ))}
  </>
));

class ErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? (
      <div>Something went wrong.</div>
    ) : (
      this.props.children
    );
  }
}

/* =======================
     APP
  ======================= */

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

export default function App() {
  return (
    <StoreProvider>
      <Home />
    </StoreProvider>
  );
}
