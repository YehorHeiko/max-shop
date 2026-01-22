import { useMemo, useState } from "react";

interface Order {
  id: number;
  customerName: string;
  status: "new" | "paid" | "cancelled";
  money: number;
}

const orders: Order[] = [
  { id: 1, customerName: "Elon Musk", status: "new", money: 2 },
  { id: 2, customerName: "John Doe", status: "paid", money: 3 },
  { id: 3, customerName: "Alex Smith", status: "cancelled", money: 44 },
];

function OrdersWithStats() {
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState<
    "new" | "paid" | "cancelled" | "all"
  >("all");

  const search = searchValue.toLowerCase();

  const { filterClient, stats } = useMemo(() => {
    const filteredDate = orders.filter((e) => {
      const filterBySearch = e.customerName.includes(search);
      const filterByType = e.status === filterType || filterType === "all";
      return filterBySearch && filterByType;
    });

    return {
      filterClient: filteredDate,
      stats: {
        sum: orders.reduce((total, e) => total + e.money, 0),
        total: orders.length,
        totalFiltered: filteredDate.length,
      },
    };
  }, [filterType, search]);

  return (
    <>
      <select
        name="select"
        value={filterType}
        onChange={(e) => {
          setFilterType(e.target.value as "new" | "paid" | "cancelled" | "all");
        }}
      >
        <option value="all">all</option>
        <option value="new">new</option>
        <option value="paid">paid</option>
        <option value="cancelled">cancelled</option>
      </select>
      <input
        type="text"
        value={searchValue}
        onChange={(e) => {
          setSearchValue(e.target.value);
        }}
      />
      {filterClient.map((order) => (
        <div key={order.id}>
          <h1>{order.customerName}</h1>
          <p>{order.status}</p>
        </div>
      ))}
      <div className="stats">
        <div>Total: {stats.total}</div>
        <div>Total cost: {stats.sum}</div>
        <div>Total Filtered: {stats.totalFiltered}</div>
      </div>
    </>
  );
}

export default OrdersWithStats;
