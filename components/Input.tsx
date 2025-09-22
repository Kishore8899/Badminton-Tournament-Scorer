import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-subtle-text mb-1">
        {label}
      </label>
      <input
        id={id}
        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-text focus:ring-1 focus:ring-primary focus:border-primary transition"
        {...props}
      />
    </div>
  );
};

export default Input;