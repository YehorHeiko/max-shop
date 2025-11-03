import { useRef, useState } from "react";
import { useTodo } from "./context/TodoContext";

function App() {
  const [text, setText] = useState("");
  const { dispatch, state } = useTodo();
  const ref = useRef(null);

  return (
    <>
      <div>todo</div>
      <input
        type="text"
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={() => dispatch({ type: "ADD_TODO", payload: text })}
      >
        Add todo
      </button>
      {state.todo?.map((e, index) => (
        <div key={index}>
          <p>{e.text}</p>
          <button
            onClick={() => dispatch({ type: "DELETE_TODO", payload: e.id })}
          >
            x
          </button>
        </div>
      ))}
    </>
  );
}

export default App;
