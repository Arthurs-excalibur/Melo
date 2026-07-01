export default function Loading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 mt-12 space-y-12 animate-pulse">
      <div className="h-64 bg-white/5 rounded-3xl border border-white/10 w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-white/5 rounded-3xl border border-white/10" />
        <div className="h-80 bg-white/5 rounded-3xl border border-white/10" />
      </div>
      <div className="h-40 bg-white/5 rounded-3xl border border-white/10 w-full" />
    </div>
  );
}
