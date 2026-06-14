import { Radio, Users, Headphones, Award, MapPin, Mail, Phone, Instagram, Youtube, Music2, Lock } from 'lucide-react';
import { useData } from '@/context/DataContext';

const features = [
  { title: 'Единая платформа', description: 'Объединяем все отели сети в одно информационное пространство' },
  { title: 'Живой контент', description: 'Передачи создаются самими сотрудниками — аутентично и искренне' },
  { title: 'Вовлечение гостей', description: 'Гости слышат истории персонала и погружаются в атмосферу отеля' },
  { title: 'Развитие команды', description: 'Творческая платформа для сотрудников по всей стране' },
];

const stats = [
  { value: '4000+', label: 'Сотрудников', icon: Users },
  { value: '24/7', label: 'Вещание', icon: Radio },
  { value: '150+', label: 'Передач', icon: Headphones },
  { value: '50+', label: 'Ведущих', icon: Award },
];

export function AboutSection() {
  const { settings } = useData();

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center py-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
          <Radio className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-3">{settings.site_name}</h1>
        <p className="text-[#a1a1aa] max-w-md mx-auto">
          {settings.site_tagline}
        </p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="glass-card rounded-2xl p-4 text-center">
              <Icon className="w-6 h-6 text-[#6366f1] mx-auto mb-2" />
              <div className="text-2xl font-bold gradient-text">{stat.value}</div>
              <div className="text-xs text-[#71717a]">{stat.label}</div>
            </div>
          );
        })}
      </section>

      {/* Mission */}
      <section className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Наша миссия</h2>
        <p className="text-[#a1a1aa] leading-relaxed mb-6">
          {settings.about_text}
        </p>
        
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#6366f1]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[#6366f1] font-bold text-sm">{index + 1}</span>
              </div>
              <div>
                <h3 className="font-medium mb-1">{feature.title}</h3>
                <p className="text-sm text-[#71717a]">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How to Listen */}
      <section>
        <h2 className="text-xl font-bold mb-4">Как слушать</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="show-card text-center">
            <div className="w-12 h-12 rounded-xl bg-[#6366f1]/20 flex items-center justify-center mx-auto mb-3">
              <Radio className="w-6 h-6 text-[#6366f1]" />
            </div>
            <h3 className="font-medium mb-1">В номере</h3>
            <p className="text-sm text-[#71717a]">Фоновое радио в отельном ТВ</p>
          </div>
          <div className="show-card text-center">
            <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center mx-auto mb-3">
              <Headphones className="w-6 h-6 text-[#8b5cf6]" />
            </div>
            <h3 className="font-medium mb-1">На сайте</h3>
            <p className="text-sm text-[#71717a]">Онлайн-трансляция 24/7</p>
          </div>
          <div className="show-card text-center">
            <div className="w-12 h-12 rounded-xl bg-[#06b6d4]/20 flex items-center justify-center mx-auto mb-3">
              <Phone className="w-6 h-6 text-[#06b6d4]" />
            </div>
            <h3 className="font-medium mb-1">В приложении</h3>
            <p className="text-sm text-[#71717a]">Скоро на iOS и Android</p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Контакты</h2>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-[#6366f1]" />
            <span className="text-[#a1a1aa]">{settings.contact_email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-[#6366f1]" />
            <span className="text-[#a1a1aa]">{settings.contact_phone}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-[#6366f1]" />
            <span className="text-[#a1a1aa]">{settings.contact_address}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <a href={settings.social_instagram} className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-[#13131f] border border-[#27273a] hover:border-[#6366f1]/50 transition-colors">
            <Instagram className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">Instagram</span>
          </a>
          <a href={settings.social_youtube} className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-[#13131f] border border-[#27273a] hover:border-[#6366f1]/50 transition-colors">
            <Youtube className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">YouTube</span>
          </a>
          <a href={settings.social_tiktok} className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-[#13131f] border border-[#27273a] hover:border-[#6366f1]/50 transition-colors">
            <Music2 className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">TikTok</span>
          </a>
        </div>
      </section>

      {/* Admin Link */}
      <div className="text-center">
        <a
          href="#/admin"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#13131f] border border-[#27273a] hover:border-[#6366f1]/50 transition-colors text-sm text-[#71717a] hover:text-white"
        >
          <Lock className="w-4 h-4" />
          Вход для администратора
        </a>
      </div>

      {/* Footer */}
      <footer className="text-center pt-8 border-t border-[#27273a]">
        <p className="text-sm text-[#71717a]">
          © 2026 {settings.site_name}. Все права защищены.
        </p>
        <p className="text-xs text-[#27273a] mt-2">
          {settings.hero_title} • {settings.hero_subtitle}
        </p>
      </footer>
    </div>
  );
}
