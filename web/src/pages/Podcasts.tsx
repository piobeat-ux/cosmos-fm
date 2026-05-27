import { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { Player } from '../components/Player';

export function PodcastsPage() {
  const api = useApi();
  const [podcasts, setPodcasts] = useState<any[]>([]);

  useEffect(() => {
    api.get('/podcasts').then(r => setPodcasts(r.data));
  }, []);

  return (
    <div className="page">
      <div className="page-header"><h1>Подкасты</h1></div>
      <div className="list-grid">
        {podcasts.map(p => (
          <div key={p.id} className="list-card" style={{ flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="list-img">🎧</div>
              <div className="list-body">
                <h3>{p.title}</h3>
                <p>{p.show.title} • {p.host.name}</p>
              </div>
            </div>
            <Player src={p.audioUrl} title={p.title} subtitle={p.show.title} />
          </div>
        ))}
      </div>
    </div>
  );
}
