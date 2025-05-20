import { forwardRef, InputHTMLAttributes } from "react";

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props }, ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm placeholder-gray-400focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors',
        className
      )}
      {...props}
    />
  );
});