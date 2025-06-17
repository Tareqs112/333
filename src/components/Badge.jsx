import React from 'react';

export function Badge({ children, variant = "default", className = "" }) {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  
  const variants = {
    default: "bg-gray-100 text-gray-800",
    secondary: "bg-gray-100 text-gray-800",
    outline: "border border-gray-200 text-gray-700",
    destructive: "bg-red-100 text-red-800",
    success: "bg-green-100 text-green-800",
  };

  const variantClasses = variants[variant] || variants.default;

  return (
    <span className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  );
}

