// netlify/functions/apifootball.js
export async function handler(event) {
  try {
    const API_KEY = process.env.API_SPORTS_KEY; // هنعرفه كـ env var
    const base = 'https://v3.football.api-sports.io';

    // مثال نداء: /.netlify/functions/apifootball/fixtures?league=..&season=..&date=..
    const pathAfterFn = event.path.replace('/.netlify/functions/apifootball', '') || '/';
    const qs = new URLSearchParams(event.queryStringParameters || {}).toString();
    const url = `${base}${pathAfterFn}${qs ? `?${qs}` : ''}`;

    const res = await fetch(url, {
      headers: { 'x-apisports-key': API_KEY, 'accept': 'application/json' }
    });

    const text = await res.text();
    return {
      statusCode: res.status,
      headers: { 'content-type': res.headers.get('content-type') || 'application/json' },
      body: text
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}