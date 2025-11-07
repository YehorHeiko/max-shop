import { useTodo } from "../context/TodoContext";

function TodoList() {
  const { dispatch, state } = useTodo();

  return (
    <>
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

export default TodoList;
