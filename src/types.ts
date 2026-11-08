// ===== Types =====

export type BrandType = 'bvk' | 'gbo';
export type AppMode = 'client' | 'journal';
export type BookingStatus = 'pending' | 'in_progress' | 'ready';

export interface Brand {
  id: BrandType;
  name: string;
  subtitle: string;
  color: string;  // Tailwind + hex for borders/accent
  phone: string;
  phoneClean: string;
  logo: string;
  telegram: string;
  mapLink: string;
}

export interface Service {
  id: string;
  name: string;
  price: string;  // e.g. "1000 ₽" or "от 6500 ₽"
  duration: number;  // minutes, for display
  brand: BrandType;
}

export interface Booking {
  id: string;
  brand: BrandType;
  services: string[];     // service ids
  serviceName: string;    // joined names for display
  totalPrice: number;
  carMake: string;
  carModel: string;
  date: string;           // ISO date  YYYY-MM-DD
  time: string;           // HH:MM (start)
  name: string;
  phone: string;
  comment: string;
  status: BookingStatus;
  createdAt: string;
  type?: 'client' | 'personal';
  endTime?: string;       // 'HH:MM' — реальное время окончания
  duration?: number;      // длительность в минутах (endTime - time)
  color?: string;         // кастомный цвет карточки в сетке журнала
}

export interface DaySlot {
  date: string;   // YYYY-MM-DD
  label: string;  // "Сегодня", "Завтра", "Пн", etc.
  dayName: string;
  dayNum: number;
}

export interface ScheduleSettings {
  startTime: string;  // "09:00"
  endTime: string;    // "21:00"
  daysOff: number[];  // 0=Sunday, 1=Monday, ... 6=Saturday
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  carMake?: string;
  carModel?: string;
}

// ===== Business Data =====

export const BRANDS: Record<BrandType, Brand> = {
  bvk: {
    id: 'bvk',
    name: 'BVK-AUTOSERVIS',
    subtitle: 'Слесарный ремонт',
    color: '#16a34a',
    phone: '+7 (812) 923-41-41',
    phoneClean: '+78129234141',
    logo: 'logo-bvk.png',
    telegram: 'https://t.me/bvkaudioservis',
    mapLink: 'https://yandex.ru/maps/?text=Санкт-Петербург,+шоссе+Революции,+65',
  },
  gbo: {
    id: 'gbo',
    name: 'МирГбоСПб',
    subtitle: 'Установка и ремонт ГБО',
    color: '#dc2626',
    phone: '+7 (911) 765-70-70',
    phoneClean: '+79117657070',
    logo: 'logo-gbo.png',
    telegram: 'https://t.me/mirgbospb',
    mapLink: 'https://yandex.ru/maps/?text=Санкт-Петербург,+шоссе+Революции,+65',
  },
};

export const ADDRESS = 'СПб, Шафировский 28к1';
export const WORKING_HOURS = '09:00–21:00';

// Service prices parsed from the string
function parsePrice(s: string): number {
  const m = s.replace(/\s/g, '').match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

export const SERVICE_PRICE_FROM = {
  'bvk': 1000,
  'gbo': 1000,
} as const;

export const CAR_MAKES = [
  'Toyota', 'Honda', 'BMW', 'Mercedes', 'Audi', 'Volkswagen',
  'Skoda', 'Renault', 'Peugeot', 'Citroen', 'Hyundai', 'Kia',
  'Lada', 'Nissan', 'Mazda', 'Subaru', 'Mitsubishi', 'Suzuki',
  'Газель', 'Грузовик',
];

// Utility: get next N days starting today
export const getDaySlots = (count: number = 7): DaySlot[] => {
  const slots: DaySlot[] = [];
  const today = new Date();
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const isToday = i === 0;
    const isTomorrow = i === 1;
    slots.push({
      date: d.toISOString().split('T')[0],
      label: isToday ? 'Сегодня' : isTomorrow ? 'Завтра' : dayNames[d.getDay()],
      dayName: dayNames[d.getDay()],
      dayNum: d.getDate(),
    });
  }
  return slots;
};

// Utility: format date  DD.MM (Wed)
export const formatDateLabel = (dateStr: string): string => {
  const d = new Date(dateStr);
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')} (${dayNames[d.getDay()]})`;
};

// Utility: format date+time for confirmation screen
export const formatDateTime = (dateStr: string, timeStr: string): string => {
  return `${dateStr.split('-').reverse().join('.')}, ${timeStr}`;
};

// Export parsePrice for App usage
export { parsePrice };
