import React from 'react';
import { ServiceType, TabType, CONTACTS, ADVANTAGES, GALLERY } from '../types';
import { Phone, Send, MapPin, ExternalLink } from 'lucide-react';

interface HomeProps {
  activeService: ServiceType;
  onTabChange: (tab: TabType) => void;
}

const Home: React.FC<HomeProps> = ({ activeService, onTabChange }) => {
  const isBvo = activeService === 'bvo';
  const primaryColor = isBvo ? 'text-bvo-green-light' : 'text-gbo-red-light';
  const accentBg = isBvo ? 'bg-bvo-green/20' : 'bg-gbo-red/20';

  // Динамически берем правильный телефон и логотип в зависимости от выбранной вкладки (BVK или ГБО)
  const activePhone = isBvo ? CONTACTS.bvoPhone : CONTACTS.gboPhone;
  const cleanPhone = activePhone.replace(/\D/g, '');
  const phoneLink = `tel:+${cleanPhone}`;
  const telegramLink = 'https://t.me/+79117657070';
  const whatsappLink = `https://wa.me/${cleanPhone}`;
  const mapsLink = 'https://yandex.ru/maps/?text=Санкт-Петербург,+шоссе+Революции,+65';
  const logoSrc = isBvo ? 'logo-bvk.png' : 'logo-gbo.png';

  return (
    <div className="space-y-4 pb-6 pt-3">
      {/* Hero section with logo */}
      <section className="text-center py-6 card mx-4">
        <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-white p-1.5 shadow-lg flex items-center justify-center">
          <img
            src={logoSrc}
            alt={isBvo ? 'BVK-AUTOSERVIS' : 'МирГбоСПб'}
            className="w-full h-full object-contain transition-all duration-300"
          />
        </div>
        <h1 className={`text-2xl font-bold mb-1 ${primaryColor}`}>
          {isBvo ? 'BVK-AUTOSERVIS' : 'МирГбоСПб'}
        </h1>
        <p className="text-gray-300 text-sm">
          {isBvo
            ? 'Общий автосервис и слесарный ремонт • СПб'
            : 'ГБО: установка, ремонт, ТО, регистрация • СПб'}
        </p>
        <p className="text-gray-500 text-xs mt-2">
          {CONTACTS.established} • {CONTACTS.carsServed}
        </p>
      </section>

      {/* Quick actions card */}
      <section className="card mx-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-200">Быстрые действия</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Позвонить', icon: Phone, href: phoneLink },
            { label: 'Telegram', icon: Send, href: telegramLink, target: '_blank' },
            { label: 'WhatsApp', icon: Send, href: whatsappLink, target: '_blank' },
            { label: 'Маршрут', icon: MapPin, href: mapsLink, target: '_blank' },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              target={action.target}
              rel={action.target === '_blank' ? 'noopener noreferrer' : undefined}
              className={`flex flex-col items-center gap-2 ${accentBg} rounded-xl py-4 transition-transform hover:scale-105`}
            >
              <action.icon className={`w-7 h-7 ${primaryColor}`} />
              <span className="text-sm font-medium text-white">{action.label}</span>
            </a>
          ))}
        </div>
      </section>

      {/* CTA Button */}
      <div className="px-4">
        <button
          onClick={() => onTabChange('booking')}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 ${isBvo
              ? 'bg-gradient-to-r from-bvo-green to-bvo-green-light hover:from-bvo-green-light hover:to-bvo-green neon-green'
              : 'bg-gradient-to-r from-gbo-red to-gbo-red-light hover:from-gbo-red-light hover:to-gbo-red neon-red'
            } text-white`}
        >
          Записаться на сервис онлайн
        </button>
      </div>

      {/* Advantages */}
      <section className="card mx-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-200">Преимущества сервиса</h2>
        <div className="space-y-3">
          {ADVANTAGES.map((adv) => (
            <div key={adv.id} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${accentBg} flex items-center justify-center text-lg`}>
                {adv.icon}
              </div>
              <div>
                <p className="font-medium text-gray-200">{adv.title}</p>
                <p className="text-sm text-gray-400">{adv.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Address */}
      <section className="card mx-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-200">Адрес и телефоны</h2>
        <div className="flex items-start gap-3">
          <MapPin className={`w-5 h-5 ${primaryColor} flex-shrink-0 mt-0.5`} />
          <div>
            <p className="text-sm text-gray-200 font-medium">{CONTACTS.address}</p>
            <p className="text-xs text-gray-500 mt-1">
              {CONTACTS.established} • {CONTACTS.carsServed}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Время работы: {CONTACTS.workingHours}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
          <div>
            <span className="text-xs text-gray-400">BVK Автосервис: </span>
            <a href={`tel:${CONTACTS.bvoPhone}`} className="text-sm font-medium text-gray-200 hover:underline">
              {CONTACTS.bvoPhone}
            </a>
          </div>
          <div>
            <span className="text-xs text-gray-400">МирГбоСПб: </span>
            <a href={`tel:${CONTACTS.gboPhone}`} className="text-sm font-medium text-gray-200 hover:underline">
              {CONTACTS.gboPhone}
            </a>
          </div>
          {!isBvo && (
            <div>
              <span className="text-xs text-gray-400">Сайт: </span>
              <a
                href={CONTACTS.gboSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm font-medium ${primaryColor} hover:underline`}
              >
                {CONTACTS.gboSite}
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Gallery (Before/After) */}
      <section className="card mx-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-200">Галерея работ</h2>
        <div className="space-y-4">
          {GALLERY[activeService].map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="flex-1 text-center">
                <div className="text-3xl mb-1">{item.before}</div>
                <p className="text-xs text-gray-500">До</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-600" />
              <div className="flex-1 text-center">
                <div className="text-3xl mb-1">{item.after}</div>
                <p className="text-xs text-gray-500">После</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <button
            onClick={() => onTabChange('booking')}
            className="text-sm text-gray-400 hover:text-gray-200"
          >
            Хотите похожую работу? Запишитесь →
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;