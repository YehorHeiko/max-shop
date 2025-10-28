import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
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
      return { ...state, count: state.count + action.count || 1 };
    case "decrement":
      return { ...state, count: state.count - action.count || 1 };
    case "changeName":
      return { ...state, name: action.name };
    default:
      throw new Error();
  }
}


const initialState = { count: 0, name: "John" };

const API = "https://jsonplaceholder.typicode.com/todos";

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useLoginForm();
  const onSubmit = (data: FormData) => console.log(data);

  const [counter, dispatch] = useReducer(reducer, initialState);
  const [posts, setPost] = useState([]);

  const getPosts = useCallback(async () => {
    try {
      const resApi = await fetch(API); // Получаем ответ от API
      const data = await resApi.json(); // Парсим JSON
      setPost(data); // Возвращаем данные
    } catch (error) {
      console.error("Ошибка при получении данных:", error);
      return []; // Возвращаем пустой массив в случае ошибки
    }
  }, []);

  useEffect(() => {
    getPosts();
  }, [getPosts]);
  const memoizedPosts = useMemo(() => posts, [posts]);

  const PostList = React.memo(
    ({ post }: any) => {
      return (
        <div key={post.id} className="post">
          {post.title}
        </div>
      );
    },
    (prevPost, nextPost) => {
      return (
        prevPost.post.title === nextPost.post.title &&
        prevPost.post.id === nextPost.post.id
      );
    }
  );

  console.log(posts);

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
              count: 2,
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

      <div className="posts">
        {memoizedPosts.map((post: any) => (
          <PostList key={post.id} post={post} />
        ))}
      </div>
    </>
  );
}

export default App;
