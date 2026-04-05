import { Component, ErrorInfo, ReactNode } from 'react';
import Button from './Button';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('ErrorBoundary:', error, info); }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <div>
            <h2 className="font-heading text-3xl font-bold text-ink-900">Something broke</h2>
            <p className="text-ink-500 mt-2">An unexpected error occurred.</p>
            <div className="mt-6">
              <Button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}>Reload</Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
