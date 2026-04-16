'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NdaCreator from '@/components/NdaCreator';

export default function Home() {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem('auth_token')) {
      router.replace('/login/');
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;

  return (
    <div className="flex flex-col h-full">
      <header className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-navy">Mutual NDA Creator</h1>
          <p className="text-xs text-gray-text">
            Fill in the fields on the left to generate your Mutual Non-Disclosure Agreement.
          </p>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('auth_token');
            router.replace('/login/');
          }}
          className="text-xs text-gray-text hover:text-navy transition-colors"
        >
          Sign out
        </button>
      </header>
      <div className="flex-1 overflow-hidden">
        <NdaCreator />
      </div>
    </div>
  );
}
