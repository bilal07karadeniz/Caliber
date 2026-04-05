export default function Footer() {
  return (
    <footer className="bg-surface-inverse mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <span className="font-heading font-bold text-xs tracking-[0.2em] uppercase text-ink-500">Caliber</span>
          <p className="text-xs font-mono text-ink-500">&copy; {new Date().getFullYear()} SENG 400 Graduation Project</p>
        </div>
      </div>
    </footer>
  );
}
