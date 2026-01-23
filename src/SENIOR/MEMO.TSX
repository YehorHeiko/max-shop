import React, { useState, useMemo, useEffect, useContext, createContext } from "react";
import { FixedSizeList as List } from "react-window"; // Для виртуализации больших списков
import { useDebounce } from "use-debounce"; // Библиотека для debounce (или кастомный хук)

// --- Types & Enums (Строгие типы для безопасности) ---
enum OrderStatus {
  NEW = "new",
  PAID = "paid",
  CANCELLED = "cancelled",
}

type FilterStatus = OrderStatus | "all";

interface Order {
  id: number;
  customerName: string;
  status: OrderStatus; // Только enum, без "all"
  money: number;
}

// --- Constants & Mocks ---
const ORDERS_DATA: Order[] = [
  { id: 1, customerName: "Elon Musk", status: OrderStatus.NEW, money: 2 },
  { id: 2, customerName: "John Doe", status: OrderStatus.PAID, money: 3 },
  { id: 3, customerName: "Alex Smith", status: OrderStatus.CANCELLED, money: 44 },
];

// --- Context для глобального состояния (если нужно делить между компонентами) ---
interface OrdersContextType {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
}

const OrdersContext = createContext<OrdersContextType | null>(null);

// Provider для загрузки данных (например, из API)
const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Симуляция API-запроса
    const fetchOrders = async () => {
      try {
        // В реальности: const response = await fetch('/api/orders');
        setOrders(ORDERS_DATA); // Мок
      } catch (err) {
        setError("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <OrdersContext.Provider value={{ orders, isLoading, error }}>
      {children}
    </OrdersContext.Provider>
  );
};

// --- Pure Logic (Легко тестировать) ---
/**
 * Фильтрует заказы по поиску и статусу.
 * @param orders - Массив заказов
 * @param query - Поисковый запрос
 * @param status - Фильтр статуса
 * @returns Отфильтрованный массив
 */
const filterOrders = (orders: Order[], query: string, status: FilterStatus): Order[] => {
  const normalizedQuery = query.trim().toLowerCase();
  return orders.filter((order) => {
    const matchesStatus = status === "all" || order.status === status;
    const matchesQuery = !normalizedQuery || order.customerName.toLowerCase().includes(normalizedQuery);
    return matchesStatus && matchesQuery;
  });
};

/**
 * Вычисляет статистику для заказов.
 * @param orders - Все заказы
 * @param filtered - Отфильтрованные заказы
 * @returns Объект статистики
 */
const calculateStats = (orders: Order[], filtered: Order[]) => ({
  total: orders.length,
  filteredCount: filtered.length,
  totalRevenue: filtered.reduce((sum, order) => sum + order.money, 0),
});

// --- Custom Hook ---
const useOrdersWithStats = () => {
  const context = useContext(OrdersContext);
  if (!context) throw new Error("useOrdersWithStats must be used within OrdersProvider");

  const { orders, isLoading, error } = context;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<FilterStatus>("all");

  // Debounce для поиска (300ms, чтобы избежать лишних рендеров)
  const [debouncedQuery] = useDebounce(query, 300);

  const filteredOrders = useMemo(
    () => filterOrders(orders, debouncedQuery, status),
    [orders, debouncedQuery, status]
  );

  const stats = useMemo(
    () => calculateStats(orders, filteredOrders),
    [orders, filteredOrders]
  );

  return {
    query,
    setQuery,
    status,
    setStatus,
    filteredOrders,
    stats,
    isLoading,
    error,
  };
};

// --- Components (Модульные, с memo для оптимизации) ---
const OrderItem: React.FC<{ order: Order }> = React.memo(({ order }) => (
  <article className="order-item" role="listitem">
    <h3>{order.customerName}</h3>
    <p>Status: <strong>{order.status}</strong></p>
  </article>
));

const OrdersList: React.FC<{ orders: Order[] }> = ({ orders }) => {
  if (orders.length === 0) {
    return <p>No orders found matching your criteria.</p>;
  }

  // Виртуализация для больших списков (react-window)
  return (
    <List
      height={400} // Высота контейнера
      itemCount={orders.length}
      itemSize={100} // Высота элемента
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <OrderItem order={orders[index]} />
        </div>
      )}
    </List>
  );
};

