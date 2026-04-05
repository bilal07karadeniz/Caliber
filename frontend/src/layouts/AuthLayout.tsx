import { Link } from 'react-router-dom';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-surface-inverse flex-col justify-between p-12">
        <Link to="/" className="font-heading font-bold text-sm tracking-[0.2em] uppercase text-white">Caliber</Link>
        <div>
          <h1 className="font-heading text-6xl font-bold text-ink-700 leading-tight">Your skills<br/>are a signal.</h1>
          <p className="text-ink-500 font-body mt-4 text-lg">We find who's listening.</p>
        </div>
        <p className="text-ink-600 font-mono text-xs">Precision Career Matching</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 bg-surface">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Link to="/" className="font-heading font-bold text-sm tracking-[0.2em] uppercase text-ink-900">Caliber</Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
