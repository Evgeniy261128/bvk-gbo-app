import React from 'react';
import { TabType } from '../types';
import { Home, Tag, Calendar, MessageCircle } from 'lucide-react';

interface BottomBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}

const BottomBar: React.FC<BottomBarProps> = ({ activeTab, onTabChange }) => {
  const tabs: TabConfig[] = [
    {
      id: 'home',
      label: 'Главная',
      icon: <Home size={20} />,
    },
    {
      id: 'price',
      label: 'Прайс',
      icon: <Tag size={20} />,
    },
    {
      id: 'booking',
      label: 'Запись',
      icon: <Calendar size={20} />,
    },
    {
      id: 'reviews',
      label: 'Отзывы',
      icon: <MessageCircle size={20} />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1C1E24] border-t border-white/10 pb-safe">
      <div className="container mx-auto px-2 py-2 max-w-md">
        <div className="flex items justify-around">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white/5 text-white'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-gray-500'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomBar;
