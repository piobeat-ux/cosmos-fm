import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { Player } from '../components/Player';

export function ShowPage() {
  const { id } = useParams();
  const api = useApi();
  const nav = useNavigate();
  const [show, setShow] = useState<any>(null);

  useEffect(() => {
    api.get(`/shows/${id}`).then(r => setShow(r.data));
  }, [id]);

  if (!show) return <div className="loading">Загрузка...</div>;

  return (
    <div className="page">
      <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: '#00d4ff', marginBottom: 16, fontSize: 14 }}>← Назад</button>
      <div className="page-header"><h1>{show.title}</h1><p className="subtitle">{show.host.name}</p></div>
      <p style={{ color: '#aaa', fontSize: 14, marginBottom: 20 }}>{show.description}</p>

      <h2 className="section-title">Архив подкастов</h2>
      {show.podcasts.length === 0 && <div className="empty">Пока нет подкастов</div>}
      {show.podcasts.map((p: any) => (
        <div key={p.id} style={{ marginBottom: 16 }}>
          <Player src={p.audioUrl} title={p.title} subtitle={show.host.name} />
        </div>
      ))}
    </div>
  );
}
