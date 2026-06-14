import { useEffect, useState } from 'react';
import { Radio, ChevronDown, Sparkles } from 'lucide-react';

export function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/60 via-[#0a0a0f]/40 to-[#0a0a0f]" />
      </div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 floating"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
            animationDelay: '0s',
          }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full opacity-15 floating"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, transparent 70%)',
            animationDelay: '2s',
          }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-32 h-32 rounded-full opacity-10 floating"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
            animationDelay: '4s',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 section-padding w-full max-w-6xl mx-auto pt-24">
        <div className="text-center">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 transition-all duration-700 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#6366f1]" />
            <span className="text-sm text-[#a1a1aa]">Первый в России</span>
          </div>

          {/* Logo Icon */}
          <div
            className={`flex justify-center mb-8 transition-all duration-700 delay-100 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center animate-pulse-glow">
                <Radio className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-[#6366f1]/30 to-[#8b5cf6]/30 blur-xl" />
            </div>
          </div>

          {/* Main Title */}
          <h1
            className={`text-5xl sm:text-6xl lg:text-7xl font-black mb-4 transition-all duration-700 delay-200 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <span className="gradient-text">Голос вашего отеля</span>
          </h1>

          {/* Subtitle */}
          <p
            className={`text-2xl sm:text-3xl lg:text-4xl font-light text-[#a1a1aa] mb-6 transition-all duration-700 delay-300 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Звуки вашего космоса
          </p>

          {/* Description */}
          <p
            className={`text-lg sm:text-xl text-[#71717a] max-w-2xl mx-auto mb-12 transition-all duration-700 delay-400 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Первый в России корпоративный медиа-канал в индустрии гостеприимства, 
            вдохновляющий сотрудников, удивляющий гостей и укрепляющий бренд изнутри
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center mb-16 transition-all duration-700 delay-500 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <button
              onClick={() => scrollToSection('#solution')}
              className="btn-primary text-lg"
            >
              Узнать больше
            </button>
            <button
              onClick={() => scrollToSection('#contact')}
              className="btn-secondary text-lg"
            >
              Связаться с нами
            </button>
          </div>

          {/* Stats Preview */}
          <div
            className={`grid grid-cols-3 gap-8 max-w-lg mx-auto transition-all duration-700 delay-600 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold gradient-text">4000+</div>
              <div className="text-sm text-[#71717a] mt-1">сотрудников</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold gradient-text">2.5M</div>
              <div className="text-sm text-[#71717a] mt-1">гостей</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold gradient-text">24/7</div>
              <div className="text-sm text-[#71717a] mt-1">вещание</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <button
          onClick={() => scrollToSection('#problem')}
          className="flex flex-col items-center gap-2 text-[#71717a] hover:text-white transition-colors"
        >
          <span className="text-sm">Листайте вниз</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </button>
      </div>
    </section>
  );
}
