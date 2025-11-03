interface InputFieldProps {
  label: string;
  id: string;
  type?: string;
  error?: string;
  autoFocus?: boolean;
  autoComplete?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  id,
  type = "text",
  error,
  autoFocus,
  autoComplete,
  ...props
}) => (
  <>
    <label htmlFor={id}>{label}</label>
    <input
      type={type}
      id={id}
      autoFocus={autoFocus}
      autoComplete={autoComplete}
      aria-invalid={error ? "true" : "false"}
      {...props}
    />
    {error && <p>{error}</p>}
  </>
);

export default InputField;
