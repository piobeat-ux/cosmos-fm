import { useState } from 'react';
import { Radio, Clock, User } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { SearchBar } from '@/components/SearchBar';
import { FilterChips } from '@/components/FilterChips';

export function ScheduleSection() {
  const { shows } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Все');

  const categories = ['Все', ...new Set(shows.map(s => s.category).filter(Boolean))];

  const filteredShows = shows.filter(show => {
    const matchesSearch = show.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         show.host_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Все' || show.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section id="schedule" className="py-20 fade-in">
      <div className="max-w-6xl mx-auto section-padding">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Расписание эфиров</span>
          </h2>
          <p className="text-lg text-[#71717a]">Наши передачи и шоу</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Поиск передач и ведущих..."
          />
        </div>

        {/* Filters */}
        <div className="mb-8">
          <FilterChips
            filters={categories}
            activeFilter={activeCategory}
            onChange={setActiveCategory}
          />
        </div>

        {/* Shows */}
        <div className="space-y-4">
          {filteredShows.length === 0 ? (
            <div className="text-center py-12 text-[#71717a]">
              <Radio className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Передачи не найдены</p>
            </div>
          ) : (
            filteredShows.map((show, index) => (
              <div
                key={show.id}
                className={`show-card slide-up ${show.is_live ? 'live' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-4">
                  {show.cover_url ? (
                    <img src={show.cover_url} alt={show.title} className="w-20 h-20 rounded-xl object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center flex-shrink-0">
                      <Radio className="w-10 h-10 text-white" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold truncate">{show.title}</h3>
                      {show.is_live && (
                        <span className="px-2 py-0.5 rounded-full bg-[#ef4444]/20 text-[#ef4444] text-xs font-bold">
                          LIVE
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-[#71717a] flex-wrap">
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
                        <span className="category-badge bg-[#6366f1]/20 text-[#6366f1]">
                          {show.category}
                        </span>
                      )}
                    </div>

                    {show.description && (
                      <p className="text-sm text-[#a1a1aa] mt-2 line-clamp-2">{show.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}