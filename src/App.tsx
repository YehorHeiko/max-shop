import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import "./App.scss";
import InputField from "./components/InputField";
import { useLoginForm } from "./hooks/useLoginForm";
import { loginRules } from "./validation/loginRules";
import { usePrevious } from "./hooks/usePrevious";

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

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useLoginForm();
  const onSubmit = (data: FormData) => console.log(data);

  const [counter, dispatch] = useReducer(reducer, initialState);

  const API = "https://jsonplaceholder.typicode.com/todos";
  const [posts, setPosts] = useState([]);

  // useEffect(() => {
  //   const controller = new AbortController();

  //   (async () => {
  //     try {
  //       const res = await fetch(API, { signal: controller.signal });
  //       if (!res.ok) throw new Error(`HTTP ${res.status}`);
  //       const data = await res.json();
  //       setPosts(data);
  //     } catch (error) {
  //       if (error instanceof DOMException && error.name === "AbortError") {
  //         console.error("Failed to fetch posts:", error);
  //       }
  //     }
  //   })();

  //   return () => controller.abort();
  // }, []);
  

  // const getPosts = useCallback(async () => {
  //   const controller = new AbortController();

  //   try {
  //     const resApi = await fetch(API, { signal: controller.signal }); // Получаем ответ от API
  //     const data = await resApi.json(); // Парсим JSON
  //     setPost(data); // Возвращаем данные
  //   } catch (error) {
  //     if (error !== "AbortError") console.error(error);
  //     return []; // Возвращаем пустой массив в случае ошибки
  //   }

  //   return () => controller.abort();
  // }, []);

  // useEffect(() => {
  //   getPosts();
  // }, [getPosts]);

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

  // console.log(posts);

  const myRef = useRef<HTMLInputElement>(null);

  function focusInput() {
    if (myRef.current) {
      myRef.current.focus();
    }
  }

  const [test1 , setTest1] = useState(0);

  const prevTest1 = usePrevious(test1)
  const message = 
    (test1 > prevTest1 && prevTest1 !== undefined) 
      ? `Увеличилось с ${prevTest1} до ${test1}!` 
      : 'Значение не изменилось или уменьшилось.';
  
  return (
    <>
      {/* <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
      </form> */}

      {/* <div>
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
        {posts.map((post: any) => (
          <PostList key={post.id} post={post} />
        ))}
      </div> */}

      <div>Now {prevTest1} numbers</div>
      <div>{message}</div>
      <button onClick={() => setTest1(test1 => test1 + 1)}>Increment</button>  

      <input type="text" ref={myRef} />
      <button onClick={focusInput}>Focus</button>
    </>
  );
}

export default App;
