import type { Metadata } from "next";
import "./globals.css";
import AppBar from "../components/AppBar";

export const metadata: Metadata = {
  title: "Connector Integration Hub",
  description: "Dashboard for Jira & Confluence integrations (Ocean Professional)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[var(--bg-app)] text-[var(--text-primary)]" suppressHydrationWarning>
        <AppBar
          title="Connector Integration Hub"
          actions={[
            { label: "Debug (Off)" },
            { label: "Ready" },
          ]}
        />
        {children}
      </body>
    </html>
  );
}
