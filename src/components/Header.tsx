import React from 'react';
import { ServiceType } from '../types';
import { Phone, MessageCircle } from 'lucide-react';

interface HeaderProps {
  activeService: ServiceType;
  onServiceChange: (service: ServiceType) => void;
}

const Header: React.FC<HeaderProps> = ({ activeService, onServiceChange }) => {
  const isBvo = activeService === 'bvo';

  return (
    <header className="bg-[#121316] border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-md">
        {/* Brand block */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border border-white/10">
            <span className="text-white font-bold text-xs leading-tight">
              B+G
            </span>
          </div>
          <div>
            <span className="text-white font-bold text-lg block leading-tight">
              BVK-AUTOSERVIS
            </span>
            <span className="text-gray-400 text-xs block leading-tight">
              МирГбоСПб
            </span>
          </div>
        </div>

        {/* Brand toggle tabs */}
        <div className="flex items-center bg-[#1C1E24] border border-white/10 rounded-full p-1">
          <button
            onClick={() => onServiceChange('bvo')}
            className={`relative overflow-hidden px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              isBvo
                ? 'bg-gradient-to-r from-bvo-green to-bvo-green-light text-white neon-green'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isBvo ? 'bg-green-300 animate-pulse' : 'bg-gray-600'}`} />
              BVK Авто
            </span>
          </button>
          <button
            onClick={() => onServiceChange('gbo')}
            className={`relative overflow-hidden px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              !isBvo
                ? 'bg-gradient-to-r from-gbo-red to-gbo-red-light text-white neon-red'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${!isBvo ? 'bg-red-300 animate-pulse' : 'bg-gray-600'}`} />
              ГБО
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
