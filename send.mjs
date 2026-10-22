try {
  const response = await fetch(`http://127.0.0.1:${process.env.PORT || 3001}/send`, { method: 'POST', signal: AbortSignal.timeout(25000) });
  const data = await response.json();
  console.log('Status:', response.status);
  console.log(JSON.stringify(data, null, 2));
  if (!response.ok) process.exitCode = 1;
} catch {
  console.error('No reply. Is npm start running in your first terminal? If you already sent a live request, check for your record before sending again.');
  process.exitCode = 1;
}
