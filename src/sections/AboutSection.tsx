import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Users, Radio, Headphones, Star, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const COLORS = {
  bg: '#B6E0EE',
  neppy: '#28B9D0',
  purple: '#685096',
  green: '#AFCB31',
  white: '#FFFFFF',
  text: '#1A2B3C',
  textMuted: '#4A6578',
};

export function AboutSection() {
  const { settings } = useData();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const stats = [
    { icon: Radio, value: '24/7', label: settings.about_stat1_label || 'Непрерывное вещание профессионального контента для гостей' },
    { icon: Users, value: '4000+', label: settings.about_stat2_label || 'Объединяем команды лучших отелей по всей России и миру' },
    { icon: Star, value: '2.5M', label: settings.about_stat3_label || 'Ежегодный охват гостей сети отелей Cosmos' },
    { icon: Headphones, value: '100+', label: settings.about_stat4_label || 'Эксклюзивные подкасты, интервью и музыкальные программы' },
  ];

  const cities = (settings.about_cities || 'Москва • Санкт-Петербург • Сочи').split('•').map(c => c.trim());

  // Parse FAQ from settings
  let faqs = [];
  try {
    if (settings.faq_items) {
      faqs = typeof settings.faq_items === 'string' 
        ? JSON.parse(settings.faq_items) 
        : settings.faq_items;
    }
  } catch (e) {
    console.error('Error parsing FAQ:', e);
  }

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="relative min-h-screen py-32 px-4 sm:px-6 lg:px-8" style={{ background: COLORS.bg }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-12" style={{ color: COLORS.text }}>
          {settings.about_title || 'О Cosmos FM'}
        </h1>

        <div className="text-center mb-16">
          <p className="text-xl max-w-3xl mx-auto mb-8" style={{ color: COLORS.textMuted }}>
            {settings.about_description || 'Первый в России корпоративный медиа-канал в индустрии гостеприимства'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="rounded-3xl p-8 shadow-xl text-center" style={{ background: COLORS.white }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white" style={{ background: 'linear-gradient(135deg, #28B9D0, #685096)' }}>
                  <Icon className="w-8 h-8" />
                </div>
                <div className="text-3xl font-bold mb-2" style={{ color: COLORS.text }}>{stat.value}</div>
                <p className="text-sm" style={{ color: COLORS.textMuted }}>{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Cities */}
        <div className="rounded-3xl p-8 shadow-xl mb-12" style={{ background: COLORS.white }}>
          <h2 className="text-2xl font-bold text-center mb-6" style={{ color: COLORS.text }}>
            {settings.about_cities_title || 'Присоединяйтесь к нам! Слушайте Cosmos FM в лучших отелях сети'}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {cities.map((city, i) => (
              <div key={i} className="px-6 py-3 rounded-2xl text-white font-bold" style={{ background: 'linear-gradient(135deg, #28B9D0, #685096)' }}>
                {city}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        {faqs.length > 0 && (
          <div className="rounded-3xl p-8 shadow-xl" style={{ background: COLORS.white }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #28B9D0, #685096)' }}>
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: COLORS.text }}>
                {settings.faq_title || 'Часто задаваемые вопросы'}
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq: any, index: number) => (
                <div
                  key={index}
                  className="rounded-2xl overflow-hidden border-2"
                  style={{ borderColor: COLORS.neppy + '40', background: '#F5FBFD' }}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                  >
                    <span className="font-bold pr-4" style={{ color: COLORS.text }}>
                      {faq.question}
                    </span>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: COLORS.purple }} />
                    ) : (
                      <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: COLORS.purple }} />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4" style={{ color: COLORS.textMuted }}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
