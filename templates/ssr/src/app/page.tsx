import React, { useState, useEffect } from 'react';
import { useService, GetStaticProps } from 'stratus';
import { HttpService } from '../services/ApiService';
import { withAuth } from '../middleware/auth';

function HomePage() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const httpService = useService<HttpService>('httpService');

  useEffect(() => {
    // Example of using a service to fetch data
    const fetchUserData = async () => {
      try {
        const userData = await httpService.get('/user');
        setUser(userData);
      } catch (error) {
        // Handle error - in a real app you might show a toast or error message
        console.log('User not logged in or API not available');
        setUser({ name: 'Guest User' });
      }
    };

    fetchUserData();
  }, [httpService]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-8">
            Welcome to {{PROJECT_NAME_PASCAL}}
          </h1>
          
          {user && (
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Hello, {user.name}!
            </p>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <button
              onClick={() => setCount((count) => count + 1)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Count is {count}
            </button>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Edit <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">src/app/page.tsx</code> and save to test HMR
            </p>
          </div>

          <div className="mt-12">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Built with Stratus SSR + TailwindCSS
            </p>
            <div className="flex justify-center space-x-4 mt-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                SSR
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Services
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Middleware
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                TailwindCSS
              </span>
            </div>
          </div>

          <div className="mt-8">
            <a
              href="/about"
              className="inline-flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition duration-200 transform hover:scale-105"
            >
              View SSR Demo →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Apply authentication middleware
export default withAuth(HomePage, { redirectTo: '/login' });