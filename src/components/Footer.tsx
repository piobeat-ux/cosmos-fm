import { Radio, Heart, Instagram, Youtube, Music2, Mail, Phone, MapPin, FileText } from 'lucide-react';
import { useData } from '@/context/DataContext';

const COLORS = {
  neppy: '#28B9D0',
  purple: '#685096',
  green: '#AFCB31',
  white: '#FFFFFF',
  text: '#1A2B3C',
  textMuted: '#4A6578',
};

export function Footer() {
  const { settings } = useData();

  const socials = [
    { icon: Instagram, url: settings.social_instagram, label: 'Instagram' },
    { icon: Youtube, url: settings.social_youtube, label: 'YouTube' },
    { icon: Music2, url: settings.social_tiktok, label: 'TikTok' },
  ].filter(s => s.url);

  const documents = [
    { title: settings.doc1_title || 'Политика конфиденциальности', url: settings.doc1_url },
    { title: settings.doc2_title || 'Пользовательское соглашение', url: settings.doc2_url },
    { title: settings.doc3_title || 'Cookies', url: settings.doc3_url },
  ].filter(d => d.url);

  return (
    <footer className="relative z-10 py-12 px-4 sm:px-6 lg:px-8" style={{ background: COLORS.white + 'F0', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ 
                background: `linear-gradient(135deg, ${COLORS.neppy}, ${COLORS.purple})` 
              }}>
                <Radio className="w-5 h-5" style={{ color: COLORS.white }} />
              </div>
              <span className="text-xl font-bold text-transparent bg-clip-text" style={{ 
                backgroundImage: `linear-gradient(90deg, ${COLORS.purple}, ${COLORS.neppy})`
              }}>
                {settings.site_name || 'Cosmos FM'}
              </span>
            </div>
            <p className="text-sm mb-4" style={{ color: COLORS.textMuted }}>
              {settings.site_tagline || 'Первый в России корпоративный медиа-канал'}
            </p>
            
            {/* Socials */}
            {socials.length > 0 && (
              <div className="flex gap-3">
                {socials.map((social, i) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={i}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                      style={{ background: COLORS.neppy + '20', color: COLORS.purple }}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Contacts */}
          <div>
            <h3 className="font-bold mb-4" style={{ color: COLORS.text }}>Контакты</h3>
            <ul className="space-y-3 text-sm" style={{ color: COLORS.textMuted }}>
              {settings.contact_email && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${settings.contact_email}`} className="hover:underline">{settings.contact_email}</a>
                </li>
              )}
              {settings.contact_phone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${settings.contact_phone}`} className="hover:underline">{settings.contact_phone}</a>
                </li>
              )}
              {settings.contact_address && (
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span>{settings.contact_address}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Documents */}
          {documents.length > 0 && (
            <div>
              <h3 className="font-bold mb-4" style={{ color: COLORS.text }}>Документы</h3>
              <ul className="space-y-2">
                {documents.map((doc, i) => (
                  <li key={i}>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm flex items-center gap-2 hover:underline"
                      style={{ color: COLORS.textMuted }}
                    >
                      <FileText className="w-4 h-4" />
                      {doc.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="pt-8 border-t" style={{ borderColor: COLORS.neppy + '30' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm" style={{ color: COLORS.textMuted }}>
              © {new Date().getFullYear()} {settings.site_name || 'Cosmos FM'}. Все права защищены.
            </p>
            <p className="text-sm flex items-center gap-1" style={{ color: COLORS.textMuted }}>
              Сделано с <Heart className="w-4 h-4" style={{ color: '#EF4444' }} /> в России
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
