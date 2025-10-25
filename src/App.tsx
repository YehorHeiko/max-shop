import { useForm } from "react-hook-form";
import "./App.scss";

interface FormData {
  email: string;
  password: string;
}

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();
  const onSubmit = (data: FormData) => console.log(data);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          autoComplete="email"
          {...register("email", {
            required: true,
            maxLength: 20,
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email format",
            },
          })}
          aria-invalid={errors.email ? "true" : "false"}
        />
        {errors.email && <p>{errors.email.message}</p>}

        <label htmlFor="password">password</label>
        <input
          type="password"
          id="password"
          autoComplete="current-password"
          aria-invalid={errors.password ? "true" : "false"}
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
        />
        {errors.password && <p role="alert">{errors.password.message}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "...Loading" : "Submit"}
        </button>
      </form>
    </>
  );
}

export default App;
