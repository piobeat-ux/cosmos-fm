import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';

export function ScheduleEditor() {
  const api = useApi();
  const nav = useNavigate();
  const [form, setForm] = useState({ showId: '', dayOfWeek: '1', startTime: '07:00', endTime: '10:00' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/admin/schedule', {
      ...form,
      showId: Number(form.showId),
      dayOfWeek: Number(form.dayOfWeek)
    });
    alert('✅ Добавлено в расписание!');
  };

  return (
    <div>
      <button className="back-btn" onClick={() => nav('/')}>← Назад</button>
      <h2>Расписание</h2>
      <form className="admin-form" onSubmit={submit}>
        <input placeholder="ID передачи" value={form.showId} onChange={e => setForm({...form, showId: e.target.value})} required />
        <select value={form.dayOfWeek} onChange={e => setForm({...form, dayOfWeek: e.target.value})}>
          <option value="0">Воскресенье</option>
          <option value="1">Понедельник</option>
          <option value="2">Вторник</option>
          <option value="3">Среда</option>
          <option value="4">Четверг</option>
          <option value="5">Пятница</option>
          <option value="6">Суббота</option>
        </select>
        <input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} required />
        <input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} required />
        <button type="submit">Добавить в расписание</button>
      </form>
    </div>
  );
}
