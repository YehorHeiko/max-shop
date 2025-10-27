import { useReducer } from "react";
import "./App.scss";
import InputField from "./components/InputField";
import { useLoginForm } from "./hooks/useLoginForm";
import { loginRules } from "./validation/loginRules";

interface FormData {
  email: string;
  password: string;
}

function reducer(state: { count: number; name: string }, action: any) {
  console.log(state, "12");

  switch (action.type) {
    case "increment":
      // console.log(state);
      return { ...state, count: state.count + 1 };
    case "decrement":
      return { ...state, count: state.count - 1 };
    case "changeName":
      return { ...state, name: action.name };
    default:
      throw new Error();
  }

  
}

const initialState = { count: 0, name: "John" };

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useLoginForm();
  const onSubmit = (data: FormData) => console.log(data);

  const [counter, dispatch] = useReducer(reducer, initialState);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <InputField
          id="email"
          label="Email"
          type="email"
          autoFocus
          autoComplete="email"
          {...register("email", loginRules.email)}
          error={errors.email?.message}
        />

        <InputField
          id="password"
          label="Password"
          autoComplete="current-password"
          type="password"
          {...register("password", loginRules.password)}
          error={errors.password?.message}
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "...Loading" : "Submit"}
        </button>
      </form>

      <div>
        <div>{counter.count}</div>
        <button
          onClick={() =>
            dispatch({
              type: "increment",
              name: "Max",
            })
          }
        >
          increment
        </button>
        <button
          onClick={() =>
            dispatch({
              type: "decrement",
              count: 2,
            })
          }
        >
          decrement
        </button>

        <div>{counter.name}</div>
        <button
          onClick={() =>
            dispatch({
              type: "changeName",
              name: "Max",
            })
          }
        >
          changeName
        </button>
      </div>
    </>
  );
}

export default App;
