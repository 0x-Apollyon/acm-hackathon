"use client";

export default function StonksPage() {
  return (
    <div className="h-screen w-full">
      <iframe
        src="/stonks/stonks.html"
        className="w-full h-full border-0"
        title="Stonks Learning Platform"
      />
    </div>
  );
}
