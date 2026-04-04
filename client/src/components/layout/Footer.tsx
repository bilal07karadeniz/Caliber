import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-600" />
            <span className="text-sm font-medium text-gray-900">AI Match</span>
          </div>
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} AI Match Platform. SENG 400 Graduation Project.
          </p>
        </div>
      </div>
    </footer>
  );
}
