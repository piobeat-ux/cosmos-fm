import { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { Link } from 'react-router-dom';

export function ShowsPage() {
  const api = useApi();
  const [shows, setShows] = useState<any[]>([]);

  useEffect(() => {
    api.get('/shows').then(r => setShows(r.data));
  }, []);

  return (
    <div className="page">
      <div className="page-header"><h1>Передачи</h1></div>
      <div className="list-grid">
        {shows.map(show => (
          <Link to={`/shows/${show.id}`} key={show.id} className="list-card">
            <div className="list-img">{show.coverUrl ? <img src={show.coverUrl} alt="" /> : '📺'}</div>
            <div className="list-body">
              <h3>{show.title}</h3>
              <p>{show.host.name} • {show._count.podcasts} подкастов</p>
              <p className="meta">{show.schedule.map((s: any) => `${['Вс','Пн','Вт','Ср','Чт','Пт','Сб'][s.dayOfWeek]} ${s.startTime}`).join(', ')}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
