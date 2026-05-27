import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';

export function HostEditor() {
  const api = useApi();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', initials: '', position: '', bio: '', telegramUsername: '' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/admin/hosts', form);
    alert('✅ Ведущий добавлен!');
    setForm({ name: '', initials: '', position: '', bio: '', telegramUsername: '' });
  };

  return (
    <div>
      <button className="back-btn" onClick={() => nav('/')}>← Назад</button>
      <h2>Добавить ведущего</h2>
      <form className="admin-form" onSubmit={submit}>
        <input placeholder="ФИО" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <input placeholder="Инициалы (АП)" value={form.initials} onChange={e => setForm({...form, initials: e.target.value})} required />
        <input placeholder="Должность" value={form.position} onChange={e => setForm({...form, position: e.target.value})} required />
        <textarea placeholder="Биография" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={3} />
        <input placeholder="Telegram @username" value={form.telegramUsername} onChange={e => setForm({...form, telegramUsername: e.target.value})} />
        <button type="submit">Добавить</button>
      </form>
    </div>
  );
}
