
import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className }) => {
  return (
    <div className={`bg-brand-secondary rounded-lg shadow-xl overflow-hidden ${className}`}>
      <div className="p-4 sm:p-6 border-b border-brand-dark/50">
        <h2 className="text-xl font-bold text-brand-light">{title}</h2>
      </div>
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
