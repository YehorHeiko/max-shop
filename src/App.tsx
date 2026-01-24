import React, { useMemo, useState } from "react";

const UserCard: React.FC<any> = React.memo(({ users }) => {
  console.log("rerender");

  return (
    <>
      {users.map((e) => (
        <div key={e.id}>
          <h1>{e.name}</h1>
          <h2>{e.email}</h2>
          <p>{e.price}</p>
          <p>{e.age}</p>
        </div>
      ))}
    </>
  );
});

export { UserCard };

const ProductList = () => {
  const USERS = useMemo(
    () => [
      { id: "p1", name: "Kevin", email: "123@gmail.com", age: 43 },
      { id: "p2", name: "Alex", email: "313@gmail.com", age: 11 },
      { id: "p3", name: "Jone", email: "223@gmail.com", age: 12 },
    ],
    []
  );

  const [conter, setCounter] = useState(0);
  return (
    <div style={{ padding: "20px" }}>
      <h2>Список товаров со скидками</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <UserCard users={USERS} />
      </div>
      <button onClick={() => setCounter((e) => e + 1)}>{conter}</button>
    </div>
  );
};

export default ProductList;
