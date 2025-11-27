import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover' | 'clickable';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'bg-dark-800 border border-dark-600 rounded-lg overflow-hidden';

  const variants = {
    default: '',
    hover: 'hover:border-dark-500 transition-colors duration-200',
    clickable: 'hover:border-primary-600 hover:shadow-lg hover:shadow-primary-900/20 transition-all duration-200 cursor-pointer',
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
