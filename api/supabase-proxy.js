// Vercel Serverless Function - прокси к Supabase
// Обходит блокировку Supabase в России

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey, prefer');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase credentials');
    return res.status(500).json({ error: 'Missing Supabase credentials' });
  }

  try {
    // Получаем путь запроса (убираем /api/supabase)
    let path = req.url.replace('/api/supabase', '');
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    const targetUrl = `${SUPABASE_URL}${path}`;
    
    // Логируем для отладки
    console.log('Proxying to:', targetUrl);
    console.log('Method:', req.method);
    
    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.body ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    
    // Логируем ошибки
    if (!response.ok) {
      console.error('Proxy error:', response.status, data);
    }
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy exception:', error);
    res.status(500).json({ error: error.message });
  }
}
