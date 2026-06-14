import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Users, TrendingDown, Lightbulb, UserX } from 'lucide-react';

const problems = [
  {
    icon: TrendingDown,
    title: 'Высокая текучесть кадров',
    description: 'Приводит к высоким затратам и падению качества услуг',
  },
  {
    icon: Users,
    title: 'Отсутствие единства',
    description: 'Команда из 4000+ человек в разных городах не чувствует связи',
  },
  {
    icon: Lightbulb,
    title: 'Нереализованный потенциал',
    description: 'Творческий потенциал сотрудников не до конца раскрыт',
  },
  {
    icon: UserX,
    title: 'Недостаточная вовлеченность',
    description: 'Гость не до конца погружен в ценности бренда отеля',
  },
];

export function ProblemSection() {
  const { ref: titleRef, isVisible: titleVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="problem" className="relative py-24 lg:py-32">
      <div className="section-padding max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left Column - Title */}
          <div
            ref={titleRef}
            className={`lg:sticky lg:top-32 transition-all duration-700 ${
              titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
              <span className="text-sm text-[#ef4444]">Проблема</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Что мешает вашему{' '}
              <span className="gradient-text">отельному бизнесу</span>{' '}
              расти?
            </h2>
            
            <p className="text-lg text-[#a1a1aa] leading-relaxed">
              Современная индустрия гостеприимства сталкивается с серьезными вызовами, 
              которые требуют инновационных решений. Традиционные методы коммуникации 
              и мотивации персонала больше не работают эффективно.
            </p>
          </div>

          {/* Right Column - Problem Cards */}
          <div className="grid sm:grid-cols-2 gap-6">
            {problems.map((problem, index) => {
              const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
              const Icon = problem.icon;
              
              return (
                <div
                  key={problem.title}
                  ref={ref}
                  className={`glass-card rounded-2xl p-6 transition-all duration-500 hover:border-[#6366f1]/50 hover:-translate-y-1 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-[#ef4444]/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[#ef4444]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
                  <p className="text-sm text-[#71717a] leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
