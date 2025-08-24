// netlify/functions/apifootball.js
exports.handler = async (event) => {
  const API_BASE = 'https://v3.football.api-sports.io';
  const API_KEY = process.env.API_SPORTS_KEY;

  if (!API_KEY) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing API_SPORTS_KEY' }),
    };
  }

  // route: leagues or fixtures from "/.netlify/functions/apifootball/<route>"
  const route = event.path.replace(/^.*\/apifootball\/?/, '');
  const url = new URL(event.rawUrl);

  let endpoint = '';
  if (route === 'leagues') {
    const country = url.searchParams.get('country') || 'Egypt';
    endpoint = `/leagues?country=${encodeURIComponent(country)}`;
  } else if (route === 'fixtures') {
    const qs = ['league', 'season', 'date']
      .map(k => [k, url.searchParams.get(k)])
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    endpoint = `/fixtures?${qs}`;
  } else {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unknown route' }),
    };
  }

  const resp = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'x-apisports-key': API_KEY,
    },
  });

  const data = await resp.json();

  return {
    statusCode: resp.ok ? 200 : resp.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(data),
  };
};
