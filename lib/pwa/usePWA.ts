"use client";

import { useEffect, useState } from "react";

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    });

    window.addEventListener("appinstalled", () => {
      console.log("[PWA] App installed successfully");
      setDeferredPrompt(null);
      setIsInstallable(false);
    });

    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((registration) => {
        console.log("[PWA] Service Worker registered:", registration);
      }).catch((error) => {
        console.error("[PWA] Service Worker registration failed:", error);
      });
    }
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] User response: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return { isInstallable, installApp };
}

/**
 * Detect connection speed and enable "Deep Sea Mode" (text-only interface)
 */
export function useDeepSeaMode() {
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      const checkConnection = () => {
        const effectiveType = connection.effectiveType; // 4g, 3g, 2g, slow-2g
        setIsSlowConnection(
          effectiveType === "2g" || effectiveType === "slow-2g" || connection.saveData
        );
      };

      checkConnection();
      connection.addEventListener("change", checkConnection);

      return () => {
        connection.removeEventListener("change", checkConnection);
      };
    }
  }, []);

  return { isSlowConnection };
}
