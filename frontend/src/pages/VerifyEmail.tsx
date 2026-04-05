import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { authApi } from '../services/api';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <AuthLayout>
      {status === 'loading' && <div className="flex flex-col items-center gap-4"><Spinner size="lg" /><p className="text-ink-500">Verifying your email...</p></div>}
      {status === 'success' && (
        <div className="text-center space-y-4">
          <h1 className="font-heading text-2xl font-bold text-ink-900">Email Verified!</h1>
          <p className="text-ink-500 font-body">Your email has been verified. You can now log in.</p>
          <Link to="/login"><Button className="w-full">Go to Login</Button></Link>
        </div>
      )}
      {status === 'error' && (
        <div className="text-center space-y-4">
          <h1 className="font-heading text-2xl font-bold text-ink-900">Verification Failed</h1>
          <p className="text-ink-500 font-body">The link is invalid or has expired.</p>
          <Link to="/login"><Button variant="outline" className="w-full">Back to Login</Button></Link>
        </div>
      )}
    </AuthLayout>
  );
}
