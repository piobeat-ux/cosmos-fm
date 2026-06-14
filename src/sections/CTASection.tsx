import { useScrollReveal } from '@/hooks/useScrollReveal';
import { CheckCircle, FileCheck, Wallet, Users, ArrowRight, Sparkles } from 'lucide-react';

const steps = [
  {
    number: '1',
    icon: FileCheck,
    title: 'Утвердить концепцию',
    description: 'Согласовать стратегическую цель и видение проекта',
  },
  {
    number: '2',
    icon: Wallet,
    title: 'Выделить бюджет',
    description: 'Определить бюджет на подготовительный этап',
  },
  {
    number: '3',
    icon: Users,
    title: 'Рабочее совещание',
    description: 'Согласовать детали плана, бюджета и старта проекта',
  },
];

export function CTASection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="contact" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, #1e1b4b 0%, #0a0a0f 70%)',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 50%)',
          }}
        />
      </div>

      <div className="section-padding max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div
          ref={headerRef}
          className={`text-center mb-16 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
            <Sparkles className="w-4 h-4 text-[#6366f1]" />
            <span className="text-sm text-[#a1a1aa]">Готовы начать?</span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Запустите{' '}
            <span className="gradient-text">COSMOS FM</span>
          </h2>

          <p className="text-xl text-[#a1a1aa] max-w-2xl mx-auto">
            Три простых шага к созданию единого медиа-пространства для вашего бизнеса
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {steps.map((step, index) => {
            const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                ref={ref}
                className={`relative transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="glass-card rounded-2xl p-6 h-full text-center">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-sm text-[#6366f1] font-semibold mb-2">
                    Шаг {step.number}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-[#71717a]">{step.description}</p>
                </div>

                {/* Arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-[#6366f1]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <div
          className={`text-center transition-all duration-700 delay-500 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <button className="btn-primary text-lg px-12 py-5">
            Начать проект
          </button>

          <div className="flex items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 text-sm text-[#71717a]">
              <CheckCircle className="w-4 h-4 text-[#22c55e]" />
              <span>Бесплатная консультация</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#71717a]">
              <CheckCircle className="w-4 h-4 text-[#22c55e]" />
              <span>Индивидуальный подход</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
