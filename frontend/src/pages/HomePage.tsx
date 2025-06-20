import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import {
  ShieldCheckIcon,
  UserGroupIcon,
  CogIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Secure Authentication',
      description:
        'JWT-based authentication with refresh tokens and social login support.',
    },
    {
      icon: UserGroupIcon,
      title: 'User Management',
      description:
        'Complete user profile management with avatar uploads and customization.',
    },
    {
      icon: CogIcon,
      title: 'Modern Tech Stack',
      description:
        'Built with React, TypeScript, Django, and PostgreSQL for scalability.',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to{' '}
            <span className="text-primary">Modern App</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            A full-stack web application with secure authentication, user
            management, and modern UI components built with React and Django.
          </p>
          
          {isAuthenticated ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Welcome back, {user?.full_name || user?.username}!
              </p>
              <Link to="/profile">
                <Button size="lg" className="inline-flex items-center m-3">
                  Go to Profile
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Key Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to build a modern web application with
              authentication and user management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
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