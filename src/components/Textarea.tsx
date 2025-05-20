import { forwardRef, TextareaHTMLAttributes } from "react";

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        `w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm placeholder-gray-400
         focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors`,
        className
      )}
      {...props}
    />
  );
});
