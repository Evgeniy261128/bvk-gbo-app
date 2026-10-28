import React, { useState, useEffect } from 'react';
import { ServiceType, SERVICES, BookingForm, CONTACTS } from '../types';
import { Calendar, Clock, User, Phone, Car, FileText, Send, X } from 'lucide-react';

interface BookingProps {
  activeService: ServiceType;
}

const Booking: React.FC<BookingProps> = ({ activeService }) => {
  const [formData, setFormData] = useState<Omit<BookingForm, 'id' | 'createdAt'>>({
    serviceType: activeService,
    direction: activeService,
    carMake: '',
    carModel: '',
    serviceId: '',
    serviceName: '',
    date: '',
    time: '',
    name: '',
    phone: '',
    comment: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      direction: activeService,
      serviceType: activeService,
      serviceId: '',
      serviceName: '',
    }));
  }, [activeService]);

  // Listen for open-booking event from Price page
  useEffect(() => {
    const handler = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('open-booking', handler);
    return () => window.removeEventListener('open-booking', handler);
  }, []);

  const availableServices = SERVICES.filter((s) => s.category === formData.direction);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selected = SERVICES.find((s) => s.id === selectedId);
    handleChange('serviceId', selectedId);
    handleChange('serviceName', selected?.name || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const booking: BookingForm = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...formData,
    };

    const existing = JSON.parse(localStorage.getItem('bookings') || '[]');
    existing.push(booking);
    localStorage.setItem('bookings', JSON.stringify(existing, null, 2));

    setIsSubmitted(true);
  };

  const isBvo = activeService === 'bvo';

  return (
    <div className="space-y-4 pb-6">
      {isSubmitted ? (
        <div className="card mx-4 text-center py-8">
          <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
            isBvo ? 'bg-bvo-green/20' : 'bg-gbo-red/20'
          }`}>
            <Send className={`w-8 h-8 ${isBvo ? 'text-bvo-green-light' : 'text-gbo-red-light'}`} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Заявка отправлена!</h2>
          <p className="text-gray-400 mb-4">
            Мы свяжемся с вами по телефону: {isBvo ? CONTACTS.bvoPhone : CONTACTS.gboPhone}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Данные сохранены в localStorage. Менеджер перезвонит в течение 10 минут.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              isBvo
                ? 'bg-gradient-to-r from-bvo-green to-bvo-green-light text-white'
                : 'bg-gradient-to-r from-gbo-red to-gbo-red-light text-white'
            }`}
          >
            Новая запись
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="px-4">
          <div className="card space-y-4">
            <h2 className={`text-lg font-semibold ${isBvo ? 'text-bvo-green-light' : 'text-gbo-red-light'}`}>
              Онлайн-запись → {isBvo ? 'BVK Автосервис' : 'МирГбоСПб'}
            </h2>

            {/* Direction selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Car className="w-4 h-4 text-gray-500" />
                Направление
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleChange('direction', 'bvo')}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    formData.direction === 'bvo'
                      ? 'bg-gradient-to-r from-bvo-green to-bvo-green-light text-white'
                      : 'bg-[#2A2D34] text-gray-400 border border-white/10'
                  }`}
                >
                  Автосервис
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('direction', 'gbo')}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    formData.direction === 'gbo'
                      ? 'bg-gradient-to-r from-gbo-red to-gbo-red-light text-white'
                      : 'bg-[#2A2D34] text-gray-400 border border-white/10'
                  }`}
                >
                  ГБО
                </button>
              </div>
            </div>

            {/* Car make & model */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
                  <Car className="w-3 h-3" /> Марка
                </label>
                <input
                  type="text"
                  list="car-makes"
                  value={formData.carMake}
                  onChange={(e) => handleChange('carMake', e.target.value)}
                  placeholder="Toyota"
                  className="w-full bg-[#121316] border border-white/10 rounded-xl px-3 py-2.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-white/30"
                  required
                />
                <datalist id="car-makes">
                  {['Toyota', 'Honda', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Skoda', 'Renault', 'Hyundai', 'Kia', 'Lada', 'Nissan', 'Mazda', 'Subaru', 'Mitsubishi', 'Suzuki'].map(
                    (make) => <option key={make} value={make} />,
                  )}
                </datalist>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Модель</label>
                <input
                  type="text"
                  value={formData.carModel}
                  onChange={(e) => handleChange('carModel', e.target.value)}
                  placeholder="Camry"
                  className="w-full bg-[#121316] border border-white/10 rounded-xl px-3 py-2.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-white/30"
                  required
                />
              </div>
            </div>

            {/* Service dropdown */}
            <div>
              <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Услуга
              </label>
              <select
                value={formData.serviceId}
                onChange={handleServiceChange}
                className="w-full bg-[#121316] border border-white/10 rounded-xl px-3 py-2.5 text-gray-100 focus:outline-none focus:border-white/30"
                required
              >
                <option value="" disabled>
                  Выберите услугу...
                </option>
                {availableServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.priceFrom})
                  </option>
                ))}
              </select>
            </div>

            {/* Date & time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Дата
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full bg-[#121316] border border-white/10 rounded-xl px-3 py-2.5 text-gray-100 focus:outline-none focus:border-white/30"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Время
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  className="w-full bg-[#121316] border border-white/10 rounded-xl px-3 py-2.5 text-gray-100 focus:outline-none focus:border-white/30"
                  required
                />
              </div>
            </div>

            {/* Name & Phone */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3" /> Имя
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Иван Иванов"
                  className="w-full bg-[#121316] border border-white/10 rounded-xl px-3 py-2.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-white/30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Телефон
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+7 (___) ___-__-__"
                  className="w-full bg-[#121316] border border-white/10 rounded-xl px-3 py-2.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-white/30"
                  required
                />
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Комментарий (необязательно)
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => handleChange('comment', e.target.value)}
                placeholder="Особенности, пожелания..."
                rows={3}
                className="w-full bg-[#121316] border border-white/10 rounded-xl px-3 py-2.5 text-gray-100 placeholder-gray-500 resize-none focus:outline-none focus:border-white/30"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 ${
                isBvo
                  ? 'bg-gradient-to-r from-bvo-green to-bvo-green-light hover:from-bvo-green-light hover:to-bvo-green neon-green'
                  : 'bg-gradient-to-r from-gbo-red to-gbo-red-light hover:from-gbo-red-light hover:to-gbo-red neon-red'
              } text-white`}
            >
              Отправить заявку
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Booking;
