import { Radio, Mail, Phone, MapPin, Instagram, Youtube, Music2 } from 'lucide-react';

const navLinks = [
  { label: 'Проблема', href: '#problem' },
  { label: 'Решение', href: '#solution' },
  { label: 'Механика', href: '#mechanics' },
  { label: 'Результаты', href: '#results' },
];

const socialLinks = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Music2, href: '#', label: 'TikTok' },
];

export function Footer() {
  const scrollToSection = (href: string) => {
    if (href === '#') return;
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative py-16 border-t border-[#27273a]/50">
      <div className="section-padding max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a
              href="#"
              className="flex items-center gap-3 mb-6"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">Cosmos FM</span>
            </a>
            <p className="text-[#71717a] max-w-md mb-6 leading-relaxed">
              Первый в России корпоративный медиа-канал в индустрии гостеприимства. 
              Вдохновляем сотрудников, удивляем гостей, укрепляем бренд изнутри.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 rounded-xl bg-[#13131f] border border-[#27273a] flex items-center justify-center text-[#71717a] hover:text-white hover:border-[#6366f1] transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-6">Навигация</h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-[#71717a] hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-6">Контакты</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#6366f1] mt-0.5" />
                <span className="text-[#71717a]">info@cosmosfm.ru</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#6366f1] mt-0.5" />
                <span className="text-[#71717a]">+7 (999) 000-00-00</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#6366f1] mt-0.5" />
                <span className="text-[#71717a]">Москва, Россия</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-[#27273a]/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#71717a]">
            © 2026 Cosmos FM. Все права защищены.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-[#71717a] hover:text-white transition-colors">
              Политика конфиденциальности
            </a>
            <a href="#" className="text-sm text-[#71717a] hover:text-white transition-colors">
              Условия использования
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
