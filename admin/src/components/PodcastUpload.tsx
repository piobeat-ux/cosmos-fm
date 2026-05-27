import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';

export function PodcastUpload() {
  const api = useApi();
  const nav = useNavigate();
  const [shows, setShows] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [showId, setShowId] = useState('');
  const [hostId, setHostId] = useState('');

  useEffect(() => {
    api.get('/shows').then(r => { setShows(r.data); });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const form = new FormData();
    form.append('audio', file);
    form.append('title', title);
    form.append('showId', showId);
    form.append('hostId', hostId);
    await api.post('/podcasts', form);
    alert('✅ Подкаст загружен!');
    nav('/');
  };

  return (
    <div>
      <button className="back-btn" onClick={() => nav('/')}>← Назад</button>
      <h2>Загрузить подкаст</h2>
      <form className="admin-form" onSubmit={submit}>
        <input placeholder="Название подкаста" value={title} onChange={e => setTitle(e.target.value)} required />
        <select value={showId} onChange={e => setShowId(e.target.value)} required>
          <option value="">Выберите передачу</option>
          {shows.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
        <input placeholder="ID ведущего (число)" value={hostId} onChange={e => setHostId(e.target.value)} required />
        <input type="file" accept="audio/mp3,audio/mpeg" onChange={e => setFile(e.target.files?.[0] || null)} required />
        <button type="submit">Загрузить MP3</button>
      </form>
    </div>
  );
}
