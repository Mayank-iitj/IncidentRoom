import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "IncidentRoom — Incident Chat That Stops Credential Leaks. Live.",
  description:
    "Real-time security incident war-room where responders chat and the chat itself stops credential leaks live. Powered by CometChat.",
  keywords: ["security", "incident response", "SOC", "chat", "credential leak prevention"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
