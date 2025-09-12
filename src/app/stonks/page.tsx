"use client";

import { useEffect, useState } from "react";

export default function StonksPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add a small delay to show loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">
            Loading Stonks Learning Platform...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <iframe
        src="/stonks/stonks.html"
        className="w-full h-full border-0"
        title="Stonks Learning Platform"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
