import { Users } from 'lucide-react';
import { useData } from '@/context/DataContext';

export function HostsSection() {
  const { hosts } = useData();

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #B8E8F7 0%, #E0F4F8 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#2D3748] mb-12 text-center">
          Наши <span className="text-[#7C5FBF]">Ведущие</span>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hosts.map(host => (
            <div key={host.id} className="bg-white rounded-3xl p-8 shadow-xl shadow-blue-100/50 hover:shadow-2xl transition-all hover:-translate-y-2 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-[#4DD0E1] to-[#7C5FBF]" />
              <div className="relative z-10 mt-8">
                {host.photo_url ? (
                  <img src={host.photo_url} className="w-24 h-24 rounded-full border-4 border-white shadow-lg mx-auto mb-4 object-cover" />
                ) : (
                  <div className={`w-24 h-24 rounded-full border-4 border-white shadow-lg mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white ${host.color || 'bg-[#7C5FBF]'}`}>
                    {host.initials || host.name.substring(0, 1)}
                  </div>
                )}
                <h3 className="text-xl font-bold text-[#2D3748] mb-1">{host.name}</h3>
                <p className="text-[#7C5FBF] font-semibold text-sm mb-4">{host.role}</p>
                <div className="bg-[#E0F4F8] rounded-xl p-4 text-sm text-[#2D3748]">
                  {host.bio}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
