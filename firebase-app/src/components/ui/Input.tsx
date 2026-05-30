import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = ({ className = "", ...props }: InputProps) => (
  <input className={`mt-2 w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 focus:border-brand-500 focus:outline-none ${className}`} {...props} />
);

export default Input;
