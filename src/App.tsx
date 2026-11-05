import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BRANDS, ADDRESS,
  formatDateTime, parsePrice,
  BrandType, Service, Booking, BookingStatus, AppMode, ScheduleSettings, Client,
} from './types';


// ===== Date helpers (timezone-safe) =====
function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}


// ===== localStorage helpers =====
const BOOKINGS_KEY = 'bumpix_bookings';

function loadBookings(): Booking[] {
  try {
    return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveBookings(bookings: Booking[]): void {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings, null, 2));
}

// ===== localStorage helpers for services =====
const SERVICES_KEY = 'bumpix_services';

const INITIAL_SERVICES: Service[] = [
  // BVK-AUTOSERVIS — слесарный ремонт
  { id: 'oil', name: 'Замена масла и фильтров', price: '1200 ₽', duration: 60, brand: 'bvk' },
  { id: 'brake', name: 'Замена передних тормозных колодок', price: '1200 ₽', duration: 60, brand: 'bvk' },
  { id: 'brake-disc', name: 'Замена тормозных дисков', price: 'от 2500 ₽', duration: 120, brand: 'bvk' },
  { id: 'susp', name: 'Диагностика подвески', price: '1000 ₽', duration: 60, brand: 'bvk' },
  { id: 'grm', name: 'Замена ГРМ', price: 'от 6500 ₽', duration: 240, brand: 'bvk' },
  { id: 'steering', name: 'Ремонт рулевой рейки', price: 'от 4000 ₽', duration: 180, brand: 'bvk' },
  { id: 'diag', name: 'Компьютерная диагностика двигателя', price: '1000 ₽', duration: 60, brand: 'bvk' },
  { id: 'spark', name: 'Замена свечей зажигания', price: '1200 ₽', duration: 60, brand: 'bvk' },
  { id: 'clutch', name: 'Замена сцепления', price: 'от 6000 ₽', duration: 240, brand: 'bvk' },
  { id: 'alignment', name: 'Регулировка сход-развала', price: '2000 ₽', duration: 60, brand: 'bvk' },
  { id: 'radiator', name: 'Промывка радиаторов', price: '2500 ₽', duration: 120, brand: 'bvk' },
  { id: 'antifreeze', name: 'Замена антифриза', price: '1500 ₽', duration: 60, brand: 'bvk' },
  { id: 'ac-refill', name: 'Заправка автокондиционера', price: '2500 ₽', duration: 90, brand: 'bvk' },
  // МирГбоСПб — газобаллонное оборудование
  { id: 'gbo-diag', name: 'Компьютерная настройка ГБО', price: '1000 ₽', duration: 60, brand: 'gbo' },
  { id: 'gbo-to', name: 'Замена газовых фильтров (ТО ГБО)', price: '1800 ₽', duration: 60, brand: 'gbo' },
  { id: 'gbo-install', name: 'Установка ГБО 4 поколения', price: 'от 38 000 ₽', duration: 360, brand: 'gbo' },
  { id: 'gbo-injectors', name: 'Диагностика и чистка газовых форсунок', price: 'от 2500 ₽', duration: 120, brand: 'gbo' },
  { id: 'gbo-repair', name: 'Замена редуктора ГБО', price: 'от 3500 ₽', duration: 120, brand: 'gbo' },
  { id: 'gbo-inspection', name: 'Опрессовка и освидетельствование баллона', price: '2500 ₽', duration: 60, brand: 'gbo' },
  { id: 'gbo-valves', name: 'Регулировка клапанов под ГБО', price: 'от 3000 ₽', duration: 120, brand: 'gbo' },
];

function loadServices(): Service[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(SERVICES_KEY) || '[]');
    if (parsed.length === 0) return INITIAL_SERVICES;
    return parsed;
  } catch {
    return INITIAL_SERVICES;
  }
}

function saveServices(services: Service[]): void {
  localStorage.setItem(SERVICES_KEY, JSON.stringify(services, null, 2));
}

// ===== localStorage helpers for clients =====
const CLIENTS_KEY = 'bumpix_clients';

function loadClients(): Client[] {
  try {
    return JSON.parse(localStorage.getItem(CLIENTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveClients(clients: Client[]): void {
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients, null, 2));
}

// ===== Schedule settings + working hours =====
const SCHEDULE_KEY = 'bumpix_schedule';
const DEFAULT_SCHEDULE: ScheduleSettings = {
  startTime: '09:00',
  endTime: '21:00',
  daysOff: [0, 6],
};

function loadScheduleSettings(): ScheduleSettings {
  try {
    const parsed = JSON.parse(localStorage.getItem(SCHEDULE_KEY) || 'null');
    if (!parsed || !parsed.startTime || !parsed.endTime) return DEFAULT_SCHEDULE;
    return parsed;
  } catch {
    return DEFAULT_SCHEDULE;
  }
}

function saveScheduleSettings(settings: ScheduleSettings): void {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(settings, null, 2));
}

function generateWorkingHours(start: string, end: string): string[] {
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;
  const hours: string[] = [];
  for (let t = startTotal; t < endTotal; t += 60) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    hours.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
  }
  return hours;
}

// ===== Demo seed data =====
function seedIfNeeded(): void {
  const existing = loadBookings();
  if (existing.length === 0) {
    const todayStr = toLocalDateString(new Date());
    const demo: Booking[] = [
      {
        id: 'demo-1', brand: 'bvk', services: ['oil'],
        serviceName: 'Замена масла', totalPrice: 1200,
        carMake: 'Kia', carModel: 'Rio', date: todayStr, time: '10:00',
        name: 'Алексей М.', phone: '+79112223344', comment: '',
        status: 'in_progress', createdAt: new Date().toISOString(),
      },
      {
        id: 'demo-2', brand: 'bvk', services: ['brake', 'susp'],
        serviceName: 'Замена тормозных колодок; Ремонт подвески', totalPrice: 2500,
        carMake: 'BMW', carModel: 'X5', date: todayStr, time: '13:00',
        name: 'Дмитрий К.', phone: '+79051234567', comment: 'Сильно скрежетит',
        status: 'in_progress', createdAt: new Date().toISOString(),
      },
      {
        id: 'demo-3', brand: 'gbo', services: ['gbo-diag'],
        serviceName: 'Компьютерная настройка ГБО', totalPrice: 1000,
        carMake: 'Honda', carModel: 'Civic', date: todayStr, time: '14:00',
        name: 'Никита В.', phone: '+79115556677', comment: '',
        status: 'pending', createdAt: new Date().toISOString(),
      },
      {
        id: 'demo-4', brand: 'gbo', services: ['gbo-repair'],
        serviceName: 'Ремонт редуктора', totalPrice: 3500,
        carMake: 'Volkswagen', carModel: 'Golf', date: todayStr, time: '17:00',
        name: 'Роман С.', phone: '+79219990011', comment: 'Тормозит на газу',
        status: 'ready', createdAt: new Date().toISOString(),
      },
    ];
    saveBookings(demo);
  }
}

// ===== Utility: format duration =====
function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return m > 0 ? `${h} ч. ${m} мин.` : `${h} ч.`;
  return `${m} мин.`;
}

// ===== Utility: get height for duration in grid (pixels per hour) =====
const HOUR_HEIGHT = 80; // px

function getBlockedHoursMap(bookings: Booking[], date: string, services: Service[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const b of bookings) {
    if (b.date !== date) continue;
    const durationMin = b.services.reduce((sum, id) => sum + (services.find(s => s.id === id)?.duration || 0), 0);
    const hours = durationMin === 0 ? 1 : Math.ceil(durationMin / 60);
    const [startH] = b.time.split(':').map(Number);
    for (let i = 0; i < hours; i++) {
      const h = startH + i;
      const slot = `${h.toString().padStart(2, '0')}:00`;
      if (!map.has(slot)) map.set(slot, b.brand);
    }
  }
  return map;
}

function getBookingsAtSlot(bookings: Booking[], date: string, time: string): Booking[] {
  return bookings.filter(b => b.date === date && b.time === time);
}

