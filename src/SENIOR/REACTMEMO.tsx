import React, { useState, useEffect, useContext, createContext } from "react";

// --- Types (Строгие типы для безопасности) ---
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

interface UsersContextType {
  users: User[];
  loading: boolean;
  error: string | null;
}

// --- Context для состояния (готов к глобальному использованию) ---
const UsersContext = createContext<UsersContextType | null>(null);

// Provider с загрузкой данных (симуляция API)
const UsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // В реальности: const response = await fetch('/api/users');
        // Мок-данные
        const mockUsers: User[] = [
          { id: "p1", name: "Kevin", email: "123@gmail.com", age: 43 },
          { id: "p2", name: "Alex", email: "313@gmail.com", age: 11 },
          { id: "p3", name: "Jone", email: "223@gmail.com", age: 12 },
        ];
        setUsers(mockUsers);
      } catch (err) {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <UsersContext.Provider value={{ users, loading, error }}>
      {children}
    </UsersContext.Provider>
  );
};

// --- Custom Hook ---
const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) throw new Error("useUsers must be used within UsersProvider");
  return context;
};

// --- Components ---
const UserCard: React.FC<{ users: User[] }> = React.memo(({ users }) => {
  // Логирование вместо console.log (в продакшене — через logger, например, Sentry)
  useEffect(() => {
    console.log("UserCard rendered"); // Или: logger.info("UserCard rendered");
  }, []);

  if (users.length === 0) {
    return <p>No users available.</p>;
  }

  return (
    <ul role="list" aria-label="User list">
      {users.map((user) => (
        <li key={user.id} className="user-item" role="listitem">
          <article>
            <h3>{user.name}</h3>
            <p>Email: {user.email}</p>
            <p>Age: {user.age}</p>
          </article>
        </li>
      ))}
    </ul>
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
    console.error("User list error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh.</div>;
    }
    return this.props.children;
  }
}

// --- Main Component ---
const UserList: React.FC = () => {
  const { users, loading, error } = useUsers();
  const [counter, setCounter] = useState(0); // Исправлено: conter -> counter

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>User List</h2> {/* Исправлено: "Список товаров со скидками" -> "User List" */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <UserCard users={users} />
      </div>
      <button
        onClick={() => setCounter((prev) => prev + 1)}
        aria-label="Increment counter"
      >
        Counter: {counter}
      </button>
    </div>
  );
};

// --- App Wrapper ---
const App: React.FC = () => (
  <ErrorBoundary>
    <UsersProvider>
      <UserList />
    </UsersProvider>
  </ErrorBoundary>
);

export default App;