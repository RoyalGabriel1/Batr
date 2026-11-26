import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "inverse";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent-primary text-text-on-accent shadow-sm hover:bg-accent-primary-hover",
  secondary:
    "border border-border-default bg-bg-surface text-text-primary hover:border-border-strong hover:bg-bg-subtle",
  ghost: "text-text-secondary hover:bg-bg-subtle hover:text-text-primary",
  danger: "border border-state-danger/30 bg-bg-surface text-state-danger hover:bg-state-danger-soft",
  inverse: "bg-bg-inverse text-text-on-inverse hover:bg-[#0a3b33]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-caption",
  md: "px-4 py-2.5 text-body-sm",
  lg: "px-5 py-3 text-body",
};

export function buttonClass(opts?: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}): string {
  const { variant = "primary", size = "md", className } = opts ?? {};
  return [base, variantClasses[variant], sizeClasses[size], className].filter(Boolean).join(" ");
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
}

export function Button({ variant, size, className, type = "button", ...rest }: ButtonProps) {
  return <button type={type} className={buttonClass({ variant, size, className })} {...rest} />;
}
