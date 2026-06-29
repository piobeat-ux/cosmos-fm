import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const COLORS = {
  bg: '#B6E0EE',
  neppy: '#28B9D0',
  purple: '#685096',
  green: '#AFCB31',
  white: '#FFFFFF',
  text: '#1A2B3C',
  textMuted: '#4A6578',
};

export function FAQSection() {
  const { settings } = useData();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #28B9D0, #685096)' }}>
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: COLORS.text }}>
            {settings.faq_title || 'Часто задаваемые вопросы'}
          </h1>
          <p className="text-lg" style={{ color: COLORS.textMuted }}>
            {settings.faq_subtitle || 'Ответы на популярные вопросы'}
          </p>
        </div>

        {faqs.length === 0 ? (
          <div className="text-center py-12" style={{ color: COLORS.textMuted }}>
            <p>Вопросы пока не добавлены</p>
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq: any, index: number) => (
              <div
                key={index}
                className="rounded-2xl overflow-hidden border-2"
                style={{ borderColor: COLORS.neppy + '40', background: COLORS.white }}
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
        )}
      </div>
    </div>
  );
}