// --- Main Component ---
export const OrdersWithStats: React.FC = () => {
  const { query, setQuery, status, setStatus, filteredOrders, stats, isLoading, error } = useOrdersWithStats();

  if (isLoading) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <main>
      <section className="controls" aria-label="Order filters">
        <label htmlFor="status-select">Filter by status:</label>
        <select
          id="status-select"
          value={status}
          onChange={(e) => setStatus(e.target.value as FilterStatus)}
        >
          <option value="all">All Statuses</option>
          <option value={OrderStatus.NEW}>New</option>
          <option value={OrderStatus.PAID}>Paid</option>
          <option value={OrderStatus.CANCELLED}>Cancelled</option>
        </select>

        <label htmlFor="search-input">Search by customer:</label>
        <input
          id="search-input"
          type="search"
          placeholder="Type customer name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-describedby="search-help"
        />
        <small id="search-help">Search is debounced for better performance.</small>
      </section>

      <section className="list" aria-label="Orders list">
        <OrdersList orders={filteredOrders} />
      </section>

      <footer className="stats">
        <p>Showing {stats.filteredCount} of {stats.total} orders</p>
        <p>Total Revenue: <strong>${stats.totalRevenue.toLocaleString()}</strong></p>
      </footer>
    </main>
  );
};

// --- App Wrapper ---
const App: React.FC = () => (
  <OrdersProvider>
    <OrdersWithStats />
  </OrdersProvider>
);

export default App;




// import { useMemo, useState } from "react";

// type OrderStatus = "new" | "paid" | "cancelled";
// type FilterStatus = OrderStatus | "all";

// interface Order {
//   id: number;
//   customerName: string;
//   status: FilterStatus;
//   money: number;
// }

// const orders: Order[] = [
//   { id: 1, customerName: "Elon Musk", status: "new", money: 2 },
//   { id: 2, customerName: "John Doe", status: "paid", money: 3 },
//   { id: 3, customerName: "Alex Smith", status: "cancelled", money: 44 },
// ];

// // helper

// const helperFunk = (data: Order[], filterType: FilterStatus, query: string) => {
//   const lowerQuery = query.toLowerCase();

//   return data.filter((e) => {
//     const filterForType = e.status === filterType || filterType === "all";
//     const filterForQuery = e.customerName.toLowerCase().includes(lowerQuery);
//     return filterForType && filterForQuery;
//   });
// };

// const useOrderLogic = (data: Order[]) => {
//   const [query, setQuery] = useState<string>("");
//   const [filterType, setFilerType] = useState<FilterStatus>("all");

//   const filteredOrders = useMemo(
//     () => helperFunk(data, filterType, query),
//     [data, filterType, query]
//   );

//   const stats = useMemo(
//     () => ({
//       total: data.length,
//       totalCost: data.reduce((start, sec) => start + sec.money, 0),
//       totalFiltered: filteredOrders.length,
//     }),
//     [data, filteredOrders]
//   );

//   return {
//     setters: {
//       setQuery,
//       setFilerType,
//     },
//     state: {
//       query,
//       filterType,
//     },
//     stats,
//     filteredOrders,
//   };
// };

// export const OrdersWithStats: React.FC = () => {
//   const { setters, state, filteredOrders, stats } = useOrderLogic(orders);
//   return (
//     <>
//       <select
//         name="select"
//         value={state.filterType}
//         onChange={(e) => {
//           setters.setFilerType(
//             e.target.value as "new" | "paid" | "cancelled" | "all"
//           );
//         }}
//       >
//         <option value="all">all</option>
//         <option value="new">new</option>
//         <option value="paid">paid</option>
//         <option value="cancelled">cancelled</option>
//       </select>
//       <input
//         type="text"
//         value={state.query}
//         onChange={(e) => {
//           setters.setQuery(e.target.value);
//         }}
//       />
//       {filteredOrders.map((order) => (
//         <div key={order.id}>
//           <h1>{order.customerName}</h1>
//           <p>{order.status}</p>
//         </div>
//       ))}
//       <div className="stats">
//         <div>Total: {stats.total}</div>
//         <div>Total cost: {stats.totalCost}</div>
//         <div>Total cost filter: {stats.totalFiltered}</div>
//       </div>
//     </>
//   );
// }

// export default OrdersWithStats;
