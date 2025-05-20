import { ButtonHTMLAttributes, forwardRef } from "react";
function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function Button(
  { className, children, ...props }, ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center px-4 py-2 rounded-2xl shadow-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
