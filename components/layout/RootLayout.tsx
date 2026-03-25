"use client";

import { useEffect, useState } from "react";
import Header from "./Header";
import { AuthProvider } from "@/lib/auth/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-deck">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </AuthProvider>
  );
}
