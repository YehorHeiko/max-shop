export const loginRules = {
    email: {
      required: "Email is required",
      maxLength: { value: 50, message: "Max 50 characters" },
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Invalid email format",
      },
    },
    password: {
      required: "Password is required",
      minLength: { value: 6, message: "Password must be at least 6 characters" },
    },
  };
  