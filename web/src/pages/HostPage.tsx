import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useTelegram } from '../hooks/useTelegram';

export function HostPage() {
  const { id } = useParams();
  const api = useApi();
  const nav = useNavigate();
  const { tg } = useTelegram();
  const [host, setHost] = useState<any>(null);

  useEffect(() => {
    api.get(`/hosts/${id}`).then(r => setHost(r.data));
  }, [id]);

  if (!host) return <div className="loading">Загрузка...</div>;

  const openChat = () => {
    if (host.telegramUsername && tg) {
      tg.openTelegramLink(`https://t.me/${host.telegramUsername}`);
    }
  };

  return (
    <div className="page">
      <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: '#00d4ff', marginBottom: 16, fontSize: 14 }}>← Назад</button>
      <div className="host-hero">
        <div className="host-avatar">{host.initials}</div>
        <h2>{host.name}</h2>
        <div className="host-position">{host.position}</div>
        <p className="host-bio">{host.bio}</p>
        {host.telegramUsername && (
          <button className="tg-link" onClick={openChat}>✉️ Написать ведущему</button>
        )}
      </div>

      <h2 className="section-title" style={{ marginTop: 24 }}>Передачи</h2>
      {host.shows.map((s: any) => (
        <div key={s.id} className="list-card" onClick={() => nav(`/shows/${s.id}`)} style={{ cursor: 'pointer' }}>
          <div className="list-body"><h3>{s.title}</h3></div>
        </div>
      ))}
    </div>
  );
}
