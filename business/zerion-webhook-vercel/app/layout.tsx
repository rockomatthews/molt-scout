export const metadata = {
  title: 'Zerion Webhook Receiver',
  description: 'Receives Zerion webhooks and stores them in Supabase',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
