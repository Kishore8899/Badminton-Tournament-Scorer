
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-brand-light/80 mb-1">
        {label}
      </label>
      <input
        id={id}
        className="w-full bg-brand-dark border border-brand-secondary rounded-md px-3 py-2 text-brand-light focus:ring-brand-primary focus:border-brand-primary transition"
        {...props}
      />
    </div>
  );
};

export default Input;
