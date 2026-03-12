export const metadata = {
  title: "Community Research Pool",
  description: "Public daily delta research pool (v0: cure-cancer)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji",
          background: "#070a08",
          color: "#e9f5ec",
        }}
      >
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 18px 60px" }}>{children}</div>
      </body>
    </html>
  );
}
