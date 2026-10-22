import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, symlink, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

test('student edits, Express forwarding, validation, and practice replies', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'whykeepus-test-'));
  const root = fileURLToPath(new URL('../', import.meta.url));
  const reservation = createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  await cp(join(root, 'server.mjs'), join(folder, 'server.mjs'));
  await symlink(join(root, 'node_modules'), join(folder, 'node_modules'), 'junction');
  const mission = reason => `export async function sendMission(url) { return fetch(url, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({displayName:'TestPilot',location:'Detroit, MI, USA',reason:${JSON.stringify(reason)}})}); }`;
  await writeFile(join(folder, 'mission.mjs'), mission('I rescue satellites.'));
  const child = spawn(process.execPath, ['server.mjs', '--mock'], { cwd: folder, env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Express did not start')), 10000);
      child.stdout.on('data', data => { if (String(data).includes('Ready on')) { clearTimeout(timer); resolve(); } });
      child.once('exit', code => { clearTimeout(timer); reject(new Error(`Express exited: ${code}`)); });
    });
    const url = `http://127.0.0.1:${port}`;
    assert.match(await (await fetch(url)).text(), /Mission control is ready/);
    const sent = await fetch(url + '/send', { method: 'POST' });
    assert.equal(sent.status, 201);
    const body = await sent.json();
    assert.match(body.mode, /not saved/);
    assert.equal(body.submission.display_name, 'TestPilot');
    assert.equal(body.submission.id, 1);
    await writeFile(join(folder, 'mission.mjs'), mission(''));
    assert.equal((await fetch(url + '/send', { method: 'POST' })).status, 400);
    await writeFile(join(folder, 'mission.mjs'), mission('A new mission.'));
    const again = await (await fetch(url + '/send', { method: 'POST' })).json();
    assert.equal(again.submission.reason, 'A new mission.');
    assert.equal(again.submission.id, 2, 'invalid attempts must not create records');
    assert.equal((await fetch(url + '/mock/submissions', {method:'POST',headers:{'Content-Type':'application/json'},body:'{broken'})).status, 400);
    assert.equal((await fetch(url + '/missing')).status, 404);
  } finally {
    const stopped = once(child, 'exit');
    child.kill();
    await stopped;
    await rm(folder, { recursive: true, force: true });
  }
});
