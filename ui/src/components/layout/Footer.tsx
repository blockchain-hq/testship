import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; 2024 Pulse ⚡ Interactive Testing for Anchor Programs</p>
          <p className="mt-1">Built with React, TypeScript, and ShadCN UI</p>
        </div>
      </div>
    </footer>
  );
};
