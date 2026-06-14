import { User } from 'lucide-react';
import { useData } from '@/context/DataContext';

export function HostsSection() {
  const { hosts } = useData();

  return (
    <section id="hosts" className="py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Наши ведущие</span>
          </h2>
          <p className="text-lg text-[#71717a]">Профессионалы своего дела</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hosts.length === 0 ? (
            <div className="col-span-full text-center py-12 text-[#71717a]">
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Пока нет ведущих</p>
            </div>
          ) : (
            hosts.map(host => (
              <div key={host.id} className="glass-card rounded-2xl p-6 hover:border-[#6366f1]/50 transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  {host.photo_url ? (
                    <img 
                      src={host.photo_url} 
                      alt={host.name} 
                      className="w-24 h-24 rounded-full object-cover border-2 border-[#27273a] mb-4"
                    />
                  ) : (
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${host.color || 'from-[#6366f1] to-[#8b5cf6]'} flex items-center justify-center text-white text-2xl font-bold mb-4`}>
                      {host.initials || host.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold mb-1">{host.name}</h3>
                  <p className="text-sm text-[#6366f1] mb-2">{host.role || 'Ведущий'}</p>
                  
                  {host.hotel && (
                    <p className="text-xs text-[#71717a] mb-3">{host.hotel}</p>
                  )}
                  
                  {host.bio && (
                    <p className="text-sm text-[#a1a1aa] line-clamp-3">{host.bio}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}