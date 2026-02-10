export default function Home() {
  return (
    <main style={{ fontFamily: 'system-ui', maxWidth: 840, margin: '40px auto', padding: '0 16px' }}>
      <h1>Zerion Webhook Receiver</h1>
      <p>
        Endpoint: <code>/api/zerion</code>
      </p>
      <p>
        Health: <code>/api/zerion</code> (GET)
      </p>
    </main>
  );
}
