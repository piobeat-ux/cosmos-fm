export interface Show {
  id: string;
  title: string;
  description?: string;
  host_name?: string;
  time?: string;
  duration?: string;
  category?: string;
  day_of_week?: string;
  is_live?: boolean;
  cover_url?: string;
  audio_url?: string;
  created_at?: string;
}

export interface Host {
  id: string;
  name: string;
  role?: string;
  hotel?: string;
  bio?: string;
  photo_url?: string;
  shows?: string[];
  schedule?: string;
  color?: string;
  initials?: string;
  created_at?: string;
}

export interface Podcast {
  id: string;
  title: string;
  description?: string;
  host_name?: string;
  episodes?: number;
  duration?: string;
  category?: string;
  likes?: number;
  color?: string;
  audio_url?: string;
  cover_url?: string;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  count?: number;
  color?: string;
  created_at?: string;
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  address?: string;
  logo_url?: string;
  created_at?: string;
}

export interface SiteSettings {
  site_title?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_description?: string;
  stream_url?: string;
  primary_color?: string;
  contact_email?: string;
  contact_phone?: string;
  [key: string]: string | undefined;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  site_title: 'Cosmos FM',
  hero_title: 'Голос вашего отеля',
  hero_subtitle: 'Звуки вашего космоса',
  hero_description: 'Первый в России корпоративный медиа-канал в индустрии гостеприимства',
  stream_url: '',
  primary_color: '#6366f1',
  contact_email: 'radio@cosmosfm.ru',
  contact_phone: '+7 (999) 000-00-00',
};

export const DAYS_OF_WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const CATEGORIES_LIST = [
  'Музыка',
  'Новости',
  'Развлечения',
  'Обучение',
  'Истории',
  'Утреннее шоу',
  'Разговорное',
  'Бизнес',
  'Кулинария',
];

export const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00',
  '11:00', '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00', '20:00',
  '21:00', '22:00', '23:00',
];

export const DEFAULT_COLORS = [
  'from-[#f59e0b] to-[#f97316]',
  'from-[#8b5cf6] to-[#6366f1]',
  'from-[#22c55e] to-[#14b8a6]',
  'from-[#ef4444] to-[#f97316]',
  'from-[#3b82f6] to-[#06b6d4]',
  'from-[#ec4899] to-[#8b5cf6]',
  'from-[#10b981] to-[#3b82f6]',
];