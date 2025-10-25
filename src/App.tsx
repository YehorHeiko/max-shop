import "./App.scss";
import InputField from "./components/InputField";
import { useLoginForm } from "./hooks/useLoginForm";
import { loginRules } from "./validation/loginRules";

interface FormData {
  email: string;
  password: string;
}

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useLoginForm();
  const onSubmit = (data: FormData) => console.log(data);

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
    </>
  );
}

export default App;
