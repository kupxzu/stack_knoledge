import React from 'react';

const variants = {
  default: "bg-blue-600 text-white",
  secondary: "bg-gray-100 text-gray-900",
  destructive: "bg-red-600 text-white",
  outline: "border border-gray-300 text-gray-700"
};

export const Badge = ({ 
  children, 
  variant = "default", 
  className = "",
  ...props 
}) => {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  const variantClasses = variants[variant] || variants.default;
  
  return (
    <span
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};