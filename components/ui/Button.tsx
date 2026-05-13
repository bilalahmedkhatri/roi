import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  className = "",
  onClick,
  type = "button",
  disabled,
}: ButtonProps) {
  const base = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-40 disabled:pointer-events-none";

  const variants: Record<string, string> = {
    primary: "bg-primary text-white hover:bg-primary-dark active:scale-[0.98]",
    secondary: "bg-surface text-foreground border border-border hover:bg-surface-elevated active:scale-[0.98]",
    outline: "border border-border text-muted hover:text-foreground hover:border-foreground/20 active:scale-[0.98]",
    ghost: "text-muted hover:text-foreground hover:bg-surface active:scale-[0.98]",
  };

  const sizes: Record<string, string> = {
    sm: "h-9 px-4 text-xs",
    md: "h-11 px-5 text-sm",
    lg: "h-13 px-7 text-base",
  };

  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return <Link href={href} className={classes}>{children}</Link>;
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
