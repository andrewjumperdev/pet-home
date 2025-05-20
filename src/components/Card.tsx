import { forwardRef, HTMLAttributes } from "react";
function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {}
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, ...props }, ref
) {
  return (
    <div
      ref={ref}
      className={cn('bg-white rounded-2xl shadow-md overflow-hidden', className)}
      {...props}
    />
  );
});

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { className, ...props }, ref
) {
  return (
    <div
      ref={ref}
      className={cn('px-6 py-4 border-b border-gray-100', className)}
      {...props}
    />
  );
});

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}
export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
  { className, children, ...props }, ref
) {
  return (
    <h3
      ref={ref}
      className={cn('text-xl font-semibold', className)}
      {...props}
    >
      {children}
    </h3>
  );
});

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}
export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(function CardContent(
  { className, ...props }, ref
) {
  return (
    <div
      ref={ref}
      className={cn('p-6', className)}
      {...props}
    />
  );
});