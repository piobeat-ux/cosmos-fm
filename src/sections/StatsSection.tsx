import { useEffect } from 'react';
import { useScrollReveal, useCountUp } from '@/hooks/useScrollReveal';
import { Users, UserCheck, Clock, Calendar } from 'lucide-react';

interface StatCardProps {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
  delay: number;
}

function StatCard({ icon: Icon, value, suffix, label, delay }: StatCardProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const { count, startAnimation } = useCountUp(value, 2500);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        startAnimation();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, delay, startAnimation]);

  return (
    <div
      ref={ref}
      className={`glass-card rounded-3xl p-8 text-center transition-all duration-500 hover:border-[#6366f1]/50 hover:-translate-y-1 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#6366f1]/20 to-[#8b5cf6]/20 flex items-center justify-center mx-auto mb-6">
        <Icon className="w-7 h-7 text-[#6366f1]" />
      </div>
      <div className="text-4xl lg:text-5xl font-black gradient-text mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-[#71717a]">{label}</div>
    </div>
  );
}

const stats = [
  { icon: Users, value: 4000, suffix: '+', label: 'Сотрудников в сети', delay: 0 },
  { icon: UserCheck, value: 2500000, suffix: '', label: 'Гостей ежегодно', delay: 150 },
  { icon: Clock, value: 24, suffix: '/7', label: 'Круглосуточное вещание', delay: 300 },
  { icon: Calendar, value: 2026, suffix: '', label: 'Год запуска проекта', delay: 450 },
];

export function StatsSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section className="relative py-24 lg:py-32">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%)',
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
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="gradient-text">Масштаб</span>{' '}
            проекта
          </h2>
          <p className="text-lg text-[#a1a1aa]">
            COSMOS FM охватывает всю экосистему вашего бизнеса
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
