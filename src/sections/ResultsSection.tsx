import { useScrollReveal } from '@/hooks/useScrollReveal';
import { TrendingDown, TrendingUp, RotateCcw, Award, DollarSign, Check } from 'lucide-react';

const results = [
  {
    icon: TrendingDown,
    title: 'Снижение текучести',
    description: 'Уменьшение процента текучести персонала за счет повышения вовлеченности',
    color: '#22c55e',
  },
  {
    icon: TrendingUp,
    title: 'Повышение лояльности',
    description: 'Рост лояльности сотрудников и улучшение репутации работодателя',
    color: '#6366f1',
  },
  {
    icon: RotateCcw,
    title: 'Повторные визиты',
    description: 'Увеличение количества повторных визитов гостей',
    color: '#8b5cf6',
  },
  {
    icon: Award,
    title: 'Программа лояльности',
    description: 'Рост числа участников программы лояльности отеля',
    color: '#06b6d4',
  },
  {
    icon: DollarSign,
    title: 'Новый канал монетизации',
    description: 'Дополнительный источник дохода через спонсорство и рекламу',
    color: '#f59e0b',
  },
];

export function ResultsSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="results" className="relative py-24 lg:py-32">
      <div className="section-padding max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left Column - Title */}
          <div
            ref={headerRef}
            className={`lg:sticky lg:top-32 transition-all duration-700 ${
              headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20 mb-6">
              <Check className="w-4 h-4 text-[#22c55e]" />
              <span className="text-sm text-[#22c55e]">Результаты</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="gradient-text">Измеримые</span>{' '}
              результаты
            </h2>

            <p className="text-lg text-[#a1a1aa] leading-relaxed mb-8">
              COSMOS FM — это инвестиция в главные активы: команду и лояльность гостей. 
              Результаты, которые можно измерить и отследить.
            </p>

            {/* Summary Card */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold">ROI</div>
                  <div className="text-sm text-[#71717a]">Окупаемость инвестиций</div>
                </div>
              </div>
              <p className="text-[#a1a1aa] text-sm">
                Проект окупается за счет снижения затрат на найм, 
                роста повторных визитов и новых каналов монетизации.
              </p>
            </div>
          </div>

          {/* Right Column - Result Cards */}
          <div className="space-y-4">
            {results.map((result, index) => {
              const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
              const Icon = result.icon;

              return (
                <div
                  key={result.title}
                  ref={ref}
                  className={`glass-card rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ 
                    transitionDelay: `${index * 100}ms`,
                    borderColor: `${result.color}30`,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${result.color}15` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: result.color }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{result.title}</h3>
                      <p className="text-sm text-[#71717a] leading-relaxed">
                        {result.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
