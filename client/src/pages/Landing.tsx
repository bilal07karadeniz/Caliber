import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/ui/Button';

const features = [
  { num: '01', title: 'Signal Extraction', desc: 'Upload your resume. Our NLP engine reads between the lines, extracting skills, experience, and potential that keywords miss.' },
  { num: '02', title: 'Precision Matching', desc: 'A five-factor algorithm scores compatibility across skills, experience, education, location, and compensation.' },
  { num: '03', title: 'Gap Mapping', desc: 'See exactly which skills separate you from your target role, with curated learning paths to close each gap.' },
  { num: '04', title: 'Career Topology', desc: 'AI maps your skill landscape to reveal career paths you haven\'t considered — backed by market data.' },
  { num: '05', title: 'Employer Intelligence', desc: 'Employers see ranked candidates with detailed compatibility breakdowns. No more resume lottery.' },
  { num: '06', title: 'Continuous Signal', desc: 'Real-time notifications when new roles match your profile. Your career radar never sleeps.' },
];

const steps = [
  { label: 'Create Profile', desc: 'Sign up and define your skills, experience, and goals.' },
  { label: 'Upload Resume', desc: 'Our AI parses and builds your comprehensive skill profile.' },
  { label: 'Get Matched', desc: 'Receive ranked job recommendations with detailed explanations.' },
];

export default function Landing() {
  return (
    <MainLayout>
      {/* Hero — dark, asymmetric */}
      <section className="bg-surface-inverse">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            <div className="lg:col-span-3">
              <h1 className="font-heading text-4xl md:text-5xl lg:text-5xl font-bold text-white leading-tight">
                Your skills are a signal.<br />
                <span className="text-verdant-400">We find who's listening.</span>
              </h1>
              <p className="text-ink-400 text-lg font-body mt-6 max-w-lg">
                Precision matching that goes beyond keywords. We analyze compatibility across five dimensions to connect talent with opportunity.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link to="/register"><Button size="lg">Get Started <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
                <Link to="/jobs"><Button variant="outline" size="lg" className="border-ink-600 text-ink-300 hover:bg-ink-800 hover:text-white">Browse Jobs</Button></Link>
              </div>
            </div>
            <div className="lg:col-span-2 hidden lg:block">
              <div className="grid grid-cols-8 gap-1">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-sm" style={{
                    backgroundColor: '#2D8A3E',
                    opacity: Math.random() * 0.6 + 0.05,
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features — Swiss numbered grid */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="label mb-3">Capabilities</p>
          <h2 className="font-heading text-3xl font-bold text-ink-900 mb-12">How the signal works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 border-t border-ink-200">
            {features.map(({ num, title, desc }) => (
              <div key={num} className="p-8 border-b border-ink-200 md:odd:border-r">
                <span className="text-5xl font-heading font-light text-ink-200">{num}</span>
                <h3 className="font-heading font-semibold text-xl mt-3 text-ink-900">{title}</h3>
                <p className="text-ink-500 text-sm mt-2 font-body leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — horizontal timeline */}
      <section className="py-16 md:py-24 bg-surface-sunken">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="label mb-3">Process</p>
          <h2 className="font-heading text-3xl font-bold text-ink-900 mb-12">Three steps to resonance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {steps.map(({ label, desc }, i) => (
              <div key={i} className="relative pb-8 md:pb-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 bg-verdant-500 rounded-sm shrink-0" />
                  {i < steps.length - 1 && <div className="hidden md:block flex-1 h-px bg-ink-200" />}
                </div>
                <p className="font-mono text-xs text-ink-400 uppercase tracking-wider mb-1">Step {i + 1}</p>
                <h3 className="font-heading font-semibold text-lg text-ink-900">{label}</h3>
                <p className="text-sm text-ink-500 mt-1 font-body">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats — data wall */}
      <section className="border-y border-ink-200 bg-surface-raised">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="data-wall">
            <div><p className="label mb-1">Job Postings</p><p className="data-value">10,000+</p></div>
            <div><p className="label mb-1">Candidates</p><p className="data-value">5,000+</p></div>
            <div><p className="label mb-1">Match Accuracy</p><p className="data-value">95%</p></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-surface">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="font-heading text-3xl font-bold text-ink-900">Ready to tune in?</h2>
          <p className="text-ink-500 mt-3 mb-8">Join thousands of professionals finding career resonance with Caliber.</p>
          <Link to="/register"><Button size="lg">Create Your Profile <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
        </div>
      </section>
    </MainLayout>
  );
}
