import Providers from "./Providers";

export const metadata = {
  title: "Shorts Factory",
  description: "10 TikTok/Reels-ready ads in 48 hours. Simple intake. Clear deliverables.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
