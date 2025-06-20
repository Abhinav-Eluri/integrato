import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-primary/20 mb-4">404</div>
          <div className="w-24 h-24 mx-auto mb-6">
            <svg
              className="w-full h-full text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20a7.962 7.962 0 01-5.207-1.709m0 0L6 18m0 0l-3-3m3 3v-3.75M18 18l3-3m-3 3v-3.75m0 3.75l-3-3"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            The page might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="inline-flex items-center"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Link to="/">
              <Button className="w-full sm:w-auto inline-flex items-center">
                <HomeIcon className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Help Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Need help? Try these links:
          </p>
          <div className="space-y-2">
            <Link
              to="/"
              className="block text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Home Page
            </Link>
            <Link
              to="/"
              className="block text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/login"
              className="block text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Sign In
            </Link>
            <a
              href="#"
              className="block text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;