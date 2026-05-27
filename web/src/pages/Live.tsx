import { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { Player } from '../components/Player';
import { Link } from 'react-router-dom';

export function LivePage() {
  const api = useApi();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/stream/current').then(r => setData(r.data)).catch(console.error);
  }, []);

  if (!data) return <div className="loading">Загрузка эфира...</div>;

  const { stream, onAir, todaySchedule } = data;

  return (
    <div className="page live-page">
      <div className="page-header">
        <h1>Cosmos FM</h1>
        <p className="subtitle">
          {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <Player
        src={stream?.streamUrl || ''}
        title={onAir?.show?.title || 'Прямой эфир'}
        subtitle={onAir?.show?.host?.name}
        cover={onAir?.show?.coverUrl}
        live
      />

      <h2 className="section-title">📅 Расписание на сегодня</h2>
      <div className="schedule-list">
        {todaySchedule.map((s: any) => (
          <Link to={`/shows/${s.show.id}`} key={s.id} className={`schedule-item ${s.show.id === onAir?.show?.id ? 'active' : ''}`}>
            <span className="schedule-time">{s.startTime}</span>
            <div className="schedule-info">
              <strong>{s.show.title}</strong>
              <span>{s.show.host.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
