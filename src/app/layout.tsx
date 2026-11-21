import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watch Movie — Stream Movies & TV Shows",
  description: "Experience premium streaming in cinema dark mode.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
