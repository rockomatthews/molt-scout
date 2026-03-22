export const metadata = {
  title: "Lead Lists",
  description: "LeadGen Maps — lead lists (CSV/JSON) with receipts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "ui-sans-serif, system-ui" }}>{children}</body>
    </html>
  );
}
