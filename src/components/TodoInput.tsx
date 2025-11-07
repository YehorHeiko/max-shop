import type { Ref } from "react";
import { useTodo } from "../context/TodoContext";

interface todoInput  {
    text: string
    setText: (text: string) => void
    ref?: Ref<HTMLInputElement>
}

const TodoInput: React.FC<todoInput> = ({ text, setText, ref}) => {
  const { dispatch } = useTodo();

  return (
    <>
      <input
        type="text"
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={() => dispatch({ type: "ADD_TODO", payload: text })}>
        Add todo
      </button>
    </>
  );
}

export default TodoInput;