// ===== Header =====
const Header: React.FC<{
  activeBrand: BrandType;
  onBrandChange: (b: BrandType) => void;
  mode: AppMode;
  onModeChange: (m: AppMode) => void;
  todayBookingsCount: number;
}> = ({ activeBrand, onBrandChange, mode, onModeChange, todayBookingsCount }) => {
  const brand = BRANDS[activeBrand];

  return (
    <>
      {/* Purple header bar */}
      <div className="bg-purple-700 text-white py-2 px-4 text-center text-sm font-medium max-w-md mx-auto">
        {brand.name} · {brand.subtitle}
      </div>

      <header className="bg-white border-b border-gray-300 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3 space-y-3">
          {/* Brand capsule toggle */}
          <div className="flex justify-center">
            <div className="inline-flex items-center bg-gray-100 rounded border border-gray-300 p-0.5 text-sm font-medium">
              <button
                onClick={() => onBrandChange('bvk')}
                className={`px-3 py-1 transition-all ${activeBrand === 'bvk'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
                  }`}
              >
                BVK-AUTOSERVIS
              </button>
              <button
                onClick={() => onBrandChange('gbo')}
                className={`px-3 py-1 transition-all ${activeBrand === 'gbo'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
                  }`}
              >
                МирГбоСПб
              </button>
            </div>
          </div>

          {/* Contact card */}
          <div className="flex items-center gap-3">
            <img src={brand.logo} alt={brand.name} className="w-12 h-12 object-contain flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-gray-900 text-md truncate">{brand.name}</h2>
              <p className="text-sm text-gray-500 truncate">{brand.subtitle}</p>
              <p className="text-xs text-gray-500 truncate">{ADDRESS}</p>
            </div>
          </div>

          {/* Mode toggle - Bumpix style */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onModeChange('client')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded border text-sm font-medium transition ${mode === 'client'
                ? 'bg-purple-700 text-white border-purple-700'
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
            >
              📱 Запись клиента
            </button>
            <button
              onClick={() => onModeChange('journal')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded border text-sm font-medium transition relative ${mode === 'journal'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
            >
              📅 Журнал мастера
              {todayBookingsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {todayBookingsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

// ===== Nearest booking block =====
const NearestBooking: React.FC<{ booking: Booking; onCancel: () => void }> = ({ booking, onCancel }) => {
  const brand = BRANDS[booking.brand];
  return (
    <div className="mx-4 mt-4 p-3 bg-white rounded shadow border border-gray-300">
      <h3 className="font-medium text-gray-900 mb-1 text-sm">Ваша ближайшая запись</h3>
      <p className="text-xs text-gray-600">{formatDateTime(booking.date, booking.time)}</p>
      <p className="text-xs text-gray-600 mt-0.5">{booking.carMake} {booking.carModel} · {booking.serviceName}</p>
      <p className="text-xs text-gray-600 mt-0.5">Сумма: <span className="font-medium">{booking.totalPrice} ₽</span></p>
      <button
        onClick={onCancel}
        className="mt-1 text-xs text-red-600 hover:text-red-700 font-medium"
      >
        Отменить / Перенести
      </button>
    </div>
  );
};

// ===== Step 1: Services (Bumpix-style compact list) =====
const StepServices: React.FC<{
  brand: BrandType;
  selected: string[];
  onToggle: (id: string) => void;
  onOpenTimeSelection: () => void;
  services: Service[];
  isBookingSectionVisible: boolean;
}> = ({ brand, selected, onToggle, onOpenTimeSelection, services, isBookingSectionVisible }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [plateEntering, setPlateEntering] = useState(false);

  // Плавное появление плашки итогов при возврате к каталогу услуг
  useEffect(() => {
    if (selected.length === 0 || isBookingSectionVisible) {
      setPlateEntering(false);
      return;
    }
    const raf = requestAnimationFrame(() => setPlateEntering(true));
    return () => cancelAnimationFrame(raf);
  }, [selected.length, isBookingSectionVisible]);
  const brandServices = useMemo(() => {
    return services
      .filter(s => s.brand === brand)
      .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [services, brand, searchQuery]);
  const brandServicesTotal = useMemo(
    () => services.filter(s => s.brand === brand).length,
    [services, brand]
  );
  const totalPrice = useMemo(
    () => selected.reduce((sum, id) => sum + parsePrice(services.find(s => s.id === id)?.price || '0'), 0),
    [selected, services]
  );
  const totalDuration = useMemo(
    () => selected.reduce((sum, id) => sum + (services.find(s => s.id === id)?.duration || 0), 0),
    [selected, services]
  );

  return (
    <div className="relative w-full px-4 pb-28">
      {/* Sticky search header */}
      <div className="sticky top-0 z-20 bg-gray-100 pt-2 pb-3">
        <h2 className="text-sm font-medium text-gray-700 mb-2">Выберите услугу</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск услуг..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-white border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          {searchQuery.trim().length > 0 && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 text-sm"
              aria-label="Очистить поиск"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded shadow border border-gray-300 overflow-hidden">
        {brandServices.map((svc, idx) => {
          const checked = selected.includes(svc.id);
          return (
            <div key={svc.id}>
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-200"
                onClick={() => onToggle(svc.id)}
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm">{svc.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDuration(svc.duration)} · {svc.price}
                  </p>
                </div>
                <div className="ml-3 flex-shrink-0">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${checked
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-300 text-gray-500'
                      }`}
                  >
                    {checked && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15.5l-4.142-4.142a1 1 0 011.414-1.414L8.414 13.75l7.879-7.879a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Search reset helpers — shown while the search filter is active */}
        {searchQuery.trim().length > 0 && (
          brandServices.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-gray-500 mb-3">
                Ничего не найдено по запросу «{searchQuery}»
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="bg-[#F07427] hover:bg-[#d9631b] text-white font-medium px-6 py-2.5 rounded shadow text-sm"
              >
                Показать все услуги
              </button>
            </div>
          ) : (
            <div className="p-3">
              <button
                onClick={() => setSearchQuery('')}
                className="w-full py-2 rounded bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 text-sm font-medium transition"
              >
                ✕ Показать все услуги (всего {brandServicesTotal})
              </button>
            </div>
          )
        )}

      </div>

      {/* Единая плавающая плашка итогов — только в области каталога услуг */}
      {selected.length > 0 && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto bg-white/95 backdrop-blur border-t border-gray-200 py-3 px-4 shadow-lg flex flex-col items-center gap-1.5 transition-all duration-300 ${isBookingSectionVisible
            ? 'hidden'
            : plateEntering
              ? 'translate-y-0 opacity-100'
              : 'translate-y-full opacity-0 pointer-events-none'
            }`}
        >
          <p className="text-center text-sm text-gray-700">
            Выбрано услуг: {selected.length} ({formatDuration(totalDuration)}, {totalPrice} руб.)
          </p>
          <button
            onClick={onOpenTimeSelection}
            className="w-full bg-[#F07427] hover:bg-[#d9631b] text-white font-medium px-6 py-2.5 rounded shadow"
          >
            Выбрать время
          </button>
        </div>
      )}
    </div>
  );
};

// ===== Step 2: Date & time (classic calendar) =====
const MONTH_NAMES = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const MONTH_NAMES_NOM = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const DAY_NAMES_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function buildCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const startDay = (firstDay.getDay() + 6) % 7; // 0=Monday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDaysInMonth = new Date(year, month, 0).getDate();
  const days: Date[] = [];
  for (let i = startDay - 1; i >= 0; i--) {
    days.push(new Date(year, month - 1, prevDaysInMonth - (startDay - 1 - i)));
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  const totalCells = 42;
  while (days.length < totalCells) {
    days.push(new Date(year, month + 1, days.length - startDay - daysInMonth + 1));
  }
  return days;
}

function isDatePast(d: Date, today: Date): boolean {
  const normalized = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return normalized < today;
}

function isDateFullyBooked(d: Date, bookings: Booking[], services: Service[], workingHours: string[] = []): boolean {
  const dateStr = toLocalDateString(d);
  const blockedMap = getBlockedHoursMap(bookings, dateStr, services);

  // День полностью забронирован, если КАЖДЫЙ рабочий час присутствует в blockedMap
  return workingHours.length > 0 && workingHours.every(hour => blockedMap.has(hour));
}

function isDateAvailable(d: Date, today: Date, bookings: Booking[], services: Service[], workingHours: string[] = [], daysOff: number[] = []): boolean {
  if (isDatePast(d, today)) return false;
  if (daysOff.includes(d.getDay())) return false;
  if (isDateFullyBooked(d, bookings, services, workingHours)) return false;

  const dateStr = toLocalDateString(d);
  const todayStr = toLocalDateString(today);

  // Если это сегодняшний день, проверяем, есть ли хотя бы один будущий свободный слот
  if (dateStr === todayStr) {
    const blockedMap = getBlockedHoursMap(bookings, dateStr, services);
    const realNow = new Date();
    const currentHour = realNow.getHours();
    const currentMinute = realNow.getMinutes();

    const hasFutureFreeSlot = workingHours.some(t => {
      if (blockedMap.has(t)) return false;
      const [h, m] = t.split(':').map(Number);
      return h > currentHour || (h === currentHour && m > currentMinute);
    });
    if (!hasFutureFreeSlot) return false;
  }

  return true;
}

function formatDateHeaderShort(d: Date): string {
  const dayOfWeek = DAY_NAMES_SHORT[(d.getDay() + 6) % 7];
  const monthName = MONTH_NAMES[d.getMonth()];
  return `${dayOfWeek}, ${d.getDate()} ${monthName} ${d.getFullYear()} г.`;
}

const StepDateTime: React.FC<{
  selectedDate: string;
  selectedTime: string | null;
  onDateChange: (d: string) => void;
  onTimeChange: (t: string | null) => void;
  blockedMap: Map<string, string>;
  bookings: Booking[];
  services: Service[];
  workingHours: string[];
  daysOff: number[];
}> = ({ selectedDate, selectedTime, onDateChange, onTimeChange, blockedMap, bookings, services, workingHours, daysOff }) => {
  const today = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = selectedDate ? parseLocalDate(selectedDate) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const calendarDays = useMemo(() => {
    const cm = calendarMonth;
    return buildCalendarDays(cm.getFullYear(), cm.getMonth());
  }, [calendarMonth]);

  const handlePrevMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  const isCurrentMonth = (d: Date): boolean => d.getMonth() === calendarMonth.getMonth();

  return (
    <div className="px-4 pb-32">
      <h2 className="text-sm font-medium text-gray-700 mb-2">Выберите дату и время</h2>

      {/* Calendar header */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={handlePrevMonth} className="px-2 py-1 text-gray-600 font-medium hover:text-gray-900">
          «
        </button>
        <h3 className="text-sm font-medium text-gray-900">
          {MONTH_NAMES_NOM[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
        </h3>
        <button onClick={handleNextMonth} className="px-2 py-1 text-gray-600 font-medium hover:text-gray-900">
          »
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-1">
        {DAY_NAMES_SHORT.map(d => (
          <div key={d} className="font-medium">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 text-center text-sm">
        {calendarDays.map((d, idx) => {
          const dateStr = toLocalDateString(d);
          const inMonth = isCurrentMonth(d);
          const isPast = isDatePast(d, today);
          const isBooked = isDateFullyBooked(d, bookings, services, workingHours);
          const isAvailable = isDateAvailable(d, today, bookings, services, workingHours, daysOff);
          const isSelected = selectedDate === dateStr;

          let textClass = 'text-gray-700';
          let bgClass = '';

          if (isSelected) {
            bgClass = 'bg-[#1E4E79] text-white';
            textClass = 'font-bold';
          } else if (isPast || isBooked) {
            if (!inMonth) {
              textClass = 'text-gray-300 opacity-60';
            } else {
              textClass = (isPast ? 'text-red-500' : 'text-gray-400');
            }
          } else if (inMonth) {
            textClass = 'text-green-700 font-semibold';
          }

          return (
            <button
              key={idx}
              onClick={() => {
                if (isAvailable && inMonth) {
                  onDateChange(dateStr);
                  onTimeChange('');
                }
              }}
              disabled={!isAvailable || !inMonth}
              className={`py-2 rounded transition relative cursor-pointer ${isSelected ? bgClass : (inMonth && isAvailable ? 'hover:bg-gray-100' : '')
                } ${textClass}`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      {/* Time slots - shown only after clicking an available (green) date */}
      {selectedDate && (() => {
        const selD = parseLocalDate(selectedDate);
        const selAvailable = isDateAvailable(selD, today, bookings, services, workingHours, daysOff);
        if (!selAvailable) return null;
        let availableSlots = workingHours.filter(t => !blockedMap.has(t));
        const realNow = new Date();
        const todayDateStr = toLocalDateString(realNow);
        if (selectedDate === todayDateStr) {
          const currentHour = realNow.getHours();
          const currentMinute = realNow.getMinutes();
          availableSlots = availableSlots.filter(t => {
            const [h, m] = t.split(':').map(Number);
            return h > currentHour || (h === currentHour && m > currentMinute);
          });
        }
        return (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-[#1E4E79] text-center mb-2">Доступное время</h3>
            {availableSlots.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">На этот день нет свободного времени</p>
            ) : (
              <div className="flex flex-wrap gap-2 justify-center">
                {availableSlots.map((t) => {
                  const sel = selectedTime === t;
                  const cls = sel
                    ? 'bg-[#7E22CE] text-white border-[#7E22CE]'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50';
                  return (
                    <button
                      key={t}
                      onClick={() => onTimeChange(selectedTime === t ? null : t)}
                      className={`px-3 py-1.5 rounded border text-sm transition ${cls}`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};

// ===== Step 3: Contact form =====
const StepContact: React.FC<{
  formData: Partial<Booking>;
  onChange: (field: keyof Booking, value: string) => void;
  selectedDate: string;
  selectedTime: string | null;
  onBook: () => void;
  canBook: boolean;
  validationError: string | null;
  innerRef: React.RefObject<HTMLDivElement | null>;
}> = ({ formData, onChange, selectedDate, selectedTime, onBook, canBook, validationError, innerRef }) => {
  const inputCls = "w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500";

  return (
    <div ref={innerRef} className="px-4 pb-24">
      <div className="bg-white rounded shadow border border-gray-300 p-4 space-y-3">
        {selectedDate && selectedTime && (
          <p className="text-sm font-medium text-[#7E22CE]">
            {formatDateHeaderShort(parseLocalDate(selectedDate))} {selectedTime}
          </p>
        )}

        <p className="text-sm text-gray-500 mb-2">Укажите ваше имя и марку автомобиля</p>

        <div className="relative">
          <input type="text" placeholder="Например: Алексей (Kia Rio)" value={formData.name || ''}
            onChange={e => onChange('name', e.target.value.replace(/[^a-zA-Zа-яА-ЯёЁ0-9\s-]/g, ''))} className={inputCls} />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none">👤</span>
        </div>

        <div className="relative">
          <input type="tel" placeholder="+7..." value={formData.phone || ''}
            onChange={e => onChange('phone', e.target.value)} className={inputCls} />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none">📞</span>
        </div>

        <div className="relative">
          <textarea
            placeholder="Комментарий к заказу (необязательно)"
            value={formData.comment || ''}
            onChange={e => onChange('comment', e.target.value)}
            rows={2}
            className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
          />
          <span className="absolute left-3 top-3 text-lg pointer-events-none">💬</span>
        </div>

        {validationError && (
          <div className="bg-red-100 text-red-600 text-xs p-2 rounded">
            Ошибка! Не заполнено поле {validationError}
          </div>
        )}

        <div className="flex justify-center pt-1">
          <button
            onClick={onBook}
            disabled={!canBook}
            className={`px-8 py-2.5 rounded font-medium text-sm transition ${canBook
              ? 'bg-[#7E22CE] hover:bg-purple-800 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            Записаться
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== Confirmation (modal) =====
const Confirmation: React.FC<{ booking: Booking; onNew: () => void; onClose?: () => void }> = ({ booking, onNew, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-sm bg-white rounded overflow-hidden shadow-xl">
        <div className="bg-purple-800 text-white py-4 px-4 text-center">
          <h2 className="text-lg font-bold">Запись подтверждена</h2>
        </div>
        <p className="text-sm text-gray-600 text-center py-2 px-4">
          Ждём вас в автосервисе в назначенное время!
        </p>
        <div className="mx-4 mb-4 rounded border border-gray-200 bg-gray-50 px-4 py-3 text-center">
          <p className="font-semibold text-gray-800">{formatDateTime(booking.date, booking.time)}</p>
          <div className="mt-1 space-y-0.5">
            {booking.serviceName.split('; ').filter(Boolean).map((s, i) => (
              <p key={i} className="text-sm text-gray-600">{s}</p>
            ))}
          </div>
          <p className="text-lg font-bold text-gray-900 mt-2">{booking.totalPrice} ₽</p>
        </div>
        <div className="flex justify-center pb-4">
          <button
            onClick={onNew}
            className="px-6 py-2 rounded bg-orange-500 text-white font-bold text-sm transition hover:opacity-90"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
// ===== PWA Install Guide Modal =====
const InstallGuideModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'android' | 'samsung' | 'ios'>(() => {
    if (typeof navigator === 'undefined') return 'android';
    const ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      return 'ios';
    }
    if (/SamsungBrowser/i.test(ua)) {
      return 'samsung';
    }
    return 'android';
  });

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="bg-purple-800 text-white py-3 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-base">
            <span>📱</span>
            <span>Установка приложения</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-xl leading-none p-1"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        {/* Browser Selector Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-medium">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2.5 text-center border-b-2 transition ${activeTab === 'android'
              ? 'border-purple-600 text-purple-700 font-bold bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Android / Chrome
          </button>
          <button
            onClick={() => setActiveTab('samsung')}
            className={`flex-1 py-2.5 text-center border-b-2 transition ${activeTab === 'samsung'
              ? 'border-purple-600 text-purple-700 font-bold bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Samsung
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2.5 text-center border-b-2 transition ${activeTab === 'ios'
              ? 'border-purple-600 text-purple-700 font-bold bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            iPhone (Safari)
          </button>
        </div>

        <div className="p-4 text-sm text-gray-700 overflow-y-auto space-y-3">
          {activeTab === 'android' && (
            <div className="space-y-2.5">
              <p className="text-gray-600 text-xs">
                Инструкция для <strong>Google Chrome</strong>, <strong>Яндекс Браузера</strong> и других на Android:
              </p>
              <div className="flex items-start gap-2.5 bg-purple-50 p-2.5 rounded border border-purple-100">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <span className="text-xs">
                  Нажмите на значок <strong>меню (три точки ⋮)</strong> в правом верхнем углу браузера.
                </span>
              </div>
              <div className="flex items-start gap-2.5 bg-purple-50 p-2.5 rounded border border-purple-100">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <span className="text-xs">
                  Выберите пункт <strong>«Установить приложение»</strong> или <strong>«Добавить на главный экран»</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2.5 bg-purple-50 p-2.5 rounded border border-purple-100">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <span className="text-xs">
                  Подтвердите добавление. Иконка появится на рабочем столе телефона!
                </span>
              </div>
            </div>
          )}

          {activeTab === 'samsung' && (
            <div className="space-y-2.5">
              <p className="text-gray-600 text-xs">
                Инструкция для <strong>Samsung Internet</strong>:
              </p>
              <div className="flex items-start gap-2.5 bg-purple-50 p-2.5 rounded border border-purple-100">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <span className="text-xs">
                  Нажмите на меню <strong>(три полоски ☰ или три точки)</strong> в правом нижнем углу экрана (или на значок «+» / стрелку загрузки рядом с адресной строкой).
                </span>
              </div>
              <div className="flex items-start gap-2.5 bg-purple-50 p-2.5 rounded border border-purple-100">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <span className="text-xs">
                  Выберите <strong>«Добавить страницу в»</strong> ➔ <strong>«Главный экран»</strong> (или сразу «Добавить на главный экран»).
                </span>
              </div>
              <div className="flex items-start gap-2.5 bg-purple-50 p-2.5 rounded border border-purple-100">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <span className="text-xs">
                  Нажмите <strong>«Добавить»</strong>. Приложение установится и будет работать как отдельная программа!
                </span>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-2.5">
              <p className="text-gray-600 text-xs">
                Инструкция для <strong>Safari на iPhone / iPad</strong>:
              </p>
              <div className="flex items-start gap-2.5 bg-purple-50 p-2.5 rounded border border-purple-100">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <span className="text-xs">
                  В нижней панели Safari нажмите кнопку <strong>«Поделиться»</strong> (квадрат со стрелкой вверх 📤).
                </span>
              </div>
              <div className="flex items-start gap-2.5 bg-purple-50 p-2.5 rounded border border-purple-100">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <span className="text-xs">
                  В списке действий прокрутите вниз и нажмите <strong>«На экран „Домой“»</strong> (значок ➕).
                </span>
              </div>
              <div className="flex items-start gap-2.5 bg-purple-50 p-2.5 rounded border border-purple-100">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <span className="text-xs">
                  В правом верхнем углу нажмите <strong>«Добавить»</strong>.
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 rounded bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== Status badge =====
function StatusBadge({ status }: { status: BookingStatus }) {
  const labels: Record<BookingStatus, string> = {
    pending: 'Ожидается',
    in_progress: 'В работе',
    ready: 'Готово',
  };
  return (
    <span className="inline-block px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
      {labels[status]}
    </span>
  );
}

// ===== Manual add modal (wizard) =====
const ManualAddModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: Booking) => void;
  prefillTime?: string;
  prefillBrand?: BrandType;
  prefillDate?: string;
  clients: Client[];
  services: Service[];
  onSaveClient: (client: Client) => void;
}> = ({ isOpen, onClose, onSave, prefillTime = '', prefillBrand = 'bvk', prefillDate, clients, services, onSaveClient }) => {
  const [step, setStep] = useState<'client' | 'services' | 'new_client'>('client');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  // New client form
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCarMake, setNewCarMake] = useState('');
  const [newCarModel, setNewCarModel] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('client');
      setSelectedClient(null);
      setSelectedServiceIds([]);
      setNewName('');
      setNewPhone('');
      setNewCarMake('');
      setNewCarModel('');
    }
  }, [isOpen]);

  const brandServices = useMemo(() => services.filter(s => s.brand === prefillBrand), [services, prefillBrand]);

  const totalPrice = useMemo(
    () => selectedServiceIds.reduce((sum, id) => sum + parsePrice(services.find(s => s.id === id)?.price || '0'), 0),
    [selectedServiceIds, services]
  );

  const toggleService = (id: string) => {
    setSelectedServiceIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleCreateClient = () => {
    if (!newName || !newPhone) return;
    const client: Client = {
      id: Date.now().toString(),
      name: newName,
      phone: newPhone,
      carMake: newCarMake || undefined,
      carModel: newCarModel || undefined,
    };
    onSaveClient(client);
    setSelectedClient(client);
    setStep('services');
  };

  const handleSave = () => {
    if (!selectedClient || !prefillTime) return;
    const selectedServiceObjs = selectedServiceIds
      .map(id => services.find(s => s.id === id))
      .filter(Boolean) as Service[];
    const serviceName = selectedServiceObjs.map(s => s.name).join('; ') || 'Вручную (звонок)';
    const dateStr = prefillDate || toLocalDateString(new Date());
    const newBooking: Booking = {
      id: Date.now().toString(),
      brand: prefillBrand,
      services: selectedServiceIds,
      serviceName,
      totalPrice,
      carMake: selectedClient.carMake || '',
      carModel: selectedClient.carModel || '',
      date: dateStr,
      time: prefillTime,
      name: selectedClient.name,
      phone: selectedClient.phone,
      comment: '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      type: 'client',
    };
    onSave(newBooking);
  };

  if (!isOpen) return null;

  const inputCls = "w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 mb-2";
  const clientTitle = selectedClient ? (selectedClient.name || selectedClient.phone) : '';

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-sm flex flex-col shadow-xl rounded max-h-[90vh]">
        <div className="bg-purple-800 text-white py-3 px-4 flex items-center justify-between">
          <span className="font-medium text-sm">
            {step === 'client' && 'Выберите клиента'}
            {step === 'new_client' && 'Новый клиент'}
            {step === 'services' && clientTitle}
          </span>
          <button onClick={onClose} className="text-white/80 hover:text-white text-lg leading-none">×</button>
        </div>

        {step === 'client' && (
          <div className="flex-1 overflow-y-auto p-4">
            <button
              onClick={() => setStep('new_client')}
              className="w-full py-2 mb-3 rounded bg-purple-700 text-white font-medium text-sm hover:opacity-90 transition"
            >
              + Новый клиент
            </button>
            <div className="border border-gray-200 rounded overflow-hidden">
              {clients.length === 0 && (
                <div className="p-6 text-center text-gray-500 text-sm">Нет клиентов</div>
              )}
              {clients.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedClient(c); setStep('services'); }}
                  className="w-full border-b border-gray-200 p-3 text-left hover:bg-gray-50 last:border-b-0"
                >
                  <p className="font-medium text-gray-900 text-sm">{c.name || 'Без имени'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {c.phone}
                    {(c.carMake || c.carModel) && ` · ${c.carMake || ''} ${c.carModel || ''}`.trimEnd()}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'new_client' && (
          <div className="flex-1 overflow-y-auto p-4">
            <input type="text" placeholder="Имя" value={newName} onChange={e => setNewName(e.target.value)} className={inputCls} />
            <input type="tel" placeholder="Телефон" value={newPhone} onChange={e => setNewPhone(e.target.value)} className={inputCls} />
            <input type="text" placeholder="Марка авто" value={newCarMake} onChange={e => setNewCarMake(e.target.value)} className={inputCls} />
            <input type="text" placeholder="Модель авто" value={newCarModel} onChange={e => setNewCarModel(e.target.value)} className={inputCls} />
          </div>
        )}

        {step === 'services' && (
          <div className="flex-1 overflow-y-auto">
            {brandServices.map(svc => {
              const checked = selectedServiceIds.includes(svc.id);
              return (
                <div
                  key={svc.id}
                  onClick={() => toggleService(svc.id)}
                  className="flex items-center justify-between p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{svc.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDuration(svc.duration)} · {svc.price}</p>
                  </div>
                  <div className={`ml-3 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${checked ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-500'}`}>
                    {checked && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15.5l-4.142-4.142a1 1 0 011.414-1.414L8.414 13.75l7.879-7.879a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="p-3 border-t border-gray-300 shrink-0">
          {step === 'client' && (
            <button onClick={onClose} className="w-full py-2.5 rounded bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 transition">
              Отмена
            </button>
          )}
          {step === 'new_client' && (
            <div className="flex gap-2">
              <button onClick={() => setStep('client')} className="flex-1 py-2.5 rounded bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 transition">
                Назад
              </button>
              <button
                onClick={handleCreateClient}
                disabled={!newName || !newPhone}
                className={`flex-1 py-2.5 rounded font-medium text-sm transition ${(!newName || !newPhone) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-purple-700 text-white hover:opacity-90'}`}
              >
                Далее
              </button>
            </div>
          )}
          {step === 'services' && (
            <>
              <p className="text-center text-sm text-gray-700 mb-2">
                Выбрано: {selectedServiceIds.length}. Сумма: {totalPrice} руб.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setStep('client')} className="flex-1 py-2.5 rounded bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 transition">
                  Назад
                </button>
                <button onClick={handleSave} className="flex-1 py-2.5 rounded bg-purple-700 text-white font-medium text-sm hover:opacity-90 transition">
                  СОХРАНИТЬ
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ===== Booking Details Modal =====
const BookingDetailsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onUpdate: (booking: Booking) => void;
  onDelete: (id: string) => void;
  services: Service[];
}> = ({ isOpen, onClose, booking, onUpdate, onDelete, services }) => {
  const [localStatus, setLocalStatus] = useState<BookingStatus>(booking.status);

  useEffect(() => {
    setLocalStatus(booking.status);
  }, [booking.id, booking.status]);

  if (!isOpen) return null;

  const WEEK_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  const d = parseLocalDate(booking.date);
  const dateLabel = `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()} г. (${WEEK_SHORT[d.getDay()]})`;

  const totalMinutes = booking.services.reduce(
    (sum, id) => sum + (services.find(s => s.id === id)?.duration || 0),
    0
  );
  const startH = parseInt(booking.time.split(':')[0]) || 0;
  const endTotal = startH * 60 + (parseInt(booking.time.split(':')[1]) || 0) + (booking.type === 'personal' ? 60 : totalMinutes);
  const endLabel = `${Math.floor(endTotal / 60).toString().padStart(2, '0')}:${(endTotal % 60).toString().padStart(2, '0')}`;

  const serviceList = booking.services
    .map(id => services.find(s => s.id === id))
    .filter(Boolean) as Service[];

  const phoneClean = booking.phone.replace(/\D/g, '');

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-purple-800 text-white py-3 px-4 flex justify-between items-center">
        <h3 className="font-medium">Запись клиента</h3>
        <button onClick={onClose} className="text-white/80 hover:text-white text-lg leading-none" aria-label="Закрыть">
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {/* Блок 1: Дата и время */}
        <div className="bg-white p-4 border-b border-gray-200">
          <p className="text-gray-900 font-medium">{dateLabel}</p>
          <p className="text-gray-500 text-sm mt-0.5">с {booking.time} до {endLabel}</p>
        </div>

        {/* Блок 2: Клиент и контакты */}
        <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-gray-900 text-lg font-medium truncate">{booking.name || 'Без имени'}</p>
            <p className="text-gray-500 text-sm mt-0.5">{booking.phone}</p>
          </div>
          {booking.phone && (
            <div className="flex gap-2 ml-3 flex-shrink-0">
              <a
                href={`tel:${phoneClean}`}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
                aria-label="Позвонить"
              >
                📞
              </a>
              <a
                href={`https://wa.me/${phoneClean}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
                aria-label="WhatsApp"
              >
                💬
              </a>
            </div>
          )}
        </div>

        {/* Блок 3: Услуги */}
        <div className="bg-white p-4 border-b border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Услуги</p>
          {serviceList.length > 0 ? (
            <ul className="text-gray-900 text-sm space-y-1">
              {serviceList.map(s => (
                <li key={s.id}>{s.name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-900 text-sm">{booking.serviceName || '—'}</p>
          )}
        </div>

        {/* Блок 4: Доход и статус */}
        <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
          <p className="text-2xl font-bold text-gray-900">{booking.totalPrice} RUB</p>
          <select
            value={localStatus}
            onChange={e => setLocalStatus(e.target.value as BookingStatus)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="pending">Ожидается</option>
            <option value="in_progress">В работе</option>
            <option value="ready">Готово</option>
          </select>
        </div>

        {/* Блок 5: Комментарий */}
        {booking.comment && (
          <div className="bg-white p-4 border-b border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Комментарий</p>
            <p className="text-gray-900 text-sm">{booking.comment}</p>
          </div>
        )}

        {/* Удалить */}
        <button
          onClick={() => { onDelete(booking.id); onClose(); }}
          className="w-full text-red-600 font-medium p-4 text-center bg-white mt-4"
        >
          Удалить запись
        </button>
      </div>

      {/* FAB */}
      <button
        onClick={() => { onUpdate({ ...booking, status: localStatus }); onClose(); }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-purple-700 text-white text-2xl shadow-lg hover:opacity-90 transition flex items-center justify-center"
        aria-label="Сохранить"
      >
        ✓
      </button>
    </div>
  );
};

// ===== Service Modal (fullscreen) =====
interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Service) => void;
  onDelete: (id: string) => void;
  service: Service | null;
  services: Service[];
}

const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, onSave, onDelete, service, services }) => {
  const [name, setName] = useState('');
  const [durationStr, setDurationStr] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [brand, setBrand] = useState<BrandType>('bvk');

  useEffect(() => {
    if (service) {
      setName(service.name);
      setDurationStr(String(service.duration));
      setPriceInput(parsePrice(service.price).toString());
      setBrand(service.brand);
    } else {
      setName('');
      setDurationStr('60');
      setPriceInput('');
      setBrand('bvk');
    }
  }, [service]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name || !priceInput) return;
    const duration = parseInt(durationStr) || 0;
    const priceStr = String(parseInt(priceInput) || 0);
    const newService: Service = {
      id: service ? service.id : Date.now().toString(),
      name,
      price: `${priceStr} ₽`,
      duration,
      brand,
    };
    onSave(newService);
    onClose();
  };

  const handleDelete = () => {
    if (service && window.confirm('Удалить услугу?')) {
      onDelete(service.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-sm flex flex-col shadow-xl rounded max-h-[90vh]">
        <div className="bg-red-900 text-white py-3 px-4 text-center font-bold text-lg">
          Услуга
        </div>
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Название услуги</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="Введите название"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Продолжительность (минут)</label>
            <input
              type="number"
              value={durationStr}
              onChange={e => setDurationStr(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Цена (₽)</label>
            <input
              type="number"
              value={priceInput}
              onChange={e => setPriceInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="Введите цену"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Бренд</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="brand"
                  checked={brand === 'bvk'}
                  onChange={() => setBrand('bvk')}
                />
                <span className="text-sm">BVK Авто</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="brand"
                  checked={brand === 'gbo'}
                  onChange={() => setBrand('gbo')}
                />
                <span className="text-sm">ГБО</span>
              </label>
            </div>
          </div>
        </div>
        <div className="p-3 border-t border-gray-300 flex gap-2 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded bg-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-300 transition"
          >
            ОТМЕНА
          </button>
          {service && (
            <button
              onClick={handleDelete}
              className="flex-1 py-2.5 rounded bg-red-100 text-red-700 font-medium text-sm hover:bg-red-200 transition border border-red-300"
            >
              Удалить
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded bg-purple-700 text-white font-medium text-sm hover:opacity-90 transition"
          >
            СОХРАНИТЬ
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== Client Modal =====
const ClientModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  onDelete: (id: string) => void;
  client: Client | null;
}> = ({ isOpen, onClose, onSave, onDelete, client }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [carMake, setCarMake] = useState('');
  const [carModel, setCarModel] = useState('');

  useEffect(() => {
    if (client) {
      setName(client.name || '');
      setPhone(client.phone || '');
      setCarMake(client.carMake || '');
      setCarModel(client.carModel || '');
    } else {
      setName('');
      setPhone('');
      setCarMake('');
      setCarModel('');
    }
  }, [client]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name || !phone) return;
    const newClient: Client = {
      id: client ? client.id : Date.now().toString(),
      name,
      phone,
      carMake: carMake || undefined,
      carModel: carModel || undefined,
    };
    onSave(newClient);
    onClose();
  };

  const handleDelete = () => {
    if (client) {
      onDelete(client.id);
      onClose();
    }
  };

  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded text-sm";

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-sm flex flex-col shadow-xl rounded max-h-[90vh]">
        <div className="bg-purple-800 text-white py-3 px-4 text-center font-bold text-lg">
          {client ? 'Редактировать клиента' : 'Новый клиент'}
        </div>
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Имя</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="Введите имя" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Телефон</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} placeholder="+7..." />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Марка авто</label>
            <input type="text" value={carMake} onChange={e => setCarMake(e.target.value)} className={inputCls} placeholder="Kia" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Модель авто</label>
            <input type="text" value={carModel} onChange={e => setCarModel(e.target.value)} className={inputCls} placeholder="Rio" />
          </div>
        </div>
        <div className="p-3 border-t border-gray-300 flex gap-2 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded bg-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-300 transition"
          >
            ОТМЕНА
          </button>
          {client && (
            <button
              onClick={handleDelete}
              className="flex-1 py-2.5 rounded bg-red-100 text-red-700 font-medium text-sm hover:bg-red-200 transition border border-red-300"
            >
              Удалить
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded bg-purple-700 text-white font-medium text-sm hover:opacity-90 transition"
          >
            СОХРАНИТЬ
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== Action Bottom Sheet =====
const ActionBottomSheet: React.FC<{
  isOpen: boolean;
  time: string;
  onClose: () => void;
  onBookClient: () => void;
  onCreatePersonal: () => void;
}> = ({ isOpen, time, onClose, onBookClient, onCreatePersonal }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose}>
      <div
        className="absolute bottom-0 w-full bg-white rounded-t-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-purple-800 text-white p-4 font-medium">Выберите действие</div>
        <button
          onClick={onBookClient}
          className="w-full border-b border-gray-200 p-4 text-left text-gray-800 hover:bg-gray-50"
        >
          Записать клиента на {time}
        </button>
        <button
          onClick={onCreatePersonal}
          className="w-full border-b border-gray-200 p-4 text-left text-gray-800 hover:bg-gray-50"
        >
          Создать личное событие на {time}
        </button>
        <button
          onClick={onClose}
          className="w-full p-4 text-center text-purple-700 font-medium hover:bg-gray-50"
        >
          ОТМЕНА
        </button>
      </div>
    </div>
  );
};

// ===== Personal Event Modal =====
const PersonalEventModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: Booking) => void;
  prefillTime?: string;
  prefillBrand?: BrandType;
  prefillDate?: string;
}> = ({ isOpen, onClose, onSave, prefillTime = '', prefillBrand = 'bvk', prefillDate }) => {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState(prefillTime);
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setStartTime(prefillTime);
      setEndTime('');
    }
  }, [isOpen, prefillTime]);

  const handleSave = () => {
    if (!title || !startTime) return;
    const dateStr = prefillDate || toLocalDateString(new Date());
    const newBooking: Booking = {
      id: Date.now().toString(),
      brand: prefillBrand,
      services: [],
      serviceName: title,
      totalPrice: 0,
      carMake: '',
      carModel: '',
      date: dateStr,
      time: startTime,
      name: 'Личное событие',
      phone: '',
      comment: endTime ? `до ${endTime}` : '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      type: 'personal',
    };
    onSave(newBooking);
  };

  if (!isOpen) return null;

  const inputCls = "w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 mb-2";

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded shadow-lg w-full max-w-sm overflow-hidden">
        <div className="bg-orange-500 text-white p-4 font-bold text-lg">Событие</div>
        <div className="p-4">
          <input
            type="text"
            placeholder="Название события"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className={inputCls}
          />
          <label className="block text-xs text-gray-600 mb-1">Время начала</label>
          <input
            type="time"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            className={inputCls}
          />
          <label className="block text-xs text-gray-600 mb-1">Время окончания</label>
          <input
            type="time"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="p-3 border-t border-gray-300 flex gap-2 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded bg-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-300 transition"
          >
            ОТМЕНА
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded bg-purple-700 text-white font-medium text-sm hover:opacity-90 transition flex items-center justify-center gap-1"
          >
            ✓ Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== Journal Mode (Bumpix Grid) =====
const JournalMode: React.FC<{
  bookings: Booking[];
  onAddManual: (time?: string, brand?: BrandType) => void;
  onCellAction: (date: string, time: string) => void;
  onDetailsOpen: (booking: Booking) => void;
  selectedJournalDate: string;
  onJournalDateChange: (d: string) => void;
  filterBrand: BrandType | 'all';
  onFilterChange: (f: BrandType | 'all') => void;
  onUpdateBooking: (booking: Booking) => void;
  onDeleteBooking: (id: string) => void;
  services: Service[];
  onUpdateServices: (services: Service[]) => void;
  workingHours: string[];
  scheduleSettings: ScheduleSettings;
  onUpdateSchedule: (settings: ScheduleSettings) => void;
  clients: Client[];
  onSaveClient: (c: Client) => void;
  onDeleteClient: (id: string) => void;
}> = ({
  bookings, onAddManual, onCellAction, onDetailsOpen, selectedJournalDate, onJournalDateChange,
  filterBrand, onFilterChange, onUpdateBooking, onDeleteBooking, services, onUpdateServices,
  workingHours, scheduleSettings, onUpdateSchedule, clients, onSaveClient, onDeleteClient,
}) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [activeAdminScreen, setActiveAdminScreen] = useState<'calendar' | 'clients' | 'services' | 'settings'>('calendar');

    const today = useMemo(() => new Date(), []);
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    const monthNamesFull = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

    // Непрерывный таймлайн: 60 дней назад и ~2 года вперёд от today.
    // Генерируется ОДИН РАЗ и никогда не пересчитывается при смене выбранной даты.
    const JOURNAL_DAYS_BACK = 60;
    const JOURNAL_DAYS_FORWARD = 730;
    const COLUMN_WIDTH = 48; // ширина одной дневной колонки, px
    const TIME_COLUMN_WIDTH = 56; // 3.5rem — ширина колонки часов

    const timelineDays = useMemo(() => {
      const anchor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const days = [];
      for (let offset = -JOURNAL_DAYS_BACK; offset <= JOURNAL_DAYS_FORWARD; offset++) {
        const d = new Date(anchor);
        d.setDate(anchor.getDate() + offset);
        days.push(d);
      }
      return days;
      // selectedDate намеренно не входит в зависимости — иначе лента будет скакать
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const weekDays = useMemo(() => {
      return timelineDays.map((d, i) => ({
        date: toLocalDateString(d),
        dayName: dayNames[d.getDay()].toUpperCase(),
        dayNum: d.getDate(),
        month: months[d.getMonth()],
        monthKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        // Показываем месяц при первом дне и на первом дне нового месяца
        showMonth: i === 0 || d.getMonth() !== timelineDays[i - 1].getMonth(),
        isToday: toLocalDateString(d) === toLocalDateString(today),
        isWeekend: scheduleSettings.daysOff.includes(d.getDay()),
      }));
    }, [timelineDays, today, scheduleSettings.daysOff]);

    const filteredBookings = useMemo(() => {
      if (filterBrand === 'all') return bookings;
      return bookings.filter(b => b.brand === filterBrand);
    }, [bookings, filterBrand]);

    const dayBookings = useMemo(() => {
      return filteredBookings.filter(b => b.date === selectedJournalDate);
    }, [filteredBookings, selectedJournalDate]);

    const totalPrice = useMemo(
      () => dayBookings.filter(b => b.status !== 'ready').reduce((sum, b) => sum + b.totalPrice, 0),
      [dayBookings]
    );

    const getDurationHours = (b: Booking): number => {
      const min = b.services.reduce((sum, id) => sum + (services.find(s => s.id === id)?.duration || 0), 0);
      return min === 0 ? 1 : Math.ceil(min / 60);
    };

    // Контейнер сетки: только свободный ручной скролл
    const gridContainerRef = useRef<HTMLDivElement>(null);

    // Строго однократное центрирование сегодняшнего дня при входе в журнал
    const todayColumnRef = useRef<HTMLDivElement>(null);

    const scrollToToday = (behavior: ScrollBehavior = 'smooth') => {
      todayColumnRef.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior });
    };

    const handleToday = () => {
      onJournalDateChange(toLocalDateString(new Date()));
      scrollToToday('smooth');
    };

    // Надёжный стартовый скролл: ждём, пока браузер отрисует ширину контейнера
    useEffect(() => {
      const scrollToTodayOnce = () => {
        if (todayColumnRef.current) {
          todayColumnRef.current.scrollIntoView({
            inline: 'center',
            block: 'nearest',
            behavior: 'auto' // при первом открытии мгновенно
          });
        }
      };

      // Двойной вызов с таймером гарантирует, что браузер уже отрисовал ширину контейнера
      const raf = requestAnimationFrame(() => {
        setTimeout(scrollToTodayOnce, 100);
      });
      return () => cancelAnimationFrame(raf);
    }, []); // Пустой массив зависимостей — только один раз при монтировании

    // Синхронизация месяца в тулбаре с центральной видимой колонкой при скролле
    const [toolbarMonthKey, setToolbarMonthKey] = useState('');

    // Стрелки < > в тулбаре: листание ровно на одну неделю (7 дней)
    const scrollByWeek = (direction: number) => {
      gridContainerRef.current?.scrollBy({
        left: direction * 7 * COLUMN_WIDTH,
        behavior: 'smooth',
      });
    };

    const handleGridScroll = () => {
      const container = gridContainerRef.current;
      if (!container) return;
      // Центральная видимая колонка: вычитаем ширину колонки часов
      const centerPx = container.scrollLeft + container.clientWidth / 2 - TIME_COLUMN_WIDTH;
      let idx = Math.floor(centerPx / COLUMN_WIDTH);
      if (idx < 0) idx = 0;
      if (idx > weekDays.length - 1) idx = weekDays.length - 1;
      const key = weekDays[idx]?.monthKey || '';
      setToolbarMonthKey(prev => (prev === key ? prev : key));
    };

    const topBarMonthDate = parseLocalDate(
      toolbarMonthKey ? `${toolbarMonthKey}-01` : (selectedJournalDate || toLocalDateString(today))
    );
    const currentMonthName = monthNamesFull[topBarMonthDate.getMonth()];
    const currentYear = topBarMonthDate.getFullYear();

    const handleNavClick = (screen: 'calendar' | 'clients' | 'services' | 'settings') => {
      setActiveAdminScreen(screen);
      setIsDrawerOpen(false);
    };

    const [serviceFilterBrand, setServiceFilterBrand] = useState<BrandType | 'all'>('all');
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);

    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    const [localSchedule, setLocalSchedule] = useState({
      startTime: scheduleSettings.startTime,
      endTime: scheduleSettings.endTime,
      daysOff: [...scheduleSettings.daysOff],
    });

    const handleScheduleChange = (field: 'startTime' | 'endTime', value: string) => {
      setLocalSchedule(prev => ({ ...prev, [field]: value }));
    };

    const handleDayOffToggle = (day: number) => {
      setLocalSchedule(prev => ({
        ...prev,
        daysOff: prev.daysOff.includes(day)
          ? prev.daysOff.filter(d => d !== day)
          : [...prev.daysOff, day].sort((a, b) => a - b),
      }));
    };

    const handleSaveSchedule = () => {
      onUpdateSchedule({
        startTime: localSchedule.startTime,
        endTime: localSchedule.endTime,
        daysOff: localSchedule.daysOff,
      });
      setIsDrawerOpen(false);
    };

    const handleSaveService = (updated: Service) => {
      const newServices = services.find(s => s.id === updated.id)
        ? services.map(s => s.id === updated.id ? updated : s)
        : [...services, updated];
      onUpdateServices(newServices);
    };

    const handleDeleteService = (id: string) => {
      onUpdateServices(services.filter(s => s.id !== id));
    };

    const openServiceModal = (service: Service | null) => {
      setEditingService(service);
      setIsServiceModalOpen(true);
    };

    const openClientModal = (c: Client | null) => {
      setEditingClient(c);
      setIsClientModalOpen(true);
    };

    const sortedClients = useMemo(
      () => [...clients].sort((a, b) => (a.name || '').localeCompare(b.name || '')),
      [clients]
    );

    const filteredServices = useMemo(() => {
      if (serviceFilterBrand === 'all') return services;
      return services.filter(s => s.brand === serviceFilterBrand);
    }, [services, serviceFilterBrand]);

    const formatDurationDisplay = (min: number): string => {
      const h = Math.floor(min / 60);
      const m = min % 60;
      if (h > 0) return m > 0 ? `${h} ч. ${m} мин.` : `${h} ч.`;
      return `${m} мин.`;
    };

    return (
      <>
        {/* Drawer overlay & menu */}
        {isDrawerOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsDrawerOpen(false)}
            />
            <div className="fixed top-0 left-0 w-72 h-full bg-white z-50 shadow-xl flex flex-col">
              <div className="bg-purple-800 p-4 text-white">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">👤</span>
                  <div>
                    <p className="font-bold">Владимир</p>
                    <p className="text-sm opacity-80">Журнал мастера</p>
                  </div>
                </div>
              </div>
              <nav className="flex-1 overflow-y-auto">
                <button onClick={() => handleNavClick('calendar')} className="w-full p-4 border-b border-gray-100 text-left text-gray-700 hover:bg-gray-50 text-sm">📅 Журнал</button>
                <button onClick={() => handleNavClick('clients')} className="w-full p-4 border-b border-gray-100 text-left text-gray-700 hover:bg-gray-50 text-sm">👥 Клиенты</button>
                <button onClick={() => handleNavClick('services')} className="w-full p-4 border-b border-gray-100 text-left text-gray-700 hover:bg-gray-50 text-sm">🛠 Услуги</button>
                <button onClick={() => handleNavClick('settings')} className="w-full p-4 border-b border-gray-100 text-left text-gray-700 hover:bg-gray-50 text-sm">⚙️ Настройки</button>
              </nav>
            </div>
          </>
        )}

        {/* Top Bar */}
        <div className="bg-purple-800 text-white flex items-center justify-between p-3 shadow-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="text-xl leading-none hover:opacity-80"
              aria-label="Открыть меню"
            >
              ☰
            </button>
            <div className="flex items-center gap-3">
              <button onClick={() => scrollByWeek(-1)} className="text-lg font-bold px-2 hover:opacity-80" aria-label="Неделя назад">&lt;</button>
              <span className="font-medium text-lg capitalize">{currentMonthName} {currentYear}</span>
              <button onClick={() => scrollByWeek(1)} className="text-lg font-bold px-2 hover:opacity-80" aria-label="Неделя вперёд">&gt;</button>
            </div>
          </div>
          <button
            onClick={handleToday}
            className="text-xl leading-none hover:opacity-80"
            aria-label="Сегодня"
            title="Сегодня"
          >
            📅
          </button>
        </div>

        {activeAdminScreen === 'calendar' && (
          <div className="pb-4 bg-gray-100 w-full overflow-x-hidden">
            <div className="max-w-md mx-auto px-2 sm:px-4 mb-3 flex gap-2">
              <button onClick={() => onFilterChange('all')} className={`px-3 py-1 rounded text-xs font-medium border ${filterBrand === 'all' ? 'bg-gray-900 text-white' : 'bg-white'}`}>Все посты</button>
              <button onClick={() => onFilterChange('bvk')} className={`px-3 py-1 rounded text-xs font-medium border ${filterBrand === 'bvk' ? 'bg-green-600 text-white' : 'bg-white'}`}>BVK Авто</button>
              <button onClick={() => onFilterChange('gbo')} className={`px-3 py-1 rounded text-xs font-medium border ${filterBrand === 'gbo' ? 'bg-red-600 text-white' : 'bg-white'}`}>ГБО</button>
            </div>

            <div className="max-w-md mx-auto px-2 sm:px-4 mb-3">
              <div className="bg-white rounded shadow border border-gray-300 p-2.5 flex justify-between text-xs">
                <span className="text-gray-600">Записей: <span className="font-medium text-gray-900">{dayBookings.length}</span></span>
                <span className="text-gray-600">Сумма: <span className="font-medium text-gray-900">{totalPrice} ₽</span></span>
              </div>
            </div>

            <div
              ref={gridContainerRef}
              onScroll={handleGridScroll}
              className="mx-1 sm:mx-4 overflow-x-auto overflow-y-auto h-[calc(100dvh-210px)] max-h-[calc(100dvh-210px)] relative"
            >
              <div className="bg-white rounded border border-gray-300 w-max">
                <div
                  className="grid w-max gap-0"
                  style={{
                    gridTemplateColumns: `3.5rem repeat(${weekDays.length}, 48px)`,
                    gridAutoRows: '3.5rem',
                  }}
                >
                  {/* Левый верхний угол над шкалой времени — sticky по обеим осям */}
                  <div
                    className="sticky left-0 top-0 z-40 bg-white w-14 min-w-[3.5rem] border-r border-b border-gray-300"
                    style={{ gridColumn: 1, gridRow: 1 }}
                  ></div>

                  {/* Шапка с днями — sticky сверху; плашка месяца / число / день недели */}
                  {weekDays.map((d, dayIdx) => (
                    <div
                      key={`header-${d.date}`}
                      data-date={d.date}
                      data-month={d.showMonth ? d.monthKey : undefined}
                      data-active={d.date === selectedJournalDate ? 'true' : undefined}
                      ref={d.isToday ? todayColumnRef : undefined}
                      tabIndex={-1}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => onJournalDateChange(d.date)}
                      className={`sticky top-0 z-30 w-12 min-w-[48px] border-r border-b border-gray-300 shadow-sm flex flex-col items-center justify-center cursor-pointer transition ${d.date === selectedJournalDate ? 'bg-purple-100' : d.isWeekend ? 'bg-slate-50' : 'bg-white'
                        }`}
                      style={{ gridColumn: dayIdx + 2, gridRow: 1 }}
                    >
                      <span className="text-[9px] font-medium uppercase leading-none text-gray-400">{d.month}</span>
                      <span
                        className={`text-sm font-bold leading-none mt-0.5 ${d.isToday
                          ? 'bg-purple-600 text-white rounded-full min-w-[1.375rem] h-[1.375rem] flex items-center justify-center px-1'
                          : d.date === selectedJournalDate
                            ? 'text-purple-700'
                            : 'text-gray-800'
                          }`}
                      >
                        {d.dayNum}
                      </span>
                      <span
                        className={`text-[9px] font-medium leading-none mt-0.5 ${d.isToday ? 'text-purple-600' : 'text-gray-500'
                          }`}
                      >
                        {d.dayName}
                      </span>
                    </div>
                  ))}

                  {workingHours.map((hour, hourIdx) => (
                    <React.Fragment key={`row-${hour}`}>
                      {/* Колонка времени — sticky слева, всегда прижата к левому краю */}
                      <div
                        className="sticky left-0 z-20 w-14 min-w-[3.5rem] h-14 bg-white border-r border-b border-gray-300 select-none text-xs text-gray-500 font-medium text-center flex items-start justify-center pt-1"
                        style={{ gridColumn: 1, gridRow: hourIdx + 2 }}
                      >
                        <span className="leading-none">{hour}</span>
                      </div>
                      {weekDays.map((d, dayIdx) => (
                        <div
                          key={`cell-${d.date}-${hour}`}
                          data-active={d.date === selectedJournalDate ? 'true' : undefined}
                          className={`w-12 min-w-[48px] h-14 border-r border-b border-gray-200 cursor-pointer transition-colors ${d.date === selectedJournalDate
                            ? 'bg-purple-50'
                            : d.isWeekend
                              ? 'bg-slate-50'
                              : 'bg-white hover:bg-gray-100'
                            }`}
                          style={{ gridColumn: dayIdx + 2, gridRow: hourIdx + 2 }}
                          onClick={() => onCellAction(d.date, hour)}
                        ></div>
                      ))}
                    </React.Fragment>
                  ))}

                  {filteredBookings
                    .filter(b => weekDays.some(wd => wd.date === b.date))
                    .map((b) => {
                      const durHrs = getDurationHours(b);
                      const endH = parseInt(b.time.split(':')[0]) + durHrs;
                      const endTime = `${endH.toString().padStart(2, '0')}:00`;
                      const bgClass = b.type === 'personal' ? 'bg-orange-500' : b.brand === 'bvk' ? 'bg-green-600' : 'bg-red-600';
                      const dayIdx = weekDays.findIndex(wd => wd.date === b.date);
                      const startHour = parseInt(workingHours[0]?.split(':')[0] || '9');
                      const hourIdx = parseInt(b.time.split(':')[0]) - startHour;

                      if (dayIdx === -1) return null;

                      return (
                        <div
                          key={b.id}
                          onClick={() => onDetailsOpen(b)}
                          className={`m-[1px] p-1 rounded-sm text-white overflow-hidden cursor-pointer z-10 flex flex-col leading-tight ${bgClass} ${b.status === 'ready' ? 'opacity-60' : ''}`}
                          style={{ gridColumn: dayIdx + 2, gridRow: `${hourIdx + 2} / span ${durHrs}` }}
                        >
                          <span className="text-[8px] sm:text-[10px] font-bold truncate">{b.time}-{endTime}</span>
                          <span className="text-[8px] sm:text-[10px] font-medium leading-none mt-0.5" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
                            {b.carMake}
                          </span>
                          <span className="text-[8px] opacity-90 leading-none mt-0.5 truncate">{b.serviceName}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}
        {activeAdminScreen === 'clients' && (
          <div className="pb-20 bg-gray-100 w-full min-h-[calc(100vh-120px)]">
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-none sm:rounded border-b sm:border border-gray-300 overflow-hidden">
                {sortedClients.map(c => (
                  <button
                    key={c.id}
                    onClick={() => openClientModal(c)}
                    className="w-full flex items-center gap-3 p-3 border-b border-gray-200 last:border-b-0 text-left hover:bg-gray-50 transition"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-400 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {(c.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{c.name || 'Без имени'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{c.phone}</p>
                    </div>
                  </button>
                ))}
                {sortedClients.length === 0 && (
                  <div className="p-6 text-center text-gray-500 text-sm">Нет клиентов</div>
                )}
              </div>
            </div>

            {/* Floating add button */}
            <button
              onClick={() => openClientModal(null)}
              className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-purple-700 text-white text-2xl shadow-lg hover:opacity-90 transition flex items-center justify-center"
              aria-label="Добавить клиента"
            >
              +
            </button>
          </div>
        )}
        {activeAdminScreen === 'services' && (
          <div className="pb-20 bg-gray-100 w-full min-h-[calc(100vh-120px)]">
            <div className="max-w-md mx-auto px-2 sm:px-4 py-3">
              {/* Brand filter tabs */}
              <div className="flex gap-2 mb-3">
                <button onClick={() => setServiceFilterBrand('all')} className={`px-3 py-1 rounded text-xs font-medium border ${serviceFilterBrand === 'all' ? 'bg-gray-900 text-white' : 'bg-white'}`}>Все</button>
                <button onClick={() => setServiceFilterBrand('bvk')} className={`px-3 py-1 rounded text-xs font-medium border ${serviceFilterBrand === 'bvk' ? 'bg-green-600 text-white' : 'bg-white'}`}>BVK Авто</button>
                <button onClick={() => setServiceFilterBrand('gbo')} className={`px-3 py-1 rounded text-xs font-medium border ${serviceFilterBrand === 'gbo' ? 'bg-red-600 text-white' : 'bg-white'}`}>ГБО</button>
              </div>

              {/* Services list */}
              <div className="bg-white rounded border border-gray-300 overflow-hidden">
                {filteredServices.map((svc) => (
                  <div key={svc.id} className="p-3 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{svc.name}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-600">
                        <span>🕒 {formatDurationDisplay(svc.duration)}</span>
                        <span>💰 {svc.price}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-3">
                      <button
                        onClick={() => openServiceModal(svc)}
                        className="text-gray-600 hover:text-gray-900 text-sm"
                        aria-label="Редактировать"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteService(svc.id)}
                        className="text-gray-600 hover:text-red-600 text-sm"
                        aria-label="Удалить"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
                {filteredServices.length === 0 && (
                  <div className="p-6 text-center text-gray-500 text-sm">Нет услуг</div>
                )}
              </div>
            </div>

            {/* Floating add button */}
            <button
              onClick={() => openServiceModal(null)}
              className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-purple-700 text-white text-2xl shadow-lg hover:opacity-90 transition flex items-center justify-center"
              aria-label="Добавить услугу"
            >
              +
            </button>
          </div>
        )}
        {activeAdminScreen === 'settings' && (
          <div className="pb-20 bg-gray-100 w-full min-h-[calc(100vh-120px)]">
            <div className="max-w-md mx-auto px-2 sm:px-4 py-4">
              <div className="bg-white rounded shadow border border-gray-300 p-4 mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Расписание</h2>

                {/* Время работы */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Время работы</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">От</label>
                      <input
                        type="time"
                        value={localSchedule.startTime}
                        onChange={e => handleScheduleChange('startTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <span className="text-gray-400 mt-5">—</span>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">До</label>
                      <input
                        type="time"
                        value={localSchedule.endTime}
                        onChange={e => handleScheduleChange('endTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Выходные дни */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Выходные дни</h3>
                  <div className="space-y-1 border border-gray-200 rounded bg-gray-50 p-2">
                    {[
                      { name: 'Понедельник', value: 1 },
                      { name: 'Вторник', value: 2 },
                      { name: 'Среда', value: 3 },
                      { name: 'Четверг', value: 4 },
                      { name: 'Пятница', value: 5 },
                      { name: 'Суббота', value: 6 },
                      { name: 'Воскресенье', value: 0 },
                    ].map((day) => (
                      <label key={day.value} className="flex items-center justify-between py-1.5 cursor-pointer">
                        <span className="text-sm text-gray-700">{day.name}</span>
                        <input
                          type="checkbox"
                          checked={localSchedule.daysOff.includes(day.value)}
                          onChange={() => handleDayOffToggle(day.value)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save button */}
              <button
                onClick={handleSaveSchedule}
                className="w-full py-3 rounded bg-purple-700 text-white font-medium text-sm hover:opacity-90 transition"
              >
                СОХРАНИТЬ
              </button>
            </div>
          </div>
        )}

        {/* Service Modal */}
        <ServiceModal
          isOpen={isServiceModalOpen}
          onClose={() => setIsServiceModalOpen(false)}
          onSave={handleSaveService}
          onDelete={handleDeleteService}
          service={editingService}
          services={services}
        />

        <ClientModal
          isOpen={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
          onSave={onSaveClient}
          onDelete={onDeleteClient}
          client={editingClient}
        />
      </>
    );
  };
// ===== Main App =====
const App: React.FC = () => {
  const [activeBrand, setActiveBrand] = useState<BrandType>('bvk');
  const [mode, setMode] = useState<AppMode>('client');
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Booking form state
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState<Partial<Booking>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [isTimeSelectionOpen, setIsTimeSelectionOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const calendarSectionRef = useRef<HTMLDivElement | null>(null);
  const bookingFormRef = useRef<HTMLDivElement | null>(null);
  const [isBookingSectionVisible, setIsBookingSectionVisible] = useState(false);

  // Плашка «Выбрать время» жёстко скрывается, как только верхняя граница
  // секции календаря или формы записи достигает нижней границы экрана
  useEffect(() => {
    const els = [calendarSectionRef.current, bookingFormRef.current].filter(Boolean) as HTMLElement[];
    if (els.length === 0) {
      setIsBookingSectionVisible(false);
      return;
    }
    const visibility = new Map<Element, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visibility.set(entry.target, entry.isIntersecting);
        setIsBookingSectionVisible(Array.from(visibility.values()).some(Boolean));
      },
      { threshold: 0 }
    );
    els.forEach(el => {
      visibility.set(el, false);
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, [isTimeSelectionOpen, selectedServices.length, selectedDate, selectedTime]);

  // Форма контактов плавно раскрывается после выбора слота и плавно сворачивается при сбросе времени
  const wantBookingForm = !!(selectedServices.length > 0 && selectedDate && selectedTime);
  const [isFormMounted, setIsFormMounted] = useState(false);
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  useEffect(() => {
    if (wantBookingForm) {
      setIsFormMounted(true);
      const raf = requestAnimationFrame(() => setIsFormExpanded(true));
      return () => cancelAnimationFrame(raf);
    }
    setIsFormExpanded(false);
    const t = setTimeout(() => setIsFormMounted(false), 320);
    return () => clearTimeout(t);
  }, [wantBookingForm]);

  // Journal state
  const [filterBrand, setFilterBrand] = useState<BrandType | 'all'>('all');
  const [selectedJournalDate, setSelectedJournalDate] = useState<string>('');
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [prefillTime, setPrefillTime] = useState<string>('');
  const [prefillBrand, setPrefillBrand] = useState<BrandType>('bvk');
  const [prefillDate, setPrefillDate] = useState<string>('');
  const [detailsBooking, setDetailsBooking] = useState<Booking | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings>(DEFAULT_SCHEDULE);
  const [actionSheetData, setActionSheetData] = useState<{ date: string; time: string } | null>(null);
  const [isPersonalEventOpen, setIsPersonalEventOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    seedIfNeeded();
    const loaded = loadBookings();
    setBookings(loaded);
    const loadedServices = loadServices();
    setServices(loadedServices);
    const loadedClients = loadClients();
    setClients(loadedClients);
    const loadedSchedule = loadScheduleSettings();
    setScheduleSettings(loadedSchedule);

    const todayStr = toLocalDateString(new Date());
    setSelectedDate(todayStr);
    setSelectedJournalDate(todayStr);

    const checkMobile = () => {
      if (typeof window === 'undefined') return false;
      const ua = navigator.userAgent || '';
      return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua) || window.innerWidth <= 768;
    };
    setIsMobile(checkMobile());
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true
    );
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      } catch (e) {
        setShowInstallHelp(true);
      }
    } else {
      setShowInstallHelp(true);
    }
  };

  const todayStr = useMemo(() => toLocalDateString(new Date()), []);
  const todayBookingsCount = useMemo(
    () => bookings.filter(b => b.date === todayStr && b.status !== 'ready').length,
    [bookings, todayStr]
  );

  const handleServiceToggle = (id: string) => {
    const next = selectedServices.includes(id)
      ? selectedServices.filter(s => s !== id)
      : [...selectedServices, id];
    setSelectedServices(next);
    if (next.length === 0) setIsTimeSelectionOpen(false);
  };

  const handleContactChange = (field: keyof Booking, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  const handleBook = () => {
    setValidationError(null);
    const phoneDigits = (contactForm.phone || '').replace(/\D/g, '');
    let missingField: string | null = null;
    if (!contactForm.name || contactForm.name.trim().length < 2) {
      missingField = 'Имя (минимум 2 символа)';
    } else if (phoneDigits.length < 10) {
      missingField = 'Корректный номер телефона';
    }
    if (missingField) {
      setValidationError(missingField);
      return;
    }

    if (!selectedDate || !selectedTime || selectedServices.length === 0) return;

    const selectedServiceObjs = selectedServices
      .map(id => services.find(s => s.id === id))
      .filter(Boolean) as Service[];
    const serviceName = selectedServiceObjs.map(s => s.name).join('; ');
    const totalPrice = selectedServiceObjs.reduce((sum, s) => sum + parsePrice(s.price), 0);

    const newBooking: Booking = {
      id: Date.now().toString(),
      brand: activeBrand,
      services: selectedServices,
      serviceName,
      totalPrice,
      carMake: contactForm.carMake || '',
      carModel: contactForm.carModel || '',
      date: selectedDate,
      time: selectedTime,
      name: contactForm.name,
      phone: contactForm.phone,
      comment: contactForm.comment || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const updated = [...bookings, newBooking];
    setBookings(updated);
    saveBookings(updated);

    setCurrentBooking(newBooking);
    setIsSubmitted(true);

    setSelectedServices([]);
    setSelectedTime(null);
    setSelectedDate('');
    setContactForm({});
    setIsTimeSelectionOpen(false);
  };

  const handleCancelNearest = () => {
    const earliest = [...bookings]
      .filter(b => !b.id.startsWith('demo'))
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
    if (earliest) {
      const updated = bookings.filter(b => b.id !== earliest.id);
      setBookings(updated);
      saveBookings(updated);
    }
  };

  const handleNewBooking = () => {
    setIsSubmitted(false);
    setCurrentBooking(null);
  };

  const handleSaveManual = (booking: Booking) => {
    const updated = [...bookings, booking];
    setBookings(updated);
    saveBookings(updated);
    setIsManualOpen(false);
    setIsPersonalEventOpen(false);
    if (mode === 'journal') {
      setSelectedJournalDate(booking.date);
    }
  };

  const handleUpdateBooking = (updated: Booking) => {
    const newBookings = bookings.map(b => b.id === updated.id ? updated : b);
    setBookings(newBookings);
    saveBookings(newBookings);
    // Also update details modal if open
    if (detailsBooking?.id === updated.id) {
      setDetailsBooking(updated);
    }
  };

  const handleDeleteBooking = (id: string) => {
    if (window.confirm('Удалить запись?')) {
      const updated = bookings.filter(b => b.id !== id);
      setBookings(updated);
      saveBookings(updated);
    }
  };

  const handleUpdateServices = (updatedServices: Service[]) => {
    setServices(updatedServices);
    saveServices(updatedServices);
  };

  const handleSaveClient = (c: Client) => {
    const exists = clients.find(existing => existing.id === c.id);
    const upd = exists ? clients.map(existing => existing.id === c.id ? c : existing) : [...clients, c];
    setClients(upd);
    saveClients(upd);
  };

  const handleDeleteClient = (id: string) => {
    if (window.confirm('Удалить клиента из базы?')) {
      const upd = clients.filter(c => c.id !== id);
      setClients(upd);
      saveClients(upd);
    }
  };

  const openManualAdd = (time?: string, brand?: BrandType) => {
    setPrefillTime(time || '');
    setPrefillBrand(brand || 'bvk');
    setPrefillDate(selectedJournalDate || toLocalDateString(new Date()));
    setIsManualOpen(true);
  };

  const handleCellAction = (date: string, time: string) => {
    // На прошедшее время запись создавать нельзя
    const [hourStr, minuteStr] = time.split(':');
    const slot = parseLocalDate(date);
    slot.setHours(parseInt(hourStr, 10) || 0, parseInt(minuteStr, 10) || 0, 0, 0);
    if (slot.getTime() < Date.now()) {
      return; // слот в прошлом — не открываем меню создания записи
    }
    setActionSheetData({ date, time });
  };

  const handleActionSheetBookClient = () => {
    if (actionSheetData) {
      setPrefillTime(actionSheetData.time);
      setPrefillBrand(filterBrand === 'all' ? 'bvk' : filterBrand);
      setPrefillDate(actionSheetData.date);
    }
    setIsManualOpen(true);
    setActionSheetData(null);
  };

  const handleActionSheetCreatePersonal = () => {
    if (actionSheetData) {
      setPrefillTime(actionSheetData.time);
      setPrefillBrand(filterBrand === 'all' ? 'bvk' : filterBrand);
      setPrefillDate(actionSheetData.date);
    }
    setIsPersonalEventOpen(true);
    setActionSheetData(null);
  };

  const openDetails = (booking: Booking) => {
    setDetailsBooking(booking);
  };

  const handleOpenTimeSelection = () => {
    setIsTimeSelectionOpen(true);
    setTimeout(() => {
      calendarSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  useEffect(() => {
    if (!selectedTime) return;
    const t = setTimeout(() => {
      bookingFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 350);
    return () => clearTimeout(t);
  }, [selectedTime]);

  const handleDateChangeClient = (d: string) => {
    setSelectedDate(d);
    setSelectedTime(null);
    setValidationError(null);
  };

  const handleTimeChangeClient = (t: string | null) => {
    setSelectedTime(t);
    setValidationError(null);
  };

  const blockedMap = useMemo(
    () => getBlockedHoursMap(bookings, selectedDate, services),
    [bookings, selectedDate, services]
  );

  const workingHours = useMemo(
    () => generateWorkingHours(scheduleSettings.startTime, scheduleSettings.endTime),
    [scheduleSettings.startTime, scheduleSettings.endTime]
  );

  const handleUpdateSchedule = (settings: ScheduleSettings) => {
    setScheduleSettings(settings);
    saveScheduleSettings(settings);
  };

  const nearestUserBooking = useMemo(() => {
    const userBookings = bookings.filter(b => !b.id.startsWith('demo'));
    if (userBookings.length === 0) return null;
    return [...userBookings].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
  }, [bookings]);

  const canBook = selectedDate && selectedTime && selectedServices.length > 0 && contactForm.name && contactForm.phone;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      <div className="w-full bg-gray-100 min-h-screen">
        <Header
          activeBrand={activeBrand}
          onBrandChange={setActiveBrand}
          mode={mode}
          onModeChange={setMode}
          todayBookingsCount={todayBookingsCount}
        />

        {(!isStandalone && (isMobile || deferredPrompt)) && (
          <div className="px-4 pb-4">
            <button
              onClick={handleInstallClick}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded text-sm font-medium shadow flex items-center justify-center gap-2 transition-colors"
            >
              📱 Установить приложение на телефон
            </button>
          </div>
        )}

        {showInstallHelp && (
          <InstallGuideModal onClose={() => setShowInstallHelp(false)} />
        )}

        <main className="pb-20">
          {mode === 'journal' ? (
            <JournalMode
              bookings={bookings}
              onAddManual={openManualAdd}
              onCellAction={handleCellAction}
              onDetailsOpen={openDetails}
              selectedJournalDate={selectedJournalDate}
              onJournalDateChange={setSelectedJournalDate}
              filterBrand={filterBrand}
              onFilterChange={setFilterBrand}
              onUpdateBooking={handleUpdateBooking}
              onDeleteBooking={handleDeleteBooking}
              services={services}
              onUpdateServices={handleUpdateServices}
              workingHours={workingHours}
              scheduleSettings={scheduleSettings}
              onUpdateSchedule={handleUpdateSchedule}
              clients={clients}
              onSaveClient={handleSaveClient}
              onDeleteClient={handleDeleteClient}
            />
          ) : isSubmitted && currentBooking ? (
            <Confirmation booking={currentBooking} onNew={handleNewBooking} />
          ) : (
            <div>
              {nearestUserBooking && (
                <NearestBooking booking={nearestUserBooking} onCancel={handleCancelNearest} />
              )}

              <StepServices
                brand={activeBrand}
                selected={selectedServices}
                onToggle={handleServiceToggle}
                onOpenTimeSelection={handleOpenTimeSelection}
                services={services}
                isBookingSectionVisible={isBookingSectionVisible}
              />

              {selectedServices.length > 0 && isTimeSelectionOpen && (
                <div ref={calendarSectionRef} className="scroll-mt-24">
                  <StepDateTime
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onDateChange={handleDateChangeClient}
                    onTimeChange={handleTimeChangeClient}
                    blockedMap={blockedMap}
                    bookings={bookings}
                    services={services}
                    workingHours={workingHours}
                    daysOff={scheduleSettings.daysOff}
                  />
                </div>
              )}

              {isFormMounted && (
                <div
                  className={`transition-all duration-300 overflow-hidden ${isFormExpanded ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                    }`}
                >
                  <StepContact
                    formData={contactForm}
                    onChange={handleContactChange}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onBook={handleBook}
                    canBook={!!canBook}
                    validationError={validationError}
                    innerRef={bookingFormRef}
                  />
                </div>
              )}
            </div>
          )}
        </main>

        <ManualAddModal
          isOpen={isManualOpen}
          onClose={() => setIsManualOpen(false)}
          onSave={handleSaveManual}
          prefillTime={prefillTime}
          prefillBrand={prefillBrand}
          prefillDate={prefillDate}
          clients={clients}
          services={services}
          onSaveClient={handleSaveClient}
        />

        <PersonalEventModal
          isOpen={isPersonalEventOpen}
          onClose={() => setIsPersonalEventOpen(false)}
          onSave={handleSaveManual}
          prefillTime={prefillTime}
          prefillBrand={prefillBrand}
          prefillDate={prefillDate}
        />

        <ActionBottomSheet
          isOpen={!!actionSheetData}
          time={actionSheetData?.time || ''}
          onClose={() => setActionSheetData(null)}
          onBookClient={handleActionSheetBookClient}
          onCreatePersonal={handleActionSheetCreatePersonal}
        />

        {detailsBooking && (
          <BookingDetailsModal
            isOpen={!!detailsBooking}
            onClose={() => setDetailsBooking(null)}
            booking={detailsBooking}
            onUpdate={handleUpdateBooking}
            onDelete={handleDeleteBooking}
            services={services}
          />
        )}
      </div>
    </div>
  );
};

export default App;

