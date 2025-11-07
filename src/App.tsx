import { useRef, useState } from "react";
import TodoInput from "./components/TodoInput";
import TodoList from "./components/TodoList";

function App() {
  const [text, setText] = useState("");
  const ref = useRef(null);

  return (
    <>
      <div>todo</div>
      <TodoInput text={text} setText={setText} ref={ref} />
      <TodoList />
    </>
  );
}

export default App;
