import express from 'express';
const mock = process.argv.includes('--mock');
const port = Number(process.env.PORT || 3001);
const endpoint = mock ? `http://127.0.0.1:${port}/mock/submissions` : (process.env.WHYKEEPUS_URL || 'https://whykeepus.com') + '/api/submissions';
let nextMockId = 1;
function reply(res, status, body) {
  res.status(status).json(body);
}
const app = express();
app.get('/', (req, res) => res.send('Mission control is ready. Run npm run send in another terminal.'));
app.use(express.json({ limit: '10kb' }));
app.post(['/send', '/mock/submissions'], async (req, res) => {
  if (mock && req.method === 'POST' && req.url === '/mock/submissions') {
    try {
      const body = req.body;
      const limits = { displayName: 48, location: 100, reason: 240 };
      if (Object.entries(limits).some(([key, max]) => typeof body?.[key] !== 'string' || !body[key].trim() || body[key].trim().length > max)) {
        return reply(res, 400, { error: 'Check displayName, location and reason.' });
      }
      return reply(res, 201, { mode: 'MOCK: not saved to WhyKeepUs', submission: { id: nextMockId++, display_name: body.displayName, location_label: body.location, reason: body.reason } });
    } catch { return reply(res, 400, { error: 'Check your JSON message.' }); }
  }
  if (req.method !== 'POST' || req.url !== '/send') return reply(res, 404, { error: 'Use npm run send to POST /send.' });
  console.log('Received local request. Forwarding your mission to ' + (mock ? 'LOCAL PRACTICE' : 'WhyKeepUs') + '.');
  try {
    // Reload the saved student edits on every attempt; no server restart needed.
    const { sendMission } = await import(new URL('./mission.mjs?attempt=' + Date.now(), import.meta.url));
    const response = await sendMission(endpoint);
    const data = await response.json();
    console.log('Reply:', response.status, data.submission?.id ? 'Record ID ' + data.submission.id : data.error);
    reply(res, response.status, data);
  } catch (error) {
    console.error('Mission could not complete:', error.message);
    reply(res, 502, { error: 'Check method is POST, save mission.mjs, and check your connection. If a live request may have gone through, check the registry before resending.' });
  }
});
app.use((req, res) => reply(res, 404, { error: 'Use npm run send to POST /send.' }));
app.use((error, req, res, next) => reply(res, error.status || 500, { error: 'Check your JSON message and its size.' }));
const server = app.listen(port, '127.0.0.1', () => console.log(`Ready on http://127.0.0.1:${port} — ` + (mock ? 'LOCAL PRACTICE (no live saving)' : `Sending to ${new URL(endpoint).origin}: accepted messages become public records`)));
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
