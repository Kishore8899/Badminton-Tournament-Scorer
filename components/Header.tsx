import React from 'react';
import { ShuttlecockIcon } from './icons/ShuttlecockIcon';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-brand-secondary shadow-lg">
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center">
        <ShuttlecockIcon className="w-8 h-8 text-brand-primary mr-3" />
        <h1 className="text-xl sm:text-2xl font-bold text-brand-light tracking-wider">{title}</h1>
      </div>
    </header>
  );
};

export default Header;