import React from 'react';
import { GetServerSideProps } from 'stratus';

interface AboutPageProps {
  serverData: {
    timestamp: string;
    userAgent: string;
  };
}

function AboutPage({ serverData }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            About {{PROJECT_NAME_PASCAL}}
          </h1>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Server-Side Rendering Demo
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This page demonstrates Server-Side Rendering (SSR) capabilities. The data below was fetched on the server:
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Server Data:
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><strong>Server Timestamp:</strong> {serverData.timestamp}</li>
                <li><strong>User Agent:</strong> {serverData.userAgent}</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Framework Features
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">File-system based routing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Automatic code splitting</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Server-side rendering</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Service injection</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Middleware system</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">TailwindCSS integration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">TypeScript support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Hot module replacement</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition duration-200 transform hover:scale-105"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// This function runs on the server during SSR
export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      serverData: {
        timestamp: new Date().toISOString(),
        userAgent: context.req?.headers['user-agent'] || 'Unknown',
      },
    },
  };
};

export default AboutPage;