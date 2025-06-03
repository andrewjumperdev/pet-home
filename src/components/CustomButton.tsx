import { Link } from "react-router-dom";
import React from "react";

type ButtonProps = {
  label: string;
  alt: string;
  variant?: "primary" | "secondary";
  onClick?: () => void;
  to?: string;
};

const CustomButton: React.FC<ButtonProps> = ({
  label,
  alt,
  variant = "primary",
  onClick,
  to,
}) => {
  const baseStyle =
    "w-full md:w-auto px-6 py-2 md:px-8 md:py-3 rounded-full text-base md:text-lg shadow-lg transform transition duration-300 drop-shadow-md uppercase font-semibold text-center";
  
  const variants = {
    primary: "bg-blue-400 hover:bg-blue-800 text-white hover:scale-110",
    secondary: "bg-white border border-blue-400 text-blue-600 hover:bg-blue-100 hover:scale-105",
  };

  const className = `${baseStyle} ${variants[variant]}`;

  if (to) {
    return (
      <Link to={to} className={className} aria-label={alt}>
        {label}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className} aria-label={alt}>
      {label}
    </button>
  );
};

export default CustomButton;
