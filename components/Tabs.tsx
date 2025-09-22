import React from 'react';

interface TabsProps<T extends string> {
  tabs: T[];
  activeTab: T;
  onTabClick: (tab: T) => void;
}

const Tabs = <T extends string,>({ tabs, activeTab, onTabClick }: TabsProps<T>) => {
  return (
    <div className="border-b border-secondary">
      <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabClick(tab)}
            className={`${
              activeTab === tab
                ? 'border-accent text-accent'
                : 'border-transparent text-subtle-text hover:text-text hover:border-gray-700'
            } whitespace-nowrap py-3 px-3 sm:py-4 sm:px-4 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none`}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;