import React, {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Tab loading error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || <div>Failed to load tab. Please try again.</div>
      );
    }
    return this.props.children;
  }
}

interface TabConfig {
  key: TabType;
  label: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
}

const TABS: TabConfig[] = [
  {
    key: "first",
    label: "firstHeavyComponents",
    component: lazy(() => import("./components/HeavyComponent")),
  },
  {
    key: "second",
    label: "secondHeavyComponents",
    component: lazy(() => import("./components/Reports")),
  },
  {
    key: "third",
    label: "thirdHeavyComponents",
    component: lazy(() => import("./components/TodoItem")),
  },
];

enum Status {
  New = "NEW",
  Paid = "PAID",
  Canceled = "CANCELLED",
}

type Orders = {
  id: number;
  customerName: string;
  status: Status | "ALL";
  money: number;
};

type Todos = {
  id: number;
  title: string;
  completed: boolean;
};
type Users = {
  id: string;
  name: string;
  email: string;
  age: number;
};

type TabType = "first" | "second" | "third";

const ORDERS_DATA: Orders[] = [
  { id: 1, customerName: "Elon Musk", status: Status.New, money: 2 },
  { id: 2, customerName: "John Doe", status: Status.Canceled, money: 3 },
  { id: 3, customerName: "Alex Smith", status: Status.Paid, money: 44 },
];

const INITIAL_TODOS: Todos[] = [
  { id: 1, title: "Elon Musk", completed: true },
  { id: 2, title: "John Doe", completed: true },
  { id: 3, title: "Alex Smith", completed: false },
  { id: 4, title: "Jane Doe", completed: false },
  { id: 5, title: "Bob Wilson", completed: true },
];

interface ListOfTodoProps {
  initial_todo: Todos[];
  deleteFunction: (id: number) => void;
  toggleFunction: (id: number) => void;
}

const ListOfTodo: React.FC<ListOfTodoProps> = ({
  initial_todo,
  deleteFunction,
  toggleFunction,
}) => {
  return (
    <>
      {initial_todo.map((e) => (
        <div key={e.id}>
          <p>{e.title}</p>
          <button onClick={() => deleteFunction(e.id)}>delete</button>
          <button onClick={() => toggleFunction(e.id)}>toggle</button>
        </div>
      ))}
    </>
  );
};

export { ListOfTodo };

const ListOfUsers = React.memo<{ users: Users[] }>(({ users }) => {
  return (
    <>
      {users.map((e) => (
        <div key={e.id}>
          <p>{e.name}</p>
          <p>{e.email}</p>
          <p>{e.age}</p>
        </div>
      ))}
    </>
  );
});

export { ListOfUsers };

export const MainContext = createContext<any>(null);

export const MainProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeTab, setActiveTab] = useState<string>("first");
  const [todos, setTodos] = useState<Todos[]>(INITIAL_TODOS);
  const [queryTodo, setQueryTodo] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [count, setCount] = useState<number>(0);

  const value = {
    activeTab,
    setActiveTab,
    todos,
    setTodos,
    queryTodo,
    setQueryTodo,
    count,
    setCount,
    query,
    setQuery,
  };

  return <MainContext.Provider value={value}>{children}</MainContext.Provider>;
};

const ComponentsLoading: React.FC = () => {
  const { setActiveTab, renderComponents } = useRenderComponents();

  return (
    <>
      <div>
        <button onClick={() => setActiveTab("first")}>
          firstHeavyComponents
        </button>
        <button onClick={() => setActiveTab("second")}>
          secondHeavyComponents
        </button>
        <button onClick={() => setActiveTab("third")}>
          thirdHeavyComponents
        </button>
      </div>
      <div>
        <Suspense fallback={<div>Loading</div>}>{renderComponents()}</Suspense>
      </div>
    </>
  );
};

export { ComponentsLoading };

const useRenderComponents = () => {
  const { activeTab, setActiveTab } = useContext(MainContext);

  const renderComponents = () => {
    const activeComponent = TABS.find((e) => e.key === activeTab);

    if (!activeTab) return <div>Error</div>;

    const Component = activeComponent?.component;
    if (!Component) return <div>Error</div>;

    return <Component />;
  };
  return {
    activeTab,
    setActiveTab,
    renderComponents,
  };
};

