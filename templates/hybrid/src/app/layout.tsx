import React from 'react';
import { HybridRouter } from 'stratus';

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <HybridRouter 
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          </div>
        }
      />
    </div>
  );
}