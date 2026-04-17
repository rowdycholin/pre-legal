'use client';

import { useState } from 'react';
import DocumentCreator from '@/components/DocumentCreator';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => typeof window !== 'undefined' && Boolean(localStorage.getItem('auth_token')),
  );

  return (
    <div className="flex flex-col h-full">
      <header className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-navy">Legal Document Creator</h1>
          <p className="text-xs text-gray-text">Chat with the AI assistant to draft your legal document.</p>
        </div>
        {isLoggedIn ? (
          <button
            onClick={() => {
              localStorage.removeItem('auth_token');
              setIsLoggedIn(false);
            }}
            className="text-xs text-gray-text hover:text-navy transition-colors"
          >
            Sign out
          </button>
        ) : (
          <a href="/login/" className="text-xs text-blue-primary hover:opacity-80 transition-opacity">
            Sign in
          </a>
        )}
      </header>
      <div className="flex-1 overflow-hidden">
        <DocumentCreator isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}