const ComponentOrders: React.FC = () => {
  const { state, setters, changedValue, stats } = useComponentOrder();

  return (
    <div>
      <input
        type="text"
        value={state.query}
        onChange={(e) => setters.setQuery(e.target.value)}
      />
      <select
        onChange={(e) =>
          setters.setFilter(
            e.target.value as Status.New | Status.Canceled | Status.Paid
          )
        }
      >
        <option value={"ALL"}>all</option>
        <option value={"NEW"}>new</option>
        <option value={"PAID"}>paid</option>
        <option value={"CANCELLED"}>canceled</option>
      </select>
      <button onClick={() => setters.setCount((e) => e + 1)}>
        CHECK - {state.count}
      </button>

      <div>
        {changedValue.map((e) => (
          <div
            key={e.id}
            style={{
              display: "flex",
              gap: "24px",
            }}
          >
            <p>{e.customerName}</p>
            <p>{e.money}</p>
            <small>{e.status}</small>
          </div>
        ))}
        <div>
          <p>{stats.count}Count</p>
          <p>{stats.countMain}Main</p>
        </div>
      </div>
    </div>
  );
};

export { ComponentOrders };

const ComponentTodos: React.FC = () => {
  const { states, setters, func } = useTodo();
  return (
    <>
      <input
        type="text"
        value={states.queryTodo}
        onChange={(e) => setters.setQueryTodo(e.target.value)}
      />
      <button
        onClick={() => func.addFunction(Math.random(), states.queryTodo, false)}
      >
        Add New TODO
      </button>
      <ListOfTodo
        initial_todo={states.todos}
        deleteFunction={func.deleteFunction}
        toggleFunction={func.toggleFunction}
      />
    </>
  );
};

export { ComponentTodos };

const useTodo = () => {
  const { todos, setTodos, queryTodo, setQueryTodo } = useContext(MainContext);

  const toggleFunction = useCallback((id: number) => {
    setTodos((state) =>
      state.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e))
    );
  }, [setTodos]);
  const deleteFunction = useCallback((id: number) => {
    setTodos((state) => state.filter((b) => b.id !== id));
  }, [setTodos]);
  const addFunction = useCallback(
    (id: number, newTitle: string, completed: boolean) => {
      const newTodo = { id: id, title: newTitle, completed: completed };
      setTodos((state) => [...state, newTodo]);
    },
    [setTodos]
  );

  return {
    states: { todos, queryTodo },
    setters: { setQueryTodo },
    func: {
      toggleFunction,
      deleteFunction,
      addFunction,
    },
  };
};

const useComponentOrder = () => {
  const [dateState, setDateState] = useState<Orders[]>(ORDERS_DATA);
  const { count, setCount, query, setQuery } = useContext(MainContext);
  const [filter, setFilter] = useState<Status | "ALL">("ALL");

  const { changedValue, stats } = useMemo(() => {
    const returnedValue = dateState.filter((e) => {
      const filtered = e.status === filter || filter === "ALL";
      const search = e.customerName.toLowerCase().includes(query.toLowerCase());

      return filtered && search;
    });
    return {
      changedValue: returnedValue,
      stats: {
        count: returnedValue.length,
        countMain: dateState.length,
      },
    };
  }, [dateState, filter, query]);

  return {
    state: {
      count,
      query,
    },
    changedValue,
    stats,
    setters: {
      setDateState,
      setCount,
      setQuery,
      setFilter,
    },
  };
};

function Home() {
  const USERS: Users[] = useMemo(
    () => [
      { id: "p1", name: "Kevin", email: "123@gmail.com", age: 43 },
      { id: "p2", name: "Alex", email: "313@gmail.com", age: 11 },
      { id: "p3", name: "Jone", email: "223@gmail.com", age: 12 },
    ],
    []
  );

  return (
    <>
      <div>
        <ErrorBoundary>
          <ComponentsLoading />
          <ComponentOrders />
          <ComponentTodos />
          <ListOfUsers users={USERS} />
        </ErrorBoundary>
      </div>
    </>
  );
}

export { Home };

function App() {
  return (
    <>
      <MainProvider>
        <Home />
      </MainProvider>
    </>
  );
}

export default App;
