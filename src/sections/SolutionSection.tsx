import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Mic, Radio, Heart, Sparkles } from 'lucide-react';

const solutions = [
  {
    icon: Mic,
    title: 'Объединяем команду',
    description: 'Формируем рабочую группу амбассадоров из каждого отеля и региона. Они — наши голоса, ведущие и авторы идей.',
    result: 'Сотрудники объединены общей творческой целью',
  },
  {
    icon: Radio,
    title: 'Вовлекаем гостя 24/7',
    description: 'Фоновое радио в номерах, онлайн-трансляции на сайте и в соцсетях, интерактивные шоу.',
    result: 'Гость постоянно в контакте с брендом',
  },
  {
    icon: Heart,
    title: 'Укрепляем бренд',
    description: 'Истории горничной, советы консьержа, интервью с шеф-поваром — живой контент от сотрудников.',
    result: 'Эффект доверия и личной связи',
  },
];

export function SolutionSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="solution" className="relative py-24 lg:py-32">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 60%)',
          }}
        />
      </div>

      <div className="section-padding max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20 mb-6">
            <Sparkles className="w-4 h-4 text-[#22c55e]" />
            <span className="text-sm text-[#22c55e]">Решение</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            COSMOS FM —{' '}
            <span className="gradient-text">единая платформа</span>{' '}
            для вашего бизнеса
          </h2>

          <p className="text-lg text-[#a1a1aa] leading-relaxed">
            Первый в России корпоративный медиа-канал в индустрии гостеприимства, 
            вдохновляющий сотрудников, удивляющий гостей и укрепляющий бренд изнутри.
          </p>
        </div>

        {/* Solution Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {solutions.map((solution, index) => {
            const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
            const Icon = solution.icon;

            return (
              <div
                key={solution.title}
                ref={ref}
                className={`group relative transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="glass-card rounded-3xl p-8 h-full transition-all duration-300 group-hover:border-[#6366f1]/50 group-hover:-translate-y-2">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-4">{solution.title}</h3>
                  <p className="text-[#a1a1aa] leading-relaxed mb-6">
                    {solution.description}
                  </p>

                  {/* Result Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20">
                    <span className="text-sm text-[#22c55e]">{solution.result}</span>
                  </div>
                </div>

                {/* Glow Effect */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-[#6366f1]/20 to-[#8b5cf6]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
