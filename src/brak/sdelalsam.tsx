import React, {
  Children,
  createContext,
  lazy,
  Suspense,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

type TabType = "first" | "second" | "third";

enum Status {
  New = "New",
  Canceled = "Canceled",
  Paid = "Paid",
}

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

type Order = {
  id: number;
  customerName: string;
  status: Status;
  money: number;
};
type User = {
  id: string;
  name: string;
  email: string;
  age: number;
};

type State = {
  todoState: Todo[];
  orderState: Order[];
  activeTab: TabType;
  queryTodo: string;
  queryOrder: string;
  queryFilter: Status | "all";
  count: number;
};

type Action =
  | { type: "SET_ACTIVE_TAB"; payload: TabType }
  | { type: "SET_QUERY_TODO"; payload: string }
  | { type: "SET_QUERY_ORDER"; payload: string }
  | { type: "SET_ORDER_FILTER"; payload: Status | "all" }
  | { type: "SET_COUNT"; payload: number }
  | { type: "SET_ORDER_STATE"; payload: Order[] }
  | { type: "SET_TODO_STATE"; payload: Todo[] };

type Store = {
  state: State;
  dispatch: React.Dispatch<Action>;
};

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

const initialState: State = {
  activeTab: "first",
  todoState: INITIAL_TODOS,
  orderState: INITIAL_ORDERS,
  queryTodo: "",
  queryOrder: "",
  queryFilter: "all",
  count: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };
    case "SET_QUERY_TODO":
      return { ...state, queryTodo: action.payload };
    case "SET_QUERY_ORDER":
      return { ...state, queryOrder: action.payload };
    case "SET_ORDER_FILTER":
      return { ...state, queryFilter: action.payload };
    case "SET_COUNT":
      return { ...state, count: action.payload };
    case "SET_ORDER_STATE":
      return { ...state, orderState: action.payload };
    case "SET_TODO_STATE":
      return { ...state, todoState: action.payload };

    default:
      return state;
  }
}

const StoreContext = createContext<Store | null>(null);

const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("Error nothing in context");
  return ctx;
};

const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
};

const selectFilteredTodos = (state: State) => {
  const q = state.queryTodo.toLowerCase();

  return state.todoState.filter((e) => e.title.toLowerCase().includes(q));
};
const selectFilteredOrders = (state: State) => {
  const q = state.queryOrder.toLowerCase();

  return state.orderState.filter((e) => {
    const math = state.queryFilter === "all" || e.status === state.queryFilter;

    const mathByQuery = e.customerName.toLowerCase().includes(q);

    return math && mathByQuery;
  });
};
const selectOrderStats = (state: State) => {
  const filtered = selectFilteredOrders(state);

  return {
    count: filtered.length,
    countFull: state.orderState.length,
  };
};

const useTodo = () => {
  const { state, dispatch } = useStore();

  const setActiveTab = (tab: TabType) =>
    dispatch({ type: "SET_ACTIVE_TAB", payload: tab });

  const renderActiveComponents = () => {
    const config = TABS[state.activeTab];
    const Component = config.component;

    return (
      <Suspense fallback={<div>...Loading</div>}>
        <Component />
      </Suspense>
    );
  };

  return { activeTab: state.activeTab, setActiveTab, renderActiveComponents };
};

const useTodosVM = () => {
  const { state, dispatch } = useStore();

  const todos = useMemo(
    () => selectFilteredTodos(state),
    [state.todoState, state.queryTodo]
  );

  const setQuery = (q: string) =>
    dispatch({ type: "SET_QUERY_TODO", payload: q });

  const addTodo = (title: string) => {
    const newTodo: Todo = {
      title: title,
      id: Math.random(),
      completed: false,
    };
    dispatch({
      type: "SET_TODO_STATE",
      payload: [...state.todoState, newTodo],
    });
  };
  const deleteTodo = (id: number) => {
    dispatch({
      type: "SET_TODO_STATE",
      payload: state.todoState.filter((e) => e.id !== id),
    });
  };
  const toggleTodo = (id: number) => {
    dispatch({
      type: "SET_TODO_STATE",
      payload: state.todoState.map((e) =>
        e.id === id ? { ...e, completed: !e.completed } : e
      ),
    });
  };

  return {
    todos,
    setQuery,
    query: state.queryTodo,
    addTodo,
    deleteTodo,
    toggleTodo,
  };
};

const useOrdersVM = () => {
  const { state, dispatch } = useStore();

  const orders = useMemo(
    () => selectFilteredOrders(state),
    [state.orderState, state.queryFilter, state.queryOrder]
  );

  const stats = useMemo(
    () => selectOrderStats(state),
    [state.orderState, state.queryFilter, state.queryOrder]
  );

  return {
    orders,
    query: state.queryOrder,
    filter: state.queryFilter,
    count: state.count,
    stats,
    setQuery: (q: string) => dispatch({ type: "SET_QUERY_ORDER", payload: q }),
    setFilter: (f: Status | "all") =>
      dispatch({ type: "SET_ORDER_FILTER", payload: f }),
    setCount: (c: number) => dispatch({ type: "SET_COUNT", payload: c }),
  };
};

const ComponentsLoading: React.FC = () => {
  const { setActiveTab, renderActiveComponents } = useTodo();

  return (
    <>
      <div>
        {(Object.keys(TABS) as TabType[]).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}>
            {TABS[tab].label}
          </button>
        ))}
      </div>
      {renderActiveComponents()}
    </>
  );
};

const ComponentsTodos: React.FC = () => {
  const { todos, addTodo, deleteTodo, toggleTodo, query, setQuery } =
    useTodosVM();

  return (
    <>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        onClick={() => {
          addTodo(query);
        }}
      >
        addTodo
      </button>
      {todos.map((e) => (
        <div key={e.id}>
          <span>
            {e.title} - {e.completed ? "Done" : "Pending"}
          </span>
          <button
            onClick={() => {
              toggleTodo(e.id);
            }}
          >
            Toggle
          </button>
          <button
            onClick={() => {
              deleteTodo(e.id);
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </>
  );
};

const ComponentOrders: React.FC = () => {
  const { orders, query, filter, count, stats, setQuery, setCount, setFilter } =
    useOrdersVM();

  return (
    <>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value as Status | "all")}
      >
        <option value="all">All</option>
        <option value={Status.New}>New</option>
        <option value={Status.Canceled}>Canceled</option>
        <option value={Status.Paid}>Paid</option>
      </select>

      <button onClick={() => setCount(count + 1)}>Increment - {count}</button>

      {orders.map((e) => (
        <div key={e.id}>
          <span>{e.customerName}</span>
          <span>{e.money}</span>
          <span>{e.status}</span>
        </div>
      ))}

      <div>
        {stats.count} / {stats.countFull}
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

const Home: React.FC = () => {
  const USERS: User[] = [
    { id: "p1", name: "Kevin", email: "123@gmail.com", age: 43 },
    { id: "p2", name: "Alex", email: "313@gmail.com", age: 11 },
    { id: "p3", name: "Jone", email: "223@gmail.com", age: 12 },
  ];

  return (
    <>
      <ErrorBoundary>
        <ComponentsLoading />
        <ComponentOrders />
        <ComponentsTodos />
        <ListOfUsers users={USERS} />
      </ErrorBoundary>
    </>
  );
};

export { Home };

export default function App() {
  return (
    <StoreProvider>
      <Home />
    </StoreProvider>
  );
}

