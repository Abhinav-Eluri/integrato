import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';


interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <Outlet />
          {children}
        </div>
      </main>


    </div>
  );
};

export default Layout;