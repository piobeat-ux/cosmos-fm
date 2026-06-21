import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { ChevronDown, ChevronUp } from 'lucide-react';

const COLORS = {
  bg: '#B6E0EE',
  neppy: '#28B9D0',
  purple: '#685096',
  white: '#FFFFFF',
  text: '#1A2B3C',
  textMuted: '#4A6578',
};

export function FAQSection() {
  const { settings } = useData();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Parse FAQ from settings (stored as JSON string)
  let faqs = [];
  try {
    faqs = settings.faq_items ? JSON.parse(settings.faq_items) : [];
  } catch (e) {
    console.error('Error parsing FAQ:', e);
  }

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="relative min-h-screen py-32 px-4 sm:px-6 lg:px-8" style={{ background: COLORS.bg }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-12" style={{ color: COLORS.text }}>
          {settings.faq_title || 'Часто задаваемые вопросы'}
        </h1>

        <div className="space-y-4">
          {faqs.length === 0 ? (
            <p className="text-center" style={{ color: COLORS.textMuted }}>
              Вопросы скоро появятся...
            </p>
          ) : (
            faqs.map((faq: any, index: number) => (
              <div
                key={index}
                className="rounded-2xl overflow-hidden shadow-lg"
                style={{ background: COLORS.white }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="font-bold pr-4" style={{ color: COLORS.text }}>
                    {faq.question}
                  </span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: COLORS.purple }} />
                  ) : (
                    <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: COLORS.purple }} />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4" style={{ color: COLORS.textMuted }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
