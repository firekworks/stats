import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stats | Firekworks",
  description: "Portal privado de resultados para clientes Firekworks",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon.ico", rel: "shortcut icon" }
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
