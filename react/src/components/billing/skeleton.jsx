import React from 'react';

export const Skeleton = ({ className = "", ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-100 ${className}`}
      {...props}
    />
  );
};