import { useState } from 'react';
import { Radio, Clock, User } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAudio } from '@/context/AudioContext';

export function ScheduleSection() {
  const { shows } = useData();
  const { playTrack, currentTrack, isPlaying } = useAudio();

  const handlePlay = (show) => {
    if (show.audio_url) {
      playTrack({ id: show.id, title: show.title, artist: show.host_name, audio_url: show.audio_url, cover_url: show.cover_url, isLive: show.is_live, type: 'show' });
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #B8E8F7 0%, #E0F4F8 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#2D3748] mb-12 text-center">
          Расписание <span className="text-[#7C5FBF]">эфиров</span>
        </h1>
        
        <div className="space-y-4">
          {shows.length === 0 ? (
            <div className="text-center py-12 text-[#718096]">
              <Radio className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Передачи не найдены</p>
            </div>
          ) : (
            shows.map((show, index) => (
              <div key={show.id} className={`bg-white rounded-3xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl transition-all hover:-translate-y-1 ${show.is_live ? 'border-2 border-[#22c55e]' : ''}`} style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex items-center gap-4">
                  {show.cover_url ? (
                    <img src={show.cover_url} alt={show.title} className="w-20 h-20 rounded-2xl object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#4DD0E1] to-[#7C5FBF] flex items-center justify-center flex-shrink-0">
                      <Radio className="w-10 h-10 text-white" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-[#2D3748] truncate">{show.title}</h3>
                      {show.is_live && (
                        <span className="px-3 py-1 rounded-full bg-[#22c55e]/20 text-[#22c55e] text-xs font-bold">LIVE</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-[#718096] flex-wrap">
                      {show.host_name && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{show.host_name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{show.day_of_week} {show.time}</span>
                      </div>
                      {show.duration && <span>{show.duration}</span>}
                      {show.category && (
                        <span className="px-3 py-1 rounded-full bg-[#E0F4F8] text-[#26C6DA] text-xs font-bold">{show.category}</span>
                      )}
                    </div>

                    {show.description && (
                      <p className="text-sm text-[#718096] mt-2 line-clamp-2">{show.description}</p>
                    )}
                  </div>

                  {show.audio_url && (
                    <button onClick={() => handlePlay(show)} className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4DD0E1] to-[#7C5FBF] text-white flex items-center justify-center hover:scale-110 transition flex-shrink-0">
                      {isPlaying && currentTrack?.id === show.id ? '⏸' : '▶'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
