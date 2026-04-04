import { Link } from 'react-router-dom';
import { Brain, FileText, BarChart3, Lightbulb, TrendingUp, Bell, ArrowRight } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/ui/Button';

const features = [
  { icon: Brain, title: 'AI-Powered Matching', desc: 'Our advanced AI engine analyzes your skills and experience to find the best job matches with detailed compatibility scores.' },
  { icon: FileText, title: 'Smart CV Parsing', desc: 'Upload your resume and our NLP engine automatically extracts your skills, experience, and qualifications.' },
  { icon: BarChart3, title: 'Skill Gap Analysis', desc: 'Identify missing skills for your dream job and get personalized learning recommendations.' },
  { icon: Lightbulb, title: 'Career Insights', desc: 'Get AI-generated career path recommendations based on your current skill profile.' },
  { icon: TrendingUp, title: 'Smart Recommendations', desc: 'Receive ranked job recommendations with detailed explanations of why each job matches your profile.' },
  { icon: Bell, title: 'Real-time Alerts', desc: 'Get notified instantly when new jobs match your profile or when your application status changes.' },
];

const steps = [
  { num: '1', title: 'Create Your Profile', desc: 'Sign up and tell us about your skills, experience, and career goals.' },
  { num: '2', title: 'Upload Your Resume', desc: 'Our AI parses your resume to build a comprehensive skill profile.' },
  { num: '3', title: 'Get AI Recommendations', desc: 'Receive personalized job matches ranked by compatibility score.' },
];

export default function Landing() {
  return (
    <MainLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-28 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Find Your Perfect Career Match <span className="text-accent-400">with AI</span>
          </h1>
          <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto mb-8">
            Our AI-powered platform analyzes your skills and experience to connect you with the most compatible job opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=seeker">
              <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-100 w-full sm:w-auto">
                Find Jobs <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/register?role=employer">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                Post a Job
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Why Choose AI Match?</h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            Powered by advanced NLP and machine learning algorithms to revolutionize your job search experience.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="text-center">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {num}
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div><p className="text-4xl font-bold">10,000+</p><p className="text-primary-200 mt-1">Job Postings</p></div>
            <div><p className="text-4xl font-bold">5,000+</p><p className="text-primary-200 mt-1">Candidates</p></div>
            <div><p className="text-4xl font-bold">95%</p><p className="text-primary-200 mt-1">Match Accuracy</p></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to find your perfect match?</h2>
          <p className="text-gray-500 mb-8">Join thousands of professionals using AI to advance their careers.</p>
          <Link to="/register">
            <Button size="lg">Get Started Free <ArrowRight className="w-5 h-5 ml-2" /></Button>
          </Link>
        </div>
      </section>
    </MainLayout>
  );
}
