import React, { useCallback, useState } from "react";
interface Todos {
  id: number;
  title: string;
  completed: boolean;
}

const todos: Todos[] = [
  { id: 1, title: "Elon Musk", completed: true },
  { id: 2, title: "John Doe", completed: true },
  { id: 3, title: "Alex Smith", completed: false },
  { id: 4, title: "Jane Doe", completed: false },
  { id: 5, title: "Bob Wilson", completed: true },
];

const TodoItem: React.FC<{
  todo: Todos;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}> = React.memo(({ todo, onToggle, onDelete }) => {
  console.log("render", todo.id, todo);
  return (
    <div>
      <h1>{todo.title}</h1>
      <button onClick={() => onToggle(todo.id)}>toggle</button>
      <button onClick={() => onDelete(todo.id)}>delete</button>
    </div>
  );
});

function OrdersWithStats() {
  const [unrelatedCounter, unrelatedSetCounter] = useState(0);
  const [newTitle, setNewTitle] = useState("");
  const [mainTodos, setMainTodos] = useState<Todos[]>(todos);

  const onToggle = useCallback((id: number) => {
    setMainTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  const onAdd = useCallback(
    (id: number, newTitle: string, complete: boolean) => {
      const newTodo = { id, title: newTitle, completed: complete };

      setMainTodos((prev) => {
        console.log(prev, "prev");
        return [...prev, newTodo];
      });
    },
    []
  );

  const onDelete = useCallback((id: number) => {
    setMainTodos((prev) => prev.filter((e) => e.id != id));
  }, []);

  return (
    <>
      <input
        type="text"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
      />
      <button onClick={() => onAdd(Date.now(), newTitle, false)}>
        add todo
      </button>
      {mainTodos.map((todo) => (
        <TodoItem
          todo={todo}
          key={todo.id}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
      <button
        onClick={() => {
          unrelatedSetCounter((e) => e + 1);
        }}
      >
        {unrelatedCounter}
      </button>
    </>
  );
}

export default OrdersWithStats;
