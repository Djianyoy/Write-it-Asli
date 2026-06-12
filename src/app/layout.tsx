import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/features/auth/hooks/useAuth";
import Navbar from "@/shared/components/Navbar";

export const metadata: Metadata = {
  title: "Medium Clone",
  description: "A place to read, write, and deepen your understanding",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
