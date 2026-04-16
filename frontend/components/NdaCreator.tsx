'use client';

import { useState, useCallback } from 'react';
import NdaForm from './NdaForm';
import NdaDocument from './NdaDocument';
import { defaultFormData } from '@/lib/ndaUtils';
import type { NdaFormData } from '@/lib/types';

export default function NdaCreator() {
  const [formData, setFormData] = useState<NdaFormData>(defaultFormData);
  const [downloading, setDownloading] = useState(false);

  const handleChange = useCallback((updated: Partial<NdaFormData>) => {
    setFormData((prev) => ({ ...prev, ...updated }));
  }, []);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Download failed');

      const disposition = res.headers.get('Content-Disposition') ?? '';
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match ? match[1] : 'Mutual-NDA.html';

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
      {/* ── Form Panel ──────────────────────────────────────────── */}
      <aside className="w-80 flex-shrink-0 flex flex-col bg-white border-r border-gray-200 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5">
          <NdaForm data={formData} onChange={handleChange} />
        </div>
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg text-sm transition-colors"
          >
            {downloading ? 'Generating…' : 'Download NDA'}
          </button>
        </div>
      </aside>

      {/* ── Preview Panel ────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        <div className="flex-shrink-0 border-b border-gray-200 bg-white px-5 py-2.5 text-xs font-medium text-gray-500">
          Live Document Preview
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          <NdaDocument data={formData} />
        </div>
      </main>
    </div>
  );
}
