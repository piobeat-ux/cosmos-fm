import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Users, Headphones, HandHeart, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Users,
    title: 'Контент создает команда',
    description: 'Формируем рабочую группу амбассадоров из каждого отеля и региона. Они — наши голоса, ведущие и авторы идей.',
    details: ['Амбассадоры из каждого отеля', 'Обучение и поддержка', 'Творческая свобода'],
  },
  {
    number: '02',
    icon: Headphones,
    title: 'Захватываем внимание гостя',
    description: 'Круглосуточное присутствие во всех точках контакта с гостем.',
    details: ['В номере: фоновое радио в ТВ', 'На сайте: онлайн-трансляция', 'В соцсетях: интерактивные шоу'],
  },
  {
    number: '03',
    icon: HandHeart,
    title: 'Создаем эффект доверия',
    description: 'Гость слышит истории горничной, советы консьержа, интервью с шеф-поваром.',
    details: ['Личные истории сотрудников', 'Экспертные советы', 'Живой аутентичный контент'],
  },
];

export function MechanicsSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="mechanics" className="relative py-24 lg:py-32">
      {/* Background */}
      <div
        className="absolute inset-0 z-0 opacity-30"
        style={{
          backgroundImage: 'url(/sound-waves.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0a0a0f]/80 to-[#0a0a0f]" />
      </div>

      <div className="section-padding max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6366f1]/10 border border-[#6366f1]/20 mb-6">
            <span className="text-sm text-[#6366f1]">Механика</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Как это{' '}
            <span className="gradient-text">работает</span>
          </h2>

          <p className="text-lg text-[#a1a1aa] leading-relaxed">
            Три простых шага к созданию единого информационного пространства 
            для вашей команды и гостей
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => {
            const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
            const Icon = step.icon;
            const isEven = index % 2 === 1;

            return (
              <div
                key={step.number}
                ref={ref}
                className={`transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className={`glass-card rounded-3xl p-8 lg:p-12 ${isEven ? 'lg:flex-row-reverse' : ''} flex flex-col lg:flex-row gap-8 lg:gap-12 items-center`}>
                  {/* Number & Icon */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
                        <Icon className="w-12 h-12 text-white" />
                      </div>
                      <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-[#0a0a0f] border border-[#6366f1] flex items-center justify-center">
                        <span className="text-sm font-bold text-[#6366f1]">{step.number}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-center lg:text-left">
                    <h3 className="text-2xl lg:text-3xl font-bold mb-4">{step.title}</h3>
                    <p className="text-[#a1a1aa] text-lg leading-relaxed mb-6">
                      {step.description}
                    </p>

                    {/* Details */}
                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                      {step.details.map((detail) => (
                        <div
                          key={detail}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#13131f] border border-[#27273a]"
                        >
                          <ArrowRight className="w-4 h-4 text-[#6366f1]" />
                          <span className="text-sm text-[#a1a1aa]">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
