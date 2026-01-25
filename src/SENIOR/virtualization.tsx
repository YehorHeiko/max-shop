import React, { useState, useMemo, useEffect, useContext, createContext } from "react";

// --- Types (Строгие типы для безопасности) ---
interface Item {
  id: number;
  title: string;
  message: string;
  createdAt: string;
  type: "error" | "info" | "warning"; // Enum-подобный тип
}

interface VirtualListProps {
  items: Item[];
  itemHeight: number;
  containerHeight: number;
}

interface ItemsContextType {
  items: Item[];
  loading: boolean;
  error: string | null;
}

// --- Context для данных (готов к API) ---
const ItemsContext = createContext<ItemsContextType | null>(null);

// Provider с загрузкой данных
const ItemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        // В реальности: const response = await fetch('/api/items');
        const mockItems: Item[] = [
          {
            id: 1,
            title: "Уведомление #1",
            message: "Тестовое сообщение",
            createdAt: "Mon Oct 04 1982 18:35:18 GMT+0100 (Центральная Европа, стандартное время)",
            type: "error",
          },
          {
            id: 2,
            title: "Уведомление #2",
            message: "Тестовое сообщение",
            createdAt: "Thu May 11 1978 15:22:06 GMT+0100 (Центральная Европа, стандартное время)",
            type: "info",
          },
          {
            id: 3,
            title: "Уведомление #3",
            message: "Тестовое сообщение",
            createdAt: "Mon Jan 10 1977 11:53:08 GMT+0100 (Центральная Европа, стандартное время)",
            type: "info",
          },
        ];
        setItems(mockItems);
      } catch (err) {
        setError("Failed to load items");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  return (
    <ItemsContext.Provider value={{ items, loading, error }}>
      {children}
    </ItemsContext.Provider>
  );
};

// --- Custom Hook для виртуализации ---
const useVirtualList = (items: Item[], itemHeight: number, containerHeight: number) => {
  const [scrollTop, setScrollTop] = useState(0);

  // Оптимизация: useMemo для видимых элементов
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight)
    );

    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [items, itemHeight, containerHeight, scrollTop]);

  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    totalHeight,
    onScroll: (scrollTop: number) => setScrollTop(scrollTop),
  };
};

// --- Components ---
const VirtualListItem: React.FC<{ item: Item; index: number; itemHeight: number }> = React.memo(
  ({ item, index, itemHeight }) => (
    <div
      style={{
        position: "absolute",
        top: index * itemHeight,
        height: itemHeight,
        width: "100%",
        borderBottom: "1px solid #ccc",
        padding: "8px",
        backgroundColor: item.type === "error" ? "#ffe6e6" : "#f0f0f0",
      }}
      role="listitem"
      aria-label={`Notification: ${item.title}`}
    >
      <strong>{item.title}</strong> - {item.message} ({item.type})
    </div>
  )
);

const VirtualList: React.FC<VirtualListProps> = ({ items, itemHeight, containerHeight }) => {
  const { visibleItems, totalHeight, onScroll } = useVirtualList(items, itemHeight, containerHeight);

  if (items.length === 0) {
    return <p>No items to display.</p>;
  }

  return (
    <div
      onScroll={(e) => onScroll(e.currentTarget.scrollTop)}
      style={{
        height: containerHeight,
        overflowY: "auto",
        position: "relative",
        border: "2px solid #ddd",
      }}
      role="list"
      aria-label="Virtual list of notifications"
    >
      {/* Placeholder для общей высоты */}
      <div style={{ height: totalHeight }} />
      {visibleItems.map(({ item, index }) => (
        <VirtualListItem key={item.id} item={item} index={index} itemHeight={itemHeight} />
      ))}
    </div>
  );
};

// Error Boundary
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
    console.error("Virtual list error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong with the list.</div>;
    }
    return this.props.children;
  }
}

// --- Main Component ---
const App: React.FC = () => {
  const context = useContext(ItemsContext);
  if (!context) throw new Error("App must be used within ItemsProvider");

  const { items, loading, error } = context;

  if (loading) return <div>Loading items...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Notifications</h1>
      <VirtualList items={items} itemHeight={50} containerHeight={400} />
    </div>
  );
};

// --- App Wrapper ---
const RootApp: React.FC = () => (
  <ErrorBoundary>
    <ItemsProvider>
      <App />
    </ItemsProvider>
  </ErrorBoundary>
);

export default RootApp;