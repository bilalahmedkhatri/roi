interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div className={`rounded-2xl border border-border bg-surface-elevated p-5 sm:p-6 ${hover ? "card-hover" : ""} ${className}`}>
      {children}
    </div>
  );
}
