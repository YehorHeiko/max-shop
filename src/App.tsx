import { useRef, useState } from "react";

function App() {
  const [todo, setTodo] = useState<string[]>([]);
  const [text, setText] = useState("");

  

  const ref = useRef(null);

  function AddTodo(text: string) {
    setTodo([...todo, text]);
  }

  function removeTodo(index: number) {
    setTodo(todo.filter((_, i) => i !== index));
  }
  return (
    <>
      <div>todo</div>
      <input
        type="text"
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={() => AddTodo(text)}>Add todo</button>
      {todo?.map((e, index) => (
        <div key={index}>
          <p>{e}</p>
          <button onClick={() => removeTodo(index)}>x</button>
        </div>
      ))}
    </>
  );
}

export default App;
