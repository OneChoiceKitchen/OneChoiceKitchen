'use client';

export default function GlobalLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
}
