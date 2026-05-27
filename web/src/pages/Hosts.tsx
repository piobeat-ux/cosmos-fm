import { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { Link } from 'react-router-dom';

export function HostsPage() {
  const api = useApi();
  const [hosts, setHosts] = useState<any[]>([]);

  useEffect(() => {
    api.get('/hosts').then(r => setHosts(r.data));
  }, []);

  return (
    <div className="page">
      <div className="page-header"><h1>Ведущие</h1></div>
      <div className="list-grid">
        {hosts.map(host => (
          <Link to={`/hosts/${host.id}`} key={host.id} className="list-card">
            <div className="list-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
              {host.initials}
            </div>
            <div className="list-body">
              <h3>{host.name}</h3>
              <p>{host.position}</p>
              <p className="meta">{host.shows.length} передач</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
