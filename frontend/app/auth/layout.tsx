export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4
      bg-[radial-gradient(ellipse_at_top,_#1e1e3a_0%,_#0f0f13_60%)]">
      {children}
    </div>
  );
}
