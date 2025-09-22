import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children, className, actions }) => {
  return (
    <div className={`bg-gradient-to-r from-primary to-accent p-0.5 rounded-xl shadow-lg ${className}`}>
      <div className="bg-secondary rounded-[11px] h-full">
        <div className="p-4 sm:p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-text">{title}</h2>
          {actions && <div>{actions}</div>}
        </div>
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Card;