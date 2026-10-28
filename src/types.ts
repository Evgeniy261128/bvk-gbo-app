// ===== Types =====
export type ServiceType = 'bvo' | 'gbo';
export type TabType = 'home' | 'price' | 'booking' | 'reviews';

export interface Service {
  id: string;
  name: string;
  priceFrom: string;
  priceExact?: string;
  category: ServiceType;
  description: string;
}

export interface BookingForm {
  id: string;
  serviceType: ServiceType;
  direction: 'bvo' | 'gbo';
  carMake: string;
  carModel: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  comment: string;
  createdAt: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
}

export interface Advantage {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface GalleryItem {
  id: string;
  before: string;
  after: string;
  label: string;
}

// ===== Business Data =====
export const CONTACTS = {
  address: 'Санкт-Петербург, шоссе Революции, 65',
  addressShort: 'ш. Революции, 65, СПб',
  established: 'С 2005 года',
  carsServed: '4000+ обслуженных авто',
  bvoPhone: '+7 (812) 923-41-41',
  gboPhone: '+7 (911) 765-70-70',
  gboSite: 'mirgbospb.ru',
  gboSiteUrl: 'https://mirgbospb.ru',
  workingHours: 'Пн–Вс: 09:00–21:00',
} as const;

export const SERVICES: Service[] = [
  // BVK-AUTOSERVIS services (green theme)
  { id: 'diag', name: 'Компьютерная диагностика', priceFrom: 'от 1000 ₽', category: 'bvo', description: 'Сканерная диагностика ДВС, электроники, подвески' },
  { id: 'oil-to', name: 'Замена масла и ТО', priceFrom: 'от 1200 ₽', category: 'bvo', description: 'Качественные масла мировых брендов, комплексная замена' },
  { id: 'grm', name: 'Замена ремня/цепи ГРМ', priceFrom: 'от 6500 ₽', category: 'bvo', description: 'Профессиональная замена ремня или цепи ГРМ' },
  { id: 'susp', name: 'Ремонт подвески и ходовой', priceFrom: 'от 1500 ₽', category: 'bvo', description: 'Амортизаторы, стойки, шаровые опоры, рычаги' },
  { id: 'brake', name: 'Ремонт тормозной системы', priceFrom: 'от 1200 ₽', category: 'bvo', description: 'Колодки, диски, суппорты, тормозная жидкость' },
  { id: 'engine', name: 'Капитальный ремонт ДВС', priceFrom: 'договорная', category: 'bvo', description: 'Полный ремонт двигателя с гарантией' },

  // МирГбоСПб services (red theme)
  { id: 'gbo-install', name: 'Установка ГБО 4 поколения (Digitronic/Lovato)', priceFrom: 'от 38 000 ₽', category: 'gbo', description: 'Установка современного ГБО 4-го поколения' },
  { id: 'gbo-to', name: 'ТО газового оборудования', priceFrom: 'от 1800 ₽', category: 'gbo', description: 'Технический осмотр, замена фильтров, проверка уплотнителей' },
  { id: 'gbo-diag', name: 'Компьютерная настройка и диагностика ГБО', priceFrom: 'от 1000 ₽', category: 'gbo', description: 'Настройка под конкретный двигатель, диагностика системы' },
  { id: 'gbo-repair', name: 'Ремонт редуктора / форсунок ГБО', priceFrom: 'от 2500 ₽', category: 'gbo', description: 'Ремонт и замена редукторов, форсунок, клапанов' },
  { id: 'gbo-reg', name: 'Официальная регистрация ГБО в ГИБДД', priceFrom: '10 000 ₽', category: 'gbo', description: 'Полное оформление в ГИБДД под ключ' },
];

export const ADVANTAGES: Advantage[] = [
  { id: '1', title: 'Опыт более 15 лет', description: 'Работаем с 2005 года', icon: '🔧' },
  { id: '2', title: 'Гарантия на работы', description: 'До 24 месяцев', icon: '🛡️' },
  { id: '3', title: 'Оригинальные детали', description: 'Только проверенные комплектующие', icon: '✅' },
  { id: '4', title: 'Выездной сервис', description: 'Приедем к вам на дом', icon: '🚗' },
];

export const REVIEWS: Review[] = [
  { id: '1', name: 'Алексей М.', rating: 5, text: 'Отличный сервис! Быстро, качественно, по разумным ценам. ГБО работает как часы после установки.', date: '2024-09-15' },
  { id: '2', name: 'Иван П.', rating: 5, text: 'Профессионалы своего дела. Замена масла и ТО сделали быстро, всё чисто.', date: '2024-09-10' },
  { id: '3', name: 'Мария С.', rating: 4, text: 'Хорошая сервисная поддержка и вежливый персонал. Рекомендую всем знакомым.', date: '2024-08-28' },
];

export const GALLERY: Record<ServiceType, GalleryItem[]> = {
  bvo: [
    { id: 'b1', before: '🚗⚠️', after: '🚗✨', label: 'Ремонт подвески' },
    { id: 'b2', before: '🔥', after: '❄️', label: 'Ремонт тормозов' },
  ],
  gbo: [
    { id: 'g1', before: '⛽', after: '💰', label: 'Установка ГБО' },
    { id: 'g2', before: '📉', after: '📈', label: 'Настройка ГБО' },
  ],
};

export const CAR_MAKES = [
  'Toyota', 'Honda', 'BMW', 'Mercedes', 'Audi', 'Volkswagen',
  'Skoda', 'Renault', 'Peugeot', 'Citroen', 'Hyundai', 'Kia',
  'Lada', 'Nissan', 'Mazda', 'Subaru', 'Mitsubishi', 'Suzuki',
];
