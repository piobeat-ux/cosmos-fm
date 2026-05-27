import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { AdminGuard } from './guards/AdminGuard';
import { PodcastUpload } from './components/PodcastUpload';
import { HostEditor } from './components/HostEditor';
import { ScheduleEditor } from './components/ScheduleEditor';

function App() {
  return (
    <HashRouter>
      <AdminGuard>
        <div className="admin-app">
          <Routes>
            <Route path="/" element={
              <div>
                <h1>🎛 Админка Cosmos FM</h1>
                <div className="admin-menu">
                  <Link to="/podcasts">📤 Загрузить подкаст</Link>
                  <Link to="/hosts">👤 Управление ведущими</Link>
                  <Link to="/schedule">📅 Расписание</Link>
                </div>
              </div>
            } />
            <Route path="/podcasts" element={<PodcastUpload />} />
            <Route path="/hosts" element={<HostEditor />} />
            <Route path="/schedule" element={<ScheduleEditor />} />
          </Routes>
        </div>
      </AdminGuard>
    </HashRouter>
  );
}

export default App;
