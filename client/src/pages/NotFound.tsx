import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center">
        <h1 className="font-heading text-6xl font-bold text-ink-200 mb-4">404</h1>
        <h2 className="font-heading text-2xl font-semibold text-ink-900 mb-2">Page Not Found</h2>
        <p className="text-ink-500 mb-6 font-body">The page you're looking for doesn't exist.</p>
        <Link to="/"><Button>Go Home</Button></Link>
      </div>
    </div>
  );
}
