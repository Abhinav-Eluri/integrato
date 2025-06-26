import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import {
  ArrowRightIcon,
  CalendarIcon,
  EnvelopeIcon,
  CodeBracketIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const integrations = [
    {
      id: 'google_calendar',
      name: 'Google Calendar',
      description: 'Sync your Google Calendar events and manage schedules seamlessly',
      icon: CalendarIcon,
      color: 'bg-blue-500',
      category: 'Calendar'
    },
    {
      id: 'google_gmail',
      name: 'Gmail',
      description: 'Access and manage your Gmail messages with powerful filtering',
      icon: EnvelopeIcon,
      color: 'bg-red-500',
      category: 'Email'
    },
    {
      id: 'microsoft_calendar',
      name: 'Microsoft Calendar',
      description: 'Integrate with Outlook Calendar for unified scheduling',
      icon: CalendarIcon,
      color: 'bg-blue-600',
      category: 'Calendar'
    },
    {
      id: 'microsoft_outlook',
      name: 'Microsoft Outlook',
      description: 'Connect your Outlook email for comprehensive email management',
      icon: EnvelopeIcon,
      color: 'bg-blue-700',
      category: 'Email'
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Manage repositories, issues, and collaborate on code projects',
      icon: CodeBracketIcon,
      color: 'bg-gray-900',
      category: 'Development'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Stay connected with your team through Slack integration',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-purple-600',
      category: 'Communication'
    },
    {
      id: 'calendly',
      name: 'Calendly',
      description: 'Streamline scheduling with automated booking management',
      icon: ClockIcon,
      color: 'bg-orange-500',
      category: 'Scheduling'
    }
  ];

  const features = [
    {
      icon: SparklesIcon,
      title: 'Unified Dashboard',
      description: 'Access all your integrations from one beautiful, intuitive interface'
    },
    {
      icon: CalendarIcon,
      title: 'Smart Scheduling',
      description: 'Sync calendars across platforms and never miss an important meeting'
    },
    {
      icon: EnvelopeIcon,
      title: 'Email Management',
      description: 'Manage multiple email accounts with advanced filtering and organization'
    }
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative text-center py-20 overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-purple-600 rounded-2xl mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <SparklesIcon className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Integrato
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Connect all your favorite tools and services in one unified platform. 
            Streamline your workflow with powerful integrations.
          </p>
          
          {isAuthenticated ? (
            <div className="space-y-6">
              <p className="text-xl text-gray-700 dark:text-gray-300">
                Welcome back, <span className="font-semibold text-primary">{user?.full_name || user?.username}</span>!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/integrations">
                  <Button size="lg" className="inline-flex items-center px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                    <SparklesIcon className="mr-3 h-6 w-6" />
                    Manage Integrations
                    <ArrowRightIcon className="ml-3 h-6 w-6" />
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="outline" size="lg" className="inline-flex items-center px-8 py-4 text-lg font-semibold">
                    Go to Profile
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/register">
                <Button size="lg" className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  Get Started Free
                  <ArrowRightIcon className="ml-3 h-6 w-6" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Integrations Showcase */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Powerful{' '}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Integrations
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Connect with your favorite tools and services. Streamline your workflow 
              with seamless integrations that work together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {integrations.map((integration, index) => {
              const Icon = integration.icon;
              return (
                <div
                  key={integration.id}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-12 h-12 ${integration.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                        {integration.name}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {integration.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {integration.description}
                  </p>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              );
            })}
          </div>
          
          {!isAuthenticated && (
            <div className="text-center mt-12">
              <Link to="/register">
                <Button size="lg" className="inline-flex items-center px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  Start Connecting Now
                  <ArrowRightIcon className="ml-3 h-6 w-6" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Why Choose Integrato?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Built for modern teams who need powerful integrations without the complexity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-2xl mb-6 shadow-lg">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-16 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="max-w-4xl mx-auto text-center px-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of users who trust our platform for their
              authentication needs.
            </p>
            <Link to="/register">
              <Button size="lg" className="inline-flex items-center">
                Create Your Account
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;