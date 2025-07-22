import React from 'react';

/**
 * Authentication middleware configuration
 */
interface AuthOptions {
  redirectTo?: string;
  requireAuth?: boolean;
}

/**
 * Simple authentication check (in a real app, this would check actual auth state)
 */
function isAuthenticated(): boolean {
  // In a real application, you would check:
  // - JWT tokens in localStorage/sessionStorage
  // - Authentication service state
  // - Server session validation
  return true; // For demo purposes, always return true
}

/**
 * Authentication middleware HOC
 * Wraps components with authentication logic
 */
export function withAuth<P extends {}>(
  Component: React.ComponentType<P>,
  options: AuthOptions = {}
) {
  return function AuthenticatedComponent(props: P) {
    const { requireAuth = true, redirectTo = '/login' } = options;

    if (requireAuth && !isAuthenticated()) {
      // In a real app, you might redirect using your router
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full space-y-8 p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Authentication Required
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Please log in to access this page
              </p>
              <button
                onClick={() => {
                  // In a real app, redirect to login page
                  console.log(`Redirecting to ${redirectTo}`);
                }}
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}