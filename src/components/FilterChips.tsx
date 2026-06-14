interface FilterChipsProps {
  filters: string[];
  activeFilter: string;
  onChange: (filter: string) => void;
}

export function FilterChips({ filters, activeFilter, onChange }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onChange(filter)}
          className={`filter-chip ${activeFilter === filter ? 'active' : ''}`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}