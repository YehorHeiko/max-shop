
import React, { useState, useMemo } from "react";

// --- Types & Constants ---
type OrderStatus = "new" | "paid" | "cancelled";
type FilterStatus = OrderStatus | "all";

interface Order {
  id: number;
  customerName: string;
  status: OrderStatus;
  money: number;
}

const ORDERS_DATA: Order[] = [
  { id: 1, customerName: "Elon Musk", status: "new", money: 2 },
  { id: 2, customerName: "John Doe", status: "paid", money: 3 },
  { id: 3, customerName: "Alex Smith", status: "cancelled", money: 44 },
];

// --- Pure Logic (Easy to test) ---
const getFilteredOrders = (orders: Order[], query: string, status: FilterStatus) => {
  const normalizedQuery = query.trim().toLowerCase();
  
  return orders.filter((order) => {
    const matchesStatus = status === "all" || order.status === status;
    const matchesQuery = !normalizedQuery || order.customerName.toLowerCase().includes(normalizedQuery);
    return matchesStatus && matchesQuery;
  });
};

// --- Custom Hook ---
const useOrderswithStats = (initialOrders: Order[]) => {
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState<FilterStatus>("all");

  const filteredOrders = useMemo(
    () => getFilteredOrders(initialOrders, searchValue, filterType),
    [initialOrders, searchValue, filterType]
  );

  const stats = useMemo(() => ({
    total: initialOrders.length,
    filteredCount: filteredOrders.length,
    totalSum: filteredOrders.reduce((acc, curr) => acc + curr.money, 0),
  }), [initialOrders, filteredOrders]);

  return {
    state: { searchValue, filterType },
    handlers: { setSearchValue, setFilterType },
    filteredOrders,
    stats
  };
};

// --- Component ---
export const OrdersWithStats: React.FC = () => {
  const { state, handlers, filteredOrders, stats } = useOrderswithStats(ORDERS_DATA);

  return (
    <main>
      <section className="controls" aria-label="Filters">
        <select
          value={state.filterType}
          onChange={(e) => handlers.setFilterType(e.target.value as FilterStatus)}
        >
          {/* Ключи вынесены в константы или генерируются из типов */}
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <input
          type="search" // Специальный тип для поиска
          placeholder="Search by customer..."
          value={state.searchValue}
          onChange={(e) => handlers.setSearchValue(e.target.value)}
        />
      </section>

      <section className="list">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <article key={order.id} className="order-item">
              <h3>{order.customerName}</h3>
              <p>Status: <strong>{order.status}</strong></p>
            </article>
          ))
        ) : (
          <p>No orders found matching your criteria.</p>
        )}
      </section>

      <footer className="stats">
        <p>Showing {stats.filteredCount} of {stats.total} orders</p>
        <p>Total Revenue: <strong>${stats.totalSum.toLocaleString()}</strong></p>
      </footer>
    </main>
  );
};

// import { useMemo, useState } from "react";

// interface Order {
//   id: number;
//   customerName: string;
//   status: "new" | "paid" | "cancelled";
//   money: number;
// }

// const orders: Order[] = [
//   { id: 1, customerName: "Elon Musk", status: "new", money: 2 },
//   { id: 2, customerName: "John Doe", status: "paid", money: 3 },
//   { id: 3, customerName: "Alex Smith", status: "cancelled", money: 44 },
// ];

// function OrdersWithStats() {
//   const [searchValue, setSearchValue] = useState("");
//   const [filterType, setFilterType] = useState<
//     "new" | "paid" | "cancelled" | "all"
//   >("all");

//   const search = searchValue.toLowerCase();

//   const { filterClient, stats } = useMemo(() => {
//     const filteredDate = orders.filter((e) => {
//       const filterBySearch = e.customerName.includes(search);
//       const filterByType = e.status === filterType || filterType === "all";
//       return filterBySearch && filterByType;
//     });

//     return {
//       filterClient: filteredDate,
//       stats: {
//         sum: orders.reduce((total, e) => total + e.money, 0),
//         total: orders.length,
//         totalFiltered: filteredDate.length,
//       },
//     };
//   }, [filterType, search]);

//   return (
//     <>
//       <select
//         name="select"
//         value={filterType}
//         onChange={(e) => {
//           setFilterType(e.target.value as "new" | "paid" | "cancelled" | "all");
//         }}
//       >
//         <option value="all">all</option>
//         <option value="new">new</option>
//         <option value="paid">paid</option>
//         <option value="cancelled">cancelled</option>
//       </select>
//       <input
//         type="text"
//         value={searchValue}
//         onChange={(e) => {
//           setSearchValue(e.target.value);
//         }}
//       />
//       {filterClient.map((order) => (
//         <div key={order.id}>
//           <h1>{order.customerName}</h1>
//           <p>{order.status}</p>
//         </div>
//       ))}
//       <div className="stats">
//         <div>Total: {stats.total}</div>
//         <div>Total cost: {stats.sum}</div>
//         <div>Total Filtered: {stats.totalFiltered}</div>
//       </div>
//     </>
//   );
// }

// export default OrdersWithStats;

