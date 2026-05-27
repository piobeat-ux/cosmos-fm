import { HashRouter, Routes, Route } from 'react-router-dom';
import { LivePage } from './pages/Live';
import { ShowsPage } from './pages/Shows';
import { ShowPage } from './pages/ShowPage';
import { HostsPage } from './pages/Hosts';
import { HostPage } from './pages/HostPage';
import { PodcastsPage } from './pages/Podcasts';
import { TabBar } from './components/TabBar';

function App() {
  return (
    <HashRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<LivePage />} />
          <Route path="/shows" element={<ShowsPage />} />
          <Route path="/shows/:id" element={<ShowPage />} />
          <Route path="/hosts" element={<HostsPage />} />
          <Route path="/hosts/:id" element={<HostPage />} />
          <Route path="/podcasts" element={<PodcastsPage />} />
        </Routes>
        <TabBar />
      </div>
    </HashRouter>
  );
}

export default App;
