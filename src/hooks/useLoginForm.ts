import { useForm } from "react-hook-form";

export interface LoginFormData {
  email: string;
  password: string;
}

export const useLoginForm = () => {
  return useForm<LoginFormData>({
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });
};