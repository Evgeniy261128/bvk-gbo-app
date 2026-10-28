import React, { useState, useMemo } from 'react';
import { ServiceType, SERVICES } from '../types';
import { Search, ChevronRight } from 'lucide-react';

interface PriceProps {
  activeService: ServiceType;
}

const Price: React.FC<PriceProps> = ({ activeService }) => {
  const [search, setSearch] = useState('');

  const filteredServices = useMemo(() => {
    return SERVICES.filter(
      (s) => s.category === activeService && s.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [activeService, search]);

  const isBvo = activeService === 'bvo';

  return (
    <div className="space-y-4 pb-6">
      {/* Search */}
      <div className="px-4 pt-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск по услугам..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1C1E24] border border-white/10 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-white/20"
          />
          <Search className="absolute right-3 top-3 w-5 h-5 text-gray-500" />
        </div>
      </div>

      {/* Service list */}
      <div className="px-4 space-y-3">
        {filteredServices.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Услуги не найдены. Попробуйте изменить запрос.
          </p>
        ) : (
          filteredServices.map((service) => (
            <div key={service.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-200">{service.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{service.description}</p>
                  <p className="text-lg font-bold mt-1 text-white">{service.priceFrom}</p>
                </div>
                <button
                  onClick={() => {
                    const event = new Event('open-booking');
                    window.dispatchEvent(event);
                  }}
                  className={`ml-4 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1 ${
                    isBvo
                      ? 'bg-gradient-to-r from-bvo-green to-bvo-green-light text-white neon-green'
                      : 'bg-gradient-to-r from-gbo-red to-gbo-red-light text-white neon-red'
                  }`}
                >
                  Записаться
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Price;
