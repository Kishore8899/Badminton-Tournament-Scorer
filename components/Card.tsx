import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children, className, actions }) => {
  return (
    <div className={`bg-brand-secondary rounded-lg shadow-xl overflow-hidden ${className}`}>
      <div className="p-4 sm:p-6 border-b border-brand-dark/50 flex justify-between items-center">
        <h2 className="text-xl font-bold text-brand-light">{title}</h2>
        {actions && <div>{actions}</div>}
      </div>
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;