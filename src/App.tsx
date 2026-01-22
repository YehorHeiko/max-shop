import { useMemo, useState } from "react";

type OrderStatus = "new" | "paid" | "cancelled";
type FilterStatus = OrderStatus | "all";

interface Order {
  id: number;
  customerName: string;
  status: FilterStatus;
  money: number;
}

const orders: Order[] = [
  { id: 1, customerName: "Elon Musk", status: "new", money: 2 },
  { id: 2, customerName: "John Doe", status: "paid", money: 3 },
  { id: 3, customerName: "Alex Smith", status: "cancelled", money: 44 },
];

// helper

const helperFunk = (data: Order[], filterType: FilterStatus, query: string) => {
  const lowerQuery = query.toLowerCase();

  return data.filter((e) => {
    const filterForType = e.status === filterType || filterType === "all";
    const filterForQuery = e.customerName.toLowerCase().includes(lowerQuery);
    return filterForType && filterForQuery;
  });
};

const useOrderLogic = (data: Order[]) => {
  const [query, setQuery] = useState<string>("");
  const [filterType, setFilerType] = useState<FilterStatus>("all");

  const filteredOrders = useMemo(
    () => helperFunk(data, filterType, query),
    [data, filterType, query]
  );

  const stats = useMemo(
    () => ({
      total: data.length,
      totalCost: data.reduce((start, sec) => start + sec.money, 0),
      totalFiltered: filteredOrders.length,
    }),
    [data, filteredOrders]
  );

  return {
    setters: {
      setQuery,
      setFilerType,
    },
    state: {
      query,
      filterType,
    },
    stats,
    filteredOrders,
  };
};

export const OrdersWithStats: React.FC = () => {
  const { setters, state, filteredOrders, stats } = useOrderLogic(orders);
  return (
    <>
      <select
        name="select"
        value={state.filterType}
        onChange={(e) => {
          setters.setFilerType(
            e.target.value as "new" | "paid" | "cancelled" | "all"
          );
        }}
      >
        <option value="all">all</option>
        <option value="new">new</option>
        <option value="paid">paid</option>
        <option value="cancelled">cancelled</option>
      </select>
      <input
        type="text"
        value={state.query}
        onChange={(e) => {
          setters.setQuery(e.target.value);
        }}
      />
      {filteredOrders.map((order) => (
        <div key={order.id}>
          <h1>{order.customerName}</h1>
          <p>{order.status}</p>
        </div>
      ))}
      <div className="stats">
        <div>Total: {stats.total}</div>
        <div>Total cost: {stats.totalCost}</div>
        <div>Total cost filter: {stats.totalFiltered}</div>
      </div>
    </>
  );
}

export default OrdersWithStats;
