'use client';

import { useState, useCallback, useMemo } from 'react';
import NdaChat from './NdaChat';
import NdaDocument from './NdaDocument';
import { defaultFormData } from '@/lib/ndaUtils';
import type { NdaFormData } from '@/lib/types';

const REQUIRED_FIELDS: (keyof NdaFormData)[] = [
  'governingLaw',
  'jurisdiction',
  'p1Company',
  'p1Name',
  'p1Title',
  'p1Address',
  'p2Company',
  'p2Name',
  'p2Title',
  'p2Address',
];

export default function NdaCreator() {
  const [formData, setFormData] = useState<NdaFormData>(defaultFormData);
  const [downloading, setDownloading] = useState(false);

  const handleChange = useCallback((updated: Partial<NdaFormData>) => {
    setFormData((prev) => ({ ...prev, ...updated }));
  }, []);

  const allRequiredFilled = useMemo(
    () => REQUIRED_FIELDS.every((f) => Boolean(formData[f])),
    [formData],
  );

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('auth_token') ?? '';
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Download failed');

      const disposition = res.headers.get('Content-Disposition') ?? '';
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match ? match[1] : 'Mutual-NDA.pdf';

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  }, [formData]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Chat Panel ──────────────────────────────────────────── */}
      <aside className="w-80 flex-shrink-0 flex flex-col bg-white border-r border-gray-200 overflow-hidden">
        <div className="flex-shrink-0 border-b border-gray-200 px-4 py-2.5 text-xs font-semibold text-navy uppercase tracking-wide">
          AI Assistant
        </div>
        <div className="flex-1 overflow-hidden">
          <NdaChat currentFields={formData} onFieldsUpdate={handleChange} />
        </div>
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleDownload}
            disabled={downloading || !allRequiredFilled}
            title={!allRequiredFilled ? 'Complete all required fields to download' : undefined}
            className="w-full bg-purple-secondary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg text-sm transition-opacity"
          >
            {downloading ? 'Generating…' : 'Download NDA'}
          </button>
          {!allRequiredFilled && (
            <p className="mt-2 text-center text-xs text-gray-text">
              Fill all required fields to enable download
            </p>
          )}
        </div>
      </aside>

      {/* ── Preview Panel ────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        <div className="flex-shrink-0 border-b border-gray-200 bg-white px-5 py-2.5 text-xs font-medium text-gray-text">
          Live Document Preview
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          <NdaDocument data={formData} />
        </div>
      </main>
    </div>
  );
}
